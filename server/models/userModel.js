import { query } from "../config/db.js";

export async function findOrCreateFromGitHub(profile) {
  const githubId = String(profile.id);
  const githubUsername = profile.username || profile.displayName || "unknown";
  const avatarUrl = profile.photos?.[0]?.value ?? null;

  const result = await query(
    `
    INSERT INTO users (github_id, github_username, avatar_url, last_login_at)
    VALUES ($1, $2, $3, now())
    ON CONFLICT (github_id)
      DO UPDATE
      SET
        github_username = EXCLUDED.github_username,
        avatar_url = EXCLUDED.avatar_url,
        last_login_at = now(),
        updated_at = now()
    RETURNING id, github_id, github_username, avatar_url, created_at, updated_at
  `,
    [githubId, githubUsername, avatarUrl]
  );

  return result.rows[0];
}

export async function findUserById(id) {
  const result = await query(
    `
    SELECT id, github_id, github_username, avatar_url, created_at, updated_at
    FROM users
    WHERE id = $1
  `,
    [id]
  );
  return result.rows[0] || null;
}
