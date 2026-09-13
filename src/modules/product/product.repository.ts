import { db } from "../../db/client.js";
import type {
  CreateProductInput,
  Product,
  ProductListQuery,
  ProductListResult,
} from "./product.types.js";

export async function createProduct(
  input: CreateProductInput,
): Promise<Product> {
  try {
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
  } catch (error: any) {
    // Check for PostgreSQL foreign_key_violation error code
    if (error.code === "23503") {
      if (error.constraint === "fk_products_vendor") {
        throw new Error(`Vendor with ID ${input.vendorId} does not exist.`);
      }
      if (error.constraint === "fk_products_category") {
        throw new Error(`Category with ID ${input.categoryId} does not exist.`);
      }
    }
    throw error;
  }
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
        AND p.is_active = TRUE;
    `,
    [productId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

export async function findProducts(
  query: ProductListQuery,
): Promise<ProductListResult> {
  const values: unknown[] = [];

  const conditions: string[] = ["p.is_active = TRUE"];

  if (query.search) {
    values.push(`%${query.search}%`);

    conditions.push(`
      (
        p.name ILIKE $${values.length}
        OR p.description ILIKE $${values.length}
        OR p.sku ILIKE $${values.length}
      )
    `);
  }

  if (query.categoryId !== undefined) {
    values.push(query.categoryId);

    conditions.push(`p.category_id = $${values.length}`);
  }

  const whereClause = conditions.join(" AND ");

  const offset = (query.page - 1) * query.limit;

  values.push(query.limit);
  const limitParameter = `$${values.length}`;

  values.push(offset);
  const offsetParameter = `$${values.length}`;

  const allowedSortColumns = {
    created_at: "p.created_at",
    price: "p.price",
    name: "p.name",
  };

  const sortColumn = allowedSortColumns[query.sort];

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
      ORDER BY ${sortColumn} ${query.order}
      LIMIT ${limitParameter}
      OFFSET ${offsetParameter};
    `,
    values,
  );

  const countValues = values.slice(0, values.length - 2);

  const countResult = await db.query(
    `
      SELECT COUNT(*)::INTEGER AS total
      FROM products p
      JOIN categories c
        ON p.category_id = c.id
      JOIN vendors v
        ON p.vendor_id = v.id
      WHERE ${whereClause};
    `,
    countValues,
  );

  const total = countResult.rows[0].total;

  return {
    products: result.rows,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}
