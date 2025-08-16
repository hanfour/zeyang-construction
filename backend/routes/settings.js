const express = require('express');
const router = express.Router();
const { body, param, query: queryValidator } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { handleValidationErrors } = require('../middleware/validation');
const SettingsService = require('../services/settingsService');
const { USER_ROLES, SUCCESS_MESSAGES } = require('../config/constants');

// Validation rules
const updateSettingsValidation = [
  body('settings').isObject().withMessage('Settings must be an object'),
  handleValidationErrors
];

// Get all settings or settings by category (admin only)
router.get('/', 
  authenticate, 
  authorize(USER_ROLES.ADMIN),
  [
    queryValidator('category').optional().isString().withMessage('Category must be a string'),
    handleValidationErrors
  ],
  asyncHandler(async (req, res) => {
    const settings = await SettingsService.getSettings(req.query.category);
    
    res.json({
      success: true,
      data: settings
    });
  })
);

// Get single setting (admin only)
router.get('/:key', 
  authenticate, 
  authorize(USER_ROLES.ADMIN),
  [
    param('key').notEmpty().withMessage('Setting key is required'),
    handleValidationErrors
  ],
  asyncHandler(async (req, res) => {
    const setting = await SettingsService.getSetting(req.params.key);
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }
    
    res.json({
      success: true,
      data: setting
    });
  })
);

// Update settings (admin only)
router.put('/', 
  authenticate, 
  authorize(USER_ROLES.ADMIN),
  updateSettingsValidation,
  asyncHandler(async (req, res) => {
    const results = await SettingsService.updateSettings(req.body.settings, req.user.id);
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: results
    });
  })
);

// Test SMTP connection (admin only)
router.post('/smtp/test', 
  authenticate, 
  authorize(USER_ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    const testResult = await SettingsService.testSmtpConnection();
    
    if (testResult.success) {
      res.json({
        success: true,
        message: 'SMTP connection test successful',
        data: testResult
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'SMTP connection test failed',
        error: testResult.error
      });
    }
  })
);

// Get email settings specifically (admin only)
router.get('/category/email', 
  authenticate, 
  authorize(USER_ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    const emailSettings = await SettingsService.getSettings('email');
    
    // Don't return the actual password, just indicate if it's set
    if (emailSettings.smtp_password) {
      emailSettings.smtp_password = {
        ...emailSettings.smtp_password,
        value: emailSettings.smtp_password.value ? '••••••••' : ''
      };
    }
    
    res.json({
      success: true,
      data: emailSettings
    });
  })
);

// Update email settings specifically (admin only)
router.put('/category/email', 
  authenticate, 
  authorize(USER_ROLES.ADMIN),
  [
    body('smtp_enabled').optional().isBoolean().withMessage('SMTP enabled must be boolean'),
    body('smtp_host').optional().isString().withMessage('SMTP host must be string'),
    body('smtp_port').optional().isInt({ min: 1, max: 65535 }).withMessage('SMTP port must be valid port number'),
    body('smtp_secure').optional().isBoolean().withMessage('SMTP secure must be boolean'),
    body('smtp_username').optional().isString().withMessage('SMTP username must be string'),
    body('smtp_password').optional().isString().withMessage('SMTP password must be string'),
    body('smtp_from_email').optional().isEmail().withMessage('From email must be valid email'),
    body('smtp_from_name').optional().isString().withMessage('From name must be string'),
    body('admin_notification_emails').optional().isString().withMessage('Admin emails must be string'),
    body('send_admin_notifications').optional().isBoolean().withMessage('Send admin notifications must be boolean'),
    body('send_user_confirmations').optional().isBoolean().withMessage('Send user confirmations must be boolean'),
    handleValidationErrors
  ],
  asyncHandler(async (req, res) => {
    // Build settings object
    const settings = {};
    
    const emailFields = [
      'smtp_enabled',
      'smtp_host', 
      'smtp_port',
      'smtp_secure',
      'smtp_username',
      'smtp_password',
      'smtp_from_email',
      'smtp_from_name',
      'admin_notification_emails',
      'send_admin_notifications',
      'send_user_confirmations'
    ];
    
    for (const field of emailFields) {
      if (req.body[field] !== undefined) {
        let type = 'string';
        if (field.includes('enabled') || field.includes('secure') || field.startsWith('send_')) {
          type = 'boolean';
        } else if (field === 'smtp_port') {
          type = 'number';
        }
        
        settings[field] = {
          value: req.body[field],
          type,
          category: 'email'
        };
      }
    }
    
    const results = await SettingsService.updateSettings(settings, req.user.id);
    
    res.json({
      success: true,
      message: 'Email settings updated successfully',
      data: results
    });
  })
);

// Delete email settings (admin only)
router.delete('/category/email', 
  authenticate, 
  authorize(USER_ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    const result = await SettingsService.deleteSettingsByCategory('email', req.user.id);
    
    res.json({
      success: true,
      message: 'Email settings deleted successfully',
      data: result
    });
  })
);

module.exports = router;