require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { rateLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const contactRoutes = require('./routes/contacts');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');
const tagRoutes = require('./routes/tags');
const statisticsRoutes = require('./routes/statistics');
const systemRoutes = require('./routes/system');

// Import services
const logger = require('./utils/logger');

// Create Express app
const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '300mb' }));
app.use(express.urlencoded({ extended: true, limit: '300mb' }));
app.use(morgan('combined', { stream: logger.stream }));

// Apply rate limiting to all routes (except in test environment)
if (process.env.NODE_ENV !== 'test') {
  app.use('/api/', rateLimiter);
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/system', systemRoutes);

// Swagger Documentation
if (process.env.ENABLE_SWAGGER === 'true') {
  const swaggerUi = require('swagger-ui-express');
  const YAML = require('yamljs');
  const swaggerDocument = YAML.load(path.join(__dirname, 'swagger/api-docs.yml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'EstateHub API Server',
    version: '1.0.0',
    documentation: process.env.ENABLE_SWAGGER === 'true' ? '/api-docs' : null
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: {
      code: 'ROUTE_NOT_FOUND',
      path: req.originalUrl
    }
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    
    // Log important configurations
    logger.info('Database connected to:', {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME
    });
    
    if (process.env.ENABLE_SWAGGER === 'true') {
      logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
    }
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Export app for testing
module.exports = app;