#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Set environment to use mock database
process.env.NODE_ENV = 'test-mock';
process.env.USE_MOCK_DB = 'true';

// Load test-mock environment
require('dotenv').config({ path: '.env.test-mock' });

// Monkey-patch the database module to use mock
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
  if (id === '../config/database' || id === '../../config/database') {
    return originalRequire.call(this, path.join(__dirname, '../config/database.test.js'));
  }
  return originalRequire.apply(this, arguments);
};

// Run jest with the test configuration
const jest = spawn('npx', ['jest', '--config', './tests/jest.config.js', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env }
});

jest.on('close', (code) => {
  process.exit(code);
});
