import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import {
  createCategoryController,
  getCategoriesController,
  getCategoryByIdController,
  updateCategoryController,
  deleteCategoryController,
} from "./category.controller.js";

import {
  categoryIdParamSchema,
  categoryListQuerySchema,
  createCategorySchema,
  updateCategorySchema,
} from "./category.schema.js";
import { authenticate } from "../../middleware/auth.middlware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { USER_ROLES } from "../auth/auth.constant.js";

const categoryRouter = Router();

categoryRouter.post(
  "/",
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validate(createCategorySchema),
  asyncHandler(createCategoryController),
);

categoryRouter.get(
  "/",
  validate(categoryListQuerySchema, "query"),
  asyncHandler(getCategoriesController),
);

categoryRouter.get(
  "/:id",
  validate(categoryIdParamSchema, "params"),
  asyncHandler(getCategoryByIdController),
);

categoryRouter.patch(
  "/:id",
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validate(categoryIdParamSchema, "params", "validatedParams"),
  validate(updateCategorySchema, "body", "validatedBody"),
  asyncHandler(updateCategoryController),
);

categoryRouter.delete(
  "/:id",
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validate(categoryIdParamSchema, "params"),
  asyncHandler(deleteCategoryController),
);

export { categoryRouter };
