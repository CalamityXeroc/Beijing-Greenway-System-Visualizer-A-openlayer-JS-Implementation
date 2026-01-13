import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: 'postgres'
});

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  dbName: process.env.DB_NAME || 'greenway_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
};

async function checkPostgresConnection() {
  console.log('\n[1/4] 检查 PostgreSQL 连接...');
  try {
    const result = await pool.query('SELECT version()');
    console.log(' PostgreSQL 已连接');
    console.log(`  版本: ${result.rows[0].version.split(',')[0]}`);
    return true;
  } catch (err) {
    console.error(' 无法连接到 PostgreSQL:', err.message);
    console.error('\n  解决方案:');
    console.error('  1. 检查 PostgreSQL 是否运行');
    console.error('  2. 检查 .env.local 中的数据库配置');
    console.error('  3. 确认用户名和密码是否正确');
    return false;
  }
}

async function checkDatabase() {
  console.log('\n[2/4] 检查数据库是否存在...');
  try {
    const result = await pool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [config.dbName]
    );

    if (result.rows.length > 0) {
      console.log(` 数据库 '${config.dbName}' 已存在`);
      return true;
    } else {
      console.warn(` 数据库 '${config.dbName}' 不存在`);
      console.warn('  请运行: npm run db:init');
      return false;
    }
  } catch (err) {
    console.error(' 检查数据库失败:', err.message);
    return false;
  }
}

async function checkPostGIS() {
  console.log('\n[3/4] 检查 PostGIS 扩展...');
  try {
    const appPool = new pg.Pool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.dbName
    });

    const result = await appPool.query(
      `SELECT 1 FROM pg_extension WHERE extname = 'postgis'`
    );

    if (result.rows.length > 0) {
      console.log('✓ PostGIS 扩展已启用');
      await appPool.end();
      return true;
    } else {
      console.warn('⚠ PostGIS 扩展未启用');
      console.warn('  请运行: npm run db:init');
      await appPool.end();
      return false;
    }
  } catch (err) {
    console.warn('⚠ 无法检查 PostGIS（数据库可能不存在）');
    console.warn('  请先运行: npm run db:init');
    return false;
  }
}

async function checkEnvFile() {
  console.log('\n[4/4] 检查环境配置...');

  try {
    if (fs.existsSync('.env.local')) {
      console.log('✓ .env.local 文件存在');

      const envContent = fs.readFileSync('.env.local', 'utf-8');
      const hasRequired = envContent.includes('DB_HOST') &&
                         envContent.includes('DB_USER') &&
                         envContent.includes('DB_PASSWORD');

      if (hasRequired) {
        console.log('✓ 环境变量配置完整');
        return true;
      } else {
        console.warn('⚠ 缺少必要的环境变量');
        console.warn('  请修改 .env.local 包含: DB_HOST, DB_USER, DB_PASSWORD');
        return false;
      }
    } else {
      console.warn('⚠ .env.local 文件不存在');
      console.warn('  请执行: cp .env.example .env.local');
      return false;
    }
  } catch (err) {
    console.error('✗ 检查环境文件失败', err.message);
    return false;
  }
}

async function printSummary(results) {
  console.log('\n' + '='.repeat(60));
  console.log('检查总结');
  console.log('='.repeat(60));

  const allPassed = results.every(r => r);

  if (allPassed) {
    console.log('✓ 所有检查通过！');
    console.log('\n后续步骤:');
    console.log('1. 初始化数据库: npm run db:init');
    console.log('2. 导入绿道数据: npm run db:import');
    console.log('3. 启动开发服务器: npm run dev');
  } else {
    console.log('⚠ 部分检查未通过，请按照上面的提示解决问题');
  }

  console.log('='.repeat(60) + '\n');
}

async function main() {
  console.log('\n🔍 绿道后端环境检查工具\n');

  const results = [];

  results.push(await checkPostgresConnection());
  results.push(await checkDatabase());
  results.push(await checkPostGIS());
  results.push(await checkEnvFile());

  await printSummary(results);
  await pool.end();

  process.exit(results.every(r => r) ? 0 : 1);
}

main().catch(err => {
  console.error('检查脚本出错:', err.message);
  process.exit(1);
});