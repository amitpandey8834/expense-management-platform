const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const { isDatabaseReady } = require("./config/database");

const requestLogger = require("./middleware/requestLogger");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const categoryRoutes = require("./routes/categoryRoutes");
const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get("/", (req, res) => {
  res.json({
    message: "Expense Management API",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

app.get("/readiness", (req, res) => {
  const databaseReady = isDatabaseReady();

  if (!databaseReady) {
    return res.status(503).json({
      status: "not_ready",
      database: "disconnected",
    });
  }

  return res.status(200).json({
    status: "ready",
    database: "connected",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/expenses", expenseRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;