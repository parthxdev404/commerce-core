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

const productRouter = Router();

productRouter.post(
  "/",
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
