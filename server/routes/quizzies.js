import express from "express";
import { pool } from "../db.js";
import { requireAuth } from "../auth.js";

const router = express.Router();

/** Helper: get current DB user id from Auth0 sub */
async function getUserIdBySub(sub) {
  const { rows } = await pool.query(
    `SELECT id FROM users WHERE auth0_sub = $1`,
    [sub]
  );
  return rows[0]?.id || null;
}

/** PUBLIC: list all public quizzes for landing page */
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT q.id, q.title, q.description, q.category, q.created_at,
             u.name AS author_name, u.picture AS author_picture
      FROM quizzes q
      JOIN users u ON u.id = q.author_id
      WHERE q.visibility = 'PUBLIC'
      ORDER BY q.created_at DESC
      LIMIT 100
    `);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Get all quizzes for the currently logged-in user (with card counts)
router.get("/mine", requireAuth, async (req, res) => {
  try {
    const sub = req.auth?.payload?.sub;
    if (!sub) return res.status(401).json({ error: "Unauthorized" });

    const sql = `
      SELECT
        q.id,
        q.title,
        q.description,
        q.category,
        q.visibility,
        q.created_at,
        q.updated_at,
        COUNT(c.id) AS card_count
      FROM quizzes q
      JOIN users u ON u.id = q.author_id
      LEFT JOIN cards c ON c.quiz_id = q.id
      WHERE u.auth0_sub = $1
      GROUP BY q.id
      ORDER BY q.created_at DESC;
    `;

    const { rows } = await pool.query(sql, [sub]);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

/** PUBLIC: get a quiz and its cards by id */
router.get("/:id", async (req, res) => {
  try {
    const quizId = req.params.id;
    const quizRes = await pool.query(
      `SELECT q.id, q.title, q.description, q.category, q.visibility,
              q.created_at, q.updated_at,
              u.name AS author_name, u.picture AS author_picture
       FROM quizzes q
       JOIN users u ON u.id = q.author_id
       WHERE q.id = $1`,
      [quizId]
    );
    if (quizRes.rowCount === 0) return res.status(404).json({ error: "Not found" });

    const cardsRes = await pool.query(
      `SELECT id, question, answer, "order", created_at, updated_at
       FROM cards
       WHERE quiz_id = $1
       ORDER BY COALESCE("order", 999999), created_at ASC`,
      [quizId]
    );

    res.json({ quiz: quizRes.rows[0], cards: cardsRes.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

/** AUTH: create a new quiz (empty card list for now) */
router.post("/", requireAuth, async (req, res) => {
  try {
    const sub = req.auth?.payload?.sub;
    if (!sub) return res.status(401).json({ error: "Unauthorized" });

    const userId = await getUserIdBySub(sub);
    if (!userId) return res.status(403).json({ error: "User not found in DB. Did you call /api/users/me after login?" });

    const { title, description = null, category = null, visibility = "PUBLIC" } = req.body || {};
    if (!title || typeof title !== "string") return res.status(400).json({ error: "title is required" });
    if (!["PUBLIC", "PRIVATE"].includes(visibility)) return res.status(400).json({ error: "invalid visibility" });

    const insert = await pool.query(
      `INSERT INTO quizzes (author_id, title, description, category, visibility)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, title, description, category, visibility, created_at, updated_at`,
      [userId, title, description, category, visibility]
    );

    res.status(201).json(insert.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});



export default router;
