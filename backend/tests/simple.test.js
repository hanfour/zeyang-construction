/**
 * 簡單的 API 測試範例 - 展示測試架構已正確設置
 */

const request = require('supertest');
const app = require('./helpers/test-server');
const { generateTestToken } = require('./helpers/auth.helper');

describe('簡單 API 測試', () => {
  describe('公開端點測試', () => {
    test('GET /health - 健康檢查', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
    });

    test('GET / - API 資訊', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'ZeYang API Server');
      expect(response.body).toHaveProperty('version', '1.0.0');
    });
  });

  describe('錯誤處理測試', () => {
    test('404 錯誤 - 不存在的路由', async () => {
      const response = await request(app)
        .get('/api/not-found-endpoint')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('400 錯誤 - 格式錯誤的 JSON', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('認證測試', () => {
    test('生成測試 Token', () => {
      const token = generateTestToken({ 
        id: 1, 
        username: 'testuser', 
        role: 'admin' 
      });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT 格式
    });

    test('需要認證的端點應返回 401', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('使用有效 Token 應可訪問受保護端點', async () => {
      const token = generateTestToken({ role: 'admin' });
      
      const response = await request(app)
        .get('/api/system/health')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});

describe('測試環境驗證', () => {
  test('環境變數設置正確', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.JWT_SECRET).toBeDefined();
  });

  test('測試架構運作正常', () => {
    expect(app).toBeDefined();
    expect(typeof request).toBe('function');
  });
});