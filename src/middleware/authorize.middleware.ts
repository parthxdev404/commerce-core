import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error.js";

export function authorize(...allowedRoles: number[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    if (!allowedRoles.includes(req.user.roleId)) {
      throw new AppError(
        "You do not have permission to perform this action",
        403,
      );
    }
    next();
  };
}
