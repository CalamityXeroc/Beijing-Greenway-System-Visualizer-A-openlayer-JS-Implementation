import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'greenway',
  password: 'postgis',
  port: 5432,
});

pool.query('SELECT id, name FROM greenways ORDER BY id', (err, res) => {
  if (err) {
    console.error('数据库错误:', err.message);
  } else {
    console.log('数据库中的绿道:');
    res.rows.forEach(r => console.log(`  ${r.id}: ${r.name}`));
    console.log(`总数: ${res.rows.length}`);
  }
  pool.end();
});
