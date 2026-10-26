const app = require("./app");
const config = require("./config/env");
const {
  connectDatabase,
  isDatabaseReady,
} = require("./config/database");

let server;

const startServer = async () => {
  await connectDatabase();

  server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
};

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);

  if (server) {
    server.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

startServer();