import type { Request, Response } from "express";

import {
  loginUser,
  logOutUser,
  refreshUserSession,
  registerUser,
} from "./auth.service.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../../config/cookie.js";

import { findUserById } from "./auth.repository.js";
import { AppError } from "../../utils/app-error.js";

export async function registerController(
  _req: Request,
  res: Response,
): Promise<void> {
  const input = res.locals.validated as RegisterInput;

  const user = await registerUser(input);

  res.status(201).json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
    },
  });
}

export async function loginController(
  _req: Request,
  res: Response,
): Promise<void> {
  const input = res.locals.validated as LoginInput;

  const { user, accessToken, refreshToken } = await loginUser(input);

  res.cookie("access_token", accessToken, accessTokenCookieOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenCookieOptions);

  res.status(200).json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
    },
    accessToken,
    refreshToken,
  });
}

export async function getMeController(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const user = await findUserById(req.user.id);

  if (!user) {
    throw new AppError("User account not found", 401);
  }

  if (!user.isActive) {
    throw new AppError("Account is inactive", 403);
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: user.roleId,
      },
    },
  });
}

export async function refreshController(
  req: Request,
  res: Response,
): Promise<void> {
  const refreshToken = req.cookies?.refresh_token;

  if (!refreshToken) {
    throw new AppError("Refresh token is required", 401);
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await refreshUserSession(refreshToken);

  res.cookie("access_token", accessToken, accessTokenCookieOptions);

  res.cookie("refresh_token", newRefreshToken, refreshTokenCookieOptions);

  res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
  });
}

export async function logOutController(
  req: Request,
  res: Response,
): Promise<void> {
  const refreshToken = req.cookies?.refresh_token;

  if (refreshToken) {
    await logOutUser(refreshToken);
  }

  res.clearCookie("access_token", {
    path: "/",
  });
  res.clearCookie("refresh_token", {
    path: "/",
  });

  res.status(200).json({
    success: true,
    message: "Logged Out Successfully",
  });
}
