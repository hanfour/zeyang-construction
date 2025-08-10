const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { UPLOAD } = require('../config/constants');
const logger = require('./logger');

// Generate thumbnail sizes
const generateThumbnails = async (inputPath, outputDir, filename) => {
  const sizes = UPLOAD.IMAGE_SIZES;
  const results = {};
  
  try {
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });
    
    // Get original image metadata
    const metadata = await sharp(inputPath).metadata();
    
    // Process each size
    for (const [sizeName, dimensions] of Object.entries(sizes)) {
      const outputFilename = `${filename}-${sizeName}.webp`;
      const outputPath = path.join(outputDir, outputFilename);
      
      try {
        if (sizeName === 'thumbnail') {
          // Square crop for thumbnails
          await sharp(inputPath)
            .resize(dimensions.width, dimensions.height, {
              fit: 'cover',
              position: 'center'
            })
            .webp({ quality: 80 })
            .toFile(outputPath);
        } else {
          // Maintain aspect ratio for other sizes
          await sharp(inputPath)
            .resize(dimensions.width, dimensions.height, {
              fit: 'inside',
              withoutEnlargement: true
            })
            .webp({ quality: 85 })
            .toFile(outputPath);
        }
        
        results[sizeName] = {
          path: outputPath,
          filename: outputFilename,
          width: dimensions.width,
          height: dimensions.height
        };
      } catch (error) {
        logger.error(`Failed to generate ${sizeName} thumbnail:`, error);
      }
    }
    
    // Also create optimized original
    const optimizedFilename = `${filename}-optimized.webp`;
    const optimizedPath = path.join(outputDir, optimizedFilename);
    
    await sharp(inputPath)
      .resize(sizes.ORIGINAL.width, sizes.ORIGINAL.height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 90 })
      .toFile(optimizedPath);
    
    results.optimized = {
      path: optimizedPath,
      filename: optimizedFilename,
      width: metadata.width,
      height: metadata.height
    };
    
    return {
      success: true,
      metadata,
      thumbnails: results
    };
  } catch (error) {
    logger.error('Thumbnail generation failed:', error);
    throw error;
  }
};

// Process uploaded image
const processImage = async (file, projectUuid) => {
  try {
    const filename = path.parse(file.filename).name;
    const outputDir = path.join(
      __dirname,
      '..',
      'uploads',
      'projects',
      projectUuid
    );
    
    // Generate thumbnails
    const result = await generateThumbnails(file.path, outputDir, filename);
    
    // Delete original uploaded file
    await fs.unlink(file.path);
    
    return {
      original: {
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      },
      processed: result.thumbnails,
      metadata: result.metadata
    };
  } catch (error) {
    // Clean up on error
    try {
      await fs.unlink(file.path);
    } catch (unlinkError) {
      logger.error('Failed to clean up file:', unlinkError);
    }
    throw error;
  }
};

// Get image info
const getImageInfo = async (imagePath) => {
  try {
    const metadata = await sharp(imagePath).metadata();
    const stats = await fs.stat(imagePath);
    
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: stats.size,
      hasAlpha: metadata.hasAlpha,
      density: metadata.density
    };
  } catch (error) {
    logger.error('Failed to get image info:', error);
    throw error;
  }
};

// Optimize existing image
const optimizeImage = async (inputPath, outputPath, options = {}) => {
  const {
    quality = 85,
    format = 'webp',
    width = null,
    height = null
  } = options;
  
  try {
    let pipeline = sharp(inputPath);
    
    // Resize if dimensions provided
    if (width || height) {
      pipeline = pipeline.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // Convert format and optimize
    switch (format) {
      case 'jpeg':
      case 'jpg':
        pipeline = pipeline.jpeg({ quality, progressive: true });
        break;
      case 'png':
        pipeline = pipeline.png({ quality, compressionLevel: 9 });
        break;
      case 'webp':
      default:
        pipeline = pipeline.webp({ quality });
        break;
    }
    
    await pipeline.toFile(outputPath);
    
    return {
      success: true,
      outputPath
    };
  } catch (error) {
    logger.error('Image optimization failed:', error);
    throw error;
  }
};

// Delete image and its thumbnails
const deleteImageSet = async (projectUuid, filename) => {
  const imageDir = path.join(
    __dirname,
    '..',
    'uploads',
    'projects',
    projectUuid
  );
  
  const sizes = ['thumbnail', 'small', 'medium', 'large', 'optimized'];
  const deletionPromises = [];
  
  for (const size of sizes) {
    const filePath = path.join(imageDir, `${filename}-${size}.webp`);
    deletionPromises.push(
      fs.unlink(filePath).catch(err => {
        if (err.code !== 'ENOENT') {
          logger.error(`Failed to delete ${size} image:`, err);
        }
      })
    );
  }
  
  await Promise.all(deletionPromises);
};

// Validate image
const validateImage = async (filePath) => {
  try {
    const metadata = await sharp(filePath).metadata();
    
    // Check if it's a valid image
    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image file');
    }
    
    // Check minimum dimensions
    if (metadata.width < 100 || metadata.height < 100) {
      throw new Error('Image dimensions too small (minimum 100x100)');
    }
    
    // Check maximum dimensions
    if (metadata.width > 10000 || metadata.height > 10000) {
      throw new Error('Image dimensions too large (maximum 10000x10000)');
    }
    
    return {
      valid: true,
      metadata
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
};

module.exports = {
  generateThumbnails,
  processImage,
  getImageInfo,
  optimizeImage,
  deleteImageSet,
  validateImage
};