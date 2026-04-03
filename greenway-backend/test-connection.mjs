#!/usr/bin/env node

/**
 * 快速连接测试工具
 * 测试前端到后端的网络连接
 */

import http from 'http';
import os from 'os';

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
        console.log(`OK ${test.name}`);
        console.log(`  URL: ${test.url}`);
        console.log(`  Status: ${res.statusCode}`);
        console.log(`  Data size: ${data.length} bytes\n`);
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
      console.log(`FAIL ${test.name}`);
      console.log(`  URL: ${test.url}`);
      console.log(`  Error: ${err.message}\n`);
      resolve();
    });

    req.on('timeout', () => {
      req.destroy();
      const result = {
        test: test.name,
        url: test.url,
        status: 0,
        success: false,
        error: 'Request timeout (5s)'
      };
      results.push(result);
      console.log(`FAIL ${test.name}`);
      console.log(`  URL: ${test.url}`);
      console.log(`  Error: Request timeout (5s)\n`);
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  console.log(`Local IP: ${localIP}\n`);
  console.log('Starting tests...\n');

  for (const test of tests) {
    await testURL(test);
  }

  // Summary
  console.log('='.repeat(70));
  console.log('Test Summary');
  console.log('='.repeat(70));
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`\nOverall result: ${successful}/${total} tests passed\n`);

  if (successful === 0) {
    console.log('FAIL - All tests failed!');
    console.log('\nPossible issues:');
    console.log('1. Backend not running - please run: cd greenway-backend && node src/index.js');
    console.log('2. Database not connected - check PostgreSQL status');
    console.log('3. Firewall blocking - check Windows Firewall settings');
    console.log('4. Port in use - check if port 3001 is occupied by another process');
  } else if (successful === total) {
    console.log('SUCCESS - All tests passed!');
    console.log('\nBackend is working correctly');
    console.log(`Can access from mobile: http://${localIP}:3001`);
    console.log('\nNext steps:');
    console.log('1. Ensure app configuration uses correct IP address');
    console.log('2. Test diagnostic tool in mobile emulator');
    console.log('3. Check data handling in app');
  } else {
    console.log(`WARNING - Partial failure (${successful}/${total})\n`);
    const failed = results.filter(r => !r.success);
    console.log('Failed tests:');
    failed.forEach(f => {
      console.log(`- ${f.test}: ${f.error || 'unknown error'}`);
    });
  }

  console.log('\n' + '='.repeat(70) + '\n');
}

runTests().catch(console.error);
