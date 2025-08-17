const request = require('supertest');
const app = require('../../server');
const { authHeader } = require('../helpers/auth.helper');

describe('Complete Workflow Integration Tests', () => {
  let adminToken;
  let editorToken;
  let testProjectId;
  let testContactId;
  let testTagId;

  beforeAll(async () => {
    // Get authentication tokens
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testadmin',
        password: 'Test123!'
      });
    adminToken = adminLogin.body?.data?.accessToken;

    const editorLogin = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testeditor',
        password: 'Test123!'
      });
    editorToken = editorLogin.body?.data?.accessToken;
  });

  describe('Complete Project Lifecycle', () => {
    it('should complete full project creation, management and deletion workflow', async () => {
      // 1. Create a new project
      const createResponse = await request(app)
        .post('/api/projects')
        .set(authHeader(adminToken))
        .send({
          title: 'Integration Test Project',
          category: '住宅',
          location: 'Test City, Test District',
          status: 'planning',
          year: 2024,
          is_featured: false,
          tags: ['modern', 'luxury'],
          features: ['parking', 'garden', 'gym']
        })
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data.project).toHaveProperty('identifier');
      testProjectId = createResponse.body.data.project.identifier;

      // 2. Get the created project
      const getResponse = await request(app)
        .get(`/api/projects/${testProjectId}`)
        .expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data.project.title).toBe('Integration Test Project');

      // 3. Update the project
      const updateResponse = await request(app)
        .put(`/api/projects/${testProjectId}`)
        .set(authHeader(adminToken))
        .send({
          title: 'Updated Integration Test Project',
          status: 'in_progress',
          is_featured: true
        })
        .expect(200);

      expect(updateResponse.body.success).toBe(true);

      // 4. Verify the update
      const verifyResponse = await request(app)
        .get(`/api/projects/${testProjectId}`)
        .expect(200);

      expect(verifyResponse.body.data.project.title).toBe('Updated Integration Test Project');
      expect(verifyResponse.body.data.project.status).toBe('in_progress');
      expect(verifyResponse.body.data.project.is_featured).toBe(true);

      // 5. Set project as featured (toggle)
      await request(app)
        .post(`/api/projects/${testProjectId}/feature`)
        .set(authHeader(adminToken))
        .expect(200);

      // 6. Update project status
      await request(app)
        .patch(`/api/projects/${testProjectId}/status`)
        .set(authHeader(adminToken))
        .send({ status: 'completed' })
        .expect(200);

      // 7. Get project images (should be empty)
      const imagesResponse = await request(app)
        .get(`/api/projects/${testProjectId}/images`)
        .set(authHeader(adminToken))
        .expect(200);

      expect(imagesResponse.body.data.images).toHaveLength(0);

      // 8. Get related projects
      await request(app)
        .get(`/api/projects/${testProjectId}/related`)
        .expect(200);

      // 9. Finally, delete the project
      await request(app)
        .delete(`/api/projects/${testProjectId}`)
        .set(authHeader(adminToken))
        .expect(200);

      // 10. Verify deletion
      await request(app)
        .get(`/api/projects/${testProjectId}`)
        .expect(404);
    });

    it('should handle project reordering workflow', async () => {
      // Create multiple projects
      const projects = [];
      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .post('/api/projects')
          .set(authHeader(adminToken))
          .send({
            title: `Reorder Test Project ${i + 1}`,
            category: '住宅',
            location: 'Test Location',
            status: 'planning'
          })
          .expect(201);

        projects.push(response.body.data.project);
      }

      // Reorder projects
      const reorderData = projects.map((project, index) => ({
        identifier: project.identifier,
        displayOrder: projects.length - index // Reverse order
      }));

      await request(app)
        .put('/api/projects/reorder')
        .set(authHeader(adminToken))
        .send({ orders: reorderData })
        .expect(200);

      // Clean up - delete created projects
      for (const project of projects) {
        await request(app)
          .delete(`/api/projects/${project.identifier}`)
          .set(authHeader(adminToken))
          .expect(200);
      }
    });
  });

  describe('Complete Contact Management Workflow', () => {
    it('should complete full contact submission and management workflow', async () => {
      // 1. Submit a contact form (public endpoint)
      const submitResponse = await request(app)
        .post('/api/contacts')
        .send({
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          company: 'Test Company',
          subject: 'Project Inquiry',
          message: 'I am interested in your luxury residential projects. Please provide more information.',
          source: 'website'
        })
        .expect(201);

      expect(submitResponse.body.success).toBe(true);

      // 2. Get all contacts (admin only)
      const contactsResponse = await request(app)
        .get('/api/contacts')
        .set(authHeader(adminToken))
        .expect(200);

      expect(contactsResponse.body.success).toBe(true);
      expect(contactsResponse.body.data.items).toBeDefined();

      // Find our submitted contact
      const submittedContact = contactsResponse.body.data.items.find(
        contact => contact.email === 'john.doe@example.com'
      );
      expect(submittedContact).toBeDefined();
      testContactId = submittedContact.id;

      // 3. Get individual contact details
      const contactResponse = await request(app)
        .get(`/api/contacts/${testContactId}`)
        .set(authHeader(adminToken))
        .expect(200);

      expect(contactResponse.body.success).toBe(true);
      expect(contactResponse.body.data.contact.email).toBe('john.doe@example.com');

      // 4. Mark contact as read
      await request(app)
        .put(`/api/contacts/${testContactId}/read`)
        .set(authHeader(adminToken))
        .expect(200);

      // 5. Reply to contact
      await request(app)
        .put(`/api/contacts/${testContactId}/reply`)
        .set(authHeader(adminToken))
        .send({
          message: 'Thank you for your inquiry. We will send you our latest brochure.',
          notes: 'Interested in luxury residential projects'
        })
        .expect(200);

      // 6. Get contact statistics
      const statsResponse = await request(app)
        .get('/api/contacts/statistics')
        .set(authHeader(adminToken))
        .expect(200);

      expect(statsResponse.body.success).toBe(true);

      // 7. Delete the contact
      await request(app)
        .delete(`/api/contacts/${testContactId}`)
        .set(authHeader(adminToken))
        .expect(200);
    });

    it('should handle contact filtering and pagination', async () => {
      // Test filtering by read status
      await request(app)
        .get('/api/contacts')
        .query({ isRead: false })
        .set(authHeader(adminToken))
        .expect(200);

      // Test filtering by reply status
      await request(app)
        .get('/api/contacts')
        .query({ isReplied: true })
        .set(authHeader(adminToken))
        .expect(200);

      // Test pagination
      await request(app)
        .get('/api/contacts')
        .query({ page: 1, limit: 5 })
        .set(authHeader(adminToken))
        .expect(200);

      // Test date filtering
      const today = new Date().toISOString().split('T')[0];
      await request(app)
        .get('/api/contacts')
        .query({ dateFrom: today, dateTo: today })
        .set(authHeader(adminToken))
        .expect(200);
    });
  });

  describe('Complete Tag Management Workflow', () => {
    it('should complete full tag creation, usage and management workflow', async () => {
      // 1. Create a new tag
      const createResponse = await request(app)
        .post('/api/tags')
        .set(authHeader(adminToken))
        .send({
          name: 'integration-test-tag',
          description: 'Tag created for integration testing'
        })
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      testTagId = createResponse.body.data.tag.identifier;

      // 2. Get all tags
      const tagsResponse = await request(app)
        .get('/api/tags')
        .expect(200);

      expect(tagsResponse.body.success).toBe(true);
      const createdTag = tagsResponse.body.data.find(
        tag => tag.identifier === testTagId
      );
      expect(createdTag).toBeDefined();

      // 3. Get single tag
      const tagResponse = await request(app)
        .get(`/api/tags/${testTagId}`)
        .expect(200);

      expect(tagResponse.body.success).toBe(true);
      expect(tagResponse.body.data.tag.name).toBe('integration-test-tag');

      // 4. Update the tag
      await request(app)
        .put(`/api/tags/${testTagId}`)
        .set(authHeader(adminToken))
        .send({
          name: 'updated-integration-test-tag',
          description: 'Updated description for integration testing'
        })
        .expect(200);

      // 5. Search for tags
      const searchResponse = await request(app)
        .get('/api/tags/search')
        .query({ q: 'updated-integration' })
        .expect(200);

      expect(searchResponse.body.success).toBe(true);

      // 6. Get popular tags
      await request(app)
        .get('/api/tags/popular')
        .query({ limit: 5 })
        .expect(200);

      // 7. Delete the tag
      await request(app)
        .delete(`/api/tags/${testTagId}`)
        .set(authHeader(adminToken))
        .expect(200);

      // 8. Verify deletion
      await request(app)
        .get(`/api/tags/${testTagId}`)
        .expect(404);
    });
  });

  describe('Complete Settings Management Workflow', () => {
    it('should complete settings configuration workflow', async () => {
      // 1. Get all settings
      const allSettingsResponse = await request(app)
        .get('/api/settings')
        .set(authHeader(adminToken))
        .expect(200);

      expect(allSettingsResponse.body.success).toBe(true);

      // 2. Get settings by category
      await request(app)
        .get('/api/settings')
        .query({ category: 'email' })
        .set(authHeader(adminToken))
        .expect(200);

      // 3. Get email settings specifically
      const emailSettingsResponse = await request(app)
        .get('/api/settings/category/email')
        .set(authHeader(adminToken))
        .expect(200);

      expect(emailSettingsResponse.body.success).toBe(true);

      // 4. Update email settings
      await request(app)
        .put('/api/settings/category/email')
        .set(authHeader(adminToken))
        .send({
          smtp_enabled: true,
          smtp_host: 'smtp.test.com',
          smtp_port: 587,
          smtp_secure: false,
          smtp_from_email: 'test@ZeYang.com',
          smtp_from_name: 'ZeYang Test',
          send_admin_notifications: true
        })
        .expect(200);

      // 5. Test SMTP connection (will likely fail in test environment)
      const smtpTestResponse = await request(app)
        .post('/api/settings/smtp/test')
        .set(authHeader(adminToken));

      // Accept either success or failure
      expect([200, 400]).toContain(smtpTestResponse.status);

      // 6. Update general settings
      const settingsToUpdate = {
        site_name: {
          value: 'ZeYang Integration Test',
          type: 'string',
          category: 'general'
        }
      };

      await request(app)
        .put('/api/settings')
        .set(authHeader(adminToken))
        .send({ settings: settingsToUpdate })
        .expect(200);
    });
  });

  describe('Complete Statistics and Analytics Workflow', () => {
    it('should provide comprehensive analytics dashboard data', async () => {
      // 1. Get overview statistics
      const overviewResponse = await request(app)
        .get('/api/statistics/overview')
        .set(authHeader(adminToken))
        .expect(200);

      expect(overviewResponse.body.success).toBe(true);
      expect(overviewResponse.body.data).toHaveProperty('projects');
      expect(overviewResponse.body.data).toHaveProperty('contacts');
      expect(overviewResponse.body.data).toHaveProperty('tags');

      // 2. Get project statistics
      const projectStatsResponse = await request(app)
        .get('/api/statistics/projects')
        .query({ days: 30 })
        .set(authHeader(adminToken))
        .expect(200);

      expect(projectStatsResponse.body.success).toBe(true);

      // 3. Get view statistics
      const viewStatsResponse = await request(app)
        .get('/api/statistics/views')
        .query({ days: 7 })
        .set(authHeader(adminToken))
        .expect(200);

      expect(viewStatsResponse.body.success).toBe(true);

      // 4. Test different time ranges
      const timeRanges = [7, 30, 90];
      for (const days of timeRanges) {
        await request(app)
          .get('/api/statistics/projects')
          .query({ days })
          .set(authHeader(adminToken))
          .expect(200);

        await request(app)
          .get('/api/statistics/views')
          .query({ days })
          .set(authHeader(adminToken))
          .expect(200);
      }
    });
  });

  describe('Cross-Module Integration Tests', () => {
    it('should handle complex search and filtering across modules', async () => {
      // 1. Search projects
      await request(app)
        .get('/api/projects/search')
        .query({ q: 'test', page: 1, limit: 10 })
        .expect(200);

      // 2. Get featured projects
      await request(app)
        .get('/api/projects/featured')
        .query({ limit: 6 })
        .expect(200);

      // 3. Filter projects by multiple criteria
      await request(app)
        .get('/api/projects')
        .query({
          type: 'residential',
          status: 'completed',
          isFeatured: true,
          orderBy: 'viewCount',
          orderDir: 'DESC'
        })
        .expect(200);

      // 4. Search tags and get their usage
      const tagSearchResponse = await request(app)
        .get('/api/tags/search')
        .query({ q: 'modern' })
        .expect(200);

      // 5. Get popular tags
      await request(app)
        .get('/api/tags/popular')
        .query({ limit: 10 })
        .expect(200);
    });

    it('should maintain data consistency across related operations', async () => {
      // Create a project
      const projectResponse = await request(app)
        .post('/api/projects')
        .set(authHeader(adminToken))
        .send({
          title: 'Consistency Test Project',
          category: '住宅',
          location: 'Test Location',
          status: 'planning',
          is_featured: true
        })
        .expect(201);

      const projectId = projectResponse.body.data.project.identifier;

      // Get statistics before
      const statsBefore = await request(app)
        .get('/api/statistics/overview')
        .set(authHeader(adminToken))
        .expect(200);

      // Delete the project
      await request(app)
        .delete(`/api/projects/${projectId}`)
        .set(authHeader(adminToken))
        .expect(200);

      // Get statistics after
      const statsAfter = await request(app)
        .get('/api/statistics/overview')
        .set(authHeader(adminToken))
        .expect(200);

      // Featured count should be updated
      expect(statsAfter.body.data.projects.featured)
        .toBeLessThanOrEqual(statsBefore.body.data.projects.featured);
    });
  });

  describe('System Health and Performance', () => {
    it('should handle system health checks', async () => {
      // Test health endpoint
      const healthResponse = await request(app)
        .get('/health')
        .expect(200);

      expect(healthResponse.body.status).toBe('healthy');

      // Test system health with auth
      const systemHealthResponse = await request(app)
        .get('/api/system/health')
        .expect(200);

      expect(systemHealthResponse.body.success).toBe(true);

      // Test system info (admin only)
      const systemInfoResponse = await request(app)
        .get('/api/system/info')
        .set(authHeader(adminToken))
        .expect(200);

      expect(systemInfoResponse.body.success).toBe(true);
    });

    it('should handle concurrent requests across different modules', async () => {
      const promises = [
        request(app).get('/api/projects').query({ limit: 5 }),
        request(app).get('/api/contacts').set(authHeader(adminToken)),
        request(app).get('/api/tags').query({ limit: 10 }),
        request(app).get('/api/statistics/overview').set(authHeader(adminToken)),
        request(app).get('/api/system/health')
      ];

      const responses = await Promise.all(promises);

      responses.forEach((response, index) => {
        // All requests should succeed or return expected auth errors
        if (index === 1 || index === 3) { // Auth required endpoints
          expect([200, 401]).toContain(response.status);
        } else {
          expect(response.status).toBe(200);
        }
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid data gracefully across all modules', async () => {
      // Test invalid project data
      await request(app)
        .post('/api/projects')
        .set(authHeader(adminToken))
        .send({
          title: '', // Invalid: empty title
          category: 'invalid_category',
          location: 'Test Location'
        })
        .expect(422);

      // Test invalid contact data
      await request(app)
        .post('/api/contacts')
        .send({
          name: 'Test',
          email: 'invalid-email', // Invalid email format
          message: 'test'
        })
        .expect(422);

      // Test invalid tag data
      await request(app)
        .post('/api/tags')
        .set(authHeader(adminToken))
        .send({
          name: '' // Invalid: empty name
        })
        .expect(422);
    });

    it('should handle resource not found errors consistently', async () => {
      const nonExistentId = 'non-existent-id-123';

      // Test 404 responses
      await request(app)
        .get(`/api/projects/${nonExistentId}`)
        .expect(404);

      await request(app)
        .get(`/api/tags/${nonExistentId}`)
        .expect(404);

      await request(app)
        .get('/api/contacts/99999')
        .set(authHeader(adminToken))
        .expect(404);

      await request(app)
        .get(`/api/settings/${nonExistentId}`)
        .set(authHeader(adminToken))
        .expect(404);
    });
  });
});
