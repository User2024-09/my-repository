const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const user = await User.findOne({
        token: req.headers.authorization.replace("Bearer ", ""),
      });
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      } else {
        req.user = user;
        return next();
      }
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};
module.exports = isAuthenticated;
