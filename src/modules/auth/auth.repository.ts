import { db } from "../../db/client.js";

import type { CreateUserInput, User } from "./auth.types.js";

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await db.query(
    `
      SELECT
        id,
        role_id,
        email,
        password_hash,
        first_name,
        last_name,
        is_active,
        created_at,
        updated_at
      FROM users
      WHERE email = $1
      LIMIT 1;
    `,
    [email],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const result = await db.query(
    `
      INSERT INTO users (
        role_id,
        email,
        password_hash,
        first_name,
        last_name
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        role_id,
        email,
        password_hash,
        first_name,
        last_name,
        is_active,
        created_at,
        updated_at;
    `,
    [
      input.roleId,
      input.email,
      input.passwordHash,
      input.firstName,
      input.lastName,
      input.isActive,
    ],
  );

  return result.rows[0];
}

export async function findUserById(userId: number): Promise<User | null> {
  const result = await db.query(
    `
      SELECT
        id,
        role_id,
        email,
        password_hash,
        first_name,
        last_name,
        is_active,
        created_at,
        updated_at
      FROM users
      WHERE id = $1
      LIMIT 1;
    `,
    [userId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}
