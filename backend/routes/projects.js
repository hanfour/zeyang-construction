const express = require('express');
const router = express.Router();
const { body, param, query: queryValidator } = require('express-validator');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { handleValidationErrors, customValidators } = require('../middleware/validation');
const ProjectService = require('../services/projectService');
const projectImagesRouter = require('./projectImages');
const { USER_ROLES, SUCCESS_MESSAGES, PROJECT_CATEGORIES, PROJECT_STATUS } = require('../config/constants');

// Validation rules
const createProjectValidation = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('type').notEmpty().withMessage('Type is required')
    .isIn(Object.values(PROJECT_CATEGORIES)).withMessage('Invalid type'),
  body('location').notEmpty().withMessage('Location is required').trim(),
  body('status').optional()
    .isIn(Object.values(PROJECT_STATUS)).withMessage('Invalid status'),
  body('yearStarted').optional().isInt({ min: 1900, max: 2100 }).withMessage('Invalid year'),
  body('displayOrder').optional().isInt({ min: 0 }).withMessage('Invalid display order'),
  body('isFeatured').optional().isBoolean().withMessage('Invalid featured status'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('features').optional().custom(value => {
    if (Array.isArray(value)) return true;
    throw new Error('Features must be an array');
  }),
  handleValidationErrors
];

const updateProjectValidation = [
  param('identifier').notEmpty(),
  body('name').optional().trim(),
  body('type').optional()
    .isIn(Object.values(PROJECT_CATEGORIES)).withMessage('Invalid type'),
  body('status').optional()
    .isIn(Object.values(PROJECT_STATUS)).withMessage('Invalid status'),
  body('yearStarted').optional().isInt({ min: 1900, max: 2100 }).withMessage('Invalid year'),
  body('displayOrder').optional().isInt({ min: 0 }).withMessage('Invalid display order'),
  body('isFeatured').optional().isBoolean().withMessage('Invalid featured status'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  handleValidationErrors
];

const listProjectsValidation = [
  queryValidator('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Invalid limit'),
  queryValidator('type').optional()
    .isIn(Object.values(PROJECT_CATEGORIES)).withMessage('Invalid type'),
  queryValidator('category').optional(), // Allow any category value, will be mapped in handler
  queryValidator('status').optional()
    .isIn([...Object.values(PROJECT_STATUS), 'on_sale']).withMessage('Invalid status'),
  queryValidator('isFeatured').optional().isBoolean().withMessage('Invalid featured status'),
  queryValidator('orderBy').optional()
    .isIn(['displayOrder', 'created_at', 'updated_at', 'viewCount', 'view_count', 'name'])
    .withMessage('Invalid order by field'),
  queryValidator('orderDir').optional()
    .isIn(['ASC', 'DESC']).withMessage('Invalid order direction'),
  handleValidationErrors
];

// Get all projects (public with optional auth for admin features)
router.get('/', optionalAuth, listProjectsValidation, asyncHandler(async (req, res) => {
  // Map category to type for backward compatibility
  let type = req.query.type || req.query.category;
  
  // Map Chinese categories to English types
  const categoryMap = {
    '住宅': 'residential',
    '商業': 'commercial',
    '辦公室': 'commercial',
    '公共建築': 'other',
    '其他': 'other'
  };
  
  if (type && categoryMap[type]) {
    type = categoryMap[type];
  }
  
  // Map status values
  let status = req.query.status;
  if (status === 'on_sale') {
    status = 'in_progress';
  }
  
  const filters = {
    type,
    status,
    isFeatured: req.query.isFeatured === 'true' ? true : req.query.isFeatured === 'false' ? false : undefined,
    search: req.query.search
  };
  
  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
    orderBy: req.query.orderBy || 'displayOrder',
    orderDir: req.query.orderDir || 'ASC'
  };
  
  const result = await ProjectService.getProjects(filters, options);
  
  res.json({
    success: true,
    data: result
  });
}));

