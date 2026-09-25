import { db } from "../../db/client.js";

import type {
  CreateProductInput,
  Product,
  ProductListQuery,
} from "./product.types.js";

export interface ProductListResult {
  products: Product[];
  total: number;
}

export async function createProduct(
  input: CreateProductInput,
): Promise<Product> {
  const result = await db.query(
    `
      INSERT INTO products (
        vendor_id,
        category_id,
        name,
        description,
        sku,
        price
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        vendor_id,
        category_id,
        name,
        description,
        sku,
        price,
        is_active,
        created_at,
        updated_at;
    `,
    [
      input.vendorId,
      input.categoryId,
      input.name,
      input.description ?? null,
      input.sku,
      input.price,
    ],
  );

  return result.rows[0];
}

export async function findProductById(
  productId: number,
): Promise<Product | null> {
  const result = await db.query(
    `
      SELECT
        p.id,
        p.vendor_id,
        p.category_id,
        p.name,
        p.description,
        p.sku,
        p.price,
        p.is_active,
        p.created_at,
        p.updated_at,
        c.name AS category_name,
        v.store_name AS vendor_name
      FROM products p
      JOIN categories c
        ON p.category_id = c.id
      JOIN vendors v
        ON p.vendor_id = v.id
      WHERE p.id = $1
        AND p.is_active = TRUE
      LIMIT 1;
    `,
    [productId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

export async function findAllProducts(
  query: ProductListQuery,
): Promise<ProductListResult> {
  const { page, limit, search, categoryId, minPrice, maxPrice, sort, order } =
    query;

  const conditions: string[] = ["p.is_active = TRUE"];

  const values: unknown[] = [];

  let parameterIndex = 1;

  // Search
  if (search) {
    conditions.push(`
      (
        p.name ILIKE $${parameterIndex}
        OR p.description ILIKE $${parameterIndex}
        OR p.sku ILIKE $${parameterIndex}
      )
    `);

    values.push(`%${search}%`);
    parameterIndex++;
  }

  // Category filter
  if (categoryId !== undefined) {
    conditions.push(`p.category_id = $${parameterIndex}`);

    values.push(categoryId);
    parameterIndex++;
  }

  // Minimum price
  if (minPrice !== undefined) {
    conditions.push(`p.price >= $${parameterIndex}`);

    values.push(minPrice);
    parameterIndex++;
  }

  // Maximum price
  if (maxPrice !== undefined) {
    conditions.push(`p.price <= $${parameterIndex}`);

    values.push(maxPrice);
    parameterIndex++;
  }

  const whereClause = conditions.join(" AND ");

  /*
   * Never directly trust a client-provided column name.
   *
   * SQL parameters ($1, $2...) are for values,
   * not SQL identifiers such as column names.
   *
   * Therefore we whitelist the allowed columns.
   */
  const allowedSortColumns = {
    created_at: "p.created_at",
    price: "p.price",
    name: "p.name",
  } as const;

  const sortColumn = allowedSortColumns[sort];

  /*
   * Zod already restricts this to asc/desc,
   * but we still explicitly convert it to SQL syntax.
   */
  const sortOrder = order === "asc" ? "ASC" : "DESC";

  const offset = (page - 1) * limit;

  /*
   * Count query
   *
   * This tells the client how many products
   * match the current filters.
   */
  const countResult = await db.query(
    `
      SELECT COUNT(*)::int AS total
      FROM products p
      WHERE ${whereClause};
    `,
    values,
  );

  /*
   * Data query
   *
   * Use the same filter values and append
   * limit + offset as additional parameters.
   */
  const dataValues = [...values, limit, offset];

  const limitParameter = parameterIndex;
  const offsetParameter = parameterIndex + 1;

  const result = await db.query(
    `
      SELECT
        p.id,
        p.vendor_id,
        p.category_id,
        p.name,
        p.description,
        p.sku,
        p.price,
        p.is_active,
        p.created_at,
        p.updated_at,
        c.name AS category_name,
        v.store_name AS vendor_name
      FROM products p
      JOIN categories c
        ON p.category_id = c.id
      JOIN vendors v
        ON p.vendor_id = v.id
      WHERE ${whereClause}
      ORDER BY ${sortColumn} ${sortOrder}, p.id ASC
      LIMIT $${limitParameter}
      OFFSET $${offsetParameter};
    `,
    dataValues,
  );

  return {
    products: result.rows,
    total: countResult.rows[0].total,
  };
}

export async function findProductByIdAndVendorId(
  productId: number,
  vendorId: number,
): Promise<Product | null> {
  const result = await db.query(
    `
      SELECT
        id,
        vendor_id,
        category_id,
        name,
        description,
        sku,
        price,
        is_active,
        created_at,
        updated_at
      FROM products
      WHERE id = $1
        AND vendor_id = $2
      LIMIT 1;
    `,
    [productId, vendorId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

export async function updateProductByVendor(
  productId: number,
  vendorId: number,
  input: {
    categoryId?: number;
    name?: string;
    description?: string;
    price?: number;
  },
): Promise<Product | null> {
  const result = await db.query(
    `
      UPDATE products
      SET
        category_id = COALESCE($1, category_id),
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        price = COALESCE($4, price),
        updated_at = NOW()
      WHERE id = $5
        AND vendor_id = $6
      RETURNING
        id,
        vendor_id,
        category_id,
        name,
        description,
        sku,
        price,
        is_active,
        created_at,
        updated_at;
    `,
    [
      input.categoryId ?? null,
      input.name ?? null,
      input.description ?? null,
      input.price ?? null,
      productId,
      vendorId,
    ],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

export async function deactivateProductByVendor(
  productId: number,
  vendorId: number,
): Promise<Product | null> {
  const result = await db.query(
    `
      UPDATE products
      SET
        is_active = FALSE,
        updated_at = NOW()
      WHERE id = $1
        AND vendor_id = $2
        AND is_active = TRUE
      RETURNING
        id,
        vendor_id,
        category_id,
        name,
        description,
        sku,
        price,
        is_active,
        created_at,
        updated_at;
    `,
    [productId, vendorId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}
