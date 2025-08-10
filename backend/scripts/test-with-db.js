#!/usr/bin/env node

/**
 * 自動化測試腳本 - 使用真實資料庫
 * 
 * 使用方式：
 * 1. 確保 MySQL 正在運行
 * 2. 執行：node scripts/test-with-db.js
 */

const { execSync } = require('child_process');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// 測試資料庫配置
const TEST_DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1', // 使用 IPv4 而非 localhost
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'estatehub_test',
  multipleStatements: true,
  port: process.env.DB_PORT || 3306
};

async function setupTestDatabase() {
  console.log('🔧 設置測試資料庫...');
  
  let connection;
  
  try {
    // 連接到 MySQL（不指定資料庫）
    connection = await mysql.createConnection({
      host: TEST_DB_CONFIG.host,
      user: TEST_DB_CONFIG.user,
      password: TEST_DB_CONFIG.password,
      port: TEST_DB_CONFIG.port
    });
    
    // 創建測試資料庫
    await connection.execute('CREATE DATABASE IF NOT EXISTS estatehub_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ 資料庫創建成功');
    
    // 切換到測試資料庫
    await connection.changeUser({ database: 'estatehub_test' });
    
    // 讀取並執行 schema
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // 分割 SQL 語句並逐個執行
      const statements = schema
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await connection.query(statement + ';');
          } catch (err) {
            console.warn(`⚠️  執行語句失敗: ${err.message}`);
          }
        }
      }
      
      console.log('✅ Schema 導入成功');
    } else {
      console.warn('⚠️  找不到 schema.sql，跳過導入');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 資料庫設置失敗:', error.message);
    if (connection) await connection.end();
    throw error;
  }
}

async function runTests() {
  console.log('🧪 運行測試...\n');
  
  try {
    // 設置環境變數
    process.env.NODE_ENV = 'test';
    process.env.DB_NAME = 'estatehub_test';
    
    // 運行測試
    execSync('npm test', { 
      stdio: 'inherit',
      env: { ...process.env }
    });
    
  } catch (error) {
    console.error('\n❌ 測試失敗');
    process.exit(1);
  }
}

async function generateReport() {
  console.log('\n📊 生成測試報告...');
  
  const reportPath = path.join(__dirname, '../test-report.json');
  
  try {
    // 運行測試並輸出 JSON 報告
    execSync('npm test -- --json --outputFile=test-report.json', {
      env: { ...process.env, NODE_ENV: 'test', DB_NAME: 'estatehub_test' }
    });
    
    // 讀取報告
    if (fs.existsSync(reportPath)) {
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      
      console.log('\n📈 測試結果摘要:');
      console.log(`總測試數: ${report.numTotalTests}`);
      console.log(`通過: ${report.numPassedTests}`);
      console.log(`失敗: ${report.numFailedTests}`);
      console.log(`通過率: ${((report.numPassedTests / report.numTotalTests) * 100).toFixed(2)}%`);
      
      if (report.numFailedTests > 0) {
        console.log('\n❌ 失敗的測試:');
        report.testResults.forEach(suite => {
          suite.assertionResults
            .filter(test => test.status === 'failed')
            .forEach(test => {
              console.log(`- ${test.fullName}`);
            });
        });
      }
    }
    
  } catch (error) {
    console.warn('⚠️  無法生成詳細報告');
  }
}

// 主函數
async function main() {
  console.log('🚀 BuildSight 自動化測試\n');
  
  try {
    // 1. 檢查 MySQL 連接
    console.log('🔍 檢查 MySQL 連接...');
    const connection = await mysql.createConnection({
      host: TEST_DB_CONFIG.host,
      user: TEST_DB_CONFIG.user,
      password: TEST_DB_CONFIG.password,
      port: TEST_DB_CONFIG.port
    });
    await connection.ping();
    await connection.end();
    console.log('✅ MySQL 連接成功\n');
    
    // 2. 設置測試資料庫
    await setupTestDatabase();
    
    // 3. 運行測試
    await runTests();
    
    // 4. 生成報告
    await generateReport();
    
    console.log('\n✨ 測試完成！');
    
  } catch (error) {
    console.error('\n💥 錯誤:', error.message);
    console.log('\n請確保:');
    console.log('1. MySQL 正在運行');
    console.log('2. 資料庫用戶名和密碼正確');
    console.log('3. 已安裝所有依賴 (npm install)');
    process.exit(1);
  }
}

// 執行主函數
if (require.main === module) {
  main();
}