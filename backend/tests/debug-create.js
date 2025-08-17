const Project = require('../models/Project');
const { clearDatabase, seedTestUsers, createTestProject } = require('./helpers/db.helper');

async function debugCreate() {
  try {
    await clearDatabase();
    await seedTestUsers();

    const testData = {
      name: 'Test Project',
      type: 'residential',
      location: 'Test Location',
      status: 'planning',
      description: 'Test project description',
      yearStarted: 2024,
      displayOrder: 1,
      isFeatured: false,
      tags: ['luxury', 'modern']
    };

    console.log('Test data:', testData);

    const result = await Project.create(testData, 1); // userId = 1
    console.log('Result:', result);

  } catch (error) {
    console.error('Error:', error);
    console.error('Stack:', error.stack);
  } finally {
    process.exit();
  }
}

debugCreate();
