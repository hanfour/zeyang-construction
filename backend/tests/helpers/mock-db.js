/**
 * Mock database for testing when MySQL is not available
 */

const mockPool = {
  getConnection: jest.fn().mockResolvedValue({
    execute: jest.fn().mockResolvedValue([[], {}]),
    release: jest.fn(),
    ping: jest.fn().mockResolvedValue(true),
    beginTransaction: jest.fn().mockResolvedValue(undefined),
    commit: jest.fn().mockResolvedValue(undefined),
    rollback: jest.fn().mockResolvedValue(undefined)
  }),
  execute: jest.fn().mockResolvedValue([[], {}]),
  query: jest.fn().mockResolvedValue([[], {}])
};

// Mock the database module
jest.mock('../../config/database', () => ({
  pool: mockPool,
  testConnection: jest.fn().mockResolvedValue(true),
  query: jest.fn().mockResolvedValue([]),
  transaction: jest.fn().mockImplementation(async (callback) => {
    const connection = await mockPool.getConnection();
    try {
      return await callback(connection);
    } finally {
      connection.release();
    }
  }),
  findOne: jest.fn().mockResolvedValue(null),
  exists: jest.fn().mockResolvedValue(false),
  batchInsert: jest.fn().mockResolvedValue({ affectedRows: 0 }),
  paginate: jest.fn().mockResolvedValue({
    items: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 20,
      pages: 0,
      hasNext: false,
      hasPrev: false
    }
  })
}));

module.exports = { mockPool };
