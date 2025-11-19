import { query } from "../config/db.js";

export async function createCard({
  deckId,
  frontText,
  backText,
  hintText,
  position,
}) {
  const result = await query(
    `
    INSERT INTO cards (deck_id, front_text, back_text, hint_text, position)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `,
    [deckId, frontText, backText, hintText ?? null, position]
  );
  return result.rows[0];
}

export async function getCardsForDeck(deckId) {
  const result = await query(
    `
    SELECT *
    FROM cards
    WHERE deck_id = $1
    ORDER BY position ASC
  `,
    [deckId]
  );
  return result.rows;
}

export async function updateCard(id, updates) {
  const { frontText, backText, hintText, position } = updates;
  const result = await query(
    `
    UPDATE cards
    SET
      front_text = COALESCE($1, front_text),
      back_text = COALESCE($2, back_text),
      hint_text = COALESCE($3, hint_text),
      position = COALESCE($4, position),
      updated_at = now()
    WHERE id = $5
    RETURNING *
  `,
    [
      frontText ?? null,
      backText ?? null,
      hintText ?? null,
      position ?? null,
      id,
    ]
  );
  return result.rows[0] || null;
}

export async function deleteCard(id) {
  const result = await query(`DELETE FROM cards WHERE id = $1`, [id]);
  return result.rowCount > 0;
}
