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

export async function findAllProducts(
  query: ProductListQuery,
): Promise<Product[]> {
  const { page, limit, search, categoryId, minPrice, maxPrice, sort, order } =
    query;

  const conditions: string[] = ["is_active = TRUE"];

  const values: unknown[] = [];

  let parameterIndex = 1;

  if (search) {
    conditions.push(`
      (
        name ILIKE $${parameterIndex}
        OR description ILIKE $${parameterIndex}
        OR sku ILIKE $${parameterIndex}
      )
    `);

    values.push(`%${search}%`);
    parameterIndex++;
  }

  if (categoryId !== undefined) {
    conditions.push(`category_id = $${parameterIndex}`);

    values.push(categoryId);
    parameterIndex++;
  }

  if (minPrice !== undefined) {
    conditions.push(`price >= $${parameterIndex}`);

    values.push(minPrice);
    parameterIndex++;
  }

  if (maxPrice !== undefined) {
    conditions.push(`price <= $${parameterIndex}`);

    values.push(maxPrice);
    parameterIndex++;
  }

  const allowedSortColumns = {
    created_at: "created_at",
    price: "price",
    name: "name",
  } as const;

  const sortColumn = allowedSortColumns[sort];

  const sortOrder = order === "asc" ? "ASC" : "DESC";

  const offset = (page - 1) * limit;

  values.push(limit);
  const limitParameter = parameterIndex;
  parameterIndex++;

  values.push(offset);
  const offsetParameter = parameterIndex;

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
      WHERE ${conditions.join(" AND ")}
      ORDER BY ${sortColumn} ${sortOrder}
      LIMIT $${limitParameter}
      OFFSET $${offsetParameter};
    `,
    values,
  );

  return result.rows;
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
