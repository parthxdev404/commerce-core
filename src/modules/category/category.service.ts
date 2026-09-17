import { AppError } from "../../utils/app-error.js";
import {
  createCategory as CreateCategoryRepository,
  updateCategory as UpdateCategoryRepository,
  deactivateCategory,
  findAllCategories,
  findCategoryById,
} from "./category.repository.js";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.schema.js";

export async function createCategory(input: CreateCategoryInput) {
  return CreateCategoryRepository(input);
}

export async function getCategories(includeInactive = false) {
  return findAllCategories(includeInactive);
}

export async function getCategoryById(categoryId: number) {
  const category = await findCategoryById(categoryId);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
}

export async function updateCategory(
  categoryId: number,
  input: UpdateCategoryInput,
) {
  const existingCategory = await findCategoryById(categoryId);
  if (!existingCategory) {
    throw new AppError("Category Not Found", 404);
  }

  if (!existingCategory.isActive) {
    throw new AppError("Cannot Update an inactive category", 400);
  }

  return UpdateCategoryRepository(categoryId, input);
}

export async function deleteCategory(categoryId: number) {
  const category = await findCategoryById(categoryId);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  if (!category.isActive) {
    throw new AppError("Category is already inactive", 400);
  }

  return deactivateCategory(categoryId);
}
