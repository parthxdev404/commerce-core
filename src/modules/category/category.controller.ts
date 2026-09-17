import type { Request, Response } from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from "./category.service.js";

export async function createCategoryController(
  req: Request,
  res: Response,
): Promise<void> {
  const category = await createCategory(res.locals.validated);

  res.status(201).json({
    success: true,
    data: {
      category,
    },
  });
}

export async function getCategoriesController(
  _req: Request,
  res: Response,
): Promise<void> {
  const { id } = res.locals.validated;

  const category = await getCategoryById(id);

  res.status(200).json({
    success: true,
    data: {
      category,
    },
  });
}

export async function getCategoryByIdController(
  _req: Request,
  res: Response,
): Promise<void> {
  const { id } = res.locals.validated;

  const category = await getCategoryById(id);

  res.status(200).json({
    success: true,
    data: {
      category,
    },
  });
}

export async function updateCategoryController(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = res.locals.validatedParams;

  const category = await updateCategory(id, res.locals.validatedBody);

  res.status(200).json({
    success: true,
    data: {
      category,
    },
  });
}

export async function deleteCategoryController(
  _req: Request,
  res: Response,
): Promise<void> {
  const { id } = res.locals.validated;

  const category = await deleteCategory(id);

  res.status(200).json({
    success: true,
    message: "Category Deactivated Successfully",
    data: {
      category,
    },
  });
}
