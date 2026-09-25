import { db } from "../../db/client.js";

import type { Inventory, UpdateInventoryInput } from "./inventory.types.js";

function mapInventory(row: {
  product_id: number;
  quantity: number;
  reserved_quantity: number;
  updated_at: Date;
}): Inventory {
  return {
    productId: row.product_id,
    quantity: row.quantity,
    reservedQuantity: row.reserved_quantity,
    availableQuantity: row.quantity - row.reserved_quantity,
    updatedAt: row.updated_at,
  };
}

export async function findInventoryByProductId(
  productId: number,
): Promise<Inventory | null> {
  const result = await db.query(
    `
      SELECT
        product_id,
        quantity,
        reserved_quantity,
        updated_at
      FROM inventory
      WHERE product_id = $1
      LIMIT 1;
    `,
    [productId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapInventory(result.rows[0]);
}

export async function createInventory(
  productId: number,
  quantity = 0,
): Promise<Inventory> {
  const result = await db.query(
    `
      INSERT INTO inventory (
        product_id,
        quantity
      )
      VALUES ($1, $2)
      RETURNING
        product_id,
        quantity,
        reserved_quantity,
        updated_at;
    `,
    [productId, quantity],
  );

  return mapInventory(result.rows[0]);
}

export async function updateInventoryQuantity(
  productId: number,
  input: UpdateInventoryInput,
): Promise<Inventory | null> {
  const result = await db.query(
    `
      UPDATE inventory
      SET
        quantity = $1,
        updated_at = NOW()
      WHERE product_id = $2
        AND $1 >= reserved_quantity
      RETURNING
        product_id,
        quantity,
        reserved_quantity,
        updated_at;
    `,
    [input.quantity, productId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapInventory(result.rows[0]);
}

export async function reserveInventory(
  productId: number,
  quantity: number,
): Promise<Inventory | null> {
  const result = await db.query(
    `
      UPDATE inventory
      SET
        reserved_quantity =
          reserved_quantity + $1,
        updated_at = NOW()
      WHERE product_id = $2
        AND quantity - reserved_quantity >= $1
      RETURNING
        product_id,
        quantity,
        reserved_quantity,
        updated_at;
    `,
    [quantity, productId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapInventory(result.rows[0]);
}

export async function releaseInventoryReservation(
  productId: number,
  quantity: number,
): Promise<Inventory | null> {
  const result = await db.query(
    `
      UPDATE inventory
      SET
        reserved_quantity =
          reserved_quantity - $1,
        updated_at = NOW()
      WHERE product_id = $2
        AND reserved_quantity >= $1
      RETURNING
        product_id,
        quantity,
        reserved_quantity,
        updated_at;
    `,
    [quantity, productId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapInventory(result.rows[0]);
}

export async function confirmInventoryReservation(
  productId: number,
  quantity: number,
): Promise<Inventory | null> {
  const result = await db.query(
    `
      UPDATE inventory
      SET
        quantity = quantity - $1,
        reserved_quantity =
          reserved_quantity - $1,
        updated_at = NOW()
      WHERE product_id = $2
        AND reserved_quantity >= $1
      RETURNING
        product_id,
        quantity,
        reserved_quantity,
        updated_at;
    `,
    [quantity, productId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapInventory(result.rows[0]);
}
