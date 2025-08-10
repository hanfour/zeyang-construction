const request = require('supertest');
const app = require('../helpers/test-server');
const { generateTestToken, authHeader } = require('../helpers/auth.helper');

describe('System API Tests', () => {
  let adminToken;
  let viewerToken;

  beforeAll(() => {
    adminToken = generateTestToken({ role: 'admin' });
    viewerToken = generateTestToken({ role: 'viewer' });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('GET /api/system/health', () => {
    it('should return detailed health status', async () => {
      const response = await request(app)
        .get('/api/system/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('uptime');
      expect(response.body.data).toHaveProperty('database');
      expect(response.body.data.status).toBe('healthy');
    });
  });

  describe('GET /api/system/info', () => {
    it('should return system info with admin role', async () => {
      const response = await request(app)
        .get('/api/system/info')
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('version');
      expect(response.body.data).toHaveProperty('nodeVersion');
      expect(response.body.data).toHaveProperty('uptime');
      expect(response.body.data).toHaveProperty('memory');
    });

    it('should fail without admin role', async () => {
      const response = await request(app)
        .get('/api/system/info')
        .set(authHeader(viewerToken))
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/system/info')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('documentation');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent endpoint', async () => {
      const response = await request(app)
        .get('/api/non-existent-endpoint')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ROUTE_NOT_FOUND');
    });
  });

  describe('CORS', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should handle preflight requests', async () => {
      const response = await request(app)
        .options('/api/projects')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type')
        .expect(204);

      expect(response.headers).toHaveProperty('access-control-allow-methods');
      expect(response.headers).toHaveProperty('access-control-allow-headers');
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limiting headers', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      // Rate limit headers might be present
      const headers = response.headers;
      if (headers['x-ratelimit-limit']) {
        expect(parseInt(headers['x-ratelimit-limit'])).toBeGreaterThan(0);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{ invalid json')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
});