// Get featured projects (public)
router.get('/featured', asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 6;
  const projects = await ProjectService.getFeaturedProjects(limit);
  
  res.json({
    success: true,
    data: { items: projects }
  });
}));

// Search projects (public)
router.get('/search', asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;
  
  if (!q || q.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters'
    });
  }
  
  const result = await ProjectService.searchProjects(q, { page, limit });
  
  res.json({
    success: true,
    data: result
  });
}));

// Get single project (public, with view tracking)
router.get('/:identifier', optionalAuth, asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  
  // Don't track views for authenticated admin users
  const trackView = !req.user || req.user.role !== USER_ROLES.ADMIN;
  
  const project = await ProjectService.getProject(identifier, trackView);
  
  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }
  
  // Projects are always considered active in this schema
  
  res.json({
    success: true,
    data: { project }
  });
}));

// Get related projects (public)
router.get('/:identifier/related', asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  const limit = parseInt(req.query.limit) || 4;
  
  const projects = await ProjectService.getRelatedProjects(identifier, limit);
  
  res.json({
    success: true,
    data: projects
  });
}));

// Get project statistics (admin only)
router.get('/:identifier/statistics', authenticate, authorize(USER_ROLES.ADMIN), asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  const days = parseInt(req.query.days) || 30;
  
  const statistics = await ProjectService.getProjectStatistics(identifier, days);
  
  res.json({
    success: true,
    data: statistics
  });
}));

// Create new project (admin/editor only)
router.post('/', authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.EDITOR), createProjectValidation, asyncHandler(async (req, res) => {
  const project = await ProjectService.createProject(req.body, req.user.id);
  
  res.status(201).json({
    success: true,
    message: SUCCESS_MESSAGES.CREATED,
    data: { project }
  });
}));

// Update project (admin/editor only)
router.put('/:identifier', authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.EDITOR), updateProjectValidation, asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  
  const project = await ProjectService.updateProject(identifier, req.body, req.user.id);
  
  res.json({
    success: true,
    message: SUCCESS_MESSAGES.UPDATED,
    data: { project }
  });
}));

// Update project status (admin/editor only)
router.patch('/:identifier/status', authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.EDITOR), [
  param('identifier').notEmpty(),
  body('status').notEmpty()
    .isIn(Object.values(PROJECT_STATUS)).withMessage('Invalid status'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  const { status } = req.body;
  
  await ProjectService.updateProjectStatus(identifier, status, req.user.id);
  
  res.json({
    success: true,
    message: 'Project status updated successfully'
  });
}));

// Toggle featured status (admin only)
router.post('/:identifier/feature', authenticate, authorize(USER_ROLES.ADMIN), asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  
  const result = await ProjectService.toggleProjectFeatured(identifier, req.user.id);
  
  res.json({
    success: true,
    message: 'Featured status updated successfully',
    data: result
  });
}));

// Delete project (admin only)
router.delete('/:identifier', authenticate, authorize(USER_ROLES.ADMIN), asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  const hardDelete = req.query.hard === 'true';
  
  await ProjectService.deleteProject(identifier, hardDelete);
  
  res.json({
    success: true,
    message: SUCCESS_MESSAGES.DELETED
  });
}));

// Bulk update display order (admin only)
router.put('/reorder', authenticate, authorize(USER_ROLES.ADMIN), [
  body('orders').isArray().withMessage('Orders must be an array'),
  body('orders.*.identifier').notEmpty().withMessage('Identifier is required'),
  body('orders.*.displayOrder').isInt({ min: 0 }).withMessage('Invalid display order'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { orders } = req.body;
  
  const result = await ProjectService.updateDisplayOrder(orders, req.user.id);
  
  res.json({
    success: true,
    message: 'Display order updated successfully',
    data: result
  });
}));

// Mount image routes
router.use('/:identifier/images', projectImagesRouter);

module.exports = router;