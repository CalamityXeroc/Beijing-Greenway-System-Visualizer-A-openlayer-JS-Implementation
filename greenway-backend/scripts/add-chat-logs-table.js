/**
 * 数据库迁移：新增 chat_logs 表
 * 运行: npm run db:chat-logs
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

const client = new Client({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME     || 'greenway'
});

async function migrate() {
  try {
    await client.connect();
    console.log('[迁移] 已连接到数据库:', process.env.DB_NAME || 'greenway');

    // 创建 chat_logs 表
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_logs (
        id              SERIAL PRIMARY KEY,
        conversation_id VARCHAR(255) NOT NULL,
        message         TEXT        NOT NULL,
        created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('[迁移] ✓ chat_logs 表已创建（或已存在）');

    // 创建索引
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at
      ON chat_logs(created_at)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_logs_conversation_id
      ON chat_logs(conversation_id)
    `);
    console.log('[迁移] ✓ 索引已创建');

    // 确认表存在
    const check = await client.query(`
      SELECT COUNT(*) FROM information_schema.tables
      WHERE table_name = 'chat_logs'
    `);
    console.log('[迁移] ✓ 验证通过，表记录数:', check.rows[0].count);

    console.log('\n[迁移] 🎉 chat_logs 表初始化完成！');
  } catch (err) {
    console.error('[迁移] ✗ 失败:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
