#!/usr/bin/env node

/**
 * 快速连接测试工具
 * 测试前端到后端的网络连接
 */

const http = require('http');
const os = require('os');

console.log('\n' + '='.repeat(70));
console.log('北京绿道 - 网络连接快速测试');
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

// 测试列表
const tests = [
  {
    name: '本地健康检查',
    url: 'http://localhost:3001/health',
    method: 'GET'
  },
  {
    name: '网络IP健康检查',
    url: `http://${localIP}:3001/health`,
    method: 'GET'
  },
  {
    name: '本地绿道列表',
    url: 'http://localhost:3001/api/greenways',
    method: 'GET'
  },
  {
    name: '网络IP绿道列表',
    url: `http://${localIP}:3001/api/greenways`,
    method: 'GET'
  }
];

let completed = 0;
const results = [];

function testURL(test) {
  return new Promise((resolve) => {
    const url = new URL(test.url);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: test.method,
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        const result = {
          test: test.name,
          url: test.url,
          status: res.statusCode,
          success: res.statusCode >= 200 && res.statusCode < 300,
          dataSize: data.length,
          preview: data.substring(0, 100)
        };
        results.push(result);
        console.log(`✓ ${test.name}`);
        console.log(`  URL: ${test.url}`);
        console.log(`  状态码: ${res.statusCode}`);
        console.log(`  数据大小: ${data.length} 字节\n`);
        resolve();
      });
    });

    req.on('error', (err) => {
      const result = {
        test: test.name,
        url: test.url,
        status: 0,
        success: false,
        error: err.message
      };
      results.push(result);
      console.log(`✗ ${test.name}`);
      console.log(`  URL: ${test.url}`);
      console.log(`  错误: ${err.message}\n`);
      resolve();
    });

    req.on('timeout', () => {
      req.destroy();
      const result = {
        test: test.name,
        url: test.url,
        status: 0,
        success: false,
        error: '请求超时（5秒）'
      };
      results.push(result);
      console.log(`✗ ${test.name}`);
      console.log(`  URL: ${test.url}`);
      console.log(`  错误: 请求超时（5秒）\n`);
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  console.log(`本机IP地址: ${localIP}\n`);
  console.log('开始测试...\n');

  for (const test of tests) {
    await testURL(test);
  }

  // 总结
  console.log('='.repeat(70));
  console.log('测试总结');
  console.log('='.repeat(70));
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`\n总体结果: ${successful}/${total} 测试成功\n`);

  if (successful === 0) {
    console.log('❌ 所有测试失败！');
    console.log('\n可能的问题:');
    console.log('1. 后端服务未启动 - 请运行: cd greenway-backend && npm start');
    console.log('2. 数据库未连接 - 请检查PostgreSQL是否运行');
    console.log('3. 防火墙阻止 - 请检查Windows防火墙设置');
    console.log('4. 端口被占用 - 请检查端口3001是否被其他进程占用');
  } else if (successful === total) {
    console.log('✅ 所有测试通过！');
    console.log('\n✓ 后端服务正常运行');
    console.log(`✓ 可以从模拟器访问: http://${localIP}:3001`);
    console.log('\n后续步骤:');
    console.log('1. 确保应用配置使用相同的IP地址');
    console.log('2. 在模拟器中测试诊断工具');
    console.log('3. 检查应用是否正确处理返回的数据');
  } else {
    console.log(`⚠️  部分测试失败 (${successful}/${total})\n`);
    const failed = results.filter(r => !r.success);
    console.log('失败的测试:');
    failed.forEach(f => {
      console.log(`- ${f.test}: ${f.error || '未知错误'}`);
    });
  }

  console.log('\n' + '='.repeat(70) + '\n');
}

runTests().catch(console.error);
