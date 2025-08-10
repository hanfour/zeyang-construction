const path = require('path');
const fs = require('fs').promises;
const { query, findOne, transaction } = require('../config/database');
const { processImage, deleteImageSet, validateImage } = require('../utils/imageHandler');
const logger = require('../utils/logger');
const { IMAGE_TYPES } = require('../config/constants');

class ProjectImageService {
  // Get all images for a project
  static async getProjectImages(identifier, imageType = null) {
    try {
      // Get project ID
      const project = await findOne(
        'SELECT id, identifier FROM projects WHERE identifier = ? AND is_active = true',
        [identifier]
      );
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      let sql = `
        SELECT * FROM project_images 
        WHERE project_id = ? AND is_active = true
      `;
      const params = [project.id];
      
      if (imageType) {
        sql += ' AND image_type = ?';
        params.push(imageType);
      }
      
      sql += ' ORDER BY image_type, display_order, created_at';
      
      const images = await query(sql, params);
      
      // Parse JSON fields
      images.forEach(img => {
        if (img.dimensions) img.dimensions = JSON.parse(img.dimensions);
        if (img.thumbnails) img.thumbnails = JSON.parse(img.thumbnails);
      });
      
      return images;
    } catch (error) {
      logger.error('Error fetching project images:', error);
      throw error;
    }
  }
  
