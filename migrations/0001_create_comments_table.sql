-- Migration number: 0001 	 2026-09-24T02:43:24.747Z
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author TEXT NOT NULL,
  body TEXT NOT NULL,
  post_slug TEXT NOT NULL DEFAULT 'veranitoxxx',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_approved INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_comments_post_slug ON comments (post_slug, is_approved);