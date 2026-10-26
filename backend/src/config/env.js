require("dotenv").config();

const config = {
  port: process.env.PORT || 5000,

  mongoUri:
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/expense_management",

  jwtSecret: process.env.JWT_SECRET || "development-secret",
};

module.exports = config;