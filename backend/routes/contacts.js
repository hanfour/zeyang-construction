const express = require('express');
const router = express.Router();
const { body, param, query: queryValidator } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { handleValidationErrors } = require('../middleware/validation');
const { rateLimiter } = require('../middleware/rateLimiter');
const ContactService = require('../services/contactService');
const { USER_ROLES, SUCCESS_MESSAGES } = require('../config/constants');

// Validation rules
const createContactValidation = [
  body('name').notEmpty().withMessage('Name is required').trim()
    .isLength({ max: 100 }).withMessage('Name too long'),
  body('email').notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('phone').optional().trim()
    .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Invalid phone format'),
  body('company').optional().trim()
    .isLength({ max: 100 }).withMessage('Company name too long'),
  body('subject').optional().trim()
    .isLength({ max: 200 }).withMessage('Subject too long'),
  body('message').notEmpty().withMessage('Message is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Message must be 10-2000 characters'),
  body('source').optional().trim(),
  handleValidationErrors
];

const replyContactValidation = [
  param('id').isInt().withMessage('Invalid contact ID'),
  body('message').notEmpty().withMessage('Reply message is required'),
  body('notes').optional().trim(),
  handleValidationErrors
];

const listContactsValidation = [
  queryValidator('page').optional().isInt({ min: 1 }).withMessage('Invalid page'),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Invalid limit'),
  queryValidator('isRead').optional().isIn(['true', 'false']).withMessage('Invalid read status'),
  queryValidator('isReplied').optional().isIn(['true', 'false']).withMessage('Invalid reply status'),
  queryValidator('dateFrom').optional().isDate().withMessage('Invalid date format'),
  queryValidator('dateTo').optional().isDate().withMessage('Invalid date format'),
  handleValidationErrors
];

// Submit contact form (public, rate limited)
router.post('/', rateLimiter, createContactValidation, asyncHandler(async (req, res) => {
  const result = await ContactService.createContact(
    req.body,
    req.ip,
    req.get('user-agent')
  );
  
  res.status(201).json({
    success: true,
    message: '感謝您的來信，我們會盡快回覆',
    data: { id: result.id }
  });
}));

// Get all contacts (admin only)
router.get('/', 
  authenticate, 
  authorize(USER_ROLES.ADMIN, USER_ROLES.EDITOR),
  listContactsValidation,
  asyncHandler(async (req, res) => {
    const filters = {
      is_read: req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined,
      is_replied: req.query.isReplied === 'true' ? true : req.query.isReplied === 'false' ? false : undefined,
      source: req.query.source,
      search: req.query.search,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo
    };
    
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      orderBy: req.query.orderBy || 'created_at',
      orderDir: req.query.orderDir || 'DESC'
    };
    
    const result = await ContactService.getContacts(filters, options);
    
    res.json({
      success: true,
      data: result
    });
  })
);

// Get contact statistics (admin only)
router.get('/statistics', 
  authenticate, 
  authorize(USER_ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    const days = parseInt(req.query.days) || 30;
    const stats = await ContactService.getContactStats(days);
    
    res.json({
      success: true,
      data: stats
    });
  })
);

// Get single contact (admin only)
router.get('/:id', 
  authenticate, 
  authorize(USER_ROLES.ADMIN, USER_ROLES.EDITOR),
  asyncHandler(async (req, res) => {
    const contact = await ContactService.getContact(parseInt(req.params.id));
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    res.json({
      success: true,
      data: contact
    });
  })
);

// Mark as read (admin only)
router.put('/:id/read', 
  authenticate, 
  authorize(USER_ROLES.ADMIN, USER_ROLES.EDITOR),
  asyncHandler(async (req, res) => {
    await ContactService.markAsRead(parseInt(req.params.id), req.user.id);
    
    res.json({
      success: true,
      message: 'Contact marked as read'
    });
  })
);

// Bulk mark as read (admin only)
router.put('/bulk-read', 
  authenticate, 
  authorize(USER_ROLES.ADMIN, USER_ROLES.EDITOR),
  [
    body('ids').isArray().withMessage('IDs must be an array'),
    body('ids.*').isInt().withMessage('Invalid contact ID'),
    handleValidationErrors
  ],
  asyncHandler(async (req, res) => {
    const result = await ContactService.bulkMarkAsRead(req.body.ids, req.user.id);
    
    res.json({
      success: true,
      message: `${result.updated} contacts marked as read`,
      data: result
    });
  })
);

// Reply to contact (admin only)
router.put('/:id/reply', 
  authenticate, 
  authorize(USER_ROLES.ADMIN, USER_ROLES.EDITOR),
  replyContactValidation,
  asyncHandler(async (req, res) => {
    await ContactService.replyToContact(
      parseInt(req.params.id),
      req.body,
      req.user.id
    );
    
    res.json({
      success: true,
      message: 'Reply sent successfully'
    });
  })
);

// Delete contact (admin only)
router.delete('/:id', 
  authenticate, 
  authorize(USER_ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    await ContactService.deleteContact(parseInt(req.params.id));
    
    res.json({
      success: true,
      message: SUCCESS_MESSAGES.DELETED
    });
  })
);

// Bulk delete contacts (admin only)
router.post('/bulk-delete', 
  authenticate, 
  authorize(USER_ROLES.ADMIN),
  [
    body('ids').isArray().withMessage('IDs must be an array'),
    body('ids.*').isInt().withMessage('Invalid contact ID'),
    handleValidationErrors
  ],
  asyncHandler(async (req, res) => {
    const result = await ContactService.bulkDeleteContacts(req.body.ids);
    
    res.json({
      success: true,
      message: `${result.deleted} contacts deleted`,
      data: result
    });
  })
);

module.exports = router;