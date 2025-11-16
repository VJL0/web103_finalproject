import express from "express";
import { pool } from "../db.js";
import { requireAuth, getOrCreateUserFromToken } from "../auth.js";

const router = express.Router();

/**
 * GET /api/quizzies/mine
 * Return quizzes for the currently logged-in user
 */
router.get("/mine", requireAuth, async (req, res) => {
  try {
    const user = await getOrCreateUserFromToken(req);

    const sql = `
      SELECT
        q.id,
        q.title,
        q.description,
        q.category,
        q.visibility,
        q.created_at,
        q.updated_at,
        COUNT(c.id)::int AS card_count
      FROM quizzes q
      LEFT JOIN cards c ON c.quiz_id = q.id
      WHERE q.author_id = $1
      GROUP BY q.id
      ORDER BY q.created_at DESC;
    `;

    const { rows } = await pool.query(sql, [user.id]);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/quizzies/public
 * Return all PUBLIC quizzes (anyone can see)
 */
router.get("/public", async (req, res) => {
  try {
    const sql = `
      SELECT
        q.id,
        q.title,
        q.description,
        q.category,
        q.visibility,
        q.created_at,
        q.updated_at,
        COUNT(c.id)::int AS card_count,
        u.name AS author_name
      FROM quizzes q
      JOIN users u ON u.id = q.author_id
      LEFT JOIN cards c ON c.quiz_id = q.id
      WHERE q.visibility = 'PUBLIC'
      GROUP BY q.id, u.name
      ORDER BY q.created_at DESC;
    `;

    const { rows } = await pool.query(sql);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/quizzies
 * Create a new quiz for the logged-in user
 * Body: { title, description, category, visibility }
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const user = await getOrCreateUserFromToken(req);
    const { title, description, category, visibility } = req.body;

    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Title is required" });
    }

    let vis = visibility || "PUBLIC";
    if (!["PUBLIC", "PRIVATE"].includes(vis)) {
      return res.status(400).json({ error: "visibility must be PUBLIC or PRIVATE" });
    }

    const insertSql = `
      INSERT INTO quizzes (author_id, title, description, category, visibility)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, author_id, title, description, category, visibility, created_at, updated_at;
    `;

    const { rows } = await pool.query(insertSql, [
      user.id,
      title,
      description || null,
      category || null,
      vis,
    ]);

    const quiz = rows[0];
    // newly created quiz has 0 cards
    res.status(201).json({ ...quiz, card_count: 0 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

/**
 * PUT /api/quizzies/:id
 * Update quiz (only owner can update)
 */
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const user = await getOrCreateUserFromToken(req);
    const quizId = req.params.id;
    const { title, description, category, visibility } = req.body;

    const quizRes = await pool.query(
      "SELECT * FROM quizzes WHERE id = $1",
      [quizId]
    );
    if (quizRes.rows.length === 0) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    const quiz = quizRes.rows[0];

    if (quiz.author_id !== user.id) {
      return res.status(403).json({ error: "Not allowed to edit this quiz" });
    }

    let vis = visibility || quiz.visibility;
    if (!["PUBLIC", "PRIVATE"].includes(vis)) {
      return res.status(400).json({ error: "visibility must be PUBLIC or PRIVATE" });
    }

    const updateSql = `
      UPDATE quizzes
      SET
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        category = COALESCE($4, category),
        visibility = $5,
        updated_at = now()
      WHERE id = $1
      RETURNING id, author_id, title, description, category, visibility, created_at, updated_at;
    `;

    const { rows } = await pool.query(updateSql, [
      quizId,
      title || null,
      description || null,
      category || null,
      vis,
    ]);

    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

/**
 * DELETE /api/quizzies/:id
 * Delete quiz (only owner)
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const user = await getOrCreateUserFromToken(req);
    const quizId = req.params.id;

    const quizRes = await pool.query(
      "SELECT * FROM quizzes WHERE id = $1",
      [quizId]
    );
    if (quizRes.rows.length === 0) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    const quiz = quizRes.rows[0];

    if (quiz.author_id !== user.id) {
      return res.status(403).json({ error: "Not allowed to delete this quiz" });
    }

    await pool.query("DELETE FROM quizzes WHERE id = $1", [quizId]);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/quizzies/:id
 * Get single quiz metadata.
 * - Owner can always access
 * - Other users can access only if visibility = PUBLIC
 */
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const user = await getOrCreateUserFromToken(req);
    const quizId = req.params.id;

    const sql = `
      SELECT
        q.id,
        q.author_id,
        q.title,
        q.description,
        q.category,
        q.visibility,
        q.created_at,
        q.updated_at,
        COUNT(c.id)::int AS card_count
      FROM quizzes q
      LEFT JOIN cards c ON c.quiz_id = q.id
      WHERE q.id = $1
      GROUP BY q.id;
    `;

    const { rows } = await pool.query(sql, [quizId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const quiz = rows[0];

    if (quiz.visibility === "PRIVATE" && quiz.author_id !== user.id) {
      return res.status(403).json({ error: "Not allowed to view this quiz" });
    }

    res.json(quiz);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
