import { Router } from "express";

import {
  getMe,
  loginController,
  logOutController,
  refreshController,
  registerController,
} from "./auth.controller.js";

import { loginSchema, registerSchema } from "./auth.schema.js";

import { validate } from "../../middleware/validate.middleware.js";

import { asyncHandler } from "../../utils/async-handler.js";
import { authenticate } from "../../middleware/auth.middlware.js";

const authRouter = Router();

authRouter.post(
  "/register",
  validate(registerSchema),
  asyncHandler(registerController),
);

authRouter.post("/login", validate(loginSchema), asyncHandler(loginController));
authRouter.get("/me", authenticate, asyncHandler(getMe));
authRouter.post("/refresh", asyncHandler(refreshController));
authRouter.post("/logout", asyncHandler(logOutController));
export { authRouter };
