-- db/schema.sql
-- Run this once against your PostgreSQL database to set up the subscribers table.
--
-- Usage:
--   psql $DATABASE_URL -f db/schema.sql
-- OR paste into your DB GUI (TablePlus, pgAdmin, Supabase SQL editor, etc.)

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE
);

-- Index for fast duplicate checks and lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_email
  ON newsletter_subscribers (email);

-- Optional: view for active subscribers only
CREATE OR REPLACE VIEW active_subscribers AS
  SELECT id, email, subscribed_at
  FROM newsletter_subscribers
  WHERE is_active = TRUE
  ORDER BY subscribed_at DESC;