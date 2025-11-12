import express from "express";
import { pool } from "../db.js";
import { requireAuth } from "../auth.js";

const router = express.Router();

/** Get all cards for a quiz (must be the quiz owner) */
router.get("/:quizId", requireAuth, async (req, res) => {
  try {
    const sub = req.auth?.payload?.sub;
    const { quizId } = req.params;
    const owner = await pool.query(
      `SELECT q.id FROM quizzes q 
       JOIN users u ON u.id = q.author_id 
       WHERE q.id = $1 AND u.auth0_sub = $2`,
      [quizId, sub]
    );
    if (owner.rowCount === 0) return res.status(403).json({ error: "Forbidden" });

    const cards = await pool.query(
      `SELECT id, question, answer, "order", created_at, updated_at 
       FROM cards WHERE quiz_id = $1 ORDER BY COALESCE("order", 999999), created_at ASC`,
      [quizId]
    );
    res.json(cards.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/** Create card for a quiz */
router.post("/:quizId", requireAuth, async (req, res) => {
  try {
    const sub = req.auth?.payload?.sub;
    const { quizId } = req.params;
    const { question, answer, order } = req.body || {};
    if (!question || !answer) return res.status(400).json({ error: "question and answer required" });

    const owner = await pool.query(
      `SELECT q.id FROM quizzes q 
       JOIN users u ON u.id = q.author_id 
       WHERE q.id = $1 AND u.auth0_sub = $2`,
      [quizId, sub]
    );
    if (owner.rowCount === 0) return res.status(403).json({ error: "Forbidden" });

    const ins = await pool.query(
      `INSERT INTO cards (quiz_id, question, answer, "order")
       VALUES ($1,$2,$3,$4)
       RETURNING id, question, answer, "order", created_at, updated_at`,
      [quizId, question, answer, order ?? null]
    );
    res.status(201).json(ins.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/** Update card */
router.put("/:quizId/:cardId", requireAuth, async (req, res) => {
  try {
    const sub = req.auth?.payload?.sub;
    const { quizId, cardId } = req.params;
    const { question, answer, order } = req.body || {};

    const owner = await pool.query(
      `SELECT q.id FROM quizzes q 
       JOIN users u ON u.id = q.author_id 
       WHERE q.id = $1 AND u.auth0_sub = $2`,
      [quizId, sub]
    );
    if (owner.rowCount === 0) return res.status(403).json({ error: "Forbidden" });

    const upd = await pool.query(
      `UPDATE cards SET 
         question = COALESCE($1, question),
         answer   = COALESCE($2, answer),
         "order"  = COALESCE($3, "order"),
         updated_at = now()
       WHERE id = $4 AND quiz_id = $5
       RETURNING id, question, answer, "order", updated_at`,
      [question, answer, order, cardId, quizId]
    );
    if (upd.rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.json(upd.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/** Delete card */
router.delete("/:quizId/:cardId", requireAuth, async (req, res) => {
  try {
    const sub = req.auth?.payload?.sub;
    const { quizId, cardId } = req.params;

    const owner = await pool.query(
      `SELECT q.id FROM quizzes q 
       JOIN users u ON u.id = q.author_id 
       WHERE q.id = $1 AND u.auth0_sub = $2`,
      [quizId, sub]
    );
    if (owner.rowCount === 0) return res.status(403).json({ error: "Forbidden" });

    await pool.query(`DELETE FROM cards WHERE id = $1 AND quiz_id = $2`, [cardId, quizId]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
