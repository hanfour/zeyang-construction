const dotenv = require('dotenv');

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Mocks disabled - using real services

// Import app after environment is set
const app = require('../../server');

module.exports = app;
