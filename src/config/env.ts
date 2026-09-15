import "dotenv/config";

const PORT = Number(process.env.PORT) || 5000;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

if (!JWT_ACCESS_SECRET) {
  throw new Error("JWT_ACCESS_SECRET is not defined");
}

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_REFRESH_SECRET) {
  throw new Error("JWT_REFRESH_SECRET is not defined");
}

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

export const env = {
  PORT,

  NODE_ENV: process.env.NODE_ENV || "development",

  DATABASE_URL,

  CLIENT_URL,

  JWT_ACCESS_SECRET,

  JWT_REFRESH_SECRET,
};
