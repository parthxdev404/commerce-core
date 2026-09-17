import { Router } from "express";

import {
  getMeController,
  loginController,
  logOutController,
  refreshController,
  registerController,
} from "./auth.controller.js";

import { loginSchema, registerSchema } from "./auth.schema.js";

import { validate } from "../../middleware/validate.middleware.js";

import { asyncHandler } from "../../utils/async-handler.js";
import { authenticate } from "../../middleware/auth.middlware.js";
import {
  loginRateLimiter,
  refreshRateLimiter,
} from "../../middleware/rate-limit.middleware.js";

const authRouter = Router();

authRouter.post(
  "/register",
  validate(registerSchema),
  asyncHandler(registerController),
);

authRouter.post(
  "/login",
  loginRateLimiter,
  validate(loginSchema),
  asyncHandler(loginController),
);
authRouter.get("/me", authenticate, asyncHandler(getMeController));
authRouter.post(
  "/refresh",
  refreshRateLimiter,
  asyncHandler(refreshController),
);
authRouter.post("/logout", asyncHandler(logOutController));
export { authRouter };
