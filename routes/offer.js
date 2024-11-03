const express = require("express");
const Offer = require("../models/Offer");
const router = express.Router();
const isAuthenticated = require("../middleware/isAuthenticated");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const convertToBase64 = require("../utils/convertToBase64");
//!ROUTE ADD NEW OFFER
router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      // console.log("req.user", req.user);
      // console.log("req.body", req.body);
      const offer = new Offer({
        product_name: req.body.title,
        product_description: req.body.description,
        product_price: req.body.price,
        product_details: [
          {
            MARQUE: req.body.brand,
          },
          {
            TAILLE: req.body.size,
          },
          {
            ÉTAT: req.body.condition,
          },
          {
            COULEUR: req.body.color,
          },
          {
            EMPLACEMENT: req.body.city,
          },
        ],
        owner: req.user,
      });
      // console.log("req.files", req.files);
      const road = "vinted/offer/" + offer._id;
      const pictureToUpload = await cloudinary.uploader.upload(
        convertToBase64(req.files.picture),
        { folder: road }
      );
      (offer.product_image = pictureToUpload), offer.save();
      res.status(201).json({ message: "Offer published" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);
module.exports = router;
