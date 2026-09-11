import app from "./app.js";
import { env } from "./config/env.js";
import { checkDatabaseConnection } from "./db/health.js";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function startServer() {
  try {
    await checkDatabaseConnection();
    app.listen(env.PORT, () => {
      console.log("CommerceCore API Is Running on Port 5000");
    });
  } catch (error) {
    console.error("Failed to connect to database", error);
    process.exit(1);
  }
}

startServer();
