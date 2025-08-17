const { validationResult } = require('express-validator');
const { ERROR_CODES } = require('../config/constants');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        details: 'Please check the errors field for details'
      },
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }

  next();
};

// Custom validators
const customValidators = {
  isSlug: (value) => {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(value)) {
      throw new Error('Invalid slug format');
    }
    return true;
  },

  isUUID: (value) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error('Invalid UUID format');
    }
    return true;
  },

  isPhoneNumber: (value) => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(value)) {
      throw new Error('Invalid phone number format');
    }
    return true;
  },

  isStrongPassword: (value) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(value)) {
      throw new Error('Password must be at least 8 characters with uppercase, lowercase, and number');
    }
    return true;
  },

  isValidJSON: (value) => {
    try {
      JSON.parse(value);
      return true;
    } catch {
      throw new Error('Invalid JSON format');
    }
  },

  isValidImageType: (value) => {
    const validTypes = ['main', 'gallery', 'floor_plan', 'location', 'vr'];
    if (!validTypes.includes(value)) {
      throw new Error(`Image type must be one of: ${validTypes.join(', ')}`);
    }
    return true;
  },

  isValidProjectStatus: (value) => {
    const validStatuses = ['planning', 'pre_sale', 'on_sale', 'sold_out', 'completed'];
    if (!validStatuses.includes(value)) {
      throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
    }
    return true;
  },

  isValidCategory: (value) => {
    const validCategories = ['住宅', '商辦', '公共工程', '其他'];
    if (!validCategories.includes(value)) {
      throw new Error(`Category must be one of: ${validCategories.join(', ')}`);
    }
    return true;
  }
};

// Sanitizers
const sanitizers = {
  normalizeEmail: (value) => {
    return value ? value.toLowerCase().trim() : value;
  },

  toSlug: (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  stripHtml: (value) => {
    return value ? value.replace(/<[^>]*>/g, '') : value;
  },

  trimAll: (value) => {
    return value ? value.trim().replace(/\s+/g, ' ') : value;
  }
};

module.exports = {
  handleValidationErrors,
  customValidators,
  sanitizers
};
