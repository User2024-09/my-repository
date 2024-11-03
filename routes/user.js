const express = require("express");
const User = require("../models/User");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const convertToBase64 = require("../utils/convertToBase64");
const salt = uid2(16);

// ROUTE SIGNUP
router.post("/user/signup", fileUpload(), async (req, res) => {
  try {
    const mailChecked = await User.findOne({ email: req.body.email });
    if (mailChecked) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    console.log("req.files", req.files);
    const newUser = new User({
      email: req.body.email,
      account: {
        username: req.body.username,
      },
      newsletter: req.body.newsletter,
      token: uid2(64),
      hash: SHA256(req.body.password + salt).toString(encBase64),
      salt: salt,
    });
    //recupere la photo posté si photo posté
    const road = "vinted/user/" + newUser._id;

    if (req.files) {
      const pictureToUpload = await cloudinary.uploader.upload(
        convertToBase64(req.files.avatar),
        { folder: road }
      );
      newUser.account.avatar = pictureToUpload;
    }
    await newUser.save();
    const response = await User.findOne({ email: req.body.email }).select(
      "_id token account username"
    );

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ROUTE LOGIN
router.post("/user/login", async (req, res) => {
  const dataUser = await User.findOne({ email: req.body.email });
  if (!dataUser) {
    return res.status(400).json({ message: "Wrong email" });
  }
  const salt = dataUser.salt;
  const hash = dataUser.hash;
  const dataHash = SHA256(req.body.password + salt).toString(encBase64);
  if (hash !== dataHash) {
    return res.status(400).json({ message: "Wrong password" });
  } else {
    const response = await User.findOne({ email: req.body.email }).select(
      "_id token account.username"
    );
    res.status(200).json(response);
  }
});

module.exports = router;
