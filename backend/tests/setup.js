// Test setup file
const dotenv = require('dotenv');

// Load test environment variables
dotenv.config({ path: '.env.test-mock' });

// Set test environment
process.env.NODE_ENV = 'test-mock';
process.env.USE_MOCK_DB = 'true';
process.env.DB_HOST = '127.0.0.1';
process.env.DB_NAME = 'ZeYang_test';
process.env.JWT_SECRET = 'test-secret-key';

// Comment out mocks to use real database
// const mockConnection = {
//   execute: jest.fn().mockResolvedValue([[], {}]),
//   release: jest.fn(),
//   ping: jest.fn().mockResolvedValue(true),
//   beginTransaction: jest.fn().mockResolvedValue(undefined),
//   commit: jest.fn().mockResolvedValue(undefined),
//   rollback: jest.fn().mockResolvedValue(undefined),
//   query: jest.fn().mockResolvedValue([[], {}])
// };

// const mockPool = {
//   getConnection: jest.fn().mockResolvedValue(mockConnection),
//   execute: jest.fn().mockResolvedValue([[], {}]),
//   query: jest.fn().mockResolvedValue([[], {}]),
//   end: jest.fn().mockResolvedValue(undefined)
// };

// Mock mysql2/promise is disabled to use real database
// jest.mock('mysql2/promise', () => ({
//   createPool: jest.fn(() => mockPool),
//   createConnection: jest.fn(() => Promise.resolve(mockConnection))
// }));

// Don't mock bcryptjs - use real implementation for proper password testing
// jest.mock('bcryptjs', () => ({
//   hash: jest.fn((password) => Promise.resolve(`hashed_${password}`)),
//   compare: jest.fn((password, hash) => Promise.resolve(password === 'Test123!' || hash === `hashed_${password}`))
// }));

// Suppress console logs during tests
if (process.env.SUPPRESS_LOGS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  };
}

// Mock file system operations for image uploads and logs
const mockWriteStream = {
  on: jest.fn((event, cb) => {
    if (event === 'finish') setTimeout(cb, 0);
    return mockWriteStream;
  }),
  write: jest.fn(),
  end: jest.fn(),
  once: jest.fn(),
  emit: jest.fn(),
  close: jest.fn()
};

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  promises: {
    ...jest.requireActual('fs').promises,
    unlink: jest.fn().mockResolvedValue(undefined),
    mkdir: jest.fn().mockResolvedValue(undefined),
    access: jest.fn().mockResolvedValue(undefined)
  },
  createReadStream: jest.fn(() => ({
    pipe: jest.fn()
  })),
  createWriteStream: jest.fn(() => mockWriteStream)
}));

// Mock sharp for image processing
jest.mock('sharp', () => {
  return jest.fn(() => ({
    resize: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    toFile: jest.fn().mockResolvedValue({ width: 800, height: 600 })
  }));
});

// Clean up function
afterAll(async () => {
  // Close any open connections
  if (global.server) {
    await global.server.close();
  }
  // Clear all mocks
  jest.clearAllMocks();
});

// Export empty object since mocks are disabled
module.exports = {};
