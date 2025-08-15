const jwt = require('jsonwebtoken');

/**
 * Generate test JWT token
 */
function generateTestToken(user = {}) {
  const defaultUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'admin',
    ...user
  };

  return jwt.sign(
    { 
      userId: defaultUser.id,
      username: defaultUser.username,
      email: defaultUser.email,
      role: defaultUser.role
    },
    process.env.JWT_SECRET || 'test-secret',
    { 
      expiresIn: '1h',
      issuer: 'ZeYang',
      audience: 'ZeYang-users'
    }
  );
}

/**
 * Create auth header
 */
function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

module.exports = {
  generateTestToken,
  authHeader
};