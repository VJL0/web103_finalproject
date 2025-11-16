import { auth, requiredScopes } from "express-oauth2-jwt-bearer";
import { pool } from "./db.js";

if (!process.env.AUTH0_ISSUER_BASE_URL || !process.env.AUTH0_AUDIENCE) {
  throw new Error("Missing AUTH0_ISSUER_BASE_URL or AUTH0_AUDIENCE in server/.env");
}

export const requireAuth = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: "RS256",
});


// Create or update the user in our DB based on the Auth0 token
export async function getOrCreateUserFromToken(req) {
  const payload = req.auth?.payload || {};
  const sub = payload.sub;
  const email = payload.email || null;
  const name = payload.name || null;
  const picture = payload.picture || null;

  if (!sub) {
    throw new Error("Missing sub in access token");
  }

  // Check if user already exists
  const existing = await pool.query(
    "SELECT * FROM users WHERE auth0_sub = $1",
    [sub]
  );

  if (existing.rows.length > 0) {
    // Optional: keep email/name/picture up to date
    const current = existing.rows[0];

    const needsUpdate =
      current.email !== email ||
      current.name !== name ||
      current.picture !== picture;

    if (!needsUpdate) {
      return current;
    }

    const updated = await pool.query(
      `
      UPDATE users
      SET email = $2,
          name = $3,
          picture = $4,
          updated_at = now()
      WHERE auth0_sub = $1
      RETURNING *
      `,
      [sub, email, name, picture]
    );

    return updated.rows[0];
  }

  // Create new user
  const inserted = await pool.query(
    `
    INSERT INTO users (auth0_sub, email, name, picture)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (auth0_sub) DO UPDATE
      SET email = EXCLUDED.email,
          name = EXCLUDED.name,
          picture = EXCLUDED.picture,
          updated_at = now()
    RETURNING *
    `,
    [sub, email, name, picture]
  );

  return inserted.rows[0];
}
