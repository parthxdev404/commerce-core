import { db } from "../../db/client.js";

import type { CreateUserInput, User } from "./auth.types.js";

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await db.query(
    `
    SELECT
  id,
  role_id AS "roleId",
  email,
  password_hash AS "passwordHash",
  first_name AS "firstName",
  last_name AS "lastName",
  is_active AS "isActive",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
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
        last_name,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        role_id AS "roleId",
        email,
        password_hash AS "passwordHash",
        first_name AS "firstName",
        last_name AS "lastName",
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt";
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
        role_id AS "roleId",
        email,
        password_hash AS "passwordHash",
        first_name AS "firstName",
        last_name AS "lastName",
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
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
