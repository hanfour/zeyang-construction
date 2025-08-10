const request = require('supertest');
const app = require('../helpers/test-server');
const { clearDatabase, seedTestUsers } = require('../helpers/db.helper');
const jwt = require('jsonwebtoken');

describe('Authentication Flow Tests', () => {
  beforeAll(async () => {
    await clearDatabase();
    await seedTestUsers();
    // Add delay to avoid rate limiting from previous tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    await clearDatabase();
  });

  describe('Complete Authentication Flow', () => {
    let userCredentials;
    let accessToken;
    let refreshToken;
    let userId;

    beforeEach(() => {
      userCredentials = {
        username: `testuser_${Date.now()}`,
        email: `testuser_${Date.now()}@test.com`,
        password: 'TestPassword123!'
      };
    });

    it('should complete full authentication lifecycle', async () => {
      // Step 1: Register new user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userCredentials)
        .expect(201);

      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.data).toHaveProperty('accessToken');
      expect(registerResponse.body.data).toHaveProperty('refreshToken');
      expect(registerResponse.body.data.user).toHaveProperty('id');

      accessToken = registerResponse.body.data.accessToken;
      refreshToken = registerResponse.body.data.refreshToken;
      userId = registerResponse.body.data.user.id;

      // Step 2: Verify the token works for authenticated endpoints
      const meResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(meResponse.body.success).toBe(true);
      expect(meResponse.body.data.user.id).toBe(userId);
      expect(meResponse.body.data.user.username).toBe(userCredentials.username);

      // Step 3: Logout
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(logoutResponse.body.success).toBe(true);

      // Step 4: Login again
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: userCredentials.username,
          password: userCredentials.password
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data).toHaveProperty('accessToken');
      expect(loginResponse.body.data).toHaveProperty('refreshToken');
      
      const newAccessToken = loginResponse.body.data.accessToken;
      const newRefreshToken = loginResponse.body.data.refreshToken;

      // Step 5: Use refresh token
      const refreshResponse = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: newRefreshToken })
        .expect(200);

      expect(refreshResponse.body.success).toBe(true);
      expect(refreshResponse.body.data).toHaveProperty('accessToken');
      expect(refreshResponse.body.data).toHaveProperty('refreshToken');

      // Step 6: Change password
      const changePasswordResponse = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${refreshResponse.body.data.accessToken}`)
        .send({
          currentPassword: userCredentials.password,
          newPassword: 'NewPassword123!'
        })
        .expect(200);

      expect(changePasswordResponse.body.success).toBe(true);

      // Step 7: Verify old password doesn't work
      const failedLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: userCredentials.username,
          password: userCredentials.password
        })
        .expect(401);

      expect(failedLoginResponse.body.success).toBe(false);

      // Step 8: Verify new password works
      const successLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: userCredentials.username,
          password: 'NewPassword123!'
        })
        .expect(200);

      expect(successLoginResponse.body.success).toBe(true);
    });
  });

  describe('Token Validation', () => {
    it('should validate JWT token structure and claims', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testadmin',
          password: 'Test123!'
        });

      const { accessToken, refreshToken } = loginResponse.body.data;

      // Decode tokens (without verification for testing)
      const decodedAccess = jwt.decode(accessToken);
      const decodedRefresh = jwt.decode(refreshToken);

      // Check access token claims
      expect(decodedAccess).toHaveProperty('userId');
      expect(decodedAccess).toHaveProperty('iat');
      expect(decodedAccess).toHaveProperty('exp');
      expect(decodedAccess).toHaveProperty('iss', 'EstateHub');
      expect(decodedAccess).toHaveProperty('aud', 'estatehub-users');

      // Check refresh token claims
      expect(decodedRefresh).toHaveProperty('userId');
      expect(decodedRefresh).toHaveProperty('iat');
      expect(decodedRefresh).toHaveProperty('exp');
      expect(decodedRefresh).toHaveProperty('iss', 'EstateHub');
      expect(decodedRefresh).toHaveProperty('aud', 'estatehub-users');

      // Verify refresh token has longer expiry
      expect(decodedRefresh.exp - decodedRefresh.iat).toBeGreaterThan(
        decodedAccess.exp - decodedAccess.iat
      );
    });

    it('should reject expired tokens', async () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { userId: 1 },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' } // Expired 1 hour ago
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('TOKEN_EXPIRED');
    });

    it('should reject invalid tokens', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token-here')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });
  });

  describe('Authentication Security', () => {
    it('should not return password in any response', async () => {
      // Check registration response
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: `secure_${Date.now()}`,
          email: `secure_${Date.now()}@test.com`,
          password: 'SecurePass123!'
        });

      expect(registerResponse.body.data.user).not.toHaveProperty('password');

      // Check login response
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testadmin',
          password: 'Test123!'
        });

      expect(loginResponse.body.data.user).not.toHaveProperty('password');

      // Check /me endpoint
      const meResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`);

      expect(meResponse.body.data.user).not.toHaveProperty('password');
    });

    it('should handle multiple login attempts', async () => {
      const credentials = {
        username: 'testadmin',
        password: 'Test123!'
      };

      // Make multiple login requests with delays to avoid rate limiting
      const responses = [];
      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send(credentials);
        responses.push(response);
        // Add small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('accessToken');
      });

      // Verify all requests succeeded
      expect(responses.filter(r => r.status === 200).length).toBe(3);
    });
  });

  describe('Authorization Flow', () => {
    let adminToken;
    let editorToken;
    let viewerToken;

    beforeAll(async () => {
      // Get tokens for different roles
      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testadmin', password: 'Test123!' });
      adminToken = adminLogin.body.data.accessToken;

      const editorLogin = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testeditor', password: 'Test123!' });
      editorToken = editorLogin.body.data.accessToken;

      const viewerLogin = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testviewer', password: 'Test123!' });
      viewerToken = viewerLogin.body.data.accessToken;
    });

    it('should enforce role-based access control', async () => {
      const tagData = {
        name: `rbac_test_${Date.now()}`,
        nameEn: 'RBAC Test',
        category: 'style'
      };

      // Admin should be able to create tags
      const adminResponse = await request(app)
        .post('/api/tags')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(tagData)
        .expect(201);

      expect(adminResponse.body.success).toBe(true);

      // Editor should be able to create tags
      const editorResponse = await request(app)
        .post('/api/tags')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ ...tagData, name: `${tagData.name}_editor` })
        .expect(201);

      expect(editorResponse.body.success).toBe(true);

      // Viewer should NOT be able to create tags
      const viewerResponse = await request(app)
        .post('/api/tags')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ ...tagData, name: `${tagData.name}_viewer` })
        .expect(403);

      expect(viewerResponse.body.success).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle login with email instead of username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testadmin@test.com', // Using email in username field
          password: 'Test123!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe('testadmin');
    });

    it('should handle refresh token reuse', async () => {
      // Login to get tokens
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testadmin',
          password: 'Test123!'
        });

      const { refreshToken } = loginResponse.body.data;

      // Use refresh token once
      const firstRefresh = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(firstRefresh.body.success).toBe(true);

      // Try to use the same refresh token again
      const secondRefresh = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      // Should still work as we don't implement refresh token rotation
      expect(secondRefresh.body.success).toBe(true);
    });

    it('should handle missing authorization header formats', async () => {
      const endpoints = [
        { method: 'get', url: '/api/auth/me' },
        { method: 'post', url: '/api/auth/logout' }
      ];

      for (const endpoint of endpoints) {
        // No auth header
        await request(app)[endpoint.method](endpoint.url)
          .expect(401);

        // Wrong format
        await request(app)[endpoint.method](endpoint.url)
          .set('Authorization', 'InvalidFormat')
          .expect(401);

        // Empty bearer
        await request(app)[endpoint.method](endpoint.url)
          .set('Authorization', 'Bearer ')
          .expect(401);
      }
    });
  });
});