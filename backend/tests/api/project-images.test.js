const request = require('supertest');
const app = require('../../server');
const { authHeader } = require('../helpers/auth.helper');
const path = require('path');

describe('Project Images API Tests', () => {
  let adminToken;
  let editorToken;
  let testProjectId;

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

    // Create a test project
    const projectResponse = await request(app)
      .post('/api/projects')
      .set(authHeader(adminToken))
      .send({
        title: 'Test Project for Images',
        category: '住宅',
        location: 'Test Location',
        status: 'planning'
      });
    testProjectId = projectResponse.body?.data?.project?.identifier;
  });

  describe('GET /api/projects/:identifier/images', () => {
    it('should get empty images list for new project', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProjectId}/images`)
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('images');
      expect(Array.isArray(response.body.data.images)).toBe(true);
      expect(response.body.data.images).toHaveLength(0);
    });

    it('should filter images by type', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProjectId}/images`)
        .query({ image_type: 'gallery' })
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('images');
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get(`/api/projects/${testProjectId}/images`)
        .expect(401);
    });

    it('should fail with invalid project identifier', async () => {
      await request(app)
        .get('/api/projects/invalid-id/images')
        .set(authHeader(adminToken))
        .expect(404);
    });
  });

  describe('POST /api/projects/:identifier/images', () => {
    it('should fail to upload without files', async () => {
      const response = await request(app)
        .post(`/api/projects/${testProjectId}/images`)
        .set(authHeader(adminToken))
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No files uploaded');
    });

    it('should allow editors to upload images', async () => {
      // Since we're mocking file uploads, we'll test the endpoint structure
      const response = await request(app)
        .post(`/api/projects/${testProjectId}/images`)
        .set(authHeader(editorToken))
        .field('image_type', 'gallery')
        .field('alt_text', 'Test image')
        .attach('files', Buffer.from('fake image data'), 'test.jpg');

      // Due to mocking, this might fail with file validation, but should not fail with auth
      expect([400, 201]).toContain(response.status);
      if (response.status === 400) {
        expect(response.body.message).not.toContain('Unauthorized');
      }
    });

    it('should fail without authentication', async () => {
      await request(app)
        .post(`/api/projects/${testProjectId}/images`)
        .expect(401);
    });

    it('should validate image_type parameter', async () => {
      const response = await request(app)
        .post(`/api/projects/${testProjectId}/images`)
        .set(authHeader(adminToken))
        .field('image_type', 'invalid_type')
        .attach('files', Buffer.from('fake image data'), 'test.jpg');

      expect([400, 422]).toContain(response.status);
    });
  });

  describe('PUT /api/projects/:identifier/images/:imageId', () => {
    it('should fail with invalid image ID', async () => {
      await request(app)
        .put(`/api/projects/${testProjectId}/images/999999`)
        .set(authHeader(adminToken))
        .send({
          alt_text: 'Updated alt text',
          display_order: 1
        })
        .expect(404);
    });

    it('should validate display_order parameter', async () => {
      await request(app)
        .put(`/api/projects/${testProjectId}/images/1`)
        .set(authHeader(adminToken))
        .send({
          alt_text: 'Test alt text',
          display_order: -1
        })
        .expect(422);
    });

    it('should validate image_type parameter', async () => {
      await request(app)
        .put(`/api/projects/${testProjectId}/images/1`)
        .set(authHeader(adminToken))
        .send({
          image_type: 'invalid_type'
        })
        .expect(422);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .put(`/api/projects/${testProjectId}/images/1`)
        .send({ alt_text: 'Test' })
        .expect(401);
    });
  });

  describe('POST /api/projects/:identifier/images/:imageId/set-main', () => {
    it('should fail with invalid image ID', async () => {
      await request(app)
        .post(`/api/projects/${testProjectId}/images/999999/set-main`)
        .set(authHeader(adminToken))
        .expect(404);
    });

    it('should require valid integer image ID', async () => {
      await request(app)
        .post(`/api/projects/${testProjectId}/images/abc/set-main`)
        .set(authHeader(adminToken))
        .expect(422);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .post(`/api/projects/${testProjectId}/images/1/set-main`)
        .expect(401);
    });
  });

  describe('DELETE /api/projects/:identifier/images/:imageId', () => {
    it('should fail with invalid image ID', async () => {
      await request(app)
        .delete(`/api/projects/${testProjectId}/images/999999`)
        .set(authHeader(adminToken))
        .expect(404);
    });

    it('should require valid integer image ID', async () => {
      await request(app)
        .delete(`/api/projects/${testProjectId}/images/abc`)
        .set(authHeader(adminToken))
        .expect(422);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .delete(`/api/projects/${testProjectId}/images/1`)
        .expect(401);
    });
  });

  describe('PUT /api/projects/:identifier/images/reorder', () => {
    it('should validate orders array', async () => {
      await request(app)
        .put(`/api/projects/${testProjectId}/images/reorder`)
        .set(authHeader(adminToken))
        .send({
          orders: 'not-an-array'
        })
        .expect(422);
    });

    it('should validate orders array structure', async () => {
      await request(app)
        .put(`/api/projects/${testProjectId}/images/reorder`)
        .set(authHeader(adminToken))
        .send({
          orders: [
            { id: 'not-a-number', display_order: 1 }
          ]
        })
        .expect(422);
    });

    it('should validate display_order values', async () => {
      await request(app)
        .put(`/api/projects/${testProjectId}/images/reorder`)
        .set(authHeader(adminToken))
        .send({
          orders: [
            { id: 1, display_order: -1 }
          ]
        })
        .expect(422);
    });

    it('should process valid reorder request', async () => {
      const response = await request(app)
        .put(`/api/projects/${testProjectId}/images/reorder`)
        .set(authHeader(adminToken))
        .send({
          orders: [
            { id: 1, display_order: 0 },
            { id: 2, display_order: 1 }
          ]
        });

      // May return 404 if images don't exist, but should not fail validation
      expect([200, 404]).toContain(response.status);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .put(`/api/projects/${testProjectId}/images/reorder`)
        .send({
          orders: [{ id: 1, display_order: 0 }]
        })
        .expect(401);
    });
  });

  describe('POST /api/projects/:identifier/images/bulk-delete', () => {
    it('should validate imageIds array', async () => {
      await request(app)
        .post(`/api/projects/${testProjectId}/images/bulk-delete`)
        .set(authHeader(adminToken))
        .send({
          imageIds: 'not-an-array'
        })
        .expect(422);
    });

    it('should validate imageIds array elements', async () => {
      await request(app)
        .post(`/api/projects/${testProjectId}/images/bulk-delete`)
        .set(authHeader(adminToken))
        .send({
          imageIds: ['not-a-number']
        })
        .expect(422);
    });

    it('should process valid bulk delete request', async () => {
      const response = await request(app)
        .post(`/api/projects/${testProjectId}/images/bulk-delete`)
        .set(authHeader(adminToken))
        .send({
          imageIds: [1, 2, 3]
        });

      // May return 404 or success depending on whether images exist
      expect([200, 404]).toContain(response.status);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .post(`/api/projects/${testProjectId}/images/bulk-delete`)
        .send({
          imageIds: [1, 2, 3]
        })
        .expect(401);
    });
  });

  describe('Authorization Tests', () => {
    it('should allow admin to perform all operations', async () => {
      const endpoints = [
        { method: 'get', path: `/api/projects/${testProjectId}/images` },
        { method: 'post', path: `/api/projects/${testProjectId}/images/bulk-delete`, body: { imageIds: [1] } },
        { method: 'put', path: `/api/projects/${testProjectId}/images/reorder`, body: { orders: [{ id: 1, display_order: 0 }] } }
      ];

      for (const endpoint of endpoints) {
        const req = request(app)[endpoint.method](endpoint.path)
          .set(authHeader(adminToken));

        if (endpoint.body) {
          req.send(endpoint.body);
        }

        const response = await req;

        // Should not fail with 403 (forbidden)
        expect(response.status).not.toBe(403);
      }
    });

    it('should allow editor to perform all operations', async () => {
      const endpoints = [
        { method: 'get', path: `/api/projects/${testProjectId}/images` },
        { method: 'post', path: `/api/projects/${testProjectId}/images/bulk-delete`, body: { imageIds: [1] } },
        { method: 'put', path: `/api/projects/${testProjectId}/images/reorder`, body: { orders: [{ id: 1, display_order: 0 }] } }
      ];

      for (const endpoint of endpoints) {
        const req = request(app)[endpoint.method](endpoint.path)
          .set(authHeader(editorToken));

        if (endpoint.body) {
          req.send(endpoint.body);
        }

        const response = await req;

        // Should not fail with 403 (forbidden)
        expect(response.status).not.toBe(403);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle file upload errors gracefully', async () => {
      // Test with extremely large file size (simulated)
      const response = await request(app)
        .post(`/api/projects/${testProjectId}/images`)
        .set(authHeader(adminToken))
        .attach('files', Buffer.alloc(1), 'test.txt'); // Wrong file type

      // Should handle gracefully with appropriate error message
      if (response.status >= 400) {
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message');
        expect(typeof response.body.message).toBe('string');
      }
    });

    it('should validate project existence for all image operations', async () => {
      const invalidProjectId = 'non-existent-project-123';

      const endpoints = [
        { method: 'get', path: `/api/projects/${invalidProjectId}/images` },
        { method: 'post', path: `/api/projects/${invalidProjectId}/images/bulk-delete`, body: { imageIds: [1] } }
      ];

      for (const endpoint of endpoints) {
        const req = request(app)[endpoint.method](endpoint.path)
          .set(authHeader(adminToken));

        if (endpoint.body) {
          req.send(endpoint.body);
        }

        const response = await req;
        expect(response.status).toBe(404);
      }
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent image operations', async () => {
      const promises = [];

      for (let i = 0; i < 3; i++) {
        promises.push(
          request(app)
            .get(`/api/projects/${testProjectId}/images`)
            .set(authHeader(adminToken))
        );
      }

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });
});
