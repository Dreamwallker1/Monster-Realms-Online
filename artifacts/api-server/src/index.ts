import { createServer } from "http";
import app from "./app";
import { logger } from "./lib/logger";
import { initializeSocket } from "./lib/socket";
import { seedOnStartup } from "./lib/seedOnStartup.js";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const httpServer = createServer(app);
initializeSocket(httpServer);

httpServer.listen(port, (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
  // Run seed check after the server is up so the port is open before we hit the DB.
  seedOnStartup().catch((e) =>
    logger.warn({ err: e }, "seedOnStartup threw unexpectedly"),
  );
});
