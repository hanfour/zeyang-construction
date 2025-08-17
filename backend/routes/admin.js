const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { USER_ROLES } = require('../config/constants');
const { asyncHandler } = require('../middleware/errorHandler');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize(USER_ROLES.ADMIN));

// Placeholder for admin routes
router.get('/dashboard', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Admin dashboard - to be implemented'
  });
}));

module.exports = router;
