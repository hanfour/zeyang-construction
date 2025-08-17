const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

// Check if we should use mock
const USE_MOCK = process.env.USE_MOCK_DB === 'true' || process.env.NODE_ENV === 'test-mock';

let pool, query, findOne, transaction;

if (USE_MOCK) {
  // Use mock database
  const mock = require('../tests/mocks/database.mock');
  pool = mock.pool;
  query = mock.query;
  findOne = mock.findOne;
  transaction = mock.transaction;

  logger.info('Using mock database for testing');
} else {
  // Use real database
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ZeYang_test',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    namedPlaceholders: true,
    multipleStatements: false,
    timezone: '+00:00',
    dateStrings: false,
    supportBigNumbers: true,
    bigNumberStrings: false,
    typeCast: true,
    flags: [],
    debug: false
  });

  // Execute query with error handling
  query = async (sql, params = []) => {
    let connection;
    try {
      connection = await pool.getConnection();
      const [results] = await connection.execute(sql, params);
      return results;
    } catch (error) {
      logger.error('Database query error:', { sql, error: error.message });
      throw error;
    } finally {
      if (connection) connection.release();
    }
  };

  // Execute single row query
  findOne = async (sql, params = []) => {
    const results = await query(sql, params);
    return results[0] || null;
  };

  // Transaction helper
  transaction = async (callback) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      logger.error('Transaction error:', error);
      throw error;
    } finally {
      connection.release();
    }
  };
}

// Test database connection
const testConnection = async () => {
  if (USE_MOCK) {
    logger.info('Mock database ready');
    return true;
  }

  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    logger.info('Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error);
    return false;
  }
};

module.exports = {
  pool,
  query,
  findOne,
  transaction,
  testConnection
};
