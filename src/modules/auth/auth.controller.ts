import type { Request, Response } from "express";

import { loginUser, registerUser } from "./auth.service.js";

import type { LoginInput, RegisterInput } from "./auth.schema.js";

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

  const user = await loginUser(input);

  res.status(200).json({
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
