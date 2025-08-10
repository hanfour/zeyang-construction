const { query, findOne, transaction } = require('../config/database');
const logger = require('../utils/logger');

class Project {
  // Get all projects with filters
  static async findAll(filters = {}, options = {}) {
    const {
      type,
      status,
      isFeatured,
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
        p.identifier,
        p.name,
        p.nameEn,
        p.type,
        p.status,
        p.description,
        p.descriptionEn,
        p.location,
        p.locationEn,
        p.price,
        p.priceMin,
        p.priceMax,
        p.area,
        p.areaMin,
        p.areaMax,
        p.developer,
        p.developerEn,
        p.architect,
        p.architectEn,
        p.yearStarted,
        p.yearCompleted,
        p.units,
        p.floors,
        p.features,
        p.featuresEn,
        p.mainImage,
        p.videoUrl,
        p.website,
        p.brochureUrl,
        p.isFeatured,
        p.displayOrder,
        p.viewCount,
        p.created_at,
        p.updated_at,
        u1.username as created_by_name,
        u2.username as updated_by_name,
        COUNT(DISTINCT pi.id) as image_count,
        GROUP_CONCAT(DISTINCT t.name) as tags
      FROM projects p
      LEFT JOIN users u1 ON p.created_by = u1.id
      LEFT JOIN users u2 ON p.updated_by = u2.id
      LEFT JOIN project_images pi ON p.id = pi.project_id
      LEFT JOIN project_tags pt ON p.id = pt.project_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (type) {
      sql += ' AND p.type = ?';
      params.push(type);
    }
    
    if (status) {
      sql += ' AND p.status = ?';
      params.push(status);
    }
    
    if (isFeatured !== undefined) {
      sql += ' AND p.isFeatured = ?';
      params.push(isFeatured);
    }
    
    if (search) {
      sql += ' AND (p.name LIKE ? OR p.nameEn LIKE ? OR p.location LIKE ? OR p.description LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }
    
    sql += ' GROUP BY p.id';
    
    // Add ordering
    const validColumns = ['displayOrder', 'created_at', 'updated_at', 'viewCount', 'view_count', 'name'];
    const validDirs = ['ASC', 'DESC'];
    
    // Map snake_case to camelCase for database columns
    let orderColumn = orderBy;
    if (orderBy === 'view_count') {
      orderColumn = 'viewCount';
    }
    
    if (validColumns.includes(orderBy) && validDirs.includes(orderDir.toUpperCase())) {
      sql += ` ORDER BY p.${orderColumn} ${orderDir.toUpperCase()}`;
    } else {
      sql += ' ORDER BY p.displayOrder ASC';
    }
    
    // Add pagination
    const offset = (page - 1) * limit;
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    // Get total count
    let countSql = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM projects p
      WHERE 1=1
    `;
    
    const countParams = [];
    
    if (type) {
      countSql += ' AND p.type = ?';
      countParams.push(type);
    }
    
    if (status) {
      countSql += ' AND p.status = ?';
      countParams.push(status);
    }
    
    if (isFeatured !== undefined) {
      countSql += ' AND p.isFeatured = ?';
      countParams.push(isFeatured);
    }
    
    if (search) {
      countSql += ' AND (p.name LIKE ? OR p.nameEn LIKE ? OR p.location LIKE ? OR p.description LIKE ?)';
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
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
      WHERE p.identifier = ?
    `;
    
    const project = await findOne(sql, [identifier]);
    
    if (!project) return null;
    
    // Get images
    const images = await query(
      `SELECT * FROM project_images 
       WHERE project_id = ? 
       ORDER BY displayOrder`,
      [project.id]
    );
    
    // Get tags
    const tags = await query(
      `SELECT t.* FROM tags t
       JOIN project_tags pt ON t.id = pt.tag_id
       WHERE pt.project_id = ?`,
      [project.id]
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
        type,
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
        isFeatured = false,
        displayOrder = 0,
        tags = []
      } = data;
      
      // Generate unique identifier
      const identifier = `PRJ-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      
      // Insert project with default values for optional fields
      const [projectResult] = await connection.execute(
        `INSERT INTO projects (
          identifier, name, nameEn, type, status, description, descriptionEn,
          location, locationEn, price, priceMin, priceMax, area, areaMin, areaMax,
          developer, developerEn, architect, architectEn, yearStarted, yearCompleted,
          units, floors, features, featuresEn, mainImage, videoUrl, website,
          brochureUrl, isFeatured, displayOrder, viewCount, created_by, updated_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          identifier, 
          name, 
          nameEn || null,
          type, 
          status, 
          description || null,
          descriptionEn || null,
          location, 
          locationEn || null,
          price || null,
          priceMin || null,
          priceMax || null,
          area || null,
          areaMin || null,
          areaMax || null,
          developer || null,
          developerEn || null,
          architect || null,
          architectEn || null,
          yearStarted || null,
          yearCompleted || null,
          units || null,
          floors || null,
          JSON.stringify(features || []),
          JSON.stringify(featuresEn || []),
          mainImage || null,
          videoUrl || null,
          website || null,
          brochureUrl || null,
          isFeatured ? 1 : 0,
          displayOrder,
          0,
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
            // Create new tag with identifier
            const tagIdentifier = tagName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const [tagResult] = await connection.execute(
              'INSERT INTO tags (name, identifier) VALUES (?, ?)',
              [tagName, tagIdentifier]
            );
            tagId = tagResult.insertId;
          }
          
          // Create project-tag relation
          await connection.execute(
            'INSERT INTO project_tags (project_id, tag_id) VALUES (?, ?)',
            [projectId, tagId]
          );
        }
      }
      
      logger.info('Project created', { projectId, identifier, userId });
      
      return {
        id: projectId,
        identifier
      };
    });
  }
  
  // Update project
  static async update(identifier, data, userId) {
    return await transaction(async (connection) => {
      // Check if project exists
      const [existing] = await connection.execute(
        'SELECT id FROM projects WHERE identifier = ?',
        [identifier]
      );
      
      if (existing.length === 0) {
        throw new Error('Project not found');
      }
      
      const project = existing[0];
      const {
        name,
        nameEn,
        type,
        status,
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
        isFeatured,
        displayOrder,
        tags
      } = data;
      
      // Update main project info
      const updateFields = [];
      const updateParams = [];
      
      if (name !== undefined) {
        updateFields.push('name = ?');
        updateParams.push(name);
      }
      
      if (nameEn !== undefined) {
        updateFields.push('nameEn = ?');
        updateParams.push(nameEn);
      }
      
      if (type !== undefined) {
        updateFields.push('type = ?');
        updateParams.push(type);
      }
      
      if (status !== undefined) {
        updateFields.push('status = ?');
        updateParams.push(status);
      }
      
      if (description !== undefined) {
        updateFields.push('description = ?');
        updateParams.push(description);
      }
      
      if (descriptionEn !== undefined) {
        updateFields.push('descriptionEn = ?');
        updateParams.push(descriptionEn);
      }
      
      if (location !== undefined) {
        updateFields.push('location = ?');
        updateParams.push(location);
      }
      
      if (locationEn !== undefined) {
        updateFields.push('locationEn = ?');
        updateParams.push(locationEn);
      }
      
      if (price !== undefined) {
        updateFields.push('price = ?');
        updateParams.push(price);
      }
      
      if (priceMin !== undefined) {
        updateFields.push('priceMin = ?');
        updateParams.push(priceMin);
      }
      
      if (priceMax !== undefined) {
        updateFields.push('priceMax = ?');
        updateParams.push(priceMax);
      }
      
      if (area !== undefined) {
        updateFields.push('area = ?');
        updateParams.push(area);
      }
      
      if (areaMin !== undefined) {
        updateFields.push('areaMin = ?');
        updateParams.push(areaMin);
      }
      
      if (areaMax !== undefined) {
        updateFields.push('areaMax = ?');
        updateParams.push(areaMax);
      }
      
      if (developer !== undefined) {
        updateFields.push('developer = ?');
        updateParams.push(developer);
      }
      
      if (developerEn !== undefined) {
        updateFields.push('developerEn = ?');
        updateParams.push(developerEn);
      }
      
      if (architect !== undefined) {
        updateFields.push('architect = ?');
        updateParams.push(architect);
      }
      
      if (architectEn !== undefined) {
        updateFields.push('architectEn = ?');
        updateParams.push(architectEn);
      }
      
      if (yearStarted !== undefined) {
        updateFields.push('yearStarted = ?');
        updateParams.push(yearStarted);
      }
      
      if (yearCompleted !== undefined) {
        updateFields.push('yearCompleted = ?');
        updateParams.push(yearCompleted);
      }
      
      if (units !== undefined) {
        updateFields.push('units = ?');
        updateParams.push(units);
      }
      
      if (floors !== undefined) {
        updateFields.push('floors = ?');
        updateParams.push(floors);
      }
      
      if (features !== undefined) {
        updateFields.push('features = ?');
        updateParams.push(JSON.stringify(features));
      }
      
      if (featuresEn !== undefined) {
        updateFields.push('featuresEn = ?');
        updateParams.push(JSON.stringify(featuresEn));
      }
      
      if (mainImage !== undefined) {
        updateFields.push('mainImage = ?');
        updateParams.push(mainImage);
      }
      
      if (videoUrl !== undefined) {
        updateFields.push('videoUrl = ?');
        updateParams.push(videoUrl);
      }
      
      if (website !== undefined) {
        updateFields.push('website = ?');
        updateParams.push(website);
      }
      
      if (brochureUrl !== undefined) {
        updateFields.push('brochureUrl = ?');
        updateParams.push(brochureUrl);
      }
      
      if (isFeatured !== undefined) {
        updateFields.push('isFeatured = ?');
        updateParams.push(isFeatured);
      }
      
      if (displayOrder !== undefined) {
        updateFields.push('displayOrder = ?');
        updateParams.push(displayOrder);
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
          'DELETE FROM project_tags WHERE project_id = ?',
          [project.id]
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
            const [tagResult] = await connection.execute(
              'INSERT INTO tags (name) VALUES (?)',
              [tagName]
            );
            tagId = tagResult.insertId;
          }
          
          await connection.execute(
            'INSERT INTO project_tags (project_id, tag_id) VALUES (?, ?)',
            [project.id, tagId]
          );
        }
      }
      
      logger.info('Project updated', { projectId: project.id, userId });
      
      return { success: true };
    });
  }
  
  // Delete project
  static async delete(identifier) {
    const sql = 'DELETE FROM projects WHERE identifier = ?';
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
       WHERE identifier = ?`,
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
      'SELECT id, isFeatured FROM projects WHERE identifier = ?',
      [identifier]
    );
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    await query(
      'UPDATE projects SET isFeatured = ?, updated_by = ?, updated_at = NOW() WHERE id = ?',
      [!project.isFeatured, userId, project.id]
    );
    
    return { isFeatured: !project.isFeatured };
  }
  
  // Increment view count
  static async incrementViewCount(identifier) {
    const result = await query(
      'UPDATE projects SET viewCount = viewCount + 1 WHERE identifier = ?',
      [identifier]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Project not found');
    }
    
    return { success: true };
  }
}

module.exports = Project;