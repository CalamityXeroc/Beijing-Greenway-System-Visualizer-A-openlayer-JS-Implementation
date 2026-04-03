#!/usr/bin/env node

/**
 * 后端修复验证脚本
 * 启动后端，并运行连接测试
 */

const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');

console.log('\n' + '='.repeat(70));
console.log('北京绿道 - 后端修复验证');
console.log('='.repeat(70) + '\n');

// 获取本机IP
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();

// 检查端口是否可用
async function checkPort(port) {
  return new Promise((resolve) => {
    const server = require('net').createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true); // 端口被占用
      } else {
        resolve(false);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(false); // 端口可用
    });
    server.listen(port);
  });
}

// 发送健康检查
function healthCheck() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/health',
      method: 'GET',
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({
          success: res.statusCode === 200,
          status: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        success: false,
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Health check timeout'
      });
    });

    req.end();
  });
}

// 延迟函数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 主流程
async function main() {
  console.log('步骤 1: 检查端口占用情况...\n');
  
  const portInUse = await checkPort(3001);
  if (portInUse) {
    console.log('⚠️  端口3001已被占用');
    console.log('需要手动杀死占用进程或释放端口\n');
  } else {
    console.log('✓ 端口3001可用\n');
  }

  console.log('步骤 2: 启动后端服务...\n');
  
  const startTime = Date.now();
  const backend = spawn('npm', ['start'], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let backendOutput = '';
  let backendError = '';
  let backendStarted = false;

  backend.stdout.on('data', (data) => {
    const text = data.toString();
    backendOutput += text;
    process.stdout.write(text);
    
    // 检查是否启动成功
    if (text.includes('后端已启动') || text.includes('listening') || text.includes('started')) {
      backendStarted = true;
    }
  });

  backend.stderr.on('data', (data) => {
    const text = data.toString();
    backendError += text;
    process.stderr.write(text);
  });

  // 等待后端启动
  console.log('\n正在等待后端启动... (最多等待 30 秒)\n');
  
  let waitTime = 0;
  const maxWait = 30000; // 30秒
  
  while (waitTime < maxWait && !backendStarted) {
    const health = await healthCheck();
    if (health.success) {
      backendStarted = true;
      console.log('✓ 后端健康检查成功！\n');
      break;
    }
    
    await sleep(2000);
    waitTime += 2000;
    process.stdout.write('.');
  }

  if (!backendStarted) {
    console.log('\n\n⚠️  等待超时，但继续进行测试...\n');
  }

  console.log('\n' + '='.repeat(70));
  console.log('步骤 3: 运行连接测试\n');
  console.log('='.repeat(70) + '\n');

  // 运行测试
  const testScript = path.join(process.cwd(), 'test-connection.js');
  const testProcess = spawn('node', [testScript], {
    cwd: process.cwd(),
    stdio: 'inherit'
  });

  testProcess.on('exit', (code) => {
    console.log('\n' + '='.repeat(70));
    console.log('验证完成');
    console.log('='.repeat(70) + '\n');
    
    // 停止后端
    console.log('正在停止后端服务...\n');
    backend.kill();
    
    process.exit(code || 0);
  });

  // 监听后端进程
  backend.on('exit', (code) => {
    console.log(`\n[后端] 进程已退出，代码: ${code}\n`);
  });

  backend.on('error', (err) => {
    console.error(`[后端] 启动错误:`, err);
  });
}

main().catch(err => {
  console.error('验证脚本错误:', err);
  process.exit(1);
});

// 处理中断信号
process.on('SIGINT', () => {
  console.log('\n\n验证被中断\n');
  process.exit(0);
});
