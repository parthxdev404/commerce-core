import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/app-error.js";
interface AccessTokenPayload {
  sub: string;
  roleId: number;
}

interface RefreshTokenPayload {
  sub: string;
}

export function generateAccessToken(userId: number, roleId: number): string {
  const payload: AccessTokenPayload = {
    sub: String(userId),
    roleId,
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
}

export function generateRefreshToken(userId: number): string {
  const payload: RefreshTokenPayload = {
    sub: String(userId),
  };

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const payload = jwt.verify(
      token,
      env.JWT_REFRESH_SECRET,
    ) as RefreshTokenPayload;

    if (typeof payload.sub !== "string" || !payload.sub) {
      throw new AppError("Invalid refresh token", 401);
    }

    return payload;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Invalid or expired refresh token", 401);
  }
}
