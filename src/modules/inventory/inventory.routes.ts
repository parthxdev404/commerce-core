import { Router } from "express";

import {
  getInventoryController,
  updateInventoryController,
} from "./inventory.controller.js";

import {
  productIdParamSchema,
  updateInventorySchema,
} from "./inventory.schema.js";

import { validate } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { authenticate } from "../../middleware/auth.middlware.js";
import { authorize } from "../../middleware/authorize.middleware.js";

import { USER_ROLES } from "../auth/auth.constant.js";

const inventoryRouter = Router();

inventoryRouter.get(
  "/products/:id",
  validate(productIdParamSchema, "params", "validatedParams"),
  asyncHandler(getInventoryController),
);

inventoryRouter.patch(
  "/products/:id",
  authenticate,
  authorize(USER_ROLES.VENDOR),
  validate(productIdParamSchema, "params", "validatedParams"),
  validate(updateInventorySchema, "body", "validatedBody"),
  asyncHandler(updateInventoryController),
);

export { inventoryRouter };
