const mongoose = require("mongoose");
const logger = require("../utils/logger.js");

const connectDB = async (uri) => {
  try {
    await mongoose
      .connect(uri, { family: 4 })
      .then(() => console.log("MongoDB connected"))
      .catch((err) => console.error("MongoDB connection error:", err));
  } catch (error) {
    console.error("MongoDB Connection error", error);
    process.exit(1);
  }
};

module.exports = connectDB;
