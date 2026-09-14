import { Router } from "express";

import { loginController, registerController } from "./auth.controller.js";

import { loginSchema, registerSchema } from "./auth.schema.js";

import { validate } from "../../middleware/validate.middleware.js";

import { asyncHandler } from "../../utils/async-handler.js";

const authRouter = Router();

authRouter.post(
  "/register",
  validate(registerSchema),
  asyncHandler(registerController),
);

authRouter.post("/login", validate(loginSchema), asyncHandler(loginController));

export { authRouter };
