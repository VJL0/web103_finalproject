-- ============================================================================
-- Extensions & helpers
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Enums
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visibility') THEN
    CREATE TYPE visibility AS ENUM ('PUBLIC', 'UNLISTED', 'PRIVATE');
  END IF;
END$$;

-- ============================================================================
-- Users (GitHub ONLY)
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  github_id       TEXT NOT NULL UNIQUE,   -- stable GitHub user ID
  github_username TEXT NOT NULL,          -- GitHub username
  avatar_url      TEXT,                   -- profile image

  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT users_github_username_not_empty
    CHECK (length(trim(github_username)) > 0)
);

CREATE TRIGGER trg_users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_users_github_username
  ON users(github_username);

-- ============================================================================
-- Decks
-- ============================================================================

CREATE TABLE IF NOT EXISTS decks (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id          UUID NOT NULL
                    REFERENCES users(id) ON DELETE CASCADE,

  title             TEXT NOT NULL,
  description       TEXT,
  visibility        visibility NOT NULL DEFAULT 'PRIVATE',

  num_cards         INTEGER NOT NULL DEFAULT 0
                    CHECK (num_cards >= 0),

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT decks_title_not_empty
    CHECK (length(trim(title)) > 0)
);

CREATE TRIGGER trg_decks_set_updated_at
BEFORE UPDATE ON decks
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- "My Decks" queries
CREATE INDEX IF NOT EXISTS idx_decks_owner_id
  ON decks(owner_id);

-- Explore: latest public decks (partial index = smaller & faster)
CREATE INDEX IF NOT EXISTS idx_decks_public_created_at
  ON decks(created_at DESC)
  WHERE visibility = 'PUBLIC';

-- ============================================================================
-- Cards
-- ============================================================================

CREATE TABLE IF NOT EXISTS cards (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deck_id           UUID NOT NULL
                    REFERENCES decks(id) ON DELETE CASCADE,

  front_text        TEXT NOT NULL,
  back_text         TEXT NOT NULL,
  hint_text         TEXT,

  -- position inside deck; no default to avoid collisions
  position          INTEGER NOT NULL,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT cards_deck_position_unique
    UNIQUE (deck_id, position)
);

CREATE TRIGGER trg_cards_set_updated_at
BEFORE UPDATE ON cards
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- Tags
-- ============================================================================

CREATE TABLE IF NOT EXISTS tags (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  name        TEXT NOT NULL UNIQUE,    -- 'Biology'
  slug        TEXT UNIQUE,             -- 'biology'

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT tags_name_not_empty
    CHECK (length(trim(name)) > 0)
);

CREATE TRIGGER trg_tags_set_updated_at
BEFORE UPDATE ON tags
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- Deck <-> Tag Mapping (Many-to-Many)
-- ============================================================================

CREATE TABLE IF NOT EXISTS deck_tags (
  deck_id     UUID NOT NULL
              REFERENCES decks(id) ON DELETE CASCADE,
  tag_id      UUID NOT NULL
              REFERENCES tags(id) ON DELETE CASCADE,

  PRIMARY KEY (deck_id, tag_id)
);

-- Fast "show all decks for tag X"
CREATE INDEX IF NOT EXISTS idx_deck_tags_tag_id
  ON deck_tags(tag_id);