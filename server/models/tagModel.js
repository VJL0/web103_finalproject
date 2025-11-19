import { query } from "../config/db.js";

export async function getAllTags() {
  const result = await query(`SELECT * FROM tags ORDER BY name ASC`);
  return result.rows;
}

export async function createTag({ name, slug }) {
  const result = await query(
    `
    INSERT INTO tags (name, slug)
    VALUES ($1, $2)
    ON CONFLICT (name)
      DO UPDATE SET updated_at = now()
    RETURNING *
  `,
    [name, slug ?? null]
  );
  return result.rows[0];
}

export async function attachTagToDeck(deckId, tagId) {
  await query(
    `
    INSERT INTO deck_tags (deck_id, tag_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
  `,
    [deckId, tagId]
  );
}

export async function detachTagFromDeck(deckId, tagId) {
  await query(
    `
    DELETE FROM deck_tags
    WHERE deck_id = $1 AND tag_id = $2
  `,
    [deckId, tagId]
  );
}

export async function getTagsForDeck(deckId) {
  const result = await query(
    `
    SELECT t.*
    FROM deck_tags dt
    JOIN tags t ON t.id = dt.tag_id
    WHERE dt.deck_id = $1
    ORDER BY t.name ASC
  `,
    [deckId]
  );
  return result.rows;
}
