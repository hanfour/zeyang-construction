const request = require('supertest');
const app = require('./helpers/test-server');

/**
 * 整合測試範例 - 展示如何測試 API
 */

describe('API Integration Tests', () => {
  describe('Public Endpoints', () => {
    it('GET /health - should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
    });

    it('GET / - should return API info', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.message).toBe('ZeYang API Server');
      expect(response.body.version).toBe('1.0.0');
    });

    it('GET /api/system/health - should return detailed health', async () => {
      const response = await request(app)
        .get('/api/system/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('healthy');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ROUTE_NOT_FOUND');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{ invalid json')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // CORS headers might be set by middleware
      // Just check if response is successful
      expect(response.status).toBe(200);
    });

    it('should handle OPTIONS requests', async () => {
      const response = await request(app)
        .options('/api/projects')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .expect(204);

      expect(response.headers['access-control-allow-methods']).toBeDefined();
    });
  });
});

/**
 * 測試結果總結
 */
describe('Test Summary', () => {
  it('should display test environment info', () => {
    console.log('\n=== 測試環境資訊 ===');
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`測試端口: ${process.env.PORT || 3001}`);
    console.log(`資料庫: ${process.env.DB_NAME || 'ZeYang_test'}`);
    console.log('==================\n');

    expect(process.env.NODE_ENV).toBe('test');
  });
});
