import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./client.js";

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const migrationsDirectory = path.resolve(_dirname, "../../migrations");

async function migrate() {
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations(
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`);

    const files = await fs.readdir(migrationsDirectory);
    const migrationFiles = files.filter((file) => file.endsWith(".sql")).sort();

    for (const filename of migrationFiles) {
      const result = await client.query(
        "SELECT 1 FROM schema_migrations WHERE filename = $1",
        [filename],
      );

      if (result.rowCount && result.rowCount > 0) {
        continue;
      }

      const filepath = path.join(migrationsDirectory, filename);
      const sql = await fs.readFile(filepath, "utf8");
      console.log(`Running Migration : ${filename}`);

      await client.query(sql);
      await client.query(
        "INSERT INTO schema_migrations (filename) VALUES ($1)",
        [filename],
      );
      await client.query("COMMIT");

      console.log("Migration Completed Successfully");
    }
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Migration Failed : ", error);
    process.exitCode = 1;
  } finally {
    client.release();
    await db.end();
  }
}

migrate();
