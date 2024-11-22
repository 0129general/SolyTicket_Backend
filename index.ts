import app from "./src/app";
import { config, logger } from "./src/config";
import prisma from "./src/dbClient";

const server = app.listen(config.port, () => {
  logger.info(`Listening to port ${config.port}`);
});

prisma.$connect().then(() => {
  logger.info("Connected to the Database");
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: unknown) => {
  logger.error(error);

  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
  exitHandler();
});
