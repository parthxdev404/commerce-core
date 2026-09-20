import { Router } from "express";

import {
  createProductController,
  deletedProductController,
  getProductByIdController,
  getProductsController,
  updateProductController,
} from "./product.controller.js";

import {
  createProductSchema,
  productIdParamSchema,
  productListQuerySchema,
  updateProductSchema,
} from "./product.schema.js";

import { validate } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { authenticate } from "../../middleware/auth.middlware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { USER_ROLES } from "../auth/auth.constant.js";

const productRouter = Router();

productRouter.post(
  "/",
  authenticate,
  authorize(USER_ROLES.VENDOR, USER_ROLES.ADMIN),
  validate(createProductSchema),
  asyncHandler(createProductController),
);

productRouter.get(
  "/",
  validate(productListQuerySchema, "query"),
  asyncHandler(getProductsController),
);

productRouter.get(
  "/:id",
  validate(productIdParamSchema, "params"),
  asyncHandler(getProductByIdController),
);

productRouter.patch(
  "/:id",
  authenticate,
  authorize(USER_ROLES.VENDOR),
  validate(productIdParamSchema, "params", "validatedParams"),
  validate(updateProductSchema, "body", "validatedBody"),
  asyncHandler(updateProductController),
);

productRouter.delete(
  "/:id",
  authenticate,
  authorize(USER_ROLES.VENDOR),
  validate(productIdParamSchema, "params", "validatedParams"),
  asyncHandler(deletedProductController),
);

export { productRouter };
