import { pinoHttp } from "pino-http";
import { logger } from "../config/logger.js";

export const requestLogger = pinoHttp({
  logger,
  customProps(req) {
    return {
      requestId: req.headers["x-request-id"],
    };
  },
});
