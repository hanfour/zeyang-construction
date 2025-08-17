/**
 * 快速測試 - 驗證 API 基本功能
 */

const request = require('supertest');

// 設置測試環境
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.PORT = 3002;

// Mock 資料庫
jest.mock('../config/database', () => ({
  pool: {
    getConnection: jest.fn().mockResolvedValue({
      execute: jest.fn().mockResolvedValue([[], {}]),
      release: jest.fn(),
      ping: jest.fn().mockResolvedValue(true)
    }),
    execute: jest.fn().mockResolvedValue([[], {}])
  },
  testConnection: jest.fn().mockResolvedValue(true)
}));

// 匯入 app
const app = require('../server');

test('健康檢查 API', async () => {
  const response = await request(app)
    .get('/health')
    .expect(200);

  expect(response.body.status).toBe('healthy');
});

test('API 基本資訊', async () => {
  const response = await request(app)
    .get('/')
    .expect(200);

  expect(response.body.message).toBe('ZeYang API Server');
  expect(response.body.version).toBe('1.0.0');
});

test('404 錯誤處理', async () => {
  const response = await request(app)
    .get('/api/invalid-endpoint')
    .expect(404);

  expect(response.body.success).toBe(false);
});

console.log('\n✅ 測試環境設置成功\n');
