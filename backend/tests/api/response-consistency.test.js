const request = require('supertest');
const app = require('../helpers/test-server');
const { clearDatabase, seedTestUsers } = require('../helpers/db.helper');

describe('API Response Consistency Tests', () => {
  let adminToken;
  let viewerToken;

  beforeAll(async () => {
    await clearDatabase();
    await seedTestUsers();
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Login as admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testadmin', password: 'Test123!' });
    adminToken = adminLogin.body.data.accessToken;

    // Login as viewer
    const viewerLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testviewer', password: 'Test123!' });
    viewerToken = viewerLogin.body.data.accessToken;
  });

  afterAll(async () => {
    await clearDatabase();
  });

  describe('Success Response Structure', () => {
    it('should have consistent success response structure', async () => {
      // Test various endpoints for consistency
      const endpoints = [
        { method: 'get', url: '/api/system/status', auth: false },
        { method: 'get', url: '/api/tags', auth: false },
        { method: 'get', url: '/api/auth/me', auth: true }
      ];

      for (const endpoint of endpoints) {
        const req = request(app)[endpoint.method](endpoint.url);
        if (endpoint.auth) {
          req.set('Authorization', `Bearer ${viewerToken}`);
        }

        const response = await req;

        // Check success response structure
        if (response.status < 400) {
          expect(response.body).toHaveProperty('success', true);
          expect(response.body).toHaveProperty('data');
          // Success responses should not have error field
          expect(response.body).not.toHaveProperty('error');
        }
      }
    });

    it('should return data in consistent format for list endpoints', async () => {
      const listEndpoints = [
        '/api/tags',
        '/api/tags/popular'
      ];

      for (const url of listEndpoints) {
        const response = await request(app).get(url);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      }
    });

    it('should return data object for single resource endpoints', async () => {
      // Create a tag first
      const createResponse = await request(app)
        .post('/api/tags')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `testtag_${Date.now()}`,
          nameEn: 'Test Tag',
          category: 'style'
        });

      const tagIdentifier = createResponse.body.data.identifier;

      // Test single resource endpoints
      const response = await request(app)
        .get(`/api/tags/${tagIdentifier}`);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Object);
      expect(response.body.data).toHaveProperty('id');
    });
  });

  describe('Error Response Structure', () => {
    it('should have consistent error response structure', async () => {
      const errorScenarios = [
        {
          method: 'get',
          url: '/api/auth/me',
          expectedStatus: 401,
          description: 'Unauthorized request'
        },
        {
          method: 'get',
          url: '/api/tags/non-existent-tag',
          expectedStatus: 404,
          description: 'Not found'
        },
        {
          method: 'post',
          url: '/api/tags',
          data: { name: '' },
          auth: true,
          expectedStatus: 400,
          description: 'Validation error'
        }
      ];

      for (const scenario of errorScenarios) {
        const req = request(app)[scenario.method](scenario.url);

        if (scenario.auth) {
          req.set('Authorization', `Bearer ${adminToken}`);
        }

        if (scenario.data) {
          req.send(scenario.data);
        }

        const response = await req;

        // Check error response structure
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toHaveProperty('code');
        // Error responses should not have data field
        expect(response.body).not.toHaveProperty('data');

        // Verify status code
        expect(response.status).toBe(scenario.expectedStatus);
      }
    });
  });

  describe('Authentication Response Consistency', () => {
    it('should return consistent token structure on login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testadmin', password: 'Test123!' });

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).toHaveProperty('username');
      expect(response.body.data.user).toHaveProperty('email');
      expect(response.body.data.user).toHaveProperty('role');
    });

    it('should return consistent token structure on register', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: `newuser_${Date.now()}`,
          email: `newuser_${Date.now()}@test.com`,
          password: 'Test123!'
        });

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data).toHaveProperty('user');
    });

    it('should return consistent structure on token refresh', async () => {
      // First login to get refresh token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testadmin', password: 'Test123!' });

      const refreshToken = loginResponse.body.data.refreshToken;

      // Test refresh
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });
  });

  describe('CRUD Operation Response Consistency', () => {
    it('should return consistent response for CREATE operations', async () => {
      const response = await request(app)
        .post('/api/tags')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `newtag_${Date.now()}`,
          nameEn: 'New Tag',
          category: 'style'
        });

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name');
    });

    it('should return consistent response for UPDATE operations', async () => {
      // First create a tag
      const createResponse = await request(app)
        .post('/api/tags')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `updatetag_${Date.now()}`,
          nameEn: 'Update Tag',
          category: 'style'
        });

      const tagIdentifier = createResponse.body.data.identifier;

      // Update the tag
      const response = await request(app)
        .put(`/api/tags/${tagIdentifier}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nameEn: 'Updated Tag Name'
        });

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.nameEn).toBe('Updated Tag Name');
    });

    it('should return consistent response for DELETE operations', async () => {
      // First create a tag
      const createResponse = await request(app)
        .post('/api/tags')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `deletetag_${Date.now()}`,
          nameEn: 'Delete Tag',
          category: 'style'
        });

      const tagIdentifier = createResponse.body.data.identifier;

      // Delete the tag
      const response = await request(app)
        .delete(`/api/tags/${tagIdentifier}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Validation Error Consistency', () => {
    it('should return consistent validation error format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'a', // Too short
          email: 'invalid-email', // Invalid format
          password: '123' // Too weak
        });

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toBeInstanceOf(Array);

      response.body.errors.forEach(error => {
        expect(error).toHaveProperty('field');
        expect(error).toHaveProperty('message');
      });
    });
  });
});
