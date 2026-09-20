import { db } from "../../db/client.js";

export interface Vendor {
  id: number;
  userId: number;
  storeName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function findVendorByUserId(
  userId: number,
): Promise<Vendor | null> {
  const result = await db.query(
    `
      SELECT
        id,
        user_id,
        store_name,
        is_active,
        created_at,
        updated_at
      FROM vendors
      WHERE user_id = $1
      LIMIT 1;
    `,
    [userId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}
