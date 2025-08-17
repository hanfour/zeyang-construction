const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access project identifier
const { body, param } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { handleValidationErrors } = require('../middleware/validation');
const { uploadMultiple, handleMulterError, autoCleanup } = require('../middleware/upload');
const ProjectImageService = require('../services/projectImageService');
const { USER_ROLES, SUCCESS_MESSAGES, IMAGE_TYPES } = require('../config/constants');

// Apply authentication to all image routes
router.use(authenticate);
router.use(authorize(USER_ROLES.ADMIN, USER_ROLES.EDITOR));

// Validation rules
const uploadImagesValidation = [
  param('identifier').notEmpty(),
  body('image_type').optional()
    .isIn(Object.values(IMAGE_TYPES)).withMessage('Invalid image type'),
  body('alt_text').optional().trim(),
  handleValidationErrors
];

const updateImageValidation = [
  param('identifier').notEmpty(),
  param('imageId').isInt().withMessage('Invalid image ID'),
  body('alt_text').optional().trim(),
  body('display_order').optional().isInt({ min: 0 }).withMessage('Invalid display order'),
  body('image_type').optional()
    .isIn(Object.values(IMAGE_TYPES)).withMessage('Invalid image type'),
  handleValidationErrors
];

const reorderImagesValidation = [
  param('identifier').notEmpty(),
  body('orders').isArray().withMessage('Orders must be an array'),
  body('orders.*.id').isInt().withMessage('Image ID must be an integer'),
  body('orders.*.display_order').isInt({ min: 0 }).withMessage('Invalid display order'),
  handleValidationErrors
];

// Get all images for a project
router.get('/', asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  const { image_type } = req.query;

  const images = await ProjectImageService.getProjectImages(identifier, image_type);

  res.json({
    success: true,
    data: { images }
  });
}));

// Upload images
router.post('/',
  autoCleanup,
  uploadMultiple,
  handleMulterError,
  uploadImagesValidation,
  asyncHandler(async (req, res) => {
    const { identifier } = req.params;
    const { image_type = IMAGE_TYPES.GALLERY, alt_text } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const results = await ProjectImageService.uploadImages(
      identifier,
      req.files,
      {
        image_type,
        alt_text,
        userId: req.user.id
      }
    );

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.UPLOAD_SUCCESS,
      data: {
        uploaded: results.uploaded,
        failed: results.failed
      }
    });
  })
);

// Update image details
router.put('/:imageId', updateImageValidation, asyncHandler(async (req, res) => {
  const { identifier, imageId } = req.params;

  const image = await ProjectImageService.updateImage(
    identifier,
    parseInt(imageId),
    req.body
  );

  res.json({
    success: true,
    message: SUCCESS_MESSAGES.UPDATED,
    data: { image }
  });
}));

// Set main image
router.post('/:imageId/set-main', [
  param('identifier').notEmpty(),
  param('imageId').isInt().withMessage('Invalid image ID'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { identifier, imageId } = req.params;

  await ProjectImageService.setMainImage(identifier, parseInt(imageId));

  res.json({
    success: true,
    message: 'Main image set successfully'
  });
}));

// Delete image
router.delete('/:imageId', [
  param('identifier').notEmpty(),
  param('imageId').isInt().withMessage('Invalid image ID'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { identifier, imageId } = req.params;

  await ProjectImageService.deleteImage(identifier, parseInt(imageId));

  res.json({
    success: true,
    message: SUCCESS_MESSAGES.DELETED
  });
}));

// Reorder images
router.put('/reorder', reorderImagesValidation, asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  const { orders } = req.body;

  const result = await ProjectImageService.reorderImages(identifier, orders);

  res.json({
    success: true,
    message: 'Image order updated successfully',
    data: result
  });
}));

// Bulk delete images
router.post('/bulk-delete', [
  param('identifier').notEmpty(),
  body('imageIds').isArray().withMessage('Image IDs must be an array'),
  body('imageIds.*').isInt().withMessage('Invalid image ID'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  const { imageIds } = req.body;

  const result = await ProjectImageService.bulkDeleteImages(identifier, imageIds);

  res.json({
    success: true,
    message: `${result.deleted} images deleted successfully`,
    data: result
  });
}));

module.exports = router;
