// Use real database pool or mock based on environment
const USE_MOCK = process.env.USE_MOCK_DB === 'true' || process.env.NODE_ENV === 'test-mock';
const database = USE_MOCK
  ? require('../mocks/database.mock')
  : require('../../config/database');
const { pool } = database;

/**
 * Database helper functions for tests
 */

/**
 * Clear all test data from database
 */
async function clearDatabase() {
  if (USE_MOCK) {
    // For mock database, clear and reinitialize
    database.clearStorage();
    database.initializeTestUsers();
  } else {
    const connection = await pool.getConnection();

    try {
      await connection.execute('SET FOREIGN_KEY_CHECKS = 0');

      // Clear tables in order
      await connection.execute('DELETE FROM project_images');
      await connection.execute('DELETE FROM project_tags');
      await connection.execute('DELETE FROM projects');
      await connection.execute('DELETE FROM contacts');
      await connection.execute('DELETE FROM tags');
      await connection.execute('DELETE FROM users WHERE username NOT IN ("admin", "editor", "viewer")');

      await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    } finally {
      connection.release();
    }
  }
}

/**
 * Seed test users
 */
async function seedTestUsers() {
  if (USE_MOCK) {
    // Mock database already has test users initialized
    return;
  }

  const bcrypt = require('bcryptjs');
  const connection = await pool.getConnection();

  try {
    const hashedPassword = await bcrypt.hash('Test123!', 10);

    const users = [
      ['testadmin', 'testadmin@test.com', hashedPassword, 'admin'],
      ['testeditor', 'testeditor@test.com', hashedPassword, 'editor'],
      ['testviewer', 'testviewer@test.com', hashedPassword, 'viewer']
    ];

    for (const user of users) {
      await connection.execute(
        'INSERT IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        user
      );
    }
  } finally {
    connection.release();
  }
}

/**
 * Get user by username
 */
async function getUserByUsername(username) {
  if (USE_MOCK) {
    const query = require('../mocks/database.mock').query;
    const rows = await query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0];
  } else {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0];
  }
}

/**
 * Create test project
 */
let projectCounter = 0;
async function createTestProject(projectData = {}) {
  projectCounter++;
  const timestamp = Date.now();
  const defaultProject = {
    identifier: `test-project-${timestamp}-${projectCounter}`,
    name: 'Test Project',
    nameEn: 'Test Project',
    type: 'residential',
    status: 'planning',
    description: 'Test project description',
    location: 'Test Location',
    price: 1000000,
    area: 100,
    developer: 'Test Developer',
    architect: 'Test Architect',
    yearStarted: 2024,
    yearCompleted: null,
    isFeatured: 0,
    displayOrder: 0,
    viewCount: 0,
    ...projectData
  };

  if (USE_MOCK) {
    const query = require('../mocks/database.mock').query;
    // Add created_by and updated_by for mock
    const projectToInsert = {
      ...defaultProject,
      created_by: 1,
      updated_by: 1,
      created_at: new Date(),
      updated_at: new Date()
    };

    const [result] = await query(
      `INSERT INTO projects (identifier, name, nameEn, type, status, description, descriptionEn, location, locationEn, price, priceMin, priceMax, area, areaMin, areaMax, developer, developerEn, architect, architectEn, yearStarted, yearCompleted, units, floors, features, featuresEn, mainImage, videoUrl, website, brochureUrl, isFeatured, displayOrder, viewCount, created_by, updated_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        defaultProject.identifier,
        defaultProject.name,
        defaultProject.nameEn,
        defaultProject.type,
        defaultProject.status,
        defaultProject.description,
        null, // descriptionEn
        defaultProject.location,
        null, // locationEn
        defaultProject.price,
        null, // priceMin
        null, // priceMax
        defaultProject.area,
        null, // areaMin
        null, // areaMax
        defaultProject.developer,
        null, // developerEn
        defaultProject.architect,
        null, // architectEn
        defaultProject.yearStarted,
        defaultProject.yearCompleted,
        null, // units
        null, // floors
        '[]', // features
        '[]', // featuresEn
        null, // mainImage
        null, // videoUrl
        null, // website
        null, // brochureUrl
        defaultProject.isFeatured,
        defaultProject.displayOrder,
        defaultProject.viewCount,
        1, // created_by
        1  // updated_by
      ]
    );

    return { id: result.insertId, ...defaultProject };
  } else {
    // Map test data fields to database columns
    const [result] = await pool.execute(
      `INSERT INTO projects (identifier, name, nameEn, type, status, description, location, price, area, developer, architect, yearStarted, yearCompleted, isFeatured) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        defaultProject.identifier,
        defaultProject.name,
        defaultProject.nameEn,
        defaultProject.type,
        defaultProject.status,
        defaultProject.description,
        defaultProject.location,
        defaultProject.price,
        defaultProject.area,
        defaultProject.developer,
        defaultProject.architect,
        defaultProject.yearStarted,
        defaultProject.yearCompleted,
        defaultProject.isFeatured
      ]
    );

    return { id: result.insertId, ...defaultProject };
  }
}

module.exports = {
  clearDatabase,
  seedTestUsers,
  getUserByUsername,
  createTestProject
};
