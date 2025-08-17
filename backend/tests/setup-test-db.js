const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load test environment variables
dotenv.config({ path: '.env.test' });

/**
 * Setup test database
 */
async function setupTestDatabase() {
  let connection;

  try {
    // Connect without specifying database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    console.log('Connected to MySQL server');

    // Create test database if not exists
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'ZeYang_test'}`
    );
    console.log(`Database ${process.env.DB_NAME} created or already exists`);

    // Use the test database
    await connection.execute(`USE ${process.env.DB_NAME || 'ZeYang_test'}`);

    // Read and execute schema file
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');

      // Split by delimiter and execute each statement
      const statements = schema
        .split(';')
        .filter(stmt => stmt.trim())
        .map(stmt => stmt.trim() + ';');

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await connection.execute(statement);
          } catch (err) {
            console.warn(`Warning executing statement: ${err.message}`);
          }
        }
      }

      console.log('Database schema created successfully');
    } else {
      console.log('Schema file not found, assuming tables already exist');
    }

    console.log('Test database setup completed');
  } catch (error) {
    console.error('Error setting up test database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  setupTestDatabase();
}

module.exports = { setupTestDatabase };
