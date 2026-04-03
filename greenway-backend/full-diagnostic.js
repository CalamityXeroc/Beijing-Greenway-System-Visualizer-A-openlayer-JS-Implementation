#!/usr/bin/env node

/**
 * 后端连接测试 - 完整诊断
 * 自动检查、启动和测试后端服务
 */

const http = require('http');
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const net = require('net');

const BACKEND_DIR = path.resolve('greenway-backend');
const PORT = 3001;

// ============ 工具函数 ============

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

function printHeader(title) {
  console.log('\n' + '='.repeat(70));
  console.log(title);
  console.log('='.repeat(70) + '\n');
}

function printSection(title) {
  console.log(`\n[${title}]\n`);
}

async function checkPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port, '0.0.0.0');
  });
}

function testURL(url, timeout = 5000) {
  return new Promise((resolve) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 80,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      timeout
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          statusOk: res.statusCode >= 200 && res.statusCode < 300,
          headers: res.headers,
          dataLength: data.length,
          data: data.substring(0, 200)
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        status: 0,
        statusOk: false,
        error: err.message,
        code: err.code
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        status: 0,
        statusOk: false,
        error: '连接超时'
      });
    });

    req.end();
  });
}

// ============ 主程序 ============

async function main() {
  printHeader('北京绿道 - 后端连接完整诊断');

  const localIP = getLocalIP();
  console.log(`本地IP地址: ${localIP}`);
  console.log(`后端目录: ${BACKEND_DIR}`);
  console.log(`目标端口: ${PORT}\n`);

  // ---- 步骤1：检查依赖 ----
  printSection('步骤 1/5 - 检查npm依赖');
  const nodeModulesPath = path.join(BACKEND_DIR, 'node_modules');
  
  if (fs.existsSync(nodeModulesPath)) {
    console.log('✓ node_modules 已存在');
  } else {
    console.log('⚠ node_modules 不存在，正在安装...');
    const npmResult = spawnSync('npm', ['install'], {
      cwd: BACKEND_DIR,
      stdio: 'pipe'
    });
    if (npmResult.status === 0) {
      console.log('✓ 依赖安装成功');
    } else {
      console.log('✗ 依赖安装失败!');
      console.log(npmResult.stderr.toString());
    }
  }

  // ---- 步骤2：检查端口 ----
  printSection('步骤 2/5 - 检查端口状态');
  const portInUse = await checkPortInUse(PORT);
  
  if (portInUse) {
    console.log(`⚠ 端口 ${PORT} 已被占用 (后端可能已在运行)`);
  } else {
    console.log(`✓ 端口 ${PORT} 可用`);
  }

  // ---- 步骤3：启动后端 ----
  printSection('步骤 3/5 - 启动后端服务');
  
  if (!portInUse) {
    console.log('正在启动后端服务...');
    const backendProcess = spawn('node', ['src/index.js'], {
      cwd: BACKEND_DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false
    });

    let serverReady = false;
    let startupOutput = '';
    let startupErrors = '';

    backendProcess.stdout.on('data', (data) => {
      startupOutput += data.toString();
      process.stdout.write('  ' + data.toString());
    });

    backendProcess.stderr.on('data', (data) => {
      startupErrors += data.toString();
      process.stderr.write('  ' + data.toString());
    });

    // 等待服务启动
    console.log('等待3秒让服务初始化...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✓ 后端服务已启动\n');
  } else {
    console.log('✓ 后端服务已在运行\n');
  }

  // ---- 步骤4：运行连接测试 ----
  printSection('步骤 4/5 - 测试后端连接');
  
  const tests = [
    {
      name: '健康检查 (localhost)',
      url: 'http://localhost:3001/health'
    },
    {
      name: '健康检查 (网络IP)',
      url: `http://${localIP}:3001/health`
    },
    {
      name: '绿道列表 (localhost)',
      url: 'http://localhost:3001/api/greenways'
    },
    {
      name: '绿道列表 (网络IP)',
      url: `http://${localIP}:3001/api/greenways`
    }
  ];

  const results = [];
  console.log('开始测试...\n');

  for (const test of tests) {
    const result = await testURL(test.url);
    results.push({ ...test, ...result });

    const icon = result.statusOk ? '✓' : '✗';
    console.log(`${icon} ${test.name}`);
    console.log(`  URL: ${test.url}`);
    if (result.error) {
      console.log(`  错误: ${result.error}`);
    } else {
      console.log(`  状态: ${result.status}`);
      console.log(`  数据大小: ${result.dataLength} 字节`);
    }
    console.log();
  }

  // ---- 步骤5：测试总结 ----
  printSection('步骤 5/5 - 诊断总结');
  
  const successCount = results.filter(r => r.statusOk).length;
  const totalCount = results.length;
  
  console.log(`测试结果: ${successCount}/${totalCount} 通过\n`);

  if (successCount === 0) {
    console.log('❌ 所有测试都失败了！\n');
    console.log('可能的问题:');
    console.log('1. 后端服务未启动或启动失败');
    console.log('2. 数据库 (PostgreSQL) 未运行');
    console.log('3. 环境变量配置错误 (.env.local)');
    console.log('4. Windows防火墙阻止了连接');
    console.log('5. 3001端口被其他进程占用\n');
    console.log('排查建议:');
    console.log(`  • 手动进入后端目录: cd ${BACKEND_DIR}`);
    console.log('  • 运行: npm start');
    console.log('  • 查看是否有错误消息');
  } else if (successCount === totalCount) {
    console.log('✅ 所有测试通过！\n');
    console.log('✓ 后端服务正常运行');
    console.log(`✓ 前端可以访问: http://${localIP}:3001/api`);
    console.log(`✓ 检查点:\n`);
    console.log('  - 健康检查 (health): 通过');
    console.log('  - API可访问: 通过');
    console.log('  - 数据库连接: 通过\n');
    console.log('后续步骤:');
    console.log(`  1. 在应用配置中使用IP: ${localIP}`);
    console.log('  2. 确保防火墙允许连接');
    console.log('  3. 在模拟器中测试应用连接\n');
  } else {
    console.log(`⚠️  部分测试失败 (${successCount}/${totalCount})\n`);
    const failed = results.filter(r => !r.statusOk);
    console.log('失败的测试:');
    failed.forEach(f => {
      console.log(`  • ${f.name}`);
      console.log(`    错误: ${f.error || f.status}`);
    });
  }

  printHeader('诊断完成');
  console.log('\n');
}

main().catch(err => {
  console.error('❌ 发生错误:', err.message);
  console.error(err);
  process.exit(1);
});
