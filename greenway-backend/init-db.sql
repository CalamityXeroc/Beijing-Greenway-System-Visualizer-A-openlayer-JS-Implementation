-- 启用 PostGIS 扩展
CREATE EXTENSION IF NOT EXISTS postgis;

-- 创建绿道表
CREATE TABLE IF NOT EXISTS greenways (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  length DECIMAL(10, 2),
  introduction TEXT,
  location VARCHAR(255),
  coverage_area DECIMAL(10, 2),
  construction_area DECIMAL(10, 2),
  features TEXT,
  geometry GEOMETRY(LineString, 4326),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建兴趣点表
CREATE TABLE IF NOT EXISTS points_of_interest (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  poi_type VARCHAR(100),
  greenway_id INTEGER REFERENCES greenways(id) ON DELETE CASCADE,
  geometry GEOMETRY(Point, 4326),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建空间索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_greenways_geometry ON greenways USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_poi_geometry ON points_of_interest USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_poi_greenway_id ON points_of_interest(greenway_id);

-- 创建绿道评论表（文字 + 评分 + 审核状态）
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

-- 历史库升级：补齐审核状态默认值
ALTER TABLE greenway_comments ALTER COLUMN status SET DEFAULT 'pending';

-- 评论举报表
CREATE TABLE IF NOT EXISTS greenway_comment_reports (
  id SERIAL PRIMARY KEY,
  comment_id INTEGER NOT NULL REFERENCES greenway_comments(id) ON DELETE CASCADE,
  reporter_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(100) NOT NULL,
  detail TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comment_id, reporter_user_id)
);

-- 创建评论点赞表（防重复点赞）
CREATE TABLE IF NOT EXISTS greenway_comment_likes (
  id SERIAL PRIMARY KEY,
  comment_id INTEGER NOT NULL REFERENCES greenway_comments(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_comments_greenway_id ON greenway_comments(greenway_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON greenway_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_status_created_at ON greenway_comments(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON greenway_comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON greenway_comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_reports_comment_id ON greenway_comment_reports(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reports_reporter ON greenway_comment_reports(reporter_user_id);

-- 验证表是否创建成功
SELECT 'greenways' as table_name, COUNT(*) as row_count FROM greenways
UNION ALL
SELECT 'points_of_interest' as table_name, COUNT(*) as row_count FROM points_of_interest
UNION ALL
SELECT 'greenway_comments' as table_name, COUNT(*) as row_count FROM greenway_comments
UNION ALL
SELECT 'greenway_comment_likes' as table_name, COUNT(*) as row_count FROM greenway_comment_likes
UNION ALL
SELECT 'greenway_comment_reports' as table_name, COUNT(*) as row_count FROM greenway_comment_reports;
