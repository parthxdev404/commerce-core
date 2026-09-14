import type { Request, Response, NextFunction } from "express";

import { logger } from "../config/logger.js";

export function requestLoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const startTime = process.hrtime.bigint();

  res.on("finish", () => {
    const endTime = process.hrtime.bigint();

    const durationMs = Number(endTime - startTime) / 1_000_000;

    logger.info(
      {
        requestId: res.locals.requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Number(durationMs.toFixed(2)),
      },
      "HTTP request completed",
    );
  });

  next();
}
