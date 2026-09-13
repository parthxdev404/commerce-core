import type { Request, Response, NextFunction } from "express";

import { ZodError } from "zod";

import { AppError } from "../utils/app-error.js";
import { logger } from "../config/logger.js";

interface PostgresError extends Error {
  code?: string;
  constraint?: string;
}

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error(
    {
      error,
      method: req.method,
      path: req.originalUrl,
    },
    "Request failed",
  );

  // Zod validation error
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues,
    });

    return;
  }

  // Application error
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });

    return;
  }

  // PostgreSQL errors
  const postgresError = error as PostgresError;

  if (postgresError.code === "23505") {
    res.status(409).json({
      success: false,
      message: "Resource already exists",
    });

    return;
  }

  if (postgresError.code === "23503") {
    res.status(400).json({
      success: false,
      message: "Referenced resource does not exist",
    });

    return;
  }

  if (postgresError.code === "23502") {
    res.status(400).json({
      success: false,
      message: "Required database field is missing",
    });

    return;
  }

  if (postgresError.code === "23514") {
    res.status(400).json({
      success: false,
      message: "Database constraint violation",
    });

    return;
  }

  // Unknown error
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