  // Upload multiple images
  static async uploadImages(identifier, files, options = {}) {
    const results = {
      uploaded: [],
      failed: []
    };
    
    try {
      // Get project
      const project = await findOne(
        'SELECT uuid FROM projects WHERE (uuid = ? OR slug = ?) AND is_active = true',
        [identifier, identifier]
      );
      
      if (!project) {
        // Clean up uploaded files
        for (const file of files) {
          await fs.unlink(file.path).catch(() => {});
        }
        throw new Error('Project not found');
      }
      
      // Process each file
      for (const file of files) {
        try {
          // Validate image
          const validation = await validateImage(file.path);
          if (!validation.valid) {
            results.failed.push({
              filename: file.originalname,
              error: validation.error
            });
            await fs.unlink(file.path).catch(() => {});
            continue;
          }
          
          // Process image (generate thumbnails)
          const processed = await processImage(file, project.uuid);
          
          // Get next display order
          const [{ maxOrder }] = await query(
            'SELECT COALESCE(MAX(display_order), -1) + 1 as maxOrder FROM project_images WHERE project_uuid = ?',
            [project.uuid]
          );
          
          // Save to database
          const result = await query(
            `INSERT INTO project_images (
              project_uuid, image_type, file_name, file_path,
              file_size, mime_type, dimensions, thumbnails,
              alt_text, display_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              project.uuid,
              options.image_type || IMAGE_TYPES.GALLERY,
              file.originalname,
              path.join('projects', project.uuid, `${path.parse(file.filename).name}-optimized.webp`),
              file.size,
              file.mimetype,
              JSON.stringify(processed.metadata),
              JSON.stringify(processed.processed),
              options.alt_text || file.originalname,
              maxOrder
            ]
          );
          
          results.uploaded.push({
            id: result.insertId,
            filename: file.originalname,
            thumbnails: processed.processed
          });
          
          logger.info('Image uploaded successfully', {
            projectUuid: project.uuid,
            imageId: result.insertId,
            filename: file.originalname
          });
        } catch (error) {
          logger.error('Failed to process image:', error);
          results.failed.push({
            filename: file.originalname,
            error: error.message
          });
          
          // Clean up on error
          try {
            await fs.unlink(file.path);
          } catch (unlinkError) {
            logger.error('Failed to clean up file:', unlinkError);
          }
        }
      }
      
      return results;
    } catch (error) {
      // Clean up all files on general error
      for (const file of files) {
        await fs.unlink(file.path).catch(() => {});
      }
      logger.error('Error uploading images:', error);
      throw error;
    }
  }
  
  // Update image details
  static async updateImage(identifier, imageId, updates) {
    try {
      // Verify project and image
      const image = await findOne(
        `SELECT pi.*, p.uuid as project_uuid
         FROM project_images pi
         JOIN projects p ON pi.project_uuid = p.uuid
         WHERE pi.id = ? 
         AND (p.uuid = ? OR p.slug = ?)
         AND p.is_active = true`,
        [imageId, identifier, identifier]
      );
      
      if (!image) {
        throw new Error('Image not found');
      }
      
      const updateFields = [];
      const updateParams = [];
      
      if (updates.alt_text !== undefined) {
        updateFields.push('alt_text = ?');
        updateParams.push(updates.alt_text);
      }
      
      if (updates.display_order !== undefined) {
        updateFields.push('display_order = ?');
        updateParams.push(updates.display_order);
      }
      
      if (updates.image_type !== undefined) {
        updateFields.push('image_type = ?');
        updateParams.push(updates.image_type);
      }
      
      if (updateFields.length > 0) {
        updateParams.push(imageId);
        
        await query(
          `UPDATE project_images SET ${updateFields.join(', ')} WHERE id = ?`,
          updateParams
        );
      }
      
      // Return updated image
      const updated = await findOne(
        'SELECT * FROM project_images WHERE id = ?',
        [imageId]
      );
      
      if (updated.dimensions) updated.dimensions = JSON.parse(updated.dimensions);
      if (updated.thumbnails) updated.thumbnails = JSON.parse(updated.thumbnails);
      
      return updated;
    } catch (error) {
      logger.error('Error updating image:', error);
      throw error;
    }
  }
  
  // Set main image for project
  static async setMainImage(identifier, imageId) {
    return await transaction(async (connection) => {
      // Verify project and image
      const image = await findOne(
        `SELECT pi.*, p.uuid as project_uuid
         FROM project_images pi
         JOIN projects p ON pi.project_uuid = p.uuid
         WHERE pi.id = ? 
         AND (p.uuid = ? OR p.slug = ?)
         AND p.is_active = true
         AND pi.is_active = true`,
        [imageId, identifier, identifier]
      );
      
      if (!image) {
        throw new Error('Image not found');
      }
      
      // Reset all main images for this project
      await connection.execute(
        'UPDATE project_images SET image_type = ? WHERE project_uuid = ? AND image_type = ?',
        [IMAGE_TYPES.GALLERY, image.project_uuid, IMAGE_TYPES.MAIN]
      );
      
      // Set new main image
      await connection.execute(
        'UPDATE project_images SET image_type = ?, display_order = 0 WHERE id = ?',
        [IMAGE_TYPES.MAIN, imageId]
      );
      
      logger.info('Main image set', { projectUuid: image.project_uuid, imageId });
      
      return { success: true };
    });
  }
  
  // Delete image
  static async deleteImage(identifier, imageId) {
    try {
      // Get image details
      const image = await findOne(
        `SELECT pi.*, p.uuid as project_uuid
         FROM project_images pi
         JOIN projects p ON pi.project_uuid = p.uuid
         WHERE pi.id = ? 
         AND (p.uuid = ? OR p.slug = ?)
         AND p.is_active = true`,
        [imageId, identifier, identifier]
      );
      
      if (!image) {
        throw new Error('Image not found');
      }
      
      // Delete physical files
      const filename = path.parse(image.file_path).name.replace('-optimized', '');
      await deleteImageSet(image.project_uuid, filename);
      
      // Soft delete from database
      await query(
        'UPDATE project_images SET is_active = false WHERE id = ?',
        [imageId]
      );
      
      logger.info('Image deleted', { projectUuid: image.project_uuid, imageId });
      
      return { success: true };
    } catch (error) {
      logger.error('Error deleting image:', error);
      throw error;
    }
  }
  
  // Reorder images
  static async reorderImages(identifier, orders) {
    try {
      // Verify project
      const project = await findOne(
        'SELECT uuid FROM projects WHERE (uuid = ? OR slug = ?) AND is_active = true',
        [identifier, identifier]
      );
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      // Verify all images belong to this project
      const imageIds = orders.map(o => o.id);
      const images = await query(
        'SELECT id FROM project_images WHERE project_uuid = ? AND id IN (?) AND is_active = true',
        [project.uuid, imageIds]
      );
      
      if (images.length !== orders.length) {
        throw new Error('Some images not found or do not belong to this project');
      }
      
      // Update display orders
      const updates = [];
      for (const { id, display_order } of orders) {
        updates.push(
          query(
            'UPDATE project_images SET display_order = ? WHERE id = ?',
            [display_order, id]
          )
        );
      }
      
      await Promise.all(updates);
      
      return { success: true, updated: orders.length };
    } catch (error) {
      logger.error('Error reordering images:', error);
      throw error;
    }
  }
  
  // Bulk delete images
  static async bulkDeleteImages(identifier, imageIds) {
    const results = {
      deleted: 0,
      failed: []
    };
    
    try {
      // Verify project
      const project = await findOne(
        'SELECT uuid FROM projects WHERE (uuid = ? OR slug = ?) AND is_active = true',
        [identifier, identifier]
      );
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      // Get all images to delete
      const images = await query(
        'SELECT * FROM project_images WHERE project_uuid = ? AND id IN (?) AND is_active = true',
        [project.uuid, imageIds]
      );
      
      for (const image of images) {
        try {
          // Delete physical files
          const filename = path.parse(image.file_path).name.replace('-optimized', '');
          await deleteImageSet(project.uuid, filename);
          
          // Soft delete from database
          await query(
            'UPDATE project_images SET is_active = false WHERE id = ?',
            [image.id]
          );
          
          results.deleted++;
        } catch (error) {
          logger.error(`Failed to delete image ${image.id}:`, error);
          results.failed.push({
            id: image.id,
            error: error.message
          });
        }
      }
      
      return results;
    } catch (error) {
      logger.error('Error bulk deleting images:', error);
      throw error;
    }
  }
  
  // Get image statistics for a project
  static async getImageStats(identifier) {
    try {
      const project = await findOne(
        'SELECT uuid FROM projects WHERE (uuid = ? OR slug = ?) AND is_active = true',
        [identifier, identifier]
      );
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      const stats = await query(
        `SELECT 
          image_type,
          COUNT(*) as count,
          SUM(file_size) as total_size
         FROM project_images
         WHERE project_uuid = ? AND is_active = true
         GROUP BY image_type`,
        [project.uuid]
      );
      
      const total = await findOne(
        `SELECT 
          COUNT(*) as total_count,
          SUM(file_size) as total_size
         FROM project_images
         WHERE project_uuid = ? AND is_active = true`,
        [project.uuid]
      );
      
      return {
        total: total.total_count,
        totalSize: total.total_size,
        byType: stats
      };
    } catch (error) {
      logger.error('Error fetching image statistics:', error);
      throw error;
    }
  }
}

module.exports = ProjectImageService;