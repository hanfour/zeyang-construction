const { query } = require('../config/database');

class SimpleProject {
  static async findAll() {
    const sql = `
      SELECT 
        id,
        uuid,
        slug,
        title,
        subtitle,
        category,
        status,
        location,
        is_featured,
        view_count
      FROM projects
      WHERE is_active = 1
      ORDER BY display_order ASC, id DESC
    `;
    
    const projects = await query(sql);
    
    return {
      items: projects,
      pagination: {
        total: projects.length,
        page: 1,
        limit: 20,
        pages: 1,
        hasNext: false,
        hasPrev: false
      }
    };
  }
}

module.exports = SimpleProject;