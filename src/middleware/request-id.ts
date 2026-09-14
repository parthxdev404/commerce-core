import type { Request, Response, NextFunction } from "express";

import { randomUUID } from "node:crypto";

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const requestId = req.headers["x-request-id"]?.toString() || randomUUID();

  res.setHeader("X-Request-ID", requestId);

  res.locals.requestId = requestId;

  next();
}
