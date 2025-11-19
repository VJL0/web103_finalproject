import { query } from "../config/db.js";

export async function createDeck({ ownerId, title, description, visibility }) {
  const result = await query(
    `
    INSERT INTO decks (owner_id, title, description, visibility)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `,
    [ownerId, title, description ?? null, visibility ?? "PRIVATE"]
  );
  return result.rows[0];
}

export async function getDeckById(id) {
  const result = await query(
    `
    SELECT d.*, u.github_username AS owner_username
    FROM decks d
    JOIN users u ON u.id = d.owner_id
    WHERE d.id = $1
  `,
    [id]
  );
  return result.rows[0] || null;
}

export async function getMyDecks(ownerId) {
  const result = await query(
    `
    SELECT *
    FROM decks
    WHERE owner_id = $1
    ORDER BY created_at DESC
  `,
    [ownerId]
  );
  return result.rows;
}

export async function getPublicDecks({ limit = 20, offset = 0 } = {}) {
  const result = await query(
    `
    SELECT *
    FROM decks
    WHERE visibility = 'PUBLIC'
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `,
    [limit, offset]
  );
  return result.rows;
}

export async function updateDeck(id, ownerId, updates) {
  const { title, description, visibility } = updates;

  const result = await query(
    `
    UPDATE decks
    SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      visibility = COALESCE($3, visibility),
      updated_at = now()
    WHERE id = $4
      AND owner_id = $5
    RETURNING *
  `,
    [title ?? null, description ?? null, visibility ?? null, id, ownerId]
  );
  return result.rows[0] || null;
}

export async function deleteDeck(id, ownerId) {
  const result = await query(
    `
    DELETE FROM decks
    WHERE id = $1 AND owner_id = $2
    RETURNING id
  `,
    [id, ownerId]
  );
  return result.rowCount > 0;
}
