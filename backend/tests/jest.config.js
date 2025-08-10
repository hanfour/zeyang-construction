module.exports = {
  testEnvironment: 'node',
  coverageDirectory: '../coverage',
  collectCoverageFrom: [
    '../**/*.js',
    '!../node_modules/**',
    '!../tests/**',
    '!../coverage/**',
    '!../uploads/**',
    '!../swagger/**'
  ],
  testMatch: ['**/*.test.js'],
  setupFilesAfterEnv: ['./setup.js'],
  testTimeout: 30000,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};