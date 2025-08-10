const rateLimit = require('express-rate-limit');
const { RATE_LIMIT, ERROR_CODES } = require('../config/constants');

// General rate limiter
const rateLimiter = rateLimit({
  windowMs: (RATE_LIMIT.GENERAL.window || 15) * 60 * 1000,
  max: RATE_LIMIT.GENERAL.max || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
    error: {
      code: ERROR_CODES.RATE_LIMIT_EXCEEDED
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for whitelisted IPs
    const whitelist = process.env.RATE_LIMIT_WHITELIST?.split(',') || [];
    return whitelist.includes(req.ip);
  }
});

// Auth rate limiter (stricter)
const authRateLimiter = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' 
  ? (req, res, next) => next() // Skip rate limiting in development/test
  : rateLimit({
      windowMs: (RATE_LIMIT.AUTH.window || 15) * 60 * 1000,
      max: RATE_LIMIT.AUTH.max || 5,
      message: {
        success: false,
        message: 'Too many authentication attempts, please try again later',
        error: {
          code: ERROR_CODES.RATE_LIMIT_EXCEEDED
        }
      },
      skipSuccessfulRequests: true
    });

// Upload rate limiter
const uploadRateLimiter = rateLimit({
  windowMs: (RATE_LIMIT.UPLOAD.window || 60) * 60 * 1000,
  max: RATE_LIMIT.UPLOAD.max || 50,
  message: {
    success: false,
    message: 'Upload limit exceeded, please try again later',
    error: {
      code: ERROR_CODES.RATE_LIMIT_EXCEEDED
    }
  }
});

// API key rate limiter (dynamic based on key permissions)
const apiKeyRateLimiter = (req, res, next) => {
  if (!req.apiKey) {
    return next();
  }

  const limit = req.apiKey.rate_limit || 1000;
  const windowMs = 60 * 60 * 1000; // 1 hour

  const limiter = rateLimit({
    windowMs,
    max: limit,
    keyGenerator: () => req.apiKey.key_value,
    message: {
      success: false,
      message: 'API key rate limit exceeded',
      error: {
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED
      }
    }
  });

  limiter(req, res, next);
};

module.exports = {
  rateLimiter,
  authRateLimiter,
  uploadRateLimiter,
  apiKeyRateLimiter
};