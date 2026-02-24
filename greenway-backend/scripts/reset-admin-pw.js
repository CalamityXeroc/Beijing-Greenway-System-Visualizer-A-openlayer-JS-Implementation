import bcrypt from 'bcryptjs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'greenway',
});

const newPassword = '123456';
const hash = await bcrypt.hash(newPassword, 10);

const { rows } = await pool.query(
  `UPDATE users SET password=$1 WHERE username='admin' RETURNING id, username, role`,
  [hash]
);

if (rows.length > 0) {
  console.log('✅ 密码已更新:', rows[0]);
  console.log('新密码:', newPassword);
} else {
  console.log('❌ 未找到 admin 用户');
}

await pool.end();
