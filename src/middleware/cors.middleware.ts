import cors from "cors";
import { env } from "../config/env.js";

export const corsMiddleware = cors({
  origin: env.CLIENT_URL,
  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-type", "Authorization", "X-Request-ID"],
});
