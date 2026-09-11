import "dotenv/config";

const PORT = Number(process.env.PORT) || 5000;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

export const env = {
  PORT,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL,
};
