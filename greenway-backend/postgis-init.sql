-- 在 pgAdmin 中执行这个脚本来启用 PostGIS 和创建表

-- 第1步：启用 PostGIS 扩展
CREATE EXTENSION IF NOT EXISTS postgis;

-- 检查 PostGIS 是否成功安装
SELECT PostGIS_version();

-- 第2步：创建绿道表
CREATE TABLE IF NOT EXISTS greenways (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  length DECIMAL(10, 2),
  introduction TEXT,
  location VARCHAR(255),
  geometry GEOMETRY(LineString, 4326),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 第3步：创建兴趣点表
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

-- 第4步：创建空间索引
CREATE INDEX IF NOT EXISTS idx_greenways_geometry ON greenways USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_poi_geometry ON points_of_interest USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_poi_greenway_id ON points_of_interest(greenway_id);

-- 验证表是否创建成功
SELECT 
  'greenways' as table_name, 
  COUNT(*) as row_count 
FROM greenways
UNION ALL
SELECT 
  'points_of_interest' as table_name, 
  COUNT(*) as row_count 
FROM points_of_interest;
