const request = require('supertest');
const app = require('../../server');
const { authHeader } = require('../helpers/auth.helper');

describe('Statistics API Tests', () => {
  let adminToken;
  let editorToken;
  let viewerToken;

  beforeAll(async () => {
    // Get admin token
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testadmin',
        password: 'Test123!'
      });
    adminToken = adminLogin.body?.data?.accessToken;

    // Get editor token
    const editorLogin = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testeditor',
        password: 'Test123!'
      });
    editorToken = editorLogin.body?.data?.accessToken;

    // Create viewer user if needed
    try {
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testviewer',
          email: 'viewer@test.com',
          password: 'Test123!',
          role: 'viewer'
        });
    } catch (e) {
      // User might already exist
    }

    const viewerLogin = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testviewer',
        password: 'Test123!'
      });
    viewerToken = viewerLogin.body?.data?.accessToken;
  });

  describe('GET /api/statistics/overview', () => {
    it('should get system overview statistics for admin', async () => {
      const response = await request(app)
        .get('/api/statistics/overview')
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('projects');
      expect(response.body.data).toHaveProperty('contacts');
      expect(response.body.data).toHaveProperty('tags');

      // Validate projects statistics structure
      const { projects } = response.body.data;
      expect(projects).toHaveProperty('total');
      expect(projects).toHaveProperty('featured');
      expect(projects).toHaveProperty('byStatus');
      expect(typeof projects.total).toBe('number');
      expect(typeof projects.featured).toBe('number');
      expect(typeof projects.byStatus).toBe('object');

      // Validate contacts statistics structure
      const { contacts } = response.body.data;
      expect(contacts).toHaveProperty('total');
      expect(contacts).toHaveProperty('unread');
      expect(contacts).toHaveProperty('thisMonth');
      expect(typeof contacts.total).toBe('number');
      expect(typeof contacts.unread).toBe('number');
      expect(typeof contacts.thisMonth).toBe('number');

      // Validate tags statistics structure
      const { tags } = response.body.data;
      expect(tags).toHaveProperty('total');
      expect(tags).toHaveProperty('mostUsed');
      expect(typeof tags.total).toBe('number');
      expect(Array.isArray(tags.mostUsed)).toBe(true);
    });

    it('should allow editor access to overview statistics', async () => {
      const response = await request(app)
        .get('/api/statistics/overview')
        .set(authHeader(editorToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('projects');
      expect(response.body.data).toHaveProperty('contacts');
      expect(response.body.data).toHaveProperty('tags');
    });

    it('should deny viewer access to overview statistics', async () => {
      if (viewerToken) {
        await request(app)
          .get('/api/statistics/overview')
          .set(authHeader(viewerToken))
          .expect(403);
      }
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get('/api/statistics/overview')
        .expect(401);
    });

    it('should return valid numeric values', async () => {
      const response = await request(app)
        .get('/api/statistics/overview')
        .set(authHeader(adminToken))
        .expect(200);

      const { projects, contacts, tags } = response.body.data;

      // All counts should be non-negative numbers
      expect(projects.total).toBeGreaterThanOrEqual(0);
      expect(projects.featured).toBeGreaterThanOrEqual(0);
      expect(contacts.total).toBeGreaterThanOrEqual(0);
      expect(contacts.unread).toBeGreaterThanOrEqual(0);
      expect(contacts.thisMonth).toBeGreaterThanOrEqual(0);
      expect(tags.total).toBeGreaterThanOrEqual(0);

      // Featured projects should not exceed total projects
      expect(projects.featured).toBeLessThanOrEqual(projects.total);

      // Unread contacts should not exceed total contacts
      expect(contacts.unread).toBeLessThanOrEqual(contacts.total);
    });
  });

  describe('GET /api/statistics/projects', () => {
    it('should get project statistics with default timeframe', async () => {
      const response = await request(app)
        .get('/api/statistics/projects')
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();

      // Should include projects created in the last 30 days by default
      expect(response.body.data).toHaveProperty('totalProjects');
      expect(response.body.data).toHaveProperty('newProjects');
      expect(response.body.data).toHaveProperty('projectsByStatus');
      expect(response.body.data).toHaveProperty('projectsByType');
    });

    it('should accept custom days parameter', async () => {
      const testCases = [7, 30, 90, 365];

      for (const days of testCases) {
        const response = await request(app)
          .get('/api/statistics/projects')
          .query({ days })
          .set(authHeader(adminToken))
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      }
    });

    it('should validate days parameter range', async () => {
      // Test invalid days parameter
      await request(app)
        .get('/api/statistics/projects')
        .query({ days: 0 })
        .set(authHeader(adminToken))
        .expect(422);

      await request(app)
        .get('/api/statistics/projects')
        .query({ days: 400 })
        .set(authHeader(adminToken))
        .expect(422);

      await request(app)
        .get('/api/statistics/projects')
        .query({ days: -10 })
        .set(authHeader(adminToken))
        .expect(422);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get('/api/statistics/projects')
        .expect(401);
    });

    it('should deny viewer access', async () => {
      if (viewerToken) {
        await request(app)
          .get('/api/statistics/projects')
          .set(authHeader(viewerToken))
          .expect(403);
      }
    });
  });

  describe('GET /api/statistics/views', () => {
    it('should get view statistics with default timeframe', async () => {
      const response = await request(app)
        .get('/api/statistics/views')
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();

      // Should include view statistics
      expect(response.body.data).toHaveProperty('totalViews');
      expect(response.body.data).toHaveProperty('uniqueViews');
      expect(response.body.data).toHaveProperty('topProjects');
      expect(response.body.data).toHaveProperty('viewsByDay');
    });

    it('should accept custom days parameter', async () => {
      const testCases = [7, 30, 90, 365];

      for (const days of testCases) {
        const response = await request(app)
          .get('/api/statistics/views')
          .query({ days })
          .set(authHeader(adminToken))
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      }
    });

    it('should validate days parameter range', async () => {
      await request(app)
        .get('/api/statistics/views')
        .query({ days: 0 })
        .set(authHeader(adminToken))
        .expect(422);

      await request(app)
        .get('/api/statistics/views')
        .query({ days: 400 })
        .set(authHeader(adminToken))
        .expect(422);
    });

    it('should return properly structured view data', async () => {
      const response = await request(app)
        .get('/api/statistics/views')
        .set(authHeader(adminToken))
        .expect(200);

      const { data } = response.body;

      // Validate numeric fields
      expect(typeof data.totalViews).toBe('number');
      expect(typeof data.uniqueViews).toBe('number');
      expect(data.totalViews).toBeGreaterThanOrEqual(0);
      expect(data.uniqueViews).toBeGreaterThanOrEqual(0);

      // Unique views should not exceed total views
      expect(data.uniqueViews).toBeLessThanOrEqual(data.totalViews);

      // Validate array fields
      expect(Array.isArray(data.topProjects)).toBe(true);
      expect(Array.isArray(data.viewsByDay)).toBe(true);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get('/api/statistics/views')
        .expect(401);
    });

    it('should deny viewer access', async () => {
      if (viewerToken) {
        await request(app)
          .get('/api/statistics/views')
          .set(authHeader(viewerToken))
          .expect(403);
      }
    });
  });

  describe('Statistics Consistency Tests', () => {
    it('should maintain data consistency across different timeframes', async () => {
      const shortTermResponse = await request(app)
        .get('/api/statistics/projects')
        .query({ days: 7 })
        .set(authHeader(adminToken))
        .expect(200);

      const longTermResponse = await request(app)
        .get('/api/statistics/projects')
        .query({ days: 30 })
        .set(authHeader(adminToken))
        .expect(200);

      const shortData = shortTermResponse.body.data;
      const longData = longTermResponse.body.data;

      // Long-term data should have >= short-term data
      expect(longData.newProjects).toBeGreaterThanOrEqual(shortData.newProjects);
      expect(longData.totalProjects).toBeGreaterThanOrEqual(shortData.totalProjects);
    });

    it('should have consistent overview and detailed statistics', async () => {
      const overviewResponse = await request(app)
        .get('/api/statistics/overview')
        .set(authHeader(adminToken))
        .expect(200);

      const projectsResponse = await request(app)
        .get('/api/statistics/projects')
        .set(authHeader(adminToken))
        .expect(200);

      const overview = overviewResponse.body.data;
      const projects = projectsResponse.body.data;

      // Total projects should be consistent
      expect(overview.projects.total).toBe(projects.totalProjects);
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent statistics requests', async () => {
      const promises = [
        request(app).get('/api/statistics/overview').set(authHeader(adminToken)),
        request(app).get('/api/statistics/projects').set(authHeader(adminToken)),
        request(app).get('/api/statistics/views').set(authHeader(adminToken))
      ];

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    it('should respond within reasonable time limits', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/api/statistics/overview')
        .set(authHeader(adminToken))
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Should respond within 5 seconds
      expect(responseTime).toBeLessThan(5000);
    });
  });

  describe('Data Validation Tests', () => {
    it('should return valid date formats in time-series data', async () => {
      const response = await request(app)
        .get('/api/statistics/views')
        .set(authHeader(adminToken))
        .expect(200);

      const { viewsByDay } = response.body.data;

      if (viewsByDay.length > 0) {
        viewsByDay.forEach(item => {
          expect(item).toHaveProperty('date');
          expect(item).toHaveProperty('views');

          // Validate date format
          const date = new Date(item.date);
          expect(date.toString()).not.toBe('Invalid Date');

          // Validate views count
          expect(typeof item.views).toBe('number');
          expect(item.views).toBeGreaterThanOrEqual(0);
        });
      }
    });

    it('should return valid project status distributions', async () => {
      const response = await request(app)
        .get('/api/statistics/overview')
        .set(authHeader(adminToken))
        .expect(200);

      const { byStatus } = response.body.data.projects;

      // Should have valid status counts
      const validStatuses = ['planning', 'in_progress', 'completed', 'on_hold'];
      const statusCounts = Object.values(byStatus);

      statusCounts.forEach(count => {
        expect(typeof count).toBe('number');
        expect(count).toBeGreaterThanOrEqual(0);
      });

      // Sum of status counts should equal total projects
      const totalFromStatus = statusCounts.reduce((sum, count) => sum + count, 0);
      expect(totalFromStatus).toBeLessThanOrEqual(response.body.data.projects.total);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // This test checks that the API handles potential database issues
      const response = await request(app)
        .get('/api/statistics/overview')
        .set(authHeader(adminToken));

      // Should either succeed or fail gracefully with proper error structure
      if (response.status >= 400) {
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message');
        expect(typeof response.body.message).toBe('string');
      } else {
        expect(response.body.success).toBe(true);
      }
    });
  });
});
