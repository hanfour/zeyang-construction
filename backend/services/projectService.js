const Project = require('../models/Project');
const { deleteImageSet } = require('../utils/imageHandler');
const { query } = require('../config/database');
const logger = require('../utils/logger');

class ProjectService {
  // Get projects with advanced filtering
  static async getProjects(filters, options) {
    try {
      return await Project.findAll(filters, options);
    } catch (error) {
      logger.error('Error fetching projects:', error);
      throw new Error('Failed to fetch projects');
    }
  }
  
  // Get single project with view tracking
  static async getProject(identifier, trackView = true) {
    try {
      const project = await Project.findByIdentifier(identifier);
      
      if (!project) {
        return null;
      }
      
      // Track view if requested
      if (trackView) {
        // Fire and forget - don't wait for view tracking
        Project.incrementViewCount(identifier).catch(err => {
          logger.error('Failed to track view:', err);
        });
      }
      
      return project;
    } catch (error) {
      logger.error('Error fetching project:', error);
      throw new Error('Failed to fetch project');
    }
  }
  
  // Create project with validation
  static async createProject(data, userId) {
    try {
      // Validate required fields
      const requiredFields = ['title', 'location'];
      for (const field of requiredFields) {
        if (!data[field]) {
          throw new Error(`${field} is required`);
        }
      }
      
      // Create project
      const result = await Project.create(data, userId);
      
      // Return created project  
      return await this.getProject(result.slug, false);
    } catch (error) {
      logger.error('Error creating project:', error);
      throw error;
    }
  }
  
  // Update project with validation
  static async updateProject(identifier, data, userId) {
    try {
      // Check if project exists
      const existing = await this.getProject(identifier, false);
      if (!existing) {
        throw new Error('Project not found');
      }
      
      // Update project
      await Project.update(identifier, data, userId);
      
      // Return updated project
      return await this.getProject(identifier, false);
    } catch (error) {
      logger.error('Error updating project:', error);
      throw error;
    }
  }
  
  // Delete project and associated resources
  static async deleteProject(identifier, hardDelete = false) {
    try {
      const project = await this.getProject(identifier, false);
      if (!project) {
        throw new Error('Project not found');
      }
      
      if (hardDelete) {
        // Delete all associated images
        for (const image of project.images) {
          try {
            await deleteImageSet(project.uuid, image.file_name);
          } catch (err) {
            logger.error('Failed to delete image:', err);
          }
        }
        
        // Hard delete from database  
        await query('DELETE FROM projects WHERE uuid = ?', [project.uuid]);
      } else {
        // Soft delete
        await Project.delete(identifier);
      }
      
      return { success: true };
    } catch (error) {
      logger.error('Error deleting project:', error);
      throw error;
    }
  }
  
  // Update project status
  static async updateProjectStatus(identifier, status, userId) {
    try {
      const validStatuses = ['planning', 'pre_sale', 'on_sale', 'sold_out', 'completed'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status');
      }
      
      return await Project.updateStatus(identifier, status, userId);
    } catch (error) {
      logger.error('Error updating project status:', error);
      throw error;
    }
  }
  
  // Toggle featured status
  static async toggleProjectFeatured(identifier, userId) {
    try {
      return await Project.toggleFeatured(identifier, userId);
    } catch (error) {
      logger.error('Error toggling featured status:', error);
      throw error;
    }
  }
  
  // Get featured projects
  static async getFeaturedProjects(limit = 6) {
    try {
      const result = await Project.findAll(
        { isFeatured: true },
        { limit, orderBy: 'displayOrder' }
      );
      return result.items;
    } catch (error) {
      logger.error('Error fetching featured projects:', error);
      throw new Error('Failed to fetch featured projects');
    }
  }
  
  // Get related projects
  static async getRelatedProjects(identifier, limit = 4) {
    try {
      const project = await this.getProject(identifier, false);
      if (!project) {
        return [];
      }
      
      // Find projects in same category and location
      const sql = `
        SELECT p.*
        FROM projects p
        WHERE p.uuid != ?
        AND (p.category = ? OR p.location = ?)
        ORDER BY 
          CASE WHEN p.category = ? THEN 1 ELSE 0 END DESC,
          CASE WHEN p.location = ? THEN 1 ELSE 0 END DESC,
          p.view_count DESC
        LIMIT ?
      `;
      
      const related = await query(sql, [
        project.uuid,
        project.category,
        project.location,
        project.category,
        project.location,
        limit
      ]);
      
      return related;
    } catch (error) {
      logger.error('Error fetching related projects:', error);
      return [];
    }
  }
  
  // Search projects
  static async searchProjects(searchQuery, options = {}) {
    try {
      const filters = {
        search: searchQuery
      };
      
      return await Project.findAll(filters, options);
    } catch (error) {
      logger.error('Error searching projects:', error);
      throw new Error('Failed to search projects');
    }
  }
  
  // Get project statistics
  static async getProjectStatistics(identifier, days = 30) {
    try {
      const project = await this.getProject(identifier, false);
      if (!project) {
        throw new Error('Project not found');
      }
      
      // Since project_statistics table doesn't exist in schema, return mock data
      const stats = [];
      
      // Calculate totals
      const totals = stats.reduce((acc, stat) => ({
        views: acc.views + stat.view_count,
        visitors: acc.visitors + stat.unique_visitors,
        contacts: acc.contacts + stat.contact_count
      }), { views: 0, visitors: 0, contacts: 0 });
      
      return {
        project: {
          uuid: project.uuid,
          title: project.title
        },
        period: days,
        totals,
        daily: stats
      };
    } catch (error) {
      logger.error('Error fetching project statistics:', error);
      throw error;
    }
  }
  
  // Bulk update display order
  static async updateDisplayOrder(orders, userId) {
    try {
      const updates = [];
      
      for (const { identifier, displayOrder } of orders) {
        updates.push(
          query(
            'UPDATE projects SET display_order = ?, updated_by = ? WHERE slug = ? OR uuid = ?',
            [displayOrder, userId, identifier, identifier]
          )
        );
      }
      
      await Promise.all(updates);
      
      return { success: true, updated: orders.length };
    } catch (error) {
      logger.error('Error updating display order:', error);
      throw new Error('Failed to update display order');
    }
  }
}

module.exports = ProjectService;