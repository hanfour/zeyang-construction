const { query, findOne, transaction } = require('../config/database');
const logger = require('../utils/logger');

class Project {
  // Get all projects with filters
  static async findAll(filters = {}, options = {}) {
    const {
      type: category,
      status,
      isFeatured: is_featured,
      search
    } = filters;
    
    const {
      page = 1,
      limit = 20,
      orderBy = 'displayOrder',
      orderDir = 'ASC'
    } = options;
    
    let sql = `
      SELECT 
        p.id,
        p.uuid,
        p.slug,
        p.title as name,
        p.subtitle as nameEn,
        p.category as type,
        p.status,
        p.location,
        p.year,
        p.area,
        p.is_featured as isFeatured,
        p.view_count as viewCount,
        p.created_at,
        p.updated_at,
        u1.username as created_by_name,
        u2.username as updated_by_name,
        COUNT(DISTINCT pi.id) as image_count,
        GROUP_CONCAT(DISTINCT t.name) as tags
      FROM projects p
      LEFT JOIN users u1 ON p.created_by = u1.id
      LEFT JOIN users u2 ON p.updated_by = u2.id
      LEFT JOIN project_images pi ON p.uuid = pi.project_uuid
      LEFT JOIN project_tags pt ON p.uuid = pt.project_uuid
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (category) {
      sql += ' AND p.category = ?';
      params.push(category);
    }
    
    if (status) {
      sql += ' AND p.status = ?';
      params.push(status);
    }
    
    if (is_featured !== undefined) {
      sql += ' AND p.is_featured = ?';
      params.push(is_featured);
    }
    
    if (search) {
      sql += ' AND (p.title LIKE ? OR p.subtitle LIKE ? OR p.location LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    sql += ' GROUP BY p.id';
    
    // Add ordering
    const validColumns = ['created_at', 'updated_at', 'view_count', 'title', 'id'];
    const validDirs = ['ASC', 'DESC'];
    
    if (validColumns.includes(orderBy) && validDirs.includes(orderDir.toUpperCase())) {
      sql += ` ORDER BY p.${orderBy} ${orderDir.toUpperCase()}`;
    } else {
      sql += ' ORDER BY p.created_at DESC';
    }
    
    // Add pagination
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));
    const offsetNum = Math.max(0, (parseInt(page) - 1) * limitNum);
    sql += ` LIMIT ${limitNum} OFFSET ${offsetNum}`;
    
    // Get total count
    let countSql = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM projects p
      WHERE 1=1
    `;
    
    const countParams = [];
    
    if (category) {
      countSql += ' AND p.category = ?';
      countParams.push(category);
    }
    
    if (status) {
      countSql += ' AND p.status = ?';
      countParams.push(status);
    }
    
    if (is_featured !== undefined) {
      countSql += ' AND p.is_featured = ?';
      countParams.push(is_featured);
    }
    
    if (search) {
      countSql += ' AND (p.title LIKE ? OR p.subtitle LIKE ? OR p.location LIKE ?)';
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern);
    }
    
    const [{ total }] = await query(countSql, countParams);
    const projects = await query(sql, params);
    
    // Parse tags and features
    projects.forEach(project => {
      project.tags = project.tags ? project.tags.split(',') : [];
      if (project.features) {
        try {
          project.features = JSON.parse(project.features);
        } catch (e) {
          project.features = [];
        }
      }
      if (project.featuresEn) {
        try {
          project.featuresEn = JSON.parse(project.featuresEn);
        } catch (e) {
          project.featuresEn = [];
        }
      }
    });
    
    return {
      items: projects,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }
  
  // Find project by identifier
  static async findByIdentifier(identifier) {
    const sql = `
      SELECT 
        p.*,
        u1.username as created_by_name,
        u2.username as updated_by_name
      FROM projects p
      LEFT JOIN users u1 ON p.created_by = u1.id
      LEFT JOIN users u2 ON p.updated_by = u2.id
      WHERE p.slug = ?
    `;
    
    const project = await findOne(sql, [identifier]);
    
    if (!project) return null;
    
    // Get images
    const images = await query(
      `SELECT * FROM project_images 
       WHERE project_uuid = ? 
       ORDER BY id`,
      [project.uuid]
    );
    
    // Get tags
    const tags = await query(
      `SELECT t.* FROM tags t
       JOIN project_tags pt ON t.id = pt.tag_id
       WHERE pt.project_uuid = ?`,
      [project.uuid]
    );
    
    // Parse JSON fields
    if (project.features) {
      try {
        project.features = JSON.parse(project.features);
      } catch (e) {
        project.features = [];
      }
    }
    if (project.featuresEn) {
      try {
        project.featuresEn = JSON.parse(project.featuresEn);
      } catch (e) {
        project.featuresEn = [];
      }
    }
    
    return {
      ...project,
      images,
      tags
    };
  }
  
