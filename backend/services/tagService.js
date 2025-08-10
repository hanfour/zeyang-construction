const { query, findOne, transaction } = require('../config/database');
const { generateUniqueSlug } = require('../utils/slugGenerator');
const logger = require('../utils/logger');

class TagService {
  // Get all tags
  static async getAllTags(options = {}) {
    try {
      const { 
        orderBy = 'usageCount',
        orderDir = 'DESC',
        limit = null,
        category = null 
      } = options;
      
      let sql = `
        SELECT 
          t.*,
          COUNT(pt.project_id) as project_count
        FROM tags t
        LEFT JOIN project_tags pt ON t.id = pt.tag_id
      `;
      
      const params = [];
      
      // Add category filter if specified
      if (category) {
        sql += ' WHERE t.category = ?';
        params.push(category);
      }
      
      sql += ' GROUP BY t.id';
      
      // Add ordering
      const validColumns = ['name', 'usageCount', 'created_at'];
      const validDirs = ['ASC', 'DESC'];
      
      if (validColumns.includes(orderBy) && validDirs.includes(orderDir.toUpperCase())) {
        sql += ` ORDER BY ${orderBy === 'usageCount' ? 'project_count' : `t.${orderBy}`} ${orderDir.toUpperCase()}`;
      } else {
        sql += ' ORDER BY project_count DESC';
      }
      
      // Add limit if specified
      if (limit && limit > 0) {
        sql += ` LIMIT ${parseInt(limit)}`;
      }
      
      const tags = await query(sql, params);
      
      return tags;
    } catch (error) {
      logger.error('Error fetching tags:', error);
      throw new Error('Failed to fetch tags');
    }
  }
  
  // Get tag by ID or slug
  static async getTag(identifier) {
    try {
      const tag = await findOne(
        `SELECT 
          t.*,
          COUNT(pt.project_id) as project_count
         FROM tags t
         LEFT JOIN project_tags pt ON t.id = pt.tag_id
         WHERE t.id = ? OR t.identifier = ?
         GROUP BY t.id`,
        [identifier, identifier]
      );
      
      if (!tag) return null;
      
      // Get associated projects
      const projects = await query(
        `SELECT 
          p.id, p.identifier, p.name, p.type, p.status, p.location
         FROM projects p
         JOIN project_tags pt ON p.id = pt.project_id
         WHERE pt.tag_id = ?
         ORDER BY p.displayOrder, p.created_at DESC`,
        [tag.id]
      );
      
      return {
        ...tag,
        projects
      };
    } catch (error) {
      logger.error('Error fetching tag:', error);
      throw new Error('Failed to fetch tag');
    }
  }
  
  // Create new tag
  static async createTag(data) {
    try {
      const { name, nameEn, category } = data;
      
      // Check if tag already exists
      const existing = await findOne(
        'SELECT id FROM tags WHERE name = ?',
        [name]
      );
      
      if (existing) {
        const error = new Error('Tag already exists');
        error.statusCode = 400;
        error.code = 'ALREADY_EXISTS';
        throw error;
      }
      
      // Generate unique slug
      const identifier = await generateUniqueSlug(name, 'tags', 'identifier');
      
      // Create tag
      const result = await query(
        'INSERT INTO tags (name, identifier, nameEn, category) VALUES (?, ?, ?, ?)',
        [name, identifier, nameEn || name, category || 'other']
      );
      
      logger.info('Tag created', { tagId: result.insertId, name, identifier });
      
      return {
        id: result.insertId,
        name,
        identifier,
        nameEn: nameEn || name,
        category: category || 'other',
        usageCount: 0
      };
    } catch (error) {
      logger.error('Error creating tag:', error);
      throw error;
    }
  }
  
  // Update tag
  static async updateTag(identifier, data) {
    try {
      const tag = await findOne(
        'SELECT * FROM tags WHERE id = ? OR identifier = ?',
        [identifier, identifier]
      );
      
      if (!tag) {
        throw new Error('Tag not found');
      }
      
      const { name, nameEn, category, description } = data;
      const updateFields = [];
      const updateParams = [];
      
      if (name !== undefined && name !== tag.name) {
        // Check if new name already exists
        const existing = await findOne(
          'SELECT id FROM tags WHERE name = ? AND id != ?',
          [name, tag.id]
        );
        
        if (existing) {
          const error = new Error('Tag name already exists');
          error.statusCode = 400;
          error.code = 'ALREADY_EXISTS';
          throw error;
        }
        
        updateFields.push('name = ?');
        updateParams.push(name);
        
        // Update slug if name changed
        const newIdentifier = await generateUniqueSlug(name, 'tags', 'identifier', tag.id);
        updateFields.push('identifier = ?');
        updateParams.push(newIdentifier);
      }
      
      if (nameEn !== undefined) {
        updateFields.push('nameEn = ?');
        updateParams.push(nameEn);
      }
      
      if (category !== undefined) {
        updateFields.push('category = ?');
        updateParams.push(category);
      }
      
      if (description !== undefined) {
        updateFields.push('description = ?');
        updateParams.push(description);
      }
      
      if (updateFields.length > 0) {
        updateParams.push(tag.id);
        
        await query(
          `UPDATE tags SET ${updateFields.join(', ')} WHERE id = ?`,
          updateParams
        );
      }
      
      logger.info('Tag updated', { tagId: tag.id });
      
      return await this.getTag(tag.id);
    } catch (error) {
      logger.error('Error updating tag:', error);
      throw error;
    }
  }
  
