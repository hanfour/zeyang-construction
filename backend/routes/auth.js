const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { query, findOne } = require('../config/database');
const { handleValidationErrors, customValidators } = require('../middleware/validation');
const { verifyToken } = require('../middleware/auth');
const { authRateLimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../middleware/errorHandler');
const { ERROR_CODES, SUCCESS_MESSAGES } = require('../config/constants');
const logger = require('../utils/logger');

// Validation rules
const loginValidation = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

const registerValidation = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .custom(customValidators.isStrongPassword),
  handleValidationErrors
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .custom(customValidators.isStrongPassword),
  handleValidationErrors
];

// Helper function to generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      issuer: 'EstateHub',
      audience: 'estatehub-users'
    }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.REFRESH_SECRET,
    { 
      expiresIn: process.env.REFRESH_EXPIRES_IN || '7d',
      issuer: 'EstateHub',
      audience: 'estatehub-users'
    }
  );
  
  return { accessToken, refreshToken };
};

// Login
const loginMiddleware = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development'
  ? [loginValidation] 
  : [authRateLimiter, loginValidation];

router.post('/login', ...loginMiddleware, asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  
  // Find user by username or email
  const user = await findOne(
    'SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = true',
    [username, username]
  );
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
      error: {
        code: ERROR_CODES.INVALID_CREDENTIALS
      }
    });
  }
  
  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);
  
  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
      error: {
        code: ERROR_CODES.INVALID_CREDENTIALS
      }
    });
  }
  
  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user.id);
  
  // Update last login
  await query(
    'UPDATE users SET last_login_at = NOW() WHERE id = ?',
    [user.id]
  );
  
  // Log successful login
  logger.info('User login successful', { userId: user.id, username: user.username });
  
  // Remove password from response
  delete user.password;
  
  res.json({
    success: true,
    message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    }
  });
}));

// Register (admin only in production)
router.post('/register', registerValidation, asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  
  // Check if user exists
  const existingUser = await findOne(
    'SELECT id FROM users WHERE username = ? OR email = ?',
    [username, email]
  );
  
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'User already exists',
      error: {
        code: ERROR_CODES.ALREADY_EXISTS
      }
    });
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Create user
  const result = await query(
    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
    [username, email, hashedPassword, 'viewer']
  );
  
  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(result.insertId);
  
  logger.info('New user registered', { userId: result.insertId, username });
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: result.insertId,
        username,
        email,
        role: 'viewer'
      },
      accessToken,
      refreshToken
    }
  });
}));

// Refresh token
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token required',
      error: {
        code: ERROR_CODES.UNAUTHORIZED
      }
    });
  }
  
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    
    // Check if user exists and is active
    const user = await findOne(
      'SELECT id, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );
    
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        error: {
          code: ERROR_CODES.INVALID_TOKEN
        }
      });
    }
    
    // Generate new tokens
    const tokens = generateTokens(user.id);
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: tokens
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
      error: {
        code: ERROR_CODES.INVALID_TOKEN
      }
    });
  }
}));

// Logout
router.post('/logout', verifyToken, asyncHandler(async (req, res) => {
  // In a production app, you might want to blacklist the token
  // or store it in a revoked tokens table
  
  logger.info('User logout', { userId: req.user.id });
  
  res.json({
    success: true,
    message: SUCCESS_MESSAGES.LOGOUT_SUCCESS
  });
}));

// Change password
router.put('/change-password', verifyToken, changePasswordValidation, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;
  
  // Get user with password
  const user = await findOne(
    'SELECT password FROM users WHERE id = ?',
    [userId]
  );
  
  // Verify current password
  const isValidPassword = await bcrypt.compare(currentPassword, user.password);
  
  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect',
      error: {
        code: ERROR_CODES.INVALID_CREDENTIALS
      }
    });
  }
  
  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  // Update password
  await query(
    'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
    [hashedPassword, userId]
  );
  
  logger.info('Password changed', { userId });
  
  res.json({
    success: true,
    message: SUCCESS_MESSAGES.PASSWORD_CHANGED
  });
}));

// Get current user
router.get('/me', verifyToken, asyncHandler(async (req, res) => {
  const user = await findOne(
    'SELECT id, username, email, role, created_at, last_login_at FROM users WHERE id = ?',
    [req.user.id]
  );
  
  res.json({
    success: true,
    data: { user }
  });
}));

module.exports = router;