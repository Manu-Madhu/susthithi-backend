const mongoose = require("mongoose");
const logger = require("../utils/logger.js");

const connectDB = async (uri) => {
  try {
    await mongoose
      .connect(uri)
      .then(() => logger.info("MongoDB connected"))
      .catch((err) => logger.error("MongoDB connection error:", err));
  } catch (error) {
    logger.error("MongoDB Connection error", error);
    process.exit(1);
  }
};

module.exports = connectDB;
