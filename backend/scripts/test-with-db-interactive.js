#!/usr/bin/env node

/**
 * 互動式自動化測試腳本 - 使用真實資料庫
 */

const { execSync } = require('child_process');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 詢問函數
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function getDBConfig() {
  console.log('🔧 資料庫連接設定\n');
  
  const host = await question('MySQL 主機 (預設: 127.0.0.1): ') || '127.0.0.1';
  const port = await question('MySQL 端口 (預設: 3306): ') || '3306';
  const user = await question('MySQL 用戶名 (預設: root): ') || 'root';
  const password = await question('MySQL 密碼: ');
  
  return {
    host,
    port: parseInt(port),
    user,
    password,
    database: 'ZeYang_test',
    multipleStatements: true
  };
}

async function setupTestDatabase(config) {
  console.log('\n🔧 設置測試資料庫...');
  
  let connection;
  
  try {
    // 連接到 MySQL（不指定資料庫）
    connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password
    });
    
    // 創建測試資料庫
    await connection.execute('CREATE DATABASE IF NOT EXISTS ZeYang_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ 資料庫創建成功');
    
    // 切換到測試資料庫
    await connection.changeUser({ database: 'ZeYang_test' });
    
    // 讀取並執行 schema
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await connection.query(schema);
      console.log('✅ Schema 導入成功');
    } else {
      console.warn('⚠️  找不到 schema.sql，跳過導入');
    }
    
    await connection.end();
    
    // 保存配置到 .env.test
    const envContent = `# Test Environment Variables
NODE_ENV=test
PORT=3001

# Database
DB_HOST=${config.host}
DB_USER=${config.user}
DB_PASSWORD=${config.password}
DB_NAME=ZeYang_test
DB_PORT=${config.port}

# JWT
JWT_SECRET=test-jwt-secret-key-for-testing-only
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
REFRESH_SECRET=test-refresh-secret-key-for-testing-only

# File Upload
MAX_FILE_SIZE=268435456
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/gif,image/webp

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=error
SUPPRESS_LOGS=true`;

    fs.writeFileSync(path.join(__dirname, '../.env.test'), envContent);
    console.log('✅ 測試環境配置已保存到 .env.test');
    
  } catch (error) {
    console.error('❌ 資料庫設置失敗:', error.message);
    if (connection) await connection.end();
    throw error;
  }
}

async function runTests() {
  console.log('\n🧪 運行測試...\n');
  
  try {
    // 設置環境變數
    process.env.NODE_ENV = 'test';
    
    // 運行測試
    execSync('npm test', { 
      stdio: 'inherit',
      env: { ...process.env }
    });
    
    return true;
  } catch (error) {
    console.error('\n⚠️  部分測試失敗');
    return false;
  }
}

async function generateReport() {
  console.log('\n📊 生成測試報告...');
  
  try {
    // 運行測試並輸出統計
    const output = execSync('npm test -- --passWithNoTests 2>&1 || true', {
      env: { ...process.env, NODE_ENV: 'test' },
      encoding: 'utf8'
    });
    
    // 從輸出中提取統計信息
    const lines = output.split('\n');
    const testLine = lines.find(l => l.includes('Tests:'));
    const suiteLine = lines.find(l => l.includes('Test Suites:'));
    
    if (testLine) {
      console.log('\n📈 測試結果:');
      console.log(testLine.trim());
      if (suiteLine) console.log(suiteLine.trim());
      
      // 計算通過率
      const match = testLine.match(/(\d+) passed.*?(\d+) total/);
      if (match) {
        const passed = parseInt(match[1]);
        const total = parseInt(match[2]);
        const rate = ((passed / total) * 100).toFixed(2);
        console.log(`\n✨ 通過率: ${rate}%`);
        
        if (rate >= 90) {
          console.log('🎉 恭喜！已達到 90% 以上的通過率！');
        } else {
          console.log(`📊 距離 90% 目標還差 ${(90 - rate).toFixed(2)}%`);
        }
      }
    }
    
  } catch (error) {
    console.warn('⚠️  無法生成詳細報告');
  }
}

// 主函數
async function main() {
  console.log('🚀 ZeYang 互動式自動化測試\n');
  
  try {
    // 1. 獲取資料庫配置
    const config = await getDBConfig();
    
    // 2. 測試連接
    console.log('\n🔍 測試 MySQL 連接...');
    const testConnection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password
    });
    await testConnection.ping();
    await testConnection.end();
    console.log('✅ MySQL 連接成功');
    
    // 3. 設置測試資料庫
    await setupTestDatabase(config);
    
    // 4. 詢問是否運行測試
    const runNow = await question('\n是否立即運行測試？(y/n): ');
    
    if (runNow.toLowerCase() === 'y') {
      // 5. 運行測試
      const success = await runTests();
      
      // 6. 生成報告
      await generateReport();
      
      console.log('\n✨ 測試流程完成！');
      console.log('\n提示: 之後可以直接運行 "npm test" 來執行測試');
    } else {
      console.log('\n✅ 測試環境已準備就緒！');
      console.log('運行 "npm test" 來執行測試');
    }
    
  } catch (error) {
    console.error('\n💥 錯誤:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// 執行主函數
if (require.main === module) {
  main();
}