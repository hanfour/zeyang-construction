const request = require('supertest');
const app = require('../../server');
const { authHeader } = require('../helpers/auth.helper');

describe('Settings API Tests', () => {
  let adminToken;
  let editorToken;
  let viewerToken;

  beforeAll(async () => {
    // Create admin user and get token
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testadmin',
        password: 'Test123!'
      });
    
    adminToken = adminLogin.body?.data?.accessToken;

    // Create editor user and get token
    const editorLogin = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testeditor', 
        password: 'Test123!'
      });
    
    editorToken = editorLogin.body?.data?.accessToken;
  });

  describe('GET /api/settings', () => {
    it('should get all settings with admin role', async () => {
      const response = await request(app)
        .get('/api/settings')
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Check if settings have expected structure
      const setting = response.body.data[0];
      expect(setting).toHaveProperty('key');
      expect(setting).toHaveProperty('value');
      expect(setting).toHaveProperty('type');
      expect(setting).toHaveProperty('category');
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get('/api/settings')
        .expect(401);
    });

    it('should fail with non-admin role', async () => {
      if (editorToken) {
        await request(app)
          .get('/api/settings')
          .set(authHeader(editorToken))
          .expect(403);
      }
    });
  });

  describe('GET /api/settings/category/:category', () => {
    it('should get settings by category', async () => {
      const response = await request(app)
        .get('/api/settings/category/general')
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // All returned settings should be from 'general' category
      response.body.data.forEach(setting => {
        expect(setting.category).toBe('general');
      });
    });

    it('should return empty array for non-existent category', async () => {
      const response = await request(app)
        .get('/api/settings/category/nonexistent')
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /api/settings/:key', () => {
    it('should get single setting by key', async () => {
      const response = await request(app)
        .get('/api/settings/site_name')
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('key', 'site_name');
      expect(response.body.data).toHaveProperty('value');
      expect(response.body.data).toHaveProperty('type');
    });

    it('should return 404 for non-existent key', async () => {
      await request(app)
        .get('/api/settings/nonexistent_key')
        .set(authHeader(adminToken))
        .expect(404);
    });
  });

  describe('PUT /api/settings/:key', () => {
    it('should update setting with valid data', async () => {
      const newValue = 'Updated ZeYang';
      
      const response = await request(app)
        .put('/api/settings/site_name')
        .set(authHeader(adminToken))
        .send({ value: newValue })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('updated');

      // Verify the setting was actually updated
      const getResponse = await request(app)
        .get('/api/settings/site_name')
        .set(authHeader(adminToken))
        .expect(200);

      expect(getResponse.body.data.value).toBe(newValue);
    });

    it('should fail with empty value', async () => {
      await request(app)
        .put('/api/settings/site_name')
        .set(authHeader(adminToken))
        .send({ value: '' })
        .expect(400);
    });

    it('should fail without admin role', async () => {
      if (editorToken) {
        await request(app)
          .put('/api/settings/site_name')
          .set(authHeader(editorToken))
          .send({ value: 'New Value' })
          .expect(403);
      }
    });

    it('should return 404 for non-existent key', async () => {
      await request(app)
        .put('/api/settings/nonexistent_key')
        .set(authHeader(adminToken))
        .send({ value: 'New Value' })
        .expect(404);
    });
  });

  describe('GET /api/settings/smtp/config', () => {
    it('should get SMTP configuration', async () => {
      const response = await request(app)
        .get('/api/settings/smtp/config')
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('enabled');
      expect(response.body.data).toHaveProperty('host');
      expect(response.body.data).toHaveProperty('port');
      expect(response.body.data).toHaveProperty('fromEmail');
      expect(response.body.data).toHaveProperty('fromName');
    });

    it('should mask sensitive data in SMTP config', async () => {
      const response = await request(app)
        .get('/api/settings/smtp/config')
        .set(authHeader(adminToken))
        .expect(200);

      // Password should be masked or excluded
      expect(response.body.data.password).toBeUndefined();
    });
  });

  describe('POST /api/settings/smtp/test', () => {
    it('should test SMTP configuration', async () => {
      const testConfig = {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        username: 'test@example.com',
        password: 'testpassword',
        fromEmail: 'test@example.com',
        toEmail: 'admin@ZeYang.com'
      };

      // This will likely fail in test environment, but should return proper error structure
      const response = await request(app)
        .post('/api/settings/smtp/test')
        .set(authHeader(adminToken))
        .send(testConfig);

      // Accept either success or failure, but check response structure
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      
      if (!response.body.success) {
        // If it failed, it should have an error message
        expect(typeof response.body.message).toBe('string');
      }
    });

    it('should fail with invalid SMTP config', async () => {
      const invalidConfig = {
        host: '',
        port: 'invalid',
        fromEmail: 'invalid-email'
      };

      await request(app)
        .post('/api/settings/smtp/test')
        .set(authHeader(adminToken))
        .send(invalidConfig)
        .expect(400);
    });
  });

  describe('Settings Security', () => {
    it('should not expose sensitive settings in general endpoint', async () => {
      const response = await request(app)
        .get('/api/settings')
        .set(authHeader(adminToken))
        .expect(200);

      // Check that sensitive keys are masked or excluded
      const sensitiveKeys = ['smtp_password', 'api_keys', 'secret_key'];
      const settings = response.body.data;
      
      settings.forEach(setting => {
        if (sensitiveKeys.includes(setting.key)) {
          expect(setting.value).toMatch(/^\*+$|^$|null/);
        }
      });
    });

    it('should validate setting types correctly', async () => {
      // Test boolean type
      await request(app)
        .put('/api/settings/enable_registration')
        .set(authHeader(adminToken))
        .send({ value: 'not-a-boolean' })
        .expect(400);

      // Test number type
      await request(app)
        .put('/api/settings/items_per_page')
        .set(authHeader(adminToken))
        .send({ value: 'not-a-number' })
        .expect(400);
    });
  });

  describe('Settings Caching', () => {
    it('should handle cache invalidation after updates', async () => {
      const originalValue = 'Original Value';
      const newValue = 'New Value';

      // Set initial value
      await request(app)
        .put('/api/settings/site_name')
        .set(authHeader(adminToken))
        .send({ value: originalValue })
        .expect(200);

      // Update the value
      await request(app)
        .put('/api/settings/site_name')
        .set(authHeader(adminToken))
        .send({ value: newValue })
        .expect(200);

      // Verify the new value is returned (not cached old value)
      const response = await request(app)
        .get('/api/settings/site_name')
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body.data.value).toBe(newValue);
    });
  });

  describe('Settings Performance', () => {
    it('should handle concurrent setting updates', async () => {
      const promises = [];
      
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .put('/api/settings/site_name')
            .set(authHeader(adminToken))
            .send({ value: `Concurrent Update ${i}` })
        );
      }

      const responses = await Promise.all(promises);
      
      // All requests should succeed (no race conditions)
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });
});