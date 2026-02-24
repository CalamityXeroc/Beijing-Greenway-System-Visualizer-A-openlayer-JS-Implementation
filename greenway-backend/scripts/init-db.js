import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: 'postgres'
});

async function initDatabase() {
  try {
    await client.connect();
    console.log('[数据库] 连接到 PostgreSQL...');

    // 创建数据库
    const dbName = process.env.DB_NAME || 'greenway';
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);
    
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`[数据库] ✓ 数据库 "${dbName}" 创建成功`);
    } else {
      console.log(`[数据库] ℹ 数据库 "${dbName}" 已存在`);
    }

    await client.end();

    // 连接到新数据库
    const dbClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: dbName
    });

    await dbClient.connect();
    console.log(`[数据库] 连接到 "${dbName}"`);

    // 启用 PostGIS 扩展
    try {
      await dbClient.query('CREATE EXTENSION IF NOT EXISTS postgis');
      console.log('[数据库] ✓ PostGIS 扩展已启用');
    } catch (err) {
      console.warn('[数据库] ⚠ PostGIS 扩展安装失败，请手动安装');
    }

    // 创建绿道表
    const createGreenwaySql = `
      CREATE TABLE IF NOT EXISTS greenways (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        length FLOAT,
        cover_image VARCHAR(255),
        introduction TEXT,
        location VARCHAR(255),
        coverage_area TEXT,
        construction_area TEXT,
        features TEXT,
        geometry GEOMETRY(LineString, 4326),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_greenways_geometry ON greenways USING GIST(geometry);
      CREATE INDEX IF NOT EXISTS idx_greenways_name ON greenways(name);
    `;

    await dbClient.query(createGreenwaySql);
    console.log('[数据库] ✓ greenways 表已创建');

    // 创建兴趣点表
    const createPoiSql = `
      CREATE TABLE IF NOT EXISTS points_of_interest (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        poi_type VARCHAR(100),
        greenway_id INTEGER REFERENCES greenways(id),
        geometry GEOMETRY(Point, 4326),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_poi_geometry ON points_of_interest USING GIST(geometry);
      CREATE INDEX IF NOT EXISTS idx_poi_greenway ON points_of_interest(greenway_id);
    `;

    await dbClient.query(createPoiSql);
    console.log('[数据库] ✓ points_of_interest 表已创建');

    await dbClient.end();
    console.log('[数据库] ✓ 数据库初始化完成');
  } catch (err) {
    console.error('[数据库] ❌ 初始化失败:', err.message);
    process.exit(1);
  }
}

initDatabase();