  // Create new project
  static async create(data, userId) {
    return await transaction(async (connection) => {
      const {
        name,
        nameEn,
        type: category,
        status = 'planning',
        description,
        descriptionEn,
        location,
        locationEn,
        price,
        priceMin,
        priceMax,
        area,
        areaMin,
        areaMax,
        developer,
        developerEn,
        architect,
        architectEn,
        yearStarted,
        yearCompleted,
        units,
        floors,
        features,
        featuresEn,
        mainImage,
        videoUrl,
        website,
        brochureUrl,
        isFeatured: is_featured = false,
        displayOrder = 0,
        tags = []
      } = data;
      
      // Generate unique identifiers
      const uuid = require('crypto').randomUUID();
      const slug = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      
      // Insert project with database schema fields
      const [projectResult] = await connection.execute(
        `INSERT INTO projects (
          uuid, slug, title, subtitle, category, status, location, year, area,
          view_count, is_active, is_featured, created_by, updated_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuid,
          slug,
          name,
          nameEn || null,
          category,
          status,
          location,
          yearStarted || null,
          area || null,
          0,
          true,
          is_featured ? 1 : 0,
          userId,
          userId
        ]
      );
      
      const projectId = projectResult.insertId;
      
      // Handle tags
      if (tags.length > 0) {
        for (const tagName of tags) {
          const [existingTag] = await connection.execute(
            'SELECT id FROM tags WHERE name = ?',
            [tagName]
          );
          
          let tagId;
          if (existingTag.length > 0) {
            tagId = existingTag[0].id;
          } else {
            // Create new tag
            const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const [tagResult] = await connection.execute(
              'INSERT INTO tags (name, slug) VALUES (?, ?)',
              [tagName, tagSlug]
            );
            tagId = tagResult.insertId;
          }
          
          // Create project-tag relation
          await connection.execute(
            'INSERT INTO project_tags (project_uuid, tag_id) VALUES (?, ?)',
            [uuid, tagId]
          );
        }
      }
      
      logger.info('Project created', { projectId, uuid, slug, userId });
      
      return {
        id: projectId,
        uuid,
        slug
      };
    });
  }
  
  // Update project
  static async update(identifier, data, userId) {
    return await transaction(async (connection) => {
      // Check if project exists
      const [existing] = await connection.execute(
        'SELECT id, uuid FROM projects WHERE slug = ?',
        [identifier]
      );
      
      if (existing.length === 0) {
        throw new Error('Project not found');
      }
      
      const project = existing[0];
      const {
        name: title,
        nameEn: subtitle,
        type: category,
        status,
        location,
        year,
        area,
        isFeatured: is_featured,
        tags
      } = data;
      
      // Update main project info
      const updateFields = [];
      const updateParams = [];
      
      if (title !== undefined) {
        updateFields.push('title = ?');
        updateParams.push(title);
      }
      
      if (subtitle !== undefined) {
        updateFields.push('subtitle = ?');
        updateParams.push(subtitle);
      }
      
      if (category !== undefined) {
        updateFields.push('category = ?');
        updateParams.push(category);
      }
      
      if (status !== undefined) {
        updateFields.push('status = ?');
        updateParams.push(status);
      }
      
      if (location !== undefined) {
        updateFields.push('location = ?');
        updateParams.push(location);
      }
      
      if (year !== undefined) {
        updateFields.push('year = ?');
        updateParams.push(year);
      }
      
      if (area !== undefined) {
        updateFields.push('area = ?');
        updateParams.push(area);
      }
      
      if (is_featured !== undefined) {
        updateFields.push('is_featured = ?');
        updateParams.push(is_featured);
      }
      
      if (updateFields.length > 0) {
        updateFields.push('updated_by = ?', 'updated_at = NOW()');
        updateParams.push(userId, project.id);
        
        await connection.execute(
          `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ?`,
          updateParams
        );
      }
      
      // Update tags if provided
      if (tags !== undefined) {
        // Remove existing tags
        await connection.execute(
          'DELETE FROM project_tags WHERE project_uuid = ?',
          [project.uuid]
        );
        
        // Add new tags
        for (const tagName of tags) {
          const [existingTag] = await connection.execute(
            'SELECT id FROM tags WHERE name = ?',
            [tagName]
          );
          
          let tagId;
          if (existingTag.length > 0) {
            tagId = existingTag[0].id;
          } else {
            const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const [tagResult] = await connection.execute(
              'INSERT INTO tags (name, slug) VALUES (?, ?)',
              [tagName, tagSlug]
            );
            tagId = tagResult.insertId;
          }
          
          await connection.execute(
            'INSERT INTO project_tags (project_uuid, tag_id) VALUES (?, ?)',
            [project.uuid, tagId]
          );
        }
      }
      
      logger.info('Project updated', { projectId: project.id, userId });
      
      return { success: true };
    });
  }
  
  // Delete project
  static async delete(identifier) {
    const sql = 'DELETE FROM projects WHERE slug = ?';
    const result = await query(sql, [identifier]);
    
    if (result.affectedRows === 0) {
      throw new Error('Project not found');
    }
    
    logger.info('Project deleted', { identifier });
    
    return { success: true };
  }
  
  // Update project status
  static async updateStatus(identifier, status, userId) {
    const result = await query(
      `UPDATE projects SET status = ?, updated_by = ?, updated_at = NOW() 
       WHERE slug = ?`,
      [status, userId, identifier]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Project not found');
    }
    
    return { success: true };
  }
  
  // Toggle featured status
  static async toggleFeatured(identifier, userId) {
    const project = await findOne(
      'SELECT id, is_featured as isFeatured FROM projects WHERE slug = ?',
      [identifier]
    );
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    await query(
      'UPDATE projects SET is_featured = ?, updated_by = ?, updated_at = NOW() WHERE id = ?',
      [!project.isFeatured, userId, project.id]
    );
    
    return { isFeatured: !project.isFeatured };
  }
  
  // Increment view count
  static async incrementViewCount(identifier) {
    const result = await query(
      'UPDATE projects SET view_count = view_count + 1 WHERE slug = ?',
      [identifier]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Project not found');
    }
    
    return { success: true };
  }
}

module.exports = Project;