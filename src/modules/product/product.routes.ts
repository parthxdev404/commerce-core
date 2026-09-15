import { Router } from "express";

import {
  createProductController,
  getProductByIdController,
  getProductsController,
} from "./product.controller.js";

import {
  createProductSchema,
  productIdParamSchema,
  productListQuerySchema,
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

export { productRouter };
