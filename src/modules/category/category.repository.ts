import { db } from "../../db/client.js";

import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.types.js";

export async function createCategory(
  input: CreateCategoryInput,
): Promise<Category> {
  const result = await db.query(
    `
      INSERT INTO categories (
        name,
        description
      )
      VALUES ($1, $2)
      RETURNING
        id,
        name,
        description,
        is_active,
        created_at,
        updated_at;
    `,
    [input.name, input.description ?? null],
  );

  return result.rows[0];
}

export async function findAllCategories(
  includeInactive = false,
): Promise<Category[]> {
  const result = await db.query(
    `
      SELECT
        id,
        name,
        description,
        is_active,
        created_at,
        updated_at
      FROM categories
      ${includeInactive ? "" : "WHERE is_active = TRUE"}
      ORDER BY name ASC;
    `,
  );

  return result.rows;
}

export async function findCategoryById(
  categoryId: number,
): Promise<Category | null> {
  const result = await db.query(
    `
      SELECT
        id,
        name,
        description,
        is_active,
        created_at,
        updated_at
      FROM categories
      WHERE id = $1
      LIMIT 1;
    `,
    [categoryId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

export async function updateCategory(
  categoryId: number,
  input: UpdateCategoryInput,
): Promise<Category | null> {
  const result = await db.query(
    `
      UPDATE categories
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        updated_at = NOW()
      WHERE id = $3
      RETURNING
        id,
        name,
        description,
        is_active,
        created_at,
        updated_at;
    `,
    [input.name ?? null, input.description ?? null, categoryId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

export async function deactivateCategory(
  categoryId: number,
): Promise<Category | null> {
  const result = await db.query(
    `
      UPDATE categories
      SET
        is_active = FALSE,
        updated_at = NOW()
      WHERE id = $1
        AND is_active = TRUE
      RETURNING
        id,
        name,
        description,
        is_active,
        created_at,
        updated_at;
    `,
    [categoryId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}
