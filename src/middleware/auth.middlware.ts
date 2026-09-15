import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";
import { findUserById } from "../modules/auth/auth.repository.js";

interface AccessTokenPayload {
  sub: string;
  roleId: number;
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies?.access_token;

  if (!token) {
    throw new AppError("Authentication Required", 401);
  }

  try {
    const payload = jwt.verify(
      token,
      env.JWT_ACCESS_SECRET,
    ) as AccessTokenPayload;

    const userId = Number(payload.sub);

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new AppError("Invalid authentication token", 401);
    }

    const user = await findUserById(userId);

    if (!user) {
      throw new AppError("User Not Found", 404);
    }

    if (!user.isActive) {
      throw new AppError("Account is inactive", 401);
    }

    req.user = {
      id: user.id,
      roleId: user.roleId,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Invalid or expired authentication token", 401);
  }
}
