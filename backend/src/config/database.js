const mongoose = require("mongoose");
const config = require("./env");

const connectDatabase = async () => {
  try {
    await mongoose.connect(config.mongoUri);

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

const isDatabaseReady = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = {
  connectDatabase,
  isDatabaseReady,
};