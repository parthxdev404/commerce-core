import { db } from "../../db/client.js";
import type {
  AddCartItemsInput,
  Cart,
  CartItem,
  UpdateCartItemsInput,
} from "./cart.types.js";

export async function findCartByUserId(userId: number): Promise<Cart | null> {
  const result = await db.query(
    `
      SELECT
        id,
        user_id,
        created_at,
        updated_at
      FROM carts
      WHERE user_id = $1
      LIMIT 1;
    `,
    [userId],
  );

  if (result.rows.length === 0) return null;

  return result.rows[0];
}

export async function createCart(userId: number): Promise<Cart> {
  const result = await db.query(
    `
      INSERT INTO carts (user_id)
      VALUES ($1)
      RETURNING
        id,
        user_id,
        created_at,
        updated_at;
    `,
    [userId],
  );

  return result.rows[0];
}

export async function findCartItem(
  cartId: number,
  productId: number,
): Promise<CartItem | null> {
  const result = await db.query(
    `
      SELECT
        ci.id,
        ci.cart_id,
        ci.product_id,
        ci.quantity,
        p.name AS product_name,
        p.price,
        p.is_active
      FROM cart_items ci
      JOIN products p
        ON p.id = ci.product_id
      WHERE ci.cart_id = $1
        AND ci.product_id = $2
      LIMIT 1;
    `,
    [cartId, productId],
  );

  if (result.rows.length === 0) return null;

  return result.rows[0];
}

export async function addCartItem(
  cartId: number,
  input: AddCartItemsInput,
): Promise<CartItem> {
  const result = await db.query(
    `
      INSERT INTO cart_items (
        cart_id,
        product_id,
        quantity
      )
      VALUES ($1, $2, $3)
      ON CONFLICT (cart_id, product_id)
      DO UPDATE SET
        quantity = cart_items.quantity + EXCLUDED.quantity,
        updated_at = NOW()
      RETURNING
        id,
        cart_id,
        product_id,
        quantity;
    `,
    [cartId, input.productId, input.quantity],
  );

  return result.rows[0];
}

export async function updateCartItem(
  cartId: number,
  itemId: number,
  input: UpdateCartItemsInput,
): Promise<CartItem | null> {
  const result = await db.query(
    `
      UPDATE cart_items
      SET
        quantity = $1,
        updated_at = NOW()
      WHERE id = $2
        AND cart_id = $3
      RETURNING
        id,
        cart_id,
        product_id,
        quantity;
    `,
    [input.quantity, itemId, cartId],
  );

  if (result.rows.length === 0) return null;

  return result.rows[0];
}

export async function deleteCartItem(
  cartId: number,
  itemId: number,
): Promise<boolean> {
  const result = await db.query(
    `
      DELETE FROM cart_items
      WHERE id = $1
        AND cart_id = $2;
    `,
    [itemId, cartId],
  );

  return result.rowCount === 1;
}

export async function findCartItems(cartId: number): Promise<CartItem[]> {
  const result = await db.query(
    `
      SELECT
        ci.id,
        ci.cart_id,
        ci.product_id,
        ci.quantity,
        p.name AS product_name,
        p.price,
        p.is_active
      FROM cart_items ci
      JOIN products p
        ON p.id = ci.product_id
      WHERE ci.cart_id = $1
      ORDER BY ci.id ASC;
    `,
    [cartId],
  );

  return result.rows;
}
