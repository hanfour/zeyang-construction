const logger = require('../utils/logger');
const { ERROR_CODES } = require('../config/constants');

const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    user: req.user?.id
  });

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errorCode = err.code || ERROR_CODES.INTERNAL_ERROR;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = ERROR_CODES.VALIDATION_ERROR;
    message = 'Validation failed';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorCode = ERROR_CODES.UNAUTHORIZED;
    message = 'Unauthorized access';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = ERROR_CODES.INVALID_TOKEN;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = ERROR_CODES.TOKEN_EXPIRED;
    message = 'Token has expired';
  } else if (err.code === 'ENOENT') {
    statusCode = 404;
    errorCode = ERROR_CODES.NOT_FOUND;
    message = 'Resource not found';
  } else if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    errorCode = ERROR_CODES.ALREADY_EXISTS;
    message = 'Resource already exists';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    error: {
      code: errorCode,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    },
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Not found handler
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = ERROR_CODES.NOT_FOUND;
  next(error);
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFound
};