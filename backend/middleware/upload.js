const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { UPLOAD, ERROR_CODES } = require('../config/constants');

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    'uploads/projects',
    'uploads/temp',
    'uploads/avatars'
  ];
  
  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
};

createUploadDirs();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/temp';
    
    if (req.baseUrl.includes('/projects')) {
      uploadPath = 'uploads/projects';
    } else if (req.baseUrl.includes('/users')) {
      uploadPath = 'uploads/avatars';
    }
    
    cb(null, path.join(__dirname, '..', uploadPath));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = UPLOAD.ALLOWED_MIME_TYPES;
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
    error.code = ERROR_CODES.INVALID_FILE_TYPE;
    cb(error, false);
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: UPLOAD.MAX_FILE_SIZE,
    files: 10 // Maximum 10 files per upload
  }
});

// Error handler for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    let message = 'File upload error';
    let code = ERROR_CODES.UPLOAD_FAILED;
    
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = `File too large. Maximum size is ${UPLOAD.MAX_FILE_SIZE / 1024 / 1024}MB`;
        code = ERROR_CODES.FILE_TOO_LARGE;
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files. Maximum 10 files allowed';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected field name';
        break;
    }
    
    return res.status(400).json({
      success: false,
      message,
      error: {
        code,
        field: err.field
      }
    });
  }
  
  if (err.code === ERROR_CODES.INVALID_FILE_TYPE) {
    return res.status(400).json({
      success: false,
      message: err.message,
      error: {
        code: err.code
      }
    });
  }
  
  next(err);
};

// Clean up uploaded files on error
const cleanupFiles = (files) => {
  if (!files) return;
  
  const fileList = Array.isArray(files) ? files : Object.values(files).flat();
  
  fileList.forEach(file => {
    fs.unlink(file.path, (err) => {
      if (err) console.error('Error deleting file:', err);
    });
  });
};

// Middleware to clean up files on request error
const autoCleanup = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    res.send = originalSend;
    
    // If response status is error and files were uploaded, clean them up
    if (res.statusCode >= 400 && (req.file || req.files)) {
      const files = req.file ? [req.file] : req.files;
      cleanupFiles(files);
    }
    
    return res.send(data);
  };
  
  next();
};

module.exports = {
  upload,
  handleMulterError,
  cleanupFiles,
  autoCleanup,
  
  // Specific upload configurations
  uploadSingle: upload.single('file'),
  uploadMultiple: upload.array('files', 10),
  uploadFields: upload.fields([
    { name: 'main', maxCount: 1 },
    { name: 'gallery', maxCount: 20 },
    { name: 'floor_plan', maxCount: 5 }
  ])
};