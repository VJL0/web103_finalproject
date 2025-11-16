import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: "server/.env" }); // <-- one folder up
if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL in server/.env");
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const migrationSQL = `

-- Drop in dependency order
DROP TABLE IF EXISTS cards;
DROP TABLE IF EXISTS quizzes;
DROP TABLE IF EXISTS users;

-- Enable UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  github_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  profile_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ
);

-- Enum for quiz visibility
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visibility') THEN
    CREATE TYPE visibility AS ENUM ('PUBLIC','PRIVATE');
  END IF;
END$$;

-- Updated-at trigger helper
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Migrations ledger (optional but useful)
CREATE TABLE IF NOT EXISTS _migrations (
  id       SERIAL PRIMARY KEY,
  name     TEXT NOT NULL UNIQUE,
  run_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users updated_at trigger
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT,
  visibility  visibility NOT NULL DEFAULT 'PUBLIC',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_quizzes_updated_at ON quizzes;
CREATE TRIGGER trg_quizzes_updated_at
BEFORE UPDATE ON quizzes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Cards
CREATE TABLE IF NOT EXISTS cards (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id    UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL,
  "order"    INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_cards_updated_at ON cards;
CREATE TRIGGER trg_cards_updated_at
BEFORE UPDATE ON cards
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_author      ON quizzes(author_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_visibility  ON quizzes(visibility);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_at  ON quizzes(created_at);
CREATE INDEX IF NOT EXISTS idx_cards_quiz          ON cards(quiz_id);

`;

async function runMigration() {
  try {
    console.log("Connecting to database…");
    await client.connect();

    console.log("Running migration…");
    await client.query(migrationSQL);

    console.log("Migration complete ✔️");
  } catch (err) {
    console.error("Migration failed ❌", err);
  } finally {
    await client.end();
  }
}

runMigration();
