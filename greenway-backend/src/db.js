import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'greenway'
});

pool.on('error', (err) => {
  console.error('[数据库] 池错误:', err);
});

export async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`[数据库查询] ${duration}ms - ${text.substring(0, 50)}...`);
    return result;
  } catch (err) {
    console.error(`[数据库错误] ${err.message}`);
    throw err;
  }
}

export async function getClient() {
  const client = await pool.connect();
  return client;
}

export async function close() {
  await pool.end();
}

export default pool;
