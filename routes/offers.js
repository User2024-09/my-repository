const express = require("express");
const router = express.Router();
const Offer = require("../models/Offer");

router.get("/offers", async (req, res) => {
  try {
    const { title, priceMin, priceMax, sort, page } = req.query; //Destructuration
    const limit = 2; // Limite arbitraire car non transmise
    let currentPage = 1; // Initialisation à 1

    if (page) {
      currentPage = Number(page); // car les query sont en String
    }
    const filters = {}; // Creation d'un objet pour enregistrer les filtres

    if (title) filters.product_name = new RegExp(title, "i"); // enregistrement du title

    if (priceMin) filters.product_price = { $gte: Number(priceMin) };
    if (priceMin) {
      if (priceMax) {
        filters.product_price.$lte = Number(priceMax);
      }
    }

    // if (priceMax) {
    //   filters.product_price = filters.product_price || {};
    //   filters.product_price.$lte = Number(priceMax);
    // }

    // tri
    const sortOption = {};
    if (sort === "price-asc") sortOption.product_price = 1;
    else if (sort === "price-desc") sortOption.product_price = -1;

    const offers = await Offer.find(filters)
      .populate("owner", "account avatar _id")

      .sort(sortOption)
      .skip((currentPage - 1) * limit)
      .limit(limit);

    const totalOffers = await Offer.countDocuments();

    res.json({ count: totalOffers, offers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
