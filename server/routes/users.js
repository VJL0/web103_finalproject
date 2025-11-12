import express from "express";
import { pool } from "../db.js";
import { requireAuth } from "../auth.js";

const router = express.Router();

// Upsert the current user based on Auth0 token, then return the row
router.post("/me", requireAuth, async (req, res) => {
  try {
    const payload = req.auth?.payload;
    const sub = payload?.sub;
    const email = payload?.email || null;
    const name = payload?.name || null;
    const picture = payload?.picture || null;

    if (!sub) return res.status(400).json({ error: "Missing auth0 sub in token" });

    const upsertSql = `
      INSERT INTO users (auth0_sub, email, name, picture)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (auth0_sub)
      DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, picture = EXCLUDED.picture, updated_at = now()
      RETURNING id, auth0_sub, email, name, picture, created_at, updated_at
    `;
    const { rows } = await pool.query(upsertSql, [sub, email, name, picture]);
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
