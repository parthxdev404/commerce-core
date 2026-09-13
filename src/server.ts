import app from "./app.js";
import { env } from "./config/env.js";
import { checkDatabaseConnection } from "./db/health.js";
import { logger } from "./config/logger.js";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function startServer() {
  try {
    await checkDatabaseConnection();

    app.listen(env.PORT, () => {
      logger.info(`CommerceCore API running on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error(error, "Failed to connect to database");

    process.exit(1);
  }
}

startServer();
