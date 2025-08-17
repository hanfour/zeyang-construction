const express = require('express');
const router = express.Router();
const { body, param, query: queryValidator } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { handleValidationErrors } = require('../middleware/validation');
const TagService = require('../services/tagService');
const { USER_ROLES, SUCCESS_MESSAGES } = require('../config/constants');

// Validation rules
const createTagValidation = [
  body('name').notEmpty().withMessage('Tag name is required').trim()
    .isLength({ min: 1, max: 50 }).withMessage('Tag name must be 1-50 characters'),
  body('description').optional().trim()
    .isLength({ max: 200 }).withMessage('Description too long'),
  handleValidationErrors
];

const updateTagValidation = [
  param('identifier').notEmpty(),
  body('name').optional().trim()
    .isLength({ min: 1, max: 50 }).withMessage('Tag name must be 1-50 characters'),
  body('description').optional().trim()
    .isLength({ max: 200 }).withMessage('Description too long'),
  handleValidationErrors
];

// Get all tags (public)
router.get('/', asyncHandler(async (req, res) => {
  const options = {
    orderBy: req.query.orderBy || 'usageCount',
    orderDir: req.query.orderDir || 'DESC',
    limit: req.query.limit ? parseInt(req.query.limit) : null,
    category: req.query.category || null
  };

  const tags = await TagService.getAllTags(options);

  res.json({
    success: true,
    data: tags
  });
}));

// Get popular tags (public)
router.get('/popular', asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const tags = await TagService.getPopularTags(limit);

  res.json({
    success: true,
    data: tags
  });
}));

// Search tags (public)
router.get('/search', asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 1) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required',
      error: {
        code: 'VALIDATION_ERROR'
      }
    });
  }

  const tags = await TagService.searchTags(q);

  res.json({
    success: true,
    data: tags
  });
}));

// Get single tag with projects (public)
router.get('/:identifier', asyncHandler(async (req, res) => {
  const { identifier } = req.params;

  const tag = await TagService.getTag(identifier);

  if (!tag) {
    return res.status(404).json({
      success: false,
      message: 'Tag not found',
      error: {
        code: 'NOT_FOUND'
      }
    });
  }

  res.json({
    success: true,
    data: tag
  });
}));

// Create new tag (admin/editor only)
router.post('/',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.EDITOR),
  createTagValidation,
  asyncHandler(async (req, res) => {
    const tag = await TagService.createTag(req.body);

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.CREATED,
      data: tag
    });
  })
);

// Update tag (admin only)
router.put('/:identifier',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  updateTagValidation,
  asyncHandler(async (req, res) => {
    const { identifier } = req.params;

    const tag = await TagService.updateTag(identifier, req.body);

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.UPDATED,
      data: tag
    });
  })
);

// Delete tag (admin only)
router.delete('/:identifier',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    const { identifier } = req.params;

    await TagService.deleteTag(identifier);

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.DELETED
    });
  })
);

// Merge tags (admin only)
router.post('/merge',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  [
    body('sourceId').isInt().withMessage('Source tag ID must be an integer'),
    body('targetId').isInt().withMessage('Target tag ID must be an integer'),
    handleValidationErrors
  ],
  asyncHandler(async (req, res) => {
    const { sourceId, targetId } = req.body;

    const result = await TagService.mergeTags(sourceId, targetId);

    res.json({
      success: true,
      message: `Tags merged successfully. ${result.mergedCount} projects updated.`,
      data: result
    });
  })
);

// Update all tag usage counts (admin only)
router.post('/update-counts',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    await TagService.updateTagUsageCounts();

    res.json({
      success: true,
      message: 'Tag usage counts updated successfully'
    });
  })
);

module.exports = router;
