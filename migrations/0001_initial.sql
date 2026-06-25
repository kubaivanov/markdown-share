CREATE TABLE IF NOT EXISTS files (
  slug TEXT PRIMARY KEY,
  id TEXT NOT NULL,
  filename TEXT NOT NULL,
  object_key TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  type TEXT NOT NULL DEFAULT 'md' CHECK (type IN ('md', 'html')),
  comments_enabled INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_files_active_updated_at
  ON files (is_active, updated_at DESC);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS comments (
  slug TEXT NOT NULL,
  id TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT '',
  text TEXT NOT NULL,
  selection TEXT,
  done INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  PRIMARY KEY (slug, id)
);

CREATE INDEX IF NOT EXISTS idx_comments_slug_created_at
  ON comments (slug, created_at ASC);
