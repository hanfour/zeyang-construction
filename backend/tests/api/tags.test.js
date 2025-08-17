const request = require('supertest');
const app = require('../helpers/test-server');
const { clearDatabase, seedTestUsers } = require('../helpers/db.helper');
const { generateTestToken, authHeader } = require('../helpers/auth.helper');
const { testTags } = require('../helpers/test-data');

describe('Tags API Tests', () => {
  let adminToken;
  let editorToken;
  let viewerToken;
  let testTagId;
  let testTagIdentifier;

  beforeAll(async () => {
    await clearDatabase();
    await seedTestUsers();

    adminToken = generateTestToken({ role: 'admin' });
    editorToken = generateTestToken({ role: 'editor' });
    viewerToken = generateTestToken({ role: 'viewer' });
  });

  afterAll(async () => {
    await clearDatabase();
  });

  describe('POST /api/tags', () => {
    it('should create a new tag with admin role', async () => {
      const response = await request(app)
        .post('/api/tags')
        .set(authHeader(adminToken))
        .send(testTags.valid)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('identifier');
      expect(response.body.data.name).toBe(testTags.valid.name);
      expect(response.body.data.nameEn).toBe(testTags.valid.nameEn);
      expect(response.body.data.category).toBe(testTags.valid.category);

      testTagId = response.body.data.id;
      testTagIdentifier = response.body.data.identifier;
    });

    it('should create tag with editor role', async () => {
      const tagData = {
        name: 'editortag',
        nameEn: 'Editor Tag',
        category: 'feature'
      };

      const response = await request(app)
        .post('/api/tags')
        .set(authHeader(editorToken))
        .send(tagData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(tagData.name);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/tags')
        .send(testTags.valid)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail with duplicate tag name', async () => {
      const response = await request(app)
        .post('/api/tags')
        .set(authHeader(adminToken))
        .send(testTags.valid)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ALREADY_EXISTS');
    });

    it('should fail with invalid category', async () => {
      const response = await request(app)
        .post('/api/tags')
        .set(authHeader(adminToken))
        .send(testTags.invalid)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tags', () => {
    beforeAll(async () => {
      // Create multiple test tags
      const categories = ['style', 'feature', 'location', 'type'];
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/api/tags')
          .set(authHeader(adminToken))
          .send({
            name: `tag${i}`,
            nameEn: `Tag ${i}`,
            category: categories[i % categories.length]
          });
      }
    });

    it('should get all tags without authentication', async () => {
      const response = await request(app)
        .get('/api/tags')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter tags by category', async () => {
      const response = await request(app)
        .get('/api/tags?category=style')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(tag => {
        expect(tag.category).toBe('style');
      });
    });

    it('should limit number of tags returned', async () => {
      const response = await request(app)
        .get('/api/tags?limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /api/tags/popular', () => {
    it('should get popular tags', async () => {
      const response = await request(app)
        .get('/api/tags/popular')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      // Popular tags should be sorted by usage count
      if (response.body.data.length > 1) {
        for (let i = 0; i < response.body.data.length - 1; i++) {
          expect(response.body.data[i].usageCount).toBeGreaterThanOrEqual(
            response.body.data[i + 1].usageCount
          );
        }
      }
    });

    it('should limit popular tags', async () => {
      const response = await request(app)
        .get('/api/tags/popular?limit=3')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(3);
    });
  });

  describe('GET /api/tags/search', () => {
    it('should search tags by query', async () => {
      const response = await request(app)
        .get('/api/tags/search?q=tag')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return empty array for no matches', async () => {
      const response = await request(app)
        .get('/api/tags/search?q=nonexistenttagname')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should fail without search query', async () => {
      const response = await request(app)
        .get('/api/tags/search')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tags/:identifier', () => {
    it('should get tag by identifier', async () => {
      const response = await request(app)
        .get(`/api/tags/${testTagIdentifier}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.identifier).toBe(testTagIdentifier);
      expect(response.body.data).toHaveProperty('projects');
      expect(response.body.data).toHaveProperty('usageCount');
    });

    it('should return 404 for non-existent tag', async () => {
      const response = await request(app)
        .get('/api/tags/non-existent-tag')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/tags/:identifier', () => {
    it('should update tag with admin role', async () => {
      const response = await request(app)
        .put(`/api/tags/${testTagIdentifier}`)
        .set(authHeader(adminToken))
        .send(testTags.update)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.nameEn).toBe(testTags.update.nameEn);
      expect(response.body.data.category).toBe(testTags.update.category);
    });

    it('should fail with editor role', async () => {
      const response = await request(app)
        .put(`/api/tags/${testTagIdentifier}`)
        .set(authHeader(editorToken))
        .send(testTags.update)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should fail when updating to duplicate name', async () => {
      // First create another tag
      const anotherTag = await request(app)
        .post('/api/tags')
        .set(authHeader(adminToken))
        .send({
          name: 'anothertag',
          nameEn: 'Another Tag',
          category: 'feature'
        });

      // Try to update first tag with second tag's name
      const response = await request(app)
        .put(`/api/tags/${testTagIdentifier}`)
        .set(authHeader(adminToken))
        .send({ name: 'anothertag' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /api/tags/merge', () => {
    let sourceTagId;
    let targetTagId;

    beforeEach(async () => {
      // Create source and target tags with unique names
      const timestamp = Date.now();
      const sourceResponse = await request(app)
        .post('/api/tags')
        .set(authHeader(adminToken))
        .send({
          name: `sourcetag_${timestamp}`,
          nameEn: 'Source Tag',
          category: 'style'
        });

      if (sourceResponse.body.success) {
        sourceTagId = sourceResponse.body.data.id;
      }

      const targetResponse = await request(app)
        .post('/api/tags')
        .set(authHeader(adminToken))
        .send({
          name: `targettag_${timestamp}`,
          nameEn: 'Target Tag',
          category: 'style'
        });

      if (targetResponse.body.success) {
        targetTagId = targetResponse.body.data.id;
      }
    });

    it('should merge tags with admin role', async () => {
      const response = await request(app)
        .post('/api/tags/merge')
        .set(authHeader(adminToken))
        .send({
          sourceId: sourceTagId,
          targetId: targetTagId
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('merged');

      // Verify source tag is deleted
      await request(app)
        .get('/api/tags/sourcetag')
        .expect(404);
    });

    it('should fail without admin role', async () => {
      const response = await request(app)
        .post('/api/tags/merge')
        .set(authHeader(editorToken))
        .send({
          sourceId: sourceTagId,
          targetId: targetTagId
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid tag ids', async () => {
      const response = await request(app)
        .post('/api/tags/merge')
        .set(authHeader(adminToken))
        .send({
          sourceId: 99999,
          targetId: 99998
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail when merging tag with itself', async () => {
      const response = await request(app)
        .post('/api/tags/merge')
        .set(authHeader(adminToken))
        .send({
          sourceId: sourceTagId,
          targetId: sourceTagId
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/tags/:identifier', () => {
    let tagToDelete;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/tags')
        .set(authHeader(adminToken))
        .send({
          name: 'deletetag',
          nameEn: 'Delete Tag',
          category: 'feature'
        });

      tagToDelete = response.body.data.identifier;
    });

    it('should delete tag with admin role', async () => {
      const response = await request(app)
        .delete(`/api/tags/${tagToDelete}`)
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify tag is deleted
      await request(app)
        .get(`/api/tags/${tagToDelete}`)
        .expect(404);
    });

    it('should fail without admin role', async () => {
      const response = await request(app)
        .delete(`/api/tags/${tagToDelete}`)
        .set(authHeader(editorToken))
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/tags/update-counts', () => {
    it('should update tag usage counts with admin role', async () => {
      const response = await request(app)
        .post('/api/tags/update-counts')
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('updated');
    });

    it('should fail without admin role', async () => {
      const response = await request(app)
        .post('/api/tags/update-counts')
        .set(authHeader(editorToken))
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
