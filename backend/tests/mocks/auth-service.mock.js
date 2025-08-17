/**
 * Mock authentication service for testing
 */

const jwt = require('jsonwebtoken');

// Mock user data
const mockUsers = [
  {
    id: 1,
    username: 'testadmin',
    email: 'testadmin@test.com',
    password: 'hashed_Test123!',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    username: 'testeditor',
    email: 'testeditor@test.com',
    password: 'hashed_Test123!',
    role: 'editor',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 3,
    username: 'testviewer',
    email: 'testviewer@test.com',
    password: 'hashed_Test123!',
    role: 'viewer',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock auth service
const authService = {
  register: jest.fn(async (userData) => {
    const newUser = {
      id: mockUsers.length + 1,
      ...userData,
      password: `hashed_${userData.password}`,
      role: userData.role || 'viewer',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Check for duplicate
    const existing = mockUsers.find(u =>
      u.username === userData.username || u.email === userData.email
    );
    if (existing) {
      throw new Error('User already exists');
    }

    mockUsers.push(newUser);
    const { password, ...userWithoutPassword } = newUser;

    return {
      user: userWithoutPassword,
      token: jwt.sign(
        { id: newUser.id, username: newUser.username, role: newUser.role },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      ),
      refreshToken: jwt.sign(
        { id: newUser.id, type: 'refresh' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '7d' }
      )
    };
  }),

  login: jest.fn(async (username, password) => {
    const user = mockUsers.find(u =>
      u.username === username || u.email === username
    );

    if (!user || password !== 'Test123!') {
      throw new Error('Invalid credentials');
    }

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token: jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      ),
      refreshToken: jwt.sign(
        { id: user.id, type: 'refresh' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '7d' }
      )
    };
  }),

  refreshToken: jest.fn(async (refreshToken) => {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'test-secret');
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      const user = mockUsers.find(u => u.id === decoded.id);
      if (!user) {
        throw new Error('User not found');
      }

      return {
        token: jwt.sign(
          { id: user.id, username: user.username, role: user.role },
          process.env.JWT_SECRET || 'test-secret',
          { expiresIn: '1h' }
        ),
        refreshToken: jwt.sign(
          { id: user.id, type: 'refresh' },
          process.env.JWT_SECRET || 'test-secret',
          { expiresIn: '7d' }
        )
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }),

  getCurrentUser: jest.fn(async (userId) => {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }),

  changePassword: jest.fn(async (userId, currentPassword, newPassword) => {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (currentPassword !== 'Test123!') {
      throw new Error('Current password is incorrect');
    }

    user.password = `hashed_${newPassword}`;
    return { message: 'Password changed successfully' };
  })
};

// Mock the auth service module
jest.mock('../../services/authService', () => ({
  register: jest.fn(),
  login: jest.fn(),
  refreshToken: jest.fn(),
  getCurrentUser: jest.fn(),
  changePassword: jest.fn()
}));

module.exports = { authService, mockUsers };
