/**
 * Test data for API tests
 */

const testUsers = {
  admin: {
    username: 'admin',
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin'
  }
};

const testProjects = {
  valid: {
    name: 'Test Project',
    type: 'residential', // Using PROJECT_CATEGORIES value
    location: 'Test Location',
    status: 'planning',
    description: 'Test project description',
    yearStarted: 2024,
    displayOrder: 1,
    isFeatured: false,
    tags: ['luxury', 'modern']
  },
  update: {
    name: 'Updated Project',
    description: 'Updated description',
    status: 'completed'
  },
  invalid: {
    name: '', // Invalid: empty name
    type: 'invalid_type', // Invalid: not in enum
    location: '' // Invalid: empty location
  }
};

const testContacts = {
  valid: {
    name: 'Test Contact',
    email: 'contact@test.com',
    phone: '+1234567890',
    subject: 'Test Subject',
    message: 'This is a test message',
    projectId: null
  },
  invalid: {
    name: '',
    email: 'invalid-email',
    message: ''
  }
};

const testTags = {
  valid: {
    name: 'testtag',
    nameEn: 'Test Tag',
    category: 'style'
  },
  update: {
    nameEn: 'Updated Tag',
    category: 'location'
  },
  invalid: {
    name: '', // Invalid: empty name
    category: 'invalid_category' // Invalid: not in enum
  }
};

module.exports = {
  testUsers,
  testProjects,
  testContacts,
  testTags
};