  // Delete tag
  static async deleteTag(identifier) {
    return await transaction(async (connection) => {
      const tag = await findOne(
        'SELECT * FROM tags WHERE id = ? OR identifier = ?',
        [identifier, identifier]
      );
      
      if (!tag) {
        throw new Error('Tag not found');
      }
      
      // Check if tag is in use
      const [{ count }] = await connection.execute(
        'SELECT COUNT(*) as count FROM project_tags WHERE tag_id = ?',
        [tag.id]
      );
      
      if (count > 0) {
        throw new Error(`Tag is used by ${count} projects and cannot be deleted`);
      }
      
      // Delete tag
      await connection.execute('DELETE FROM tags WHERE id = ?', [tag.id]);
      
      logger.info('Tag deleted', { tagId: tag.id, name: tag.name });
      
      return { success: true };
    });
  }
  
  // Merge tags
  static async mergeTags(sourceId, targetId) {
    return await transaction(async (connection) => {
      // Verify both tags exist
      const source = await findOne('SELECT * FROM tags WHERE id = ?', [sourceId]);
      const target = await findOne('SELECT * FROM tags WHERE id = ?', [targetId]);
      
      if (!source || !target) {
        const error = new Error('Source or target tag not found');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
      }
      
      if (source.id === target.id) {
        const error = new Error('Cannot merge tag with itself');
        error.statusCode = 400;
        error.code = 'INVALID_REQUEST';
        throw error;
      }
      
      // Get projects using source tag
      const [sourceProjects] = await connection.execute(
        'SELECT project_id FROM project_tags WHERE tag_id = ?',
        [sourceId]
      );
      
      // Move projects to target tag (avoiding duplicates)
      for (const project of sourceProjects) {
        await connection.execute(
          'INSERT IGNORE INTO project_tags (project_id, tag_id) VALUES (?, ?)',
          [project.project_id, targetId]
        );
      }
      
      // Update usage count
      const [countResult] = await connection.execute(
        'SELECT COUNT(DISTINCT project_id) as newCount FROM project_tags WHERE tag_id = ?',
        [targetId]
      );
      
      await connection.execute(
        'UPDATE tags SET usageCount = ? WHERE id = ?',
        [countResult[0].newCount, targetId]
      );
      
      // Delete source tag
      await connection.execute('DELETE FROM project_tags WHERE tag_id = ?', [sourceId]);
      await connection.execute('DELETE FROM tags WHERE id = ?', [sourceId]);
      
      logger.info('Tags merged', { 
        sourceId, 
        targetId, 
        sourceName: source.name, 
        targetName: target.name 
      });
      
      return {
        success: true,
        mergedCount: sourceProjects.length
      };
    });
  }
  
  // Get popular tags
  static async getPopularTags(limit = 10) {
    try {
      const tags = await query(
        `SELECT 
          t.*,
          COUNT(DISTINCT pt.project_id) as project_count
         FROM tags t
         JOIN project_tags pt ON t.id = pt.tag_id
         JOIN projects p ON pt.project_id = p.id
         GROUP BY t.id
         HAVING project_count > 0
         ORDER BY project_count DESC, t.name
         LIMIT ?`,
        [limit]
      );
      
      return tags;
    } catch (error) {
      logger.error('Error fetching popular tags:', error);
      throw new Error('Failed to fetch popular tags');
    }
  }
  
  // Search tags
  static async searchTags(searchQuery) {
    try {
      const tags = await query(
        `SELECT 
          t.*,
          COUNT(pt.project_id) as project_count
         FROM tags t
         LEFT JOIN project_tags pt ON t.id = pt.tag_id
         WHERE t.name LIKE ?
         GROUP BY t.id
         ORDER BY 
           CASE WHEN t.name = ? THEN 1 ELSE 2 END,
           project_count DESC,
           t.name
         LIMIT 20`,
        [`%${searchQuery}%`, searchQuery]
      );
      
      return tags;
    } catch (error) {
      logger.error('Error searching tags:', error);
      throw new Error('Failed to search tags');
    }
  }
  
  // Update tag usage counts
  static async updateTagUsageCounts() {
    try {
      // Update all tag usage counts based on actual usage
      await query(
        `UPDATE tags t
         SET usageCount = (
           SELECT COUNT(DISTINCT pt.project_id)
           FROM project_tags pt
           JOIN projects p ON pt.project_id = p.id
           WHERE pt.tag_id = t.id
         )`
      );
      
      logger.info('Tag usage counts updated');
      
      return { success: true };
    } catch (error) {
      logger.error('Error updating tag usage counts:', error);
      throw new Error('Failed to update tag usage counts');
    }
  }
}

module.exports = TagService;