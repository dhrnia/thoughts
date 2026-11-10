-- thoughts - Neon PostgreSQL Database Schema
-- Run this in the Neon SQL Editor console (https://console.neon.tech)

-- 1. Notes Table
CREATE TABLE IF NOT EXISTS notes (
  id VARCHAR(128) PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT DEFAULT '',
  excerpt TEXT DEFAULT '',
  date VARCHAR(128),
  display_date VARCHAR(128),
  time_context VARCHAR(128),
  location VARCHAR(256),
  tags JSONB DEFAULT '[]'::jsonb,
  metadata_chips JSONB DEFAULT '[]'::jsonb,
  is_vaulted BOOLEAN DEFAULT FALSE,
  is_saved BOOLEAN DEFAULT FALSE,
  category VARCHAR(64) DEFAULT 'reflections',
  word_count INTEGER DEFAULT 0,
  reading_time VARCHAR(64) DEFAULT '0 min',
  revision VARCHAR(64) DEFAULT 'v1.0',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_vaulted ON notes(is_vaulted);
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);

-- 3. Automatic Updated-At Trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notes_updated_at ON notes;
CREATE TRIGGER trigger_notes_updated_at
BEFORE UPDATE ON notes
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
