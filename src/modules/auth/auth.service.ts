import { AppError } from "../../utils/app-error.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "./auth.repository.js";
import { comparePassword, hashPassword } from "./password.service.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";
import type { User } from "./auth.types.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "./token.service.js";
import { hashRefreshToken } from "./token-hash.service.js";
import { REFRESH_TOKEN_EXPIRES_IN_DAYS } from "./auth.constant.js";
import {
  createSession,
  findSessionByRefreshTokenHash,
  revokeSession,
  rotateSession,
} from "./session.repository.js";

export async function registerUser(input: RegisterInput): Promise<User> {
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const passwordHash = await hashPassword(input.password);

  const user = await createUser({
    roleId: 1,
    email: input.email,
    passwordHash,
    firstName: input.firstName,
    lastName: input.lastName,
    isActive: true,
  });

  return user;
}

export async function loginUser(input: LoginInput): Promise<{
  user: User;
  accessToken: string;
  refreshToken: string;
}> {
  const user = await findUserByEmail(input.email);

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new AppError("Account is inactive", 403);
  }

  if (!user.passwordHash) {
    throw new AppError("This account does not support password login", 401);
  }

  const passwordMatches = await comparePassword(
    input.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  const accessToken = generateAccessToken(user.id, user.roleId);

  const refreshToken = generateRefreshToken(user.id);

  const refreshTokenHash = hashRefreshToken(refreshToken);

  const refreshTokenExpiresAt = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
  );

  await createSession(user.id, refreshTokenHash, refreshTokenExpiresAt);

  return {
    user,
    accessToken,
    refreshToken,
  };
}

export async function refreshUserSession(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const payload = verifyRefreshToken(refreshToken);

  const userId = Number(payload.sub);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new AppError("Invalid refresh token", 401);
  }

  const refreshTokenHash = hashRefreshToken(refreshToken);

  const session = await findSessionByRefreshTokenHash(refreshTokenHash);

  if (!session) {
    throw new AppError("Invalid or revoked refresh token", 401);
  }

  if (session.revokedAt) {
    throw new AppError("Session has been revoked", 401);
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    throw new AppError("Refresh session has expired", 401);
  }

  if (session.userId !== userId) {
    throw new AppError("Invalid refresh token", 401);
  }

  const user = await findUserById(userId);

  if (!user) {
    throw new AppError("User account not found", 401);
  }

  if (!user.isActive) {
    throw new AppError("Account is inactive", 403);
  }

  const newAccessToken = generateAccessToken(user.id, user.roleId);

  const newRefreshToken = generateRefreshToken(user.id);

  const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

  const newExpiresAt = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
  );

  await rotateSession(session.id, newRefreshTokenHash, newExpiresAt);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

export async function logOutUser(refreshToken: string): Promise<void> {
  const refreshTokenHash = hashRefreshToken(refreshToken);

  const session = await findSessionByRefreshTokenHash(refreshToken);

  if (!session) {
    return;
  }

  await revokeSession(session.id);
}
