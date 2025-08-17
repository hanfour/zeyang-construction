/**
 * Mock database for testing when MySQL is not available
 */

// In-memory storage
const storage = {
  users: [],
  projects: [],
  project_images: [],
  project_tags: [],
  tags: [],
  contacts: [],
  settings: []
};

// Initialize some default data for testing
const initializeTestData = () => {
  // Add default admin user if not exists
  if (storage.users.length === 0) {
    storage.users.push({
      id: 1,
      username: 'testadmin',
      email: 'test@ZeYang.com',
      password: '$2a$10$YourHashedPasswordHere',
      role: 'admin',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    storage.users.push({
      id: 2,
      username: 'testeditor',
      email: 'editor@ZeYang.com',
      password: '$2a$10$YourHashedPasswordHere',
      role: 'editor',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  // Add default settings if not exists
  if (storage.settings.length === 0) {
    storage.settings.push(
      { key: 'site_name', value: 'ZeYang', type: 'string', category: 'general' },
      { key: 'items_per_page', value: '20', type: 'number', category: 'general' },
      { key: 'enable_registration', value: 'true', type: 'boolean', category: 'auth' },
      { key: 'max_upload_size', value: '268435456', type: 'number', category: 'upload' },
      { key: 'smtp_enabled', value: 'false', type: 'boolean', category: 'email' },
      { key: 'smtp_host', value: '', type: 'string', category: 'email' },
      { key: 'smtp_port', value: '587', type: 'number', category: 'email' },
      { key: 'smtp_from_email', value: '', type: 'string', category: 'email' },
      { key: 'admin_notification_emails', value: '', type: 'string', category: 'email' }
    );
  }
};

// Initialize test data
initializeTestData();

// Mock pool
const mockPool = {
  getConnection: async () => ({
    execute: mockExecute,
    release: () => {}
  }),
  execute: mockExecute,
  end: async () => {}
};

// Mock execute function
async function mockExecute(sql, params = []) {
  // Parse SQL to determine operation
  const sqlLower = sql.toLowerCase().trim();

  if (sqlLower.startsWith('select')) {
    return handleSelect(sql, params);
  } else if (sqlLower.startsWith('insert')) {
    return handleInsert(sql, params);
  } else if (sqlLower.startsWith('update')) {
    return handleUpdate(sql, params);
  } else if (sqlLower.startsWith('delete')) {
    return handleDelete(sql, params);
  } else if (sqlLower.includes('set foreign_key_checks')) {
    return [[]];
  }

  return [[]];
}

function handleSelect(sql, params) {
  const sqlLower = sql.toLowerCase();

  // Handle COUNT queries
  if (sqlLower.includes('count(')) {
    if (sqlLower.includes('from projects')) {
      return [[{ total: storage.projects.length }]];
    }
    if (sqlLower.includes('from users')) {
      return [[{ total: storage.users.length }]];
    }
    if (sqlLower.includes('from contacts')) {
      return [[{ total: storage.contacts.length }]];
    }
    if (sqlLower.includes('from tags')) {
      return [[{ total: storage.tags.length }]];
    }
    return [[{ total: 0 }]];
  }

  // Handle system queries
  if (sqlLower.includes('select version()')) {
    return [[{ 'VERSION()': '8.0.0' }]];
  }

  if (sqlLower.includes('select database()')) {
    return [[{ 'DATABASE()': 'ZeYang_test' }]];
  }

  // Handle project queries
  if (sqlLower.includes('from projects')) {
    let results = [...storage.projects];

    // Apply WHERE conditions
    if (sqlLower.includes('where')) {
      if (sqlLower.includes('identifier = ?')) {
        results = results.filter(p => p.identifier === params[0]);
      }
      if (sqlLower.includes('id = ?')) {
        const idParam = params.find(p => typeof p === 'number');
        if (idParam) {
          results = results.filter(p => p.id === idParam);
        }
      }
      if (sqlLower.includes('type = ?')) {
        const typeIndex = params.findIndex((p, i) => ['residential', 'commercial', 'mixed', 'other'].includes(p));
        if (typeIndex >= 0) {
          results = results.filter(p => p.type === params[typeIndex]);
        }
      }
      if (sqlLower.includes('isfeatured = ?')) {
        const featuredIndex = params.findIndex(p => p === true || p === 1);
        if (featuredIndex >= 0) {
          results = results.filter(p => p.isFeatured === 1);
        }
      }
      if (sqlLower.includes('status = ?')) {
        const statusIndex = params.findIndex(p => ['planning', 'in_progress', 'completed', 'on_hold'].includes(p));
        if (statusIndex >= 0) {
          results = results.filter(p => p.status === params[statusIndex]);
        }
      }
    }

    // Handle search queries
    if (sqlLower.includes('like ?')) {
      const searchIndex = params.findIndex(p => typeof p === 'string' && p.includes('%'));
      if (searchIndex >= 0) {
        const searchTerm = params[searchIndex].replace(/%/g, '');
        results = results.filter(p =>
          (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (p.location && p.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
    }

    // Apply ORDER BY
    if (sqlLower.includes('order by')) {
      if (sqlLower.includes('displayorder')) {
        results.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      }
      if (sqlLower.includes('created_at desc')) {
        results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
    }

    // Apply LIMIT and OFFSET
    if (sqlLower.includes('limit')) {
      const limitMatch = sqlLower.match(/limit\s+(\d+)/);
      const offsetMatch = sqlLower.match(/offset\s+(\d+)/);

      if (limitMatch) {
        const limit = parseInt(limitMatch[1]);
        const offset = offsetMatch ? parseInt(offsetMatch[1]) : 0;
        results = results.slice(offset, offset + limit);
      }
    }

    return [results];
  }

  // Handle user queries
  if (sqlLower.includes('from users')) {
    let results = [...storage.users];

    if (sqlLower.includes('where username = ?') && !sqlLower.includes('or email')) {
      results = results.filter(u => u.username === params[0]);
    } else if (sqlLower.includes('where (username = ? or email = ?)')) {
      const loginIdentifier = params[0];
      results = results.filter(u => u.username === loginIdentifier || u.email === loginIdentifier);
    } else if (sqlLower.includes('where email = ?')) {
      results = results.filter(u => u.email === params[0]);
    }

    if (sqlLower.includes('and is_active = true') || sqlLower.includes('and is_active = 1')) {
      results = results.filter(u => u.is_active === 1 || u.is_active === true);
    } else if (sqlLower.includes('where') && sqlLower.includes('is_active')) {
      // Handle direct is_active check
      const isActiveValue = params.find(p => p === 1 || p === true || p === 0 || p === false);
      if (isActiveValue !== undefined) {
        results = results.filter(u => u.is_active === isActiveValue);
      }
    }

    return [results];
  }

  // Handle project_images queries
  if (sqlLower.includes('from project_images')) {
    let results = [...storage.project_images];

    if (sqlLower.includes('where project_id = ?')) {
      results = results.filter(i => i.project_id === params[0]);
    }

    return [results];
  }

  // Handle tags queries
  if (sqlLower.includes('from tags')) {
    let results = [...storage.tags];

    if (sqlLower.includes('where id = ?')) {
      results = results.filter(t => t.id === params[0]);
    }

    if (sqlLower.includes('where identifier = ?')) {
      results = results.filter(t => t.identifier === params[0]);
    }

    if (sqlLower.includes('where name = ?')) {
      results = results.filter(t => t.name === params[0]);
    }

    // Apply ORDER BY
    if (sqlLower.includes('order by')) {
      if (sqlLower.includes('created_at desc')) {
        results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
    }

    // Apply LIMIT
    if (sqlLower.includes('limit')) {
      const limitMatch = sqlLower.match(/limit\s+(\d+)/);
      if (limitMatch) {
        const limit = parseInt(limitMatch[1]);
        results = results.slice(0, limit);
      }
    }

    return [results];
  }

  // Handle contacts queries
  if (sqlLower.includes('from contacts')) {
    let results = [...storage.contacts];

    if (sqlLower.includes('where id = ?')) {
      results = results.filter(c => c.id === params[0]);
    }

    if (sqlLower.includes('is_read = ?')) {
      const isRead = params.find(p => p === 0 || p === 1);
      if (isRead !== undefined) {
        results = results.filter(c => c.is_read === isRead);
      }
    }

    // Apply ORDER BY
    if (sqlLower.includes('order by created_at desc')) {
      results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    // Apply LIMIT and OFFSET
    if (sqlLower.includes('limit')) {
      const limitMatch = sqlLower.match(/limit\s+(\d+)/);
      const offsetMatch = sqlLower.match(/offset\s+(\d+)/);

      if (limitMatch) {
        const limit = parseInt(limitMatch[1]);
        const offset = offsetMatch ? parseInt(offsetMatch[1]) : 0;
        results = results.slice(offset, offset + limit);
      }
    }

    return [results];
  }

  // Handle settings queries
  if (sqlLower.includes('from settings')) {
    let results = [...storage.settings];

    if (sqlLower.includes('where `key` = ?')) {
      results = results.filter(s => s.key === params[0]);
    }

    if (sqlLower.includes('where category = ?')) {
      results = results.filter(s => s.category === params[0]);
    }

    return [results];
  }

  return [[]];
}

function handleInsert(sql, params) {
  const sqlLower = sql.toLowerCase();

  if (sqlLower.includes('into projects')) {
    const project = {
      id: storage.projects.length + 1,
      identifier: params[0],
      name: params[1],
      nameEn: params[2],
      type: params[3],
      status: params[4],
      description: params[5],
      descriptionEn: params[6],
      location: params[7],
      locationEn: params[8],
      price: params[9],
      priceMin: params[10],
      priceMax: params[11],
      area: params[12],
      areaMin: params[13],
      areaMax: params[14],
      developer: params[15],
      developerEn: params[16],
      architect: params[17],
      architectEn: params[18],
      yearStarted: params[19],
      yearCompleted: params[20],
      units: params[21],
      floors: params[22],
      features: params[23],
      featuresEn: params[24],
      mainImage: params[25],
      videoUrl: params[26],
      website: params[27],
      brochureUrl: params[28],
      isFeatured: params[29],
      displayOrder: params[30],
      viewCount: params[31],
      created_by: params[32],
      updated_by: params[33],
      created_at: new Date(),
      updated_at: new Date()
    };

    storage.projects.push(project);

    return [{
      insertId: project.id,
      affectedRows: 1
    }, [project]];
  }

  if (sqlLower.includes('into users')) {
    const user = {
      id: storage.users.length + 1,
      username: params[0],
      email: params[1],
      password: params[2],
      role: params[3],
      is_active: 1,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Handle INSERT IGNORE
    if (sqlLower.includes('ignore')) {
      const existing = storage.users.find(u => u.username === user.username || u.email === user.email);
      if (existing) {
        return [{ insertId: existing.id, affectedRows: 0 }];
      }
    }

    storage.users.push(user);

    return [{
      insertId: user.id,
      affectedRows: 1
    }];
  }

  if (sqlLower.includes('into tags')) {
    const tag = {
      id: storage.tags.length + 1,
      identifier: params[0],
      name: params[1],
      nameEn: params[2],
      category: params[3],
      description: params[4],
      created_at: new Date(),
      updated_at: new Date()
    };

    storage.tags.push(tag);

    return [{
      insertId: tag.id,
      affectedRows: 1
    }];
  }

  if (sqlLower.includes('into project_tags')) {
    const projectTag = {
      project_id: params[0],
      tag_id: params[1]
    };

    storage.project_tags.push(projectTag);

    return [{
      affectedRows: 1
    }];
  }

  if (sqlLower.includes('into contacts')) {
    const contact = {
      id: storage.contacts.length + 1,
      name: params[0],
      email: params[1],
      phone: params[2] || null,
      company: params[3] || null,
      subject: params[4] || null,
      message: params[5],
      source: params[6] || 'website',
      is_read: false,
      is_replied: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    storage.contacts.push(contact);

    return [{
      insertId: contact.id,
      affectedRows: 1
    }];
  }

  if (sqlLower.includes('into settings')) {
    const setting = {
      key: params[0],
      value: params[1],
      type: params[2] || 'string',
      category: params[3] || null,
      description: params[4] || null,
      updated_at: new Date().toISOString()
    };

    storage.settings.push(setting);

    return [{
      affectedRows: 1
    }];
  }

  if (sqlLower.includes('into users')) {
    const user = {
      id: storage.users.length + 1,
      username: params[0],
      email: params[1],
      password: params[2],
      role: params[3] || 'user',
      is_active: params[4] !== undefined ? params[4] : 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: null
    };

    storage.users.push(user);

    return [{
      insertId: user.id,
      affectedRows: 1
    }];
  }

  return [{ insertId: 1, affectedRows: 1 }];
}

function handleUpdate(sql, params) {
  const sqlLower = sql.toLowerCase();

  if (sqlLower.includes('projects set')) {
    // Find project by identifier
    const whereMatch = sqlLower.match(/where\s+identifier\s*=\s*\?/);
    if (whereMatch) {
      const identifier = params[params.length - 1];
      const project = storage.projects.find(p => p.identifier === identifier);

      if (project) {
        // Update fields based on SET clause
        if (sqlLower.includes('isfeatured')) {
          project.isFeatured = params[0];
        }
        if (sqlLower.includes('status')) {
          project.status = params[0];
        }
        project.updated_at = new Date();

        return [{ affectedRows: 1 }];
      }
    }
  }

  if (sqlLower.includes('contacts set')) {
    // Find contact by id
    const whereMatch = sqlLower.match(/where\s+id\s*=\s*\?/);
    if (whereMatch) {
      const id = params[params.length - 1];
      const contact = storage.contacts.find(c => c.id === id);

      if (contact) {
        // Update fields based on SET clause
        if (sqlLower.includes('is_read')) {
          contact.is_read = params[0];
        }
        if (sqlLower.includes('is_replied')) {
          contact.is_replied = params[0];
        }
        if (sqlLower.includes('notes')) {
          contact.notes = params[0];
        }
        contact.updated_at = new Date().toISOString();

        return [{ affectedRows: 1 }];
      }
    }
  }

  if (sqlLower.includes('settings set')) {
    // Find setting by key
    const whereMatch = sqlLower.match(/where\s+`?key`?\s*=\s*\?/);
    if (whereMatch) {
      const key = params[params.length - 1];
      const setting = storage.settings.find(s => s.key === key);

      if (setting) {
        // Update value
        if (sqlLower.includes('value')) {
          setting.value = params[0];
          setting.updated_at = new Date().toISOString();
        }

        return [{ affectedRows: 1 }];
      }
    }
  }

  if (sqlLower.includes('users set')) {
    // Update last login
    if (sqlLower.includes('last_login_at')) {
      const userId = params[params.length - 1];
      const user = storage.users.find(u => u.id === userId);
      if (user) {
        user.last_login_at = new Date();
        return [{ affectedRows: 1 }];
      }
    }
  }

  return [{ affectedRows: 0 }];
}

function handleDelete(sql, params) {
  const sqlLower = sql.toLowerCase();

  if (sqlLower.includes('from projects')) {
    const initialLength = storage.projects.length;

    if (sqlLower.includes('where identifier = ?')) {
      storage.projects = storage.projects.filter(p => p.identifier !== params[0]);
    } else {
      storage.projects = [];
    }

    return [{ affectedRows: initialLength - storage.projects.length }];
  }

  if (sqlLower.includes('from project_images')) {
    storage.project_images = [];
    return [{ affectedRows: 1 }];
  }

  if (sqlLower.includes('from project_tags')) {
    storage.project_tags = [];
    return [{ affectedRows: 1 }];
  }

  if (sqlLower.includes('from tags')) {
    storage.tags = [];
    return [{ affectedRows: 1 }];
  }

  if (sqlLower.includes('from contacts')) {
    storage.contacts = [];
    return [{ affectedRows: 1 }];
  }

  if (sqlLower.includes('from users')) {
    // Keep test users when clearing database
    storage.users = storage.users.filter(u =>
      ['testadmin', 'testeditor', 'testviewer'].includes(u.username)
    );
    return [{ affectedRows: 1 }];
  }

  return [{ affectedRows: 0 }];
}

// Mock query function
async function mockQuery(sql, params) {
  const [result] = await mockExecute(sql, params);
  return result;
}

// Mock findOne function
async function mockFindOne(sql, params) {
  const result = await mockQuery(sql, params);
  return result[0] || null;
}

// Mock transaction function
async function mockTransaction(callback) {
  const connection = {
    execute: mockExecute,
    release: () => {}
  };

  try {
    return await callback(connection);
  } catch (error) {
    throw error;
  }
}

// Clear storage
function clearStorage() {
  storage.users = [];
  storage.projects = [];
  storage.project_images = [];
  storage.project_tags = [];
  storage.tags = [];
  storage.contacts = [];
}

// Initialize with default test users
function initializeTestUsers() {
  // Use pre-hashed password for testing (Test123!)
  const hashedPassword = '$2a$10$N9qo8uLOickgx2ZMRZoMye1qm8VJ5VK9K8QJzLjKLCEqAoONEK.2u';

  storage.users = [
    {
      id: 1,
      username: 'testadmin',
      email: 'testadmin@test.com',
      password: hashedPassword,
      role: 'admin',
      is_active: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: null
    },
    {
      id: 2,
      username: 'testeditor',
      email: 'testeditor@test.com',
      password: hashedPassword,
      role: 'editor',
      is_active: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: null
    },
    {
      id: 3,
      username: 'testviewer',
      email: 'testviewer@test.com',
      password: hashedPassword,
      role: 'viewer',
      is_active: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: null
    }
  ];
}

// Initialize on load
initializeTestUsers();

module.exports = {
  pool: mockPool,
  query: mockQuery,
  findOne: mockFindOne,
  transaction: mockTransaction,
  clearStorage,
  initializeTestUsers,
  storage
};
