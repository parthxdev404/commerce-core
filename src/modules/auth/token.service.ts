import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

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
