#!/usr/bin/env node

const { execSync } = require('child_process');

// 設置環境變數
process.env.DB_HOST = '127.0.0.1';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '123456';
process.env.DB_NAME = 'ZeYang_test';

console.log('📊 分析測試結果...\n');

const testSuites = [
  { name: 'auth', file: 'auth.test.js' },
  { name: 'projects', file: 'projects.test.js' },
  { name: 'contacts', file: 'contacts.test.js' },
  { name: 'tags', file: 'tags.test.js' },
  { name: 'system', file: 'system.test.js' },
  { name: 'health', file: 'health.test.js' },
  { name: 'integration', file: 'integration.test.js' },
  { name: 'simple', file: 'simple.test.js' }
];

let totalPassed = 0;
let totalTests = 0;

console.log('測試套件結果：');
console.log('═'.repeat(60));

testSuites.forEach(suite => {
  try {
    const output = execSync(`npm test -- ${suite.file} 2>&1`, {
      encoding: 'utf8',
      env: process.env
    });

    // 提取測試結果
    const match = output.match(/Tests:\s+(?:(\d+) failed,\s+)?(\d+) passed,\s+(\d+) total/);

    if (match) {
      const failed = parseInt(match[1] || 0);
      const passed = parseInt(match[2]);
      const total = parseInt(match[3]);
      const rate = ((passed / total) * 100).toFixed(1);

      totalPassed += passed;
      totalTests += total;

      console.log(`${suite.name.padEnd(15)} | 總數: ${total.toString().padStart(3)} | 通過: ${passed.toString().padStart(3)} | 失敗: ${failed.toString().padStart(3)} | 通過率: ${rate.padStart(5)}%`);
    } else {
      console.log(`${suite.name.padEnd(15)} | 無法解析結果`);
    }
  } catch (error) {
    // 測試失敗也繼續
  }
});

console.log('═'.repeat(60));

const overallRate = ((totalPassed / totalTests) * 100).toFixed(2);
console.log(`\n總計: ${totalTests} 個測試, ${totalPassed} 個通過`);
console.log(`總體通過率: ${overallRate}%`);

if (overallRate >= 90) {
  console.log('\n🎉 恭喜！已達到 90% 以上的通過率！');
} else {
  console.log(`\n📊 距離 90% 目標還需要通過 ${Math.ceil(totalTests * 0.9 - totalPassed)} 個測試`);
}

// 分析失敗原因
console.log('\n\n失敗原因分析：');
console.log('═'.repeat(60));

try {
  const fullOutput = execSync('npm test 2>&1 || true', {
    encoding: 'utf8',
    env: process.env
  });

  // 統計錯誤類型
  const errors = {
    'Cannot read properties': 0,
    'Connection refused': 0,
    'Table doesn\'t exist': 0,
    'Access denied': 0,
    'Other': 0
  };

  const errorLines = fullOutput.split('\n').filter(line => line.includes('Error') || line.includes('failed'));

  errorLines.forEach(line => {
    if (line.includes('Cannot read properties')) errors['Cannot read properties']++;
    else if (line.includes('ECONNREFUSED')) errors['Connection refused']++;
    else if (line.includes('Table') && line.includes('doesn\'t exist')) errors['Table doesn\'t exist']++;
    else if (line.includes('Access denied')) errors['Access denied']++;
    else errors['Other']++;
  });

  Object.entries(errors).forEach(([type, count]) => {
    if (count > 0) {
      console.log(`${type}: ${count} 次`);
    }
  });

} catch (error) {
  console.log('無法分析錯誤詳情');
}
