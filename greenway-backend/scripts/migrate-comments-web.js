import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'greenway'
});

const migrationSql = `
CREATE TABLE IF NOT EXISTS greenway_comments (
  id SERIAL PRIMARY KEY,
  greenway_id INTEGER NOT NULL REFERENCES greenways(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  like_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS greenway_comment_likes (
  id SERIAL PRIMARY KEY,
  comment_id INTEGER NOT NULL REFERENCES greenway_comments(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comment_id, user_id)
);

CREATE TABLE IF NOT EXISTS greenway_comment_reports (
  id SERIAL PRIMARY KEY,
  comment_id INTEGER NOT NULL REFERENCES greenway_comments(id) ON DELETE CASCADE,
  reporter_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(100) NOT NULL,
  detail TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comment_id, reporter_user_id)
);

ALTER TABLE greenway_comments
  ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE greenway_comments
  ALTER COLUMN rating DROP NOT NULL;

ALTER TABLE greenway_comments
  DROP CONSTRAINT IF EXISTS greenway_comments_rating_check;

ALTER TABLE greenway_comments
  ADD CONSTRAINT greenway_comments_rating_check
  CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5));

UPDATE greenway_comments
SET status = 'pending'
WHERE status IS NULL OR status = '';

CREATE INDEX IF NOT EXISTS idx_comment_reports_comment_id
  ON greenway_comment_reports(comment_id);

CREATE INDEX IF NOT EXISTS idx_comment_reports_reporter
  ON greenway_comment_reports(reporter_user_id);

CREATE INDEX IF NOT EXISTS idx_comments_greenway_id
  ON greenway_comments(greenway_id);

CREATE INDEX IF NOT EXISTS idx_comments_status_created_at
  ON greenway_comments(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id
  ON greenway_comment_likes(comment_id);
`;

async function run() {
  try {
    await client.connect();
    console.log('[migration] connected');
    await client.query('BEGIN');
    await client.query(migrationSql);
    await client.query('COMMIT');
    console.log('[migration] comments web migration completed');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[migration] failed:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

run();
