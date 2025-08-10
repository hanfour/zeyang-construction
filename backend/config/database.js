const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'estatehub_db',
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
  debug: process.env.NODE_ENV === 'development'
});

// Test database connection
const testConnection = async () => {
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

// Execute query with error handling
const query = async (sql, params = []) => {
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

// Execute transaction
const transaction = async (callback) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    const result = await callback(connection);
    
    await connection.commit();
    return result;
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    logger.error('Transaction error:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

// Get single record
const findOne = async (sql, params = []) => {
  const results = await query(sql, params);
  return results[0] || null;
};

// Check if record exists
const exists = async (sql, params = []) => {
  const result = await findOne(sql, params);
  return !!result;
};

// Batch insert
const batchInsert = async (table, columns, values) => {
  if (!values || values.length === 0) {
    return { affectedRows: 0 };
  }
  
  const placeholders = values.map(() => 
    `(${columns.map(() => '?').join(', ')})`
  ).join(', ');
  
  const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders}`;
  const flatValues = values.flat();
  
  return await query(sql, flatValues);
};

// Paginate results
const paginate = async (sql, params = [], page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  
  // Get total count
  const countSql = sql.replace(/SELECT[\s\S]*?FROM/i, 'SELECT COUNT(*) as total FROM');
  const [{ total }] = await query(countSql, params);
  
  // Get paginated results
  const paginatedSql = `${sql} LIMIT ? OFFSET ?`;
  const results = await query(paginatedSql, [...params, limit, offset]);
  
  return {
    items: results,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};

// Export database utilities
module.exports = {
  pool,
  testConnection,
  query,
  transaction,
  findOne,
  exists,
  batchInsert,
  paginate
};