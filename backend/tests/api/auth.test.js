const request = require('supertest');
const app = require('../helpers/test-server');
const { clearDatabase, seedTestUsers } = require('../helpers/db.helper');
const { testUsers } = require('../helpers/test-data');

describe('Auth API Tests', () => {
  beforeAll(async () => {
    await clearDatabase();
    await seedTestUsers();
  });

  afterAll(async () => {
    await clearDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        username: 'newuser',
        email: 'newuser@test.com',
        password: 'NewUser123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.username).toBe(newUser.username);
      expect(response.body.data.user.email).toBe(newUser.email);
      expect(response.body.data.user.role).toBe('viewer');
    });

    it('should fail with duplicate username', async () => {
      const duplicateUser = {
        username: 'testadmin',
        email: 'different@test.com',
        password: 'Test123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateUser)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should fail with invalid email', async () => {
      const invalidUser = {
        username: 'testuser2',
        email: 'invalid-email',
        password: 'Test123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should fail with weak password', async () => {
      const weakPasswordUser = {
        username: 'testuser3',
        email: 'test3@test.com',
        password: '123456'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testadmin',
          password: 'Test123!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.username).toBe('testadmin');
      expect(response.body.data.user.role).toBe('admin');
    });

    it('should login with email instead of username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testadmin@test.com',
          password: 'Test123!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe('testadmin');
    });

    it('should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testadmin',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should fail with non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'Test123!'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken;

    beforeEach(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testadmin',
          password: 'Test123!'
        });
      
      if (loginResponse.body.success && loginResponse.body.data) {
        refreshToken = loginResponse.body.data.refreshToken;
      }
    });

    it('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should fail with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail without refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({})
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken;

    beforeEach(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testadmin',
          password: 'Test123!'
        });
      
      if (loginResponse.body.success && loginResponse.body.data) {
        authToken = loginResponse.body.data.accessToken;
      }
    });

    it('should get current user info with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.username).toBe('testadmin');
      expect(response.body.data.user.role).toBe('admin');
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/auth/change-password', () => {
    let authToken;

    beforeEach(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testeditor',
          password: 'Test123!'
        });
      
      if (loginResponse.body.success && loginResponse.body.data) {
        authToken = loginResponse.body.data.accessToken;
      }
    });

    it('should change password successfully', async () => {
      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'Test123!',
          newPassword: 'NewTest123!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify can login with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testeditor',
          password: 'NewTest123!'
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);

      // Change back for other tests
      await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
        .send({
          currentPassword: 'NewTest123!',
          newPassword: 'Test123!'
        });
    });

    it('should fail with wrong current password', async () => {
      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'WrongPassword!',
          newPassword: 'NewTest123!'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('incorrect');
    });

    it('should fail with weak new password', async () => {
      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'Test123!',
          newPassword: '123456'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/logout', () => {
    let authToken;

    beforeEach(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testadmin',
          password: 'Test123!'
        });
      
      if (loginResponse.body.success && loginResponse.body.data) {
        authToken = loginResponse.body.data.accessToken;
      }
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
    });
  });
});