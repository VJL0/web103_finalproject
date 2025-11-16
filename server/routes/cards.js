import express from "express";
import { pool } from "../db.js";
import { requireAuth, getOrCreateUserFromToken } from "../auth.js";

const router = express.Router();

// Helper: fetch quiz with author & visibility
async function getQuiz(quizId) {
  const res = await pool.query(
    `
    SELECT id, author_id, visibility
    FROM quizzes
    WHERE id = $1
    `,
    [quizId]
  );
  return res.rows[0] || null;
}

/**
 * GET /api/cards/:quizId
 * - Owner can always see cards
 * - Any logged-in user can see cards if quiz.visibility = PUBLIC
 */
router.get("/:quizId", requireAuth, async (req, res) => {
  try {
    const user = await getOrCreateUserFromToken(req);
    const quizId = req.params.quizId;

    const quiz = await getQuiz(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    if (quiz.visibility === "PRIVATE" && quiz.author_id !== user.id) {
      return res
        .status(403)
        .json({ error: "Not allowed to view cards for this private quiz" });
    }

    const cardsRes = await pool.query(
      `
      SELECT id, question, answer, "order", created_at, updated_at
      FROM cards
      WHERE quiz_id = $1
      ORDER BY "order" NULLS LAST, created_at ASC
      `,
      [quizId]
    );

    res.json(cardsRes.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/cards/:quizId
 * - Only quiz owner can add cards
 */
router.post("/:quizId", requireAuth, async (req, res) => {
  try {
    const user = await getOrCreateUserFromToken(req);
    const quizId = req.params.quizId;
    const { question, answer, order } = req.body;

    if (!question || !answer) {
      return res
        .status(400)
        .json({ error: "Both question and answer are required" });
    }

    const quiz = await getQuiz(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    if (quiz.author_id !== user.id) {
      return res
        .status(403)
        .json({ error: "Not allowed to add cards to this quiz" });
    }

    const insertRes = await pool.query(
      `
      INSERT INTO cards (quiz_id, question, answer, "order")
      VALUES ($1, $2, $3, $4)
      RETURNING id, question, answer, "order", created_at, updated_at
      `,
      [quizId, question, answer, order ?? null]
    );

    res.status(201).json(insertRes.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

/**
 * PUT /api/cards/:quizId/:cardId
 * - Only quiz owner can update cards
 */
router.put("/:quizId/:cardId", requireAuth, async (req, res) => {
  try {
    const user = await getOrCreateUserFromToken(req);
    const quizId = req.params.quizId;
    const cardId = req.params.cardId;
    const { question, answer, order } = req.body;

    const quiz = await getQuiz(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    if (quiz.author_id !== user.id) {
      return res
        .status(403)
        .json({ error: "Not allowed to edit cards for this quiz" });
    }

    const cardRes = await pool.query(
      `SELECT id FROM cards WHERE id = $1 AND quiz_id = $2`,
      [cardId, quizId]
    );
    if (cardRes.rows.length === 0) {
      return res.status(404).json({ error: "Card not found" });
    }

    const updateRes = await pool.query(
      `
      UPDATE cards
      SET
        question = COALESCE($3, question),
        answer = COALESCE($4, answer),
        "order" = COALESCE($5, "order"),
        updated_at = now()
      WHERE id = $1 AND quiz_id = $2
      RETURNING id, question, answer, "order", created_at, updated_at
      `,
      [cardId, quizId, question ?? null, answer ?? null, order ?? null]
    );

    res.json(updateRes.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

/**
 * DELETE /api/cards/:quizId/:cardId
 * - Only quiz owner can delete cards
 */
router.delete("/:quizId/:cardId", requireAuth, async (req, res) => {
  try {
    const user = await getOrCreateUserFromToken(req);
    const quizId = req.params.quizId;
    const cardId = req.params.cardId;

    const quiz = await getQuiz(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    if (quiz.author_id !== user.id) {
      return res
        .status(403)
        .json({ error: "Not allowed to delete cards from this quiz" });
    }

    const cardRes = await pool.query(
      `SELECT id FROM cards WHERE id = $1 AND quiz_id = $2`,
      [cardId, quizId]
    );
    if (cardRes.rows.length === 0) {
      return res.status(404).json({ error: "Card not found" });
    }

    await pool.query(`DELETE FROM cards WHERE id = $1 AND quiz_id = $2`, [
      cardId,
      quizId,
    ]);

    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
