// System constants
module.exports = {
  // User roles
  USER_ROLES: {
    ADMIN: 'admin',
    EDITOR: 'editor',
    VIEWER: 'viewer'
  },

  // Project categories (types)
  PROJECT_CATEGORIES: {
    RESIDENTIAL: 'residential',
    COMMERCIAL: 'commercial',
    MIXED: 'mixed',
    OTHER: 'other'
  },

  // Project status
  PROJECT_STATUS: {
    PLANNING: 'planning',
    PRE_SALE: 'pre_sale',
    ON_SALE: 'on_sale',
    SOLD_OUT: 'sold_out',
    COMPLETED: 'completed'
  },

  // Image types
  IMAGE_TYPES: {
    MAIN: 'main',
    GALLERY: 'gallery',
    FLOOR_PLAN: 'floor_plan',
    LOCATION: 'location',
    VR: 'vr'
  },

  // Log levels
  LOG_LEVELS: {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },

  // File upload
  UPLOAD: {
    MAX_FILE_SIZE: 268435456, // 256MB
    ALLOWED_MIME_TYPES: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ],
    IMAGE_SIZES: {
      THUMBNAIL: { width: 150, height: 150 },
      SMALL: { width: 300, height: 300 },
      MEDIUM: { width: 600, height: 600 },
      LARGE: { width: 1200, height: 1200 },
      ORIGINAL: { width: 1920, height: 1920 }
    }
  },

  // JWT
  JWT: {
    ALGORITHM: 'HS256',
    ISSUER: 'EstateHub',
    AUDIENCE: 'estatehub-users'
  },

  // Rate limiting
  RATE_LIMIT: {
    GENERAL: { window: 15, max: 100 }, // 15 minutes, 100 requests
    AUTH: { window: 15, max: 5 }, // 15 minutes, 5 requests
    UPLOAD: { window: 60, max: 50 } // 60 minutes, 50 requests
  },

  // Error codes
  ERROR_CODES: {
    // Authentication errors
    UNAUTHORIZED: 'UNAUTHORIZED',
    INVALID_TOKEN: 'INVALID_TOKEN',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    
    // Validation errors
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',
    MISSING_FIELD: 'MISSING_FIELD',
    
    // Resource errors
    NOT_FOUND: 'NOT_FOUND',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    
    // File errors
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
    UPLOAD_FAILED: 'UPLOAD_FAILED',
    
    // Database errors
    DATABASE_ERROR: 'DATABASE_ERROR',
    QUERY_FAILED: 'QUERY_FAILED',
    
    // Permission errors
    FORBIDDEN: 'FORBIDDEN',
    INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
    
    // Rate limit errors
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    
    // System errors
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
  },

  // Success messages
  SUCCESS_MESSAGES: {
    CREATED: '資源建立成功',
    UPDATED: '資源更新成功',
    DELETED: '資源刪除成功',
    LOGIN_SUCCESS: '登入成功',
    LOGOUT_SUCCESS: '登出成功',
    PASSWORD_CHANGED: '密碼修改成功',
    EMAIL_SENT: '郵件發送成功',
    UPLOAD_SUCCESS: '檔案上傳成功'
  },

  // Regular expressions
  REGEX: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    PHONE: /^[\d\s\-\+\(\)]+$/,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  }
};