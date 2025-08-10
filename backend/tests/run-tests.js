#!/usr/bin/env node

/**
 * 測試運行腳本 - 直接運行測試並生成報告
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n🚀 開始運行 API 測試...\n');

// 設置環境變數
process.env.NODE_ENV = 'test';
process.env.SUPPRESS_LOGS = 'true';

// 測試套件列表
const testSuites = [
  { name: '健康檢查', file: 'health.test.js' },
  { name: '認證 API', file: 'auth.test.js' },
  { name: '專案 API', file: 'projects.test.js' },
  { name: '聯絡表單 API', file: 'contacts.test.js' },
  { name: '標籤 API', file: 'tags.test.js' },
  { name: '系統 API', file: 'system.test.js' }
];

const results = [];
let totalPassed = 0;
let totalFailed = 0;

// 運行每個測試套件
testSuites.forEach(suite => {
  console.log(`\n📋 運行 ${suite.name} 測試...`);
  
  try {
    const output = execSync(
      `npx jest tests/api/${suite.file} --forceExit --json`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    
    const result = JSON.parse(output);
    const passed = result.numPassedTests;
    const failed = result.numFailedTests;
    
    totalPassed += passed;
    totalFailed += failed;
    
    results.push({
      name: suite.name,
      file: suite.file,
      passed,
      failed,
      total: passed + failed,
      success: failed === 0
    });
    
    console.log(`✅ 通過: ${passed} / ${passed + failed}`);
  } catch (error) {
    // 即使測試失敗也要解析結果
    try {
      const output = error.stdout || error.output?.[1] || '';
      const jsonMatch = output.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        const passed = result.numPassedTests || 0;
        const failed = result.numFailedTests || 0;
        
        totalPassed += passed;
        totalFailed += failed;
        
        results.push({
          name: suite.name,
          file: suite.file,
          passed,
          failed,
          total: passed + failed,
          success: false
        });
        
        console.log(`❌ 通過: ${passed} / ${passed + failed}`);
      } else {
        results.push({
          name: suite.name,
          file: suite.file,
          passed: 0,
          failed: 0,
          total: 0,
          success: false,
          error: '無法運行測試'
        });
        console.log(`❌ 測試運行失敗`);
      }
    } catch (parseError) {
      console.log(`❌ 無法解析測試結果`);
    }
  }
});

// 生成測試報告
console.log('\n\n📊 測試結果總結\n');
console.log('=' .repeat(60));
console.log(`總測試數: ${totalPassed + totalFailed}`);
console.log(`✅ 通過: ${totalPassed}`);
console.log(`❌ 失敗: ${totalFailed}`);
console.log(`成功率: ${totalPassed > 0 ? ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1) : 0}%`);
console.log('=' .repeat(60));

console.log('\n詳細結果:\n');
results.forEach(result => {
  const status = result.success ? '✅' : '❌';
  console.log(`${status} ${result.name.padEnd(20)} - 通過: ${result.passed}/${result.total}`);
});

// 寫入測試報告
const report = {
  timestamp: new Date().toISOString(),
  environment: {
    nodeVersion: process.version,
    platform: process.platform,
    testDatabase: process.env.DB_NAME || 'estatehub_test'
  },
  summary: {
    totalTests: totalPassed + totalFailed,
    passed: totalPassed,
    failed: totalFailed,
    successRate: totalPassed > 0 ? ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1) + '%' : '0%'
  },
  suites: results
};

fs.writeFileSync(
  path.join(__dirname, 'test-report.json'),
  JSON.stringify(report, null, 2)
);

console.log('\n\n📄 測試報告已保存至 tests/test-report.json\n');

// 如果有失敗的測試，退出碼為 1
if (totalFailed > 0) {
  console.log('⚠️  有測試失敗，請檢查並修復\n');
  process.exit(1);
} else {
  console.log('🎉 所有測試通過！\n');
  process.exit(0);
}