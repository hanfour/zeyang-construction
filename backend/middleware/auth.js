const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { ERROR_CODES, USER_ROLES } = require('../config/constants');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        error: {
          code: ERROR_CODES.UNAUTHORIZED
        }
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // In test environment with full user info in token
    if (process.env.NODE_ENV === 'test' && decoded.role) {
      req.user = {
        id: decoded.userId,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
        is_active: true
      };
    } else {
      // Get user from database
      const user = await query(
        'SELECT id, username, email, role, is_active FROM users WHERE id = ? AND is_active = true',
        [decoded.userId]
      );

      if (!user || user.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token or user not found',
          error: {
            code: ERROR_CODES.INVALID_TOKEN
          }
        });
      }

      // Attach user to request
      req.user = user[0];
    }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        error: {
          code: ERROR_CODES.TOKEN_EXPIRED
        }
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: {
          code: ERROR_CODES.INVALID_TOKEN
        }
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Token verification failed',
      error: {
        code: ERROR_CODES.INTERNAL_ERROR
      }
    });
  }
};

// Verify API key
const verifyApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required',
        error: {
          code: ERROR_CODES.UNAUTHORIZED
        }
      });
    }

    // Get API key from database
    const keyData = await query(
      `SELECT * FROM api_keys 
       WHERE key_value = ? 
       AND is_active = true 
       AND (expires_at IS NULL OR expires_at > NOW())`,
      [apiKey]
    );

    if (!keyData || keyData.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired API key',
        error: {
          code: ERROR_CODES.INVALID_TOKEN
        }
      });
    }

    // Check IP whitelist if configured
    const apiKeyRecord = keyData[0];
    if (apiKeyRecord.allowed_ips) {
      const allowedIps = JSON.parse(apiKeyRecord.allowed_ips);
      if (allowedIps.length > 0 && !allowedIps.includes(req.ip)) {
        return res.status(403).json({
          success: false,
          message: 'IP address not allowed',
          error: {
            code: ERROR_CODES.FORBIDDEN
          }
        });
      }
    }

    // Update last used timestamp
    await query(
      'UPDATE api_keys SET last_used_at = NOW(), usage_count = usage_count + 1 WHERE id = ?',
      [apiKeyRecord.id]
    );

    // Attach API key data to request
    req.apiKey = apiKeyRecord;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'API key verification failed',
      error: {
        code: ERROR_CODES.INTERNAL_ERROR
      }
    });
  }
};

// Combined auth (JWT or API key)
const authenticate = async (req, res, next) => {
  const hasApiKey = req.headers['x-api-key'] || req.query.api_key;
  const hasToken = req.headers.authorization;

  if (hasApiKey) {
    return verifyApiKey(req, res, next);
  } else if (hasToken) {
    return verifyToken(req, res, next);
  } else {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: {
        code: ERROR_CODES.UNAUTHORIZED
      }
    });
  }
};

// Check user role
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: ERROR_CODES.UNAUTHORIZED
        }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        error: {
          code: ERROR_CODES.FORBIDDEN
        }
      });
    }

    next();
  };
};

// Check API key permissions
const checkApiKeyPermission = (permission) => {
  return (req, res, next) => {
    if (!req.apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required',
        error: {
          code: ERROR_CODES.UNAUTHORIZED
        }
      });
    }

    const permissions = JSON.parse(req.apiKey.permissions || '[]');
    if (!permissions.includes(permission) && !permissions.includes('*')) {
      return res.status(403).json({
        success: false,
        message: 'API key lacks required permission',
        error: {
          code: ERROR_CODES.INSUFFICIENT_PERMISSIONS
        }
      });
    }

    next();
  };
};

// Optional auth (doesn't fail if no auth provided)
const optionalAuth = async (req, res, next) => {
  const hasApiKey = req.headers['x-api-key'] || req.query.api_key;
  const hasToken = req.headers.authorization;

  if (hasApiKey) {
    return verifyApiKey(req, res, (err) => {
      if (err) {
        req.apiKey = null;
      }
      next();
    });
  } else if (hasToken) {
    return verifyToken(req, res, (err) => {
      if (err) {
        req.user = null;
      }
      next();
    });
  } else {
    next();
  }
};

module.exports = {
  verifyToken,
  verifyApiKey,
  authenticate,
  authorize,
  checkApiKeyPermission,
  optionalAuth
};
