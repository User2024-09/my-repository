const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
mongoose.connect(process.env.MONGODB_URI); // online

app.use(express.json());

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome" });
});

const userRouter = require("./routes/user");
const offerRouter = require("./routes/offer");
const offersRouter = require("./routes/offers");

app.use(userRouter);
app.use(offerRouter);
app.use(offersRouter);

app.all("*", (req, res) => {
  res.status(404).json({ message: "ERROR 404" });
});

app.listen(process.env.PORT, () => {
  console.log("server started 👕");
});
