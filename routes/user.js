const express = require("express");
const User = require("../models/User");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const salt = uid2(16);

// ROUTE SIGNUP
router.post("/user/signup", async (req, res) => {
  try {
    const mailChecked = await User.findOne({ email: req.body.email });
    console.log(mailChecked);
    if (mailChecked) {
      return res.status(400).json({
        message: "try another email or click on Forgot your Password",
      });
    }

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
