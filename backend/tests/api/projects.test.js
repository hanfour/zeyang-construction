const request = require('supertest');
const app = require('../helpers/test-server');
const { clearDatabase, seedTestUsers, createTestProject } = require('../helpers/db.helper');
const { generateTestToken, authHeader } = require('../helpers/auth.helper');
const { testProjects } = require('../helpers/test-data');
const fs = require('fs');
const path = require('path');

describe('Projects API Tests', () => {
  let adminToken;
  let editorToken;
  let viewerToken;
  let testProjectId;
  let testProjectIdentifier;

  beforeAll(async () => {
    await clearDatabase();
    await seedTestUsers();

    // Generate tokens for different roles
    adminToken = generateTestToken({ role: 'admin' });
    editorToken = generateTestToken({ role: 'editor' });
    viewerToken = generateTestToken({ role: 'viewer' });
  });

  afterAll(async () => {
    await clearDatabase();
  });

  describe('POST /api/projects', () => {
    it('should create a new project with admin role', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set(authHeader(adminToken))
        .send(testProjects.valid)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('project');
      expect(response.body.data.project).toHaveProperty('id');
      expect(response.body.data.project).toHaveProperty('identifier');
      expect(response.body.data.project.name).toBe(testProjects.valid.name);
      expect(response.body.data.project.type).toBe(testProjects.valid.type);
      expect(response.body.data.project.status).toBe(testProjects.valid.status);

      testProjectId = response.body.data.project.id;
      testProjectIdentifier = response.body.data.project.identifier;
    });

    it('should create a project with editor role', async () => {
      const projectData = {
        ...testProjects.valid,
        name: 'Editor Project'
      };

      const response = await request(app)
        .post('/api/projects')
        .set(authHeader(editorToken))
        .send(projectData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project.name).toBe('Editor Project');
    });

    it('should fail to create project with viewer role', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set(authHeader(viewerToken))
        .send(testProjects.valid)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send(testProjects.valid)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid project data', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set(authHeader(adminToken))
        .send(testProjects.invalid)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/projects', () => {
    beforeAll(async () => {
      // Create multiple test projects using the API
      for (let i = 0; i < 5; i++) {
        const projectData = {
          ...testProjects.valid,
          name: `Test Project ${i}`,
          type: i % 2 === 0 ? 'residential' : 'commercial',
          status: i < 3 ? 'in_progress' : 'completed'
        };
        
        try {
          const response = await request(app)
            .post('/api/projects')
            .set(authHeader(adminToken))
            .send(projectData);
          
          if (!response.body.success) {
            console.error('Failed to create test project:', response.body);
          }
        } catch (err) {
          console.error('Error creating test project:', err.message);
        }
      }
    });

    it('should get all projects without authentication', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.items)).toBe(true);
      expect(response.body.data.items.length).toBeGreaterThan(0);
    });

    it('should filter projects by type', async () => {
      const response = await request(app)
        .get('/api/projects?type=residential')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.items.forEach(project => {
        expect(project.type).toBe('residential');
      });
    });

    it('should filter projects by status', async () => {
      const response = await request(app)
        .get('/api/projects?status=completed')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.items.forEach(project => {
        expect(project.status).toBe('completed');
      });
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/projects?page=1&limit=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items.length).toBeLessThanOrEqual(2);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(2);
    });

    it('should search projects by keyword', async () => {
      const response = await request(app)
        .get('/api/projects/search?q=Test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/projects/featured', () => {
    it('should get featured projects', async () => {
      const response = await request(app)
        .get('/api/projects/featured')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(Array.isArray(response.body.data.items)).toBe(true);
      response.body.data.items.forEach(project => {
        expect(project.isFeatured).toBeTruthy();
      });
    });
  });

  describe('GET /api/projects/:identifier', () => {
    it('should get project by identifier', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProjectIdentifier}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('project');
      expect(response.body.data.project.identifier).toBe(testProjectIdentifier);
      expect(response.body.data.project).toHaveProperty('images');
      expect(response.body.data.project).toHaveProperty('tags');
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .get('/api/projects/non-existent-project')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/projects/:identifier', () => {
    it('should update project with admin role', async () => {
      const response = await request(app)
        .put(`/api/projects/${testProjectIdentifier}`)
        .set(authHeader(adminToken))
        .send(testProjects.update)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('project');
      expect(response.body.data.project.name).toBe(testProjects.update.name);
      expect(response.body.data.project.description).toBe(testProjects.update.description);
    });

    it('should update project with editor role', async () => {
      const updateData = {
        description: 'Editor updated description'
      };

      const response = await request(app)
        .put(`/api/projects/${testProjectIdentifier}`)
        .set(authHeader(editorToken))
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should fail to update with viewer role', async () => {
      const response = await request(app)
        .put(`/api/projects/${testProjectIdentifier}`)
        .set(authHeader(viewerToken))
        .send(testProjects.update)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/projects/:identifier/status', () => {
    it('should update project status', async () => {
      const response = await request(app)
        .patch(`/api/projects/${testProjectIdentifier}/status`)
        .set(authHeader(adminToken))
        .send({ status: 'completed' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
    });

    it('should fail with invalid status', async () => {
      const response = await request(app)
        .patch(`/api/projects/${testProjectIdentifier}/status`)
        .set(authHeader(adminToken))
        .send({ status: 'invalid_status' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/projects/:identifier/feature', () => {
    it('should toggle featured status', async () => {
      // First toggle - set to featured
      let response = await request(app)
        .post(`/api/projects/${testProjectIdentifier}/feature`)
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isFeatured).toBeTruthy();

      // Second toggle - remove featured
      response = await request(app)
        .post(`/api/projects/${testProjectIdentifier}/feature`)
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isFeatured).toBeFalsy();
    });
  });

  describe('Project Images API', () => {
    const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');

    beforeAll(() => {
      // Create a test image file
      if (!fs.existsSync(path.dirname(testImagePath))) {
        fs.mkdirSync(path.dirname(testImagePath), { recursive: true });
      }
      // Create a simple 1x1 pixel JPEG
      const buffer = Buffer.from(
        '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',
        'base64'
      );
      fs.writeFileSync(testImagePath, buffer);
    });

    afterAll(() => {
      // Clean up test image
      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    });

    it.skip('should upload project image', async () => {
      
      const response = await request(app)
        .post(`/api/projects/${testProjectIdentifier}/images`)
        .set(authHeader(adminToken))
        .attach('images', testImagePath)
        .field('alt', 'Test image')
        .field('altEn', 'Test image')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('images');
      expect(response.body.data.images.length).toBeGreaterThan(0);
    });

    it.skip('should get project images', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProjectIdentifier}/images`)
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/projects/:identifier/related', () => {
    it('should get related projects', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProjectIdentifier}/related`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('DELETE /api/projects/:identifier', () => {
    let projectToDelete;

    beforeEach(async () => {
      projectToDelete = await createTestProject({
        name: 'Project to Delete'
      });
    });

    it('should delete project with admin role', async () => {
      const response = await request(app)
        .delete(`/api/projects/${projectToDelete.identifier}`)
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify project is deleted
      await request(app)
        .get(`/api/projects/${projectToDelete.identifier}`)
        .expect(404);
    });

    it('should fail to delete with editor role', async () => {
      const response = await request(app)
        .delete(`/api/projects/${projectToDelete.identifier}`)
        .set(authHeader(editorToken))
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});