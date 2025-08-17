const { query, findOne, transaction } = require('../config/database');
const logger = require('../utils/logger');

class Project {
  // Get all projects with filters
  static async findAll(filters = {}, options = {}) {
    const {
      category,
      status,
      display_page,
      is_featured,
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
        p.title,
        p.subtitle,
        p.category,
        p.status,
        p.display_page,
        p.location,
        p.base_address,
        p.year,
        p.area,
        p.floor_plan_info,
        p.unit_count,
        p.display_order,
        p.is_featured,
        p.view_count,
        p.facebook_page,
        p.booking_phone,
        p.info_website,
        p.meta_title,
        p.meta_description,
        p.created_at,
        p.updated_at,
        u1.username as created_by_name,
        u2.username as updated_by_name,
        COUNT(DISTINCT pi.id) as image_count,
        GROUP_CONCAT(DISTINCT t.name) as tags,
        (SELECT file_path FROM project_images 
         WHERE project_uuid = p.uuid AND image_type = 'main' AND is_active = true 
         ORDER BY display_order LIMIT 1) as main_image_path,
        (SELECT thumbnails FROM project_images 
         WHERE project_uuid = p.uuid AND image_type = 'main' AND is_active = true 
         ORDER BY display_order LIMIT 1) as main_image_thumbnails
      FROM projects p
      LEFT JOIN users u1 ON p.created_by = u1.id
      LEFT JOIN users u2 ON p.updated_by = u2.id
      LEFT JOIN project_images pi ON p.uuid = pi.project_uuid AND pi.is_active = true
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

    if (display_page) {
      sql += ' AND p.display_page = ?';
      params.push(display_page);
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

    if (display_page) {
      countSql += ' AND p.display_page = ?';
      countParams.push(display_page);
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

    // Parse tags, features, and main image data
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

      // Parse main image thumbnails
      if (project.main_image_thumbnails && typeof project.main_image_thumbnails === 'string') {
        try {
          project.main_image_thumbnails = JSON.parse(project.main_image_thumbnails);
        } catch (e) {
          project.main_image_thumbnails = {};
        }
      }

      // Create main_image object for easier frontend access
      if (project.main_image_path) {
        project.main_image = {
          file_path: project.main_image_path,
          thumbnails: project.main_image_thumbnails || {}
        };
      }

      // Clean up temporary fields
      delete project.main_image_path;
      delete project.main_image_thumbnails;
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

  // Find project by identifier (UUID or slug)
  static async findByIdentifier(identifier) {
    const sql = `
      SELECT 
        p.*,
        u1.username as created_by_name,
        u2.username as updated_by_name
      FROM projects p
      LEFT JOIN users u1 ON p.created_by = u1.id
      LEFT JOIN users u2 ON p.updated_by = u2.id
      WHERE p.slug = ? OR p.uuid = ?
    `;

    const project = await findOne(sql, [identifier, identifier]);

    if (!project) return null;

    // Get images
    const images = await query(
      `SELECT * FROM project_images 
       WHERE project_uuid = ? AND is_active = true
       ORDER BY image_type, display_order, id`,
      [project.uuid]
    );

    // Get tags
    const tags = await query(
      `SELECT t.* FROM tags t
       JOIN project_tags pt ON t.id = pt.tag_id
       WHERE pt.project_uuid = ?`,
      [project.uuid]
    );

    // Parse JSON fields for images
    images.forEach(img => {
      if (img.dimensions && typeof img.dimensions === 'string') {
        try {
          img.dimensions = JSON.parse(img.dimensions);
        } catch (e) {
          img.dimensions = {};
        }
      }
      if (img.thumbnails && typeof img.thumbnails === 'string') {
        try {
          img.thumbnails = JSON.parse(img.thumbnails);
        } catch (e) {
          img.thumbnails = {};
        }
      }
    });

    // Parse JSON fields for project
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
        title,
        subtitle,
        category,
        status = 'planning',
        display_page,
        description,
        detail_content,
        location,
        base_address,
        year,
        area,
        floor_plan_info,
        unit_count,
        facebook_page,
        booking_phone,
        info_website,
        is_featured = false,
        display_order = 0,
        tags = []
      } = data;

      // Generate unique identifiers
      const uuid = require('crypto').randomUUID();
      const slug = `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

      // Insert project with database schema fields
      const [projectResult] = await connection.execute(
        `INSERT INTO projects (
          uuid, slug, title, subtitle, category, status, display_page, location, base_address, year, area,
          floor_plan_info, unit_count, display_order, view_count, is_active, is_featured,
          facebook_page, booking_phone, info_website, created_by, updated_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuid,
          slug,
          title,
          subtitle || null,
          category || null,
          status,
          display_page || null,
          location,
          base_address || null,
          year || null,
          area || null,
          floor_plan_info || null,
          unit_count || null,
          display_order || 0,
          0,
          true,
          is_featured ? 1 : 0,
          facebook_page || null,
          booking_phone || null,
          info_website || null,
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
        'SELECT id, uuid FROM projects WHERE slug = ? OR uuid = ?',
        [identifier, identifier]
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
        display_page,
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

      if (display_page !== undefined) {
        updateFields.push('display_page = ?');
        updateParams.push(display_page);
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
    const sql = 'DELETE FROM projects WHERE slug = ? OR uuid = ?';
    const result = await query(sql, [identifier, identifier]);

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
       WHERE slug = ? OR uuid = ?`,
      [status, userId, identifier, identifier]
    );

    if (result.affectedRows === 0) {
      throw new Error('Project not found');
    }

    return { success: true };
  }

  // Toggle featured status
  static async toggleFeatured(identifier, userId) {
    const project = await findOne(
      'SELECT id, is_featured as isFeatured FROM projects WHERE slug = ? OR uuid = ?',
      [identifier, identifier]
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
      'UPDATE projects SET view_count = view_count + 1 WHERE slug = ? OR uuid = ?',
      [identifier, identifier]
    );

    if (result.affectedRows === 0) {
      throw new Error('Project not found');
    }

    return { success: true };
  }
}

module.exports = Project;
