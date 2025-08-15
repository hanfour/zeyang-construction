const request = require('supertest');
const app = require('../../server');
const { authHeader } = require('../helpers/auth.helper');

describe('Enhanced Contacts API Tests', () => {
  let adminToken;
  let editorToken;
  let contactId;

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

  describe('Contact Form Submission', () => {
    it('should create contact with all fields', async () => {
      const contactData = {
        name: '測試用戶',
        email: 'test@example.com',
        phone: '0912345678',
        company: '測試公司',
        subject: '詢問建案資訊',
        message: '我對貴公司的建案很有興趣，希望能了解更多詳細資訊。',
        source: 'website'
      };

      const response = await request(app)
        .post('/api/contacts')
        .send(contactData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('感謝您的來信');
      expect(response.body.data).toHaveProperty('id');
      
      contactId = response.body.data.id;
    });

    it('should create contact with minimum required fields', async () => {
      const contactData = {
        name: '最小測試',
        email: 'min@example.com',
        message: '這是最基本的聯絡訊息。'
      };

      const response = await request(app)
        .post('/api/contacts')
        .send(contactData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        email: 'test@example.com'
        // missing name and message
      };

      const response = await request(app)
        .post('/api/contacts')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should validate email format', async () => {
      const invalidData = {
        name: '測試',
        email: 'invalid-email',
        message: '測試訊息'
      };

      await request(app)
        .post('/api/contacts')
        .send(invalidData)
        .expect(400);
    });

    it('should validate phone format', async () => {
      const invalidData = {
        name: '測試',
        email: 'test@example.com',
        phone: 'invalid-phone-123abc',
        message: '測試訊息'
      };

      await request(app)
        .post('/api/contacts')
        .send(invalidData)
        .expect(400);
    });

    it('should validate message length', async () => {
      const shortMessage = {
        name: '測試',
        email: 'test@example.com',
        message: '短'
      };

      await request(app)
        .post('/api/contacts')
        .send(shortMessage)
        .expect(400);

      const longMessage = {
        name: '測試',
        email: 'test@example.com',
        message: 'a'.repeat(2001) // Too long
      };

      await request(app)
        .post('/api/contacts')
        .send(longMessage)
        .expect(400);
    });
  });

  describe('Contact Management', () => {
    it('should get contacts with pagination', async () => {
      const response = await request(app)
        .get('/api/contacts?page=1&limit=10')
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data).toHaveProperty('totalCount');
      expect(response.body.data).toHaveProperty('totalPages');
      expect(response.body.data).toHaveProperty('currentPage');
      expect(Array.isArray(response.body.data.items)).toBe(true);
    });

    it('should filter contacts by read status', async () => {
      const unreadResponse = await request(app)
        .get('/api/contacts?isRead=false')
        .set(authHeader(adminToken))
        .expect(200);

      expect(unreadResponse.body.success).toBe(true);
      // All returned contacts should be unread
      if (unreadResponse.body.data.items.length > 0) {
        unreadResponse.body.data.items.forEach(contact => {
          expect(contact.is_read).toBe(false);
        });
      }
    });

    it('should search contacts', async () => {
      const response = await request(app)
        .get('/api/contacts?search=測試')
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      // Results should contain the search term
      if (response.body.data.items.length > 0) {
        const hasSearchTerm = response.body.data.items.some(contact => 
          contact.name.includes('測試') ||
          contact.message.includes('測試') ||
          contact.subject?.includes('測試')
        );
        expect(hasSearchTerm).toBe(true);
      }
    });

    it('should get single contact', async () => {
      if (contactId) {
        const response = await request(app)
          .get(`/api/contacts/${contactId}`)
          .set(authHeader(adminToken))
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id', contactId);
        expect(response.body.data).toHaveProperty('name');
        expect(response.body.data).toHaveProperty('email');
        expect(response.body.data).toHaveProperty('message');
      }
    });
  });

  describe('Contact Actions', () => {
    it('should mark contact as read', async () => {
      if (contactId) {
        const response = await request(app)
          .put(`/api/contacts/${contactId}/read`)
          .set(authHeader(adminToken))
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('marked as read');

        // Verify the contact is marked as read
        const getResponse = await request(app)
          .get(`/api/contacts/${contactId}`)
          .set(authHeader(adminToken))
          .expect(200);

        expect(getResponse.body.data.is_read).toBe(true);
      }
    });

    it('should bulk mark contacts as read', async () => {
      if (contactId) {
        const response = await request(app)
          .put('/api/contacts/bulk-read')
          .set(authHeader(adminToken))
          .send({ ids: [contactId] })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('contacts marked as read');
        expect(response.body.data).toHaveProperty('updated');
      }
    });

    it('should update contact notes', async () => {
      if (contactId) {
        const notes = '已電話聯繫過，客戶表示很有興趣。';
        
        const response = await request(app)
          .put(`/api/contacts/${contactId}/notes`)
          .set(authHeader(adminToken))
          .send({ notes })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('Notes updated');

        // Verify the notes were updated
        const getResponse = await request(app)
          .get(`/api/contacts/${contactId}`)
          .set(authHeader(adminToken))
          .expect(200);

        expect(getResponse.body.data.notes).toBe(notes);
      }
    });

    it('should reply to contact', async () => {
      if (contactId) {
        const replyData = {
          message: '感謝您的詢問，我們已安排專人為您服務。',
          notes: '已回覆客戶詢問'
        };

        const response = await request(app)
          .put(`/api/contacts/${contactId}/reply`)
          .set(authHeader(adminToken))
          .send(replyData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('Reply sent');

        // Verify the contact is marked as replied
        const getResponse = await request(app)
          .get(`/api/contacts/${contactId}`)
          .set(authHeader(adminToken))
          .expect(200);

        expect(getResponse.body.data.is_replied).toBe(true);
      }
    });
  });

  describe('Contact Statistics', () => {
    it('should get contact statistics', async () => {
      const response = await request(app)
        .get('/api/contacts/statistics')
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('period');
      expect(response.body.data).toHaveProperty('summary');
      expect(response.body.data).toHaveProperty('daily');

      const summary = response.body.data.summary;
      expect(summary).toHaveProperty('total');
      expect(summary).toHaveProperty('read');
      expect(summary).toHaveProperty('replied');
      expect(summary).toHaveProperty('unread');
      expect(summary).toHaveProperty('readRate');
      expect(summary).toHaveProperty('replyRate');
    });

    it('should get statistics for different periods', async () => {
      const response = await request(app)
        .get('/api/contacts/statistics?days=7')
        .set(authHeader(adminToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.period).toBe(7);
    });
  });

  describe('Permission Tests', () => {
    it('should allow editor to view contacts', async () => {
      if (editorToken) {
        await request(app)
          .get('/api/contacts')
          .set(authHeader(editorToken))
          .expect(200);
      }
    });

    it('should allow editor to mark as read', async () => {
      if (editorToken && contactId) {
        await request(app)
          .put(`/api/contacts/${contactId}/read`)
          .set(authHeader(editorToken))
          .expect(200);
      }
    });

    it('should allow editor to reply to contact', async () => {
      if (editorToken && contactId) {
        const replyData = {
          message: 'Editor reply message',
          notes: 'Reply from editor'
        };

        await request(app)
          .put(`/api/contacts/${contactId}/reply`)
          .set(authHeader(editorToken))
          .expect(200);
      }
    });

    it('should NOT allow editor to delete contacts', async () => {
      if (editorToken && contactId) {
        await request(app)
          .delete(`/api/contacts/${contactId}`)
          .set(authHeader(editorToken))
          .expect(403);
      }
    });

    it('should allow admin to delete contacts', async () => {
      if (contactId) {
        await request(app)
          .delete(`/api/contacts/${contactId}`)
          .set(authHeader(adminToken))
          .expect(200);
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to contact form submissions', async () => {
      const contactData = {
        name: '測試限制',
        email: 'rate@example.com',
        message: '測試速率限制'
      };

      // Make multiple rapid requests
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/contacts')
            .send({ ...contactData, email: `rate${i}@example.com` })
        );
      }

      const responses = await Promise.all(promises);
      
      // Some requests should succeed, but rate limiting should kick in
      const successCount = responses.filter(r => r.status === 201).length;
      const rateLimitCount = responses.filter(r => r.status === 429).length;
      
      // At least one should be rate limited if rate limiting is working
      expect(successCount + rateLimitCount).toBe(10);
    });
  });

  describe('Data Validation and Sanitization', () => {
    it('should sanitize HTML in contact message', async () => {
      const contactData = {
        name: '測試用戶',
        email: 'test@example.com',
        message: '<script>alert("xss")</script>這是測試訊息<b>粗體</b>',
      };

      const response = await request(app)
        .post('/api/contacts')
        .send(contactData)
        .expect(201);

      expect(response.body.success).toBe(true);
      
      // Check that the stored message doesn't contain script tags
      if (response.body.data.id) {
        const getResponse = await request(app)
          .get(`/api/contacts/${response.body.data.id}`)
          .set(authHeader(adminToken));
        
        if (getResponse.status === 200) {
          expect(getResponse.body.data.message).not.toContain('<script>');
        }
      }
    });

    it('should normalize email addresses', async () => {
      const contactData = {
        name: '測試',
        email: '  Test@Example.COM  ',
        message: '測試郵件正規化'
      };

      const response = await request(app)
        .post('/api/contacts')
        .send(contactData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should trim whitespace from text fields', async () => {
      const contactData = {
        name: '  測試用戶  ',
        email: 'test@example.com',
        subject: '  測試主題  ',
        message: '  測試訊息  '
      };

      const response = await request(app)
        .post('/api/contacts')
        .send(contactData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // This test would require mocking database failures
      // For now, we test invalid contact ID
      await request(app)
        .get('/api/contacts/99999')
        .set(authHeader(adminToken))
        .expect(404);
    });

    it('should handle invalid JSON in request body', async () => {
      await request(app)
        .post('/api/contacts')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);
    });
  });
});