const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { USER_ROLES } = require('../config/constants');
const { asyncHandler } = require('../middleware/errorHandler');
const { testConnection } = require('../config/database');

// Health check (public)
router.get('/health', asyncHandler(async (req, res) => {
  const dbStatus = await testConnection();

  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: dbStatus ? 'connected' : 'disconnected',
      uptime: process.uptime()
    }
  });
}));

// System info (admin only)
router.get('/info', authenticate, authorize(USER_ROLES.ADMIN), asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      version: '1.0.0',
      nodeVersion: process.version,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    }
  });
}));

module.exports = router;
