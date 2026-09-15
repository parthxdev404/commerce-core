import { db } from "../../db/client.js";

export interface Session {
  id: number;
  userId: number;
  refreshTokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}

export async function createSession(
  userId: number,
  refreshTokenHash: string,
  expiresAt: Date,
): Promise<Session> {
  const result = await db.query(
    `
      INSERT INTO sessions (
        user_id,
        refresh_token_hash,
        expires_at
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        user_id,
        refresh_token_hash,
        expires_at,
        revoked_at,
        created_at;
    `,
    [userId, refreshTokenHash, expiresAt],
  );

  return result.rows[0];
}

export async function findSessionByRefreshTokenHash(
  refreshTokenHash: string,
): Promise<Session | null> {
  const result = await db.query(
    `
      SELECT
        id,
        user_id,
        refresh_token_hash,
        expires_at,
        revoked_at,
        created_at
      FROM sessions
      WHERE refresh_token_hash = $1
      LIMIT 1;
    `,
    [refreshTokenHash],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

export async function rotateSession(
  sessionId: number,
  refreshTokenHash: string,
  expiresAt: Date,
): Promise<Session> {
  const result = await db.query(
    `
      UPDATE sessions
      SET
        refresh_token_hash = $1,
        expires_at = $2
      WHERE id = $3
        AND revoked_at IS NULL
      RETURNING
        id,
        user_id,
        refresh_token_hash,
        expires_at,
        revoked_at,
        created_at;
    `,
    [refreshTokenHash, expiresAt, sessionId],
  );

  return result.rows[0];
}

export async function revokeSession(sessionId: number): Promise<void> {
  await db.query(
    `
      UPDATE sessions
      SET revoked_at = NOW()
      WHERE id = $1
        AND revoked_at IS NULL;
    `,
    [sessionId],
  );
}
