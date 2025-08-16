-- ZeYang Database Initialization Script
-- Version: 1.0.0
-- Date: 2024-01-20

-- Create database
CREATE DATABASE IF NOT EXISTS estatehub_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE estatehub_db;

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('admin', 'editor', 'viewer') DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Projects table
CREATE TABLE IF NOT EXISTS projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    subtitle VARCHAR(200),
    category ENUM('住宅', '商辦', '公共工程', '其他'),
    status ENUM('planning', 'pre_sale', 'on_sale', 'sold_out', 'completed') DEFAULT 'planning',
    display_page ENUM('開發專區', '澤暘作品'),
    location VARCHAR(200) NOT NULL,
    year INT,
    area VARCHAR(100),
    price_range VARCHAR(100),
    display_order INT DEFAULT 0,
    view_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    meta_title VARCHAR(200),
    meta_description TEXT,
    created_by INT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    INDEX idx_slug (slug),
    INDEX idx_category_status (category, status),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Project details table
CREATE TABLE IF NOT EXISTS project_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_uuid VARCHAR(36) NOT NULL,
    description TEXT,
    detail_content TEXT,
    features JSON,
    specifications JSON,
    floor_plans JSON,
    nearby_facilities JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_uuid) REFERENCES projects(uuid) ON DELETE CASCADE,
    UNIQUE KEY unique_project (project_uuid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Project images table
CREATE TABLE IF NOT EXISTS project_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_uuid VARCHAR(36) NOT NULL,
    image_type ENUM('main', 'gallery', 'floor_plan', 'location', 'vr') DEFAULT 'gallery',
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(50),
    dimensions JSON,
    thumbnails JSON,
    alt_text VARCHAR(255),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_uuid) REFERENCES projects(uuid) ON DELETE CASCADE,
    INDEX idx_project_type (project_uuid, image_type),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tags table
CREATE TABLE IF NOT EXISTS tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Project tags relation table
CREATE TABLE IF NOT EXISTS project_tags (
    project_uuid VARCHAR(36) NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (project_uuid, tag_id),
    FOREIGN KEY (project_uuid) REFERENCES projects(uuid) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(100),
    subject VARCHAR(200),
    message TEXT NOT NULL,
    source VARCHAR(50),
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_by INT,
    read_at TIMESTAMP NULL,
    is_replied BOOLEAN DEFAULT FALSE,
    replied_by INT,
    replied_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (read_by) REFERENCES users(id),
    FOREIGN KEY (replied_by) REFERENCES users(id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. API keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id INT PRIMARY KEY AUTO_INCREMENT,
    key_value VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSON,
    rate_limit INT DEFAULT 1000,
    allowed_ips JSON,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NULL,
    last_used_at TIMESTAMP NULL,
    usage_count INT DEFAULT 0,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_key_value (key_value),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. System logs table
CREATE TABLE IF NOT EXISTS system_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    level ENUM('error', 'warn', 'info', 'debug') DEFAULT 'info',
    category VARCHAR(50),
    message TEXT,
    context JSON,
    user_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_level_category (level, category),
    INDEX idx_created_at (created_at),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Project statistics table
CREATE TABLE IF NOT EXISTS project_statistics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_uuid VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    view_count INT DEFAULT 0,
    unique_visitors INT DEFAULT 0,
    contact_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_uuid) REFERENCES projects(uuid) ON DELETE CASCADE,
    UNIQUE KEY unique_project_date (project_uuid, date),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: Admin@123)
-- Note: This is the bcrypt hash for 'Admin@123'
INSERT INTO users (username, password, email, role) VALUES 
('admin', '$2a$10$Vxh2r7J5xYZu6.BmQBwJqOm0KxdKLJv.gYNnF8.iLqxZ8Kv0YXMK6', 'admin@ZeYang.com', 'admin');

-- Insert sample tags
INSERT INTO tags (name, slug) VALUES 
('豪華', 'luxury'),
('環保', 'eco-friendly'),
('交通便利', 'convenient-transport'),
('學區房', 'school-district'),
('投資首選', 'investment-choice');

-- Create views for common queries
CREATE OR REPLACE VIEW v_active_projects AS
SELECT 
    p.*,
    pd.description,
    pd.features,
    COUNT(DISTINCT pi.id) as image_count,
    GROUP_CONCAT(DISTINCT t.name) as tags
FROM projects p
LEFT JOIN project_details pd ON p.uuid = pd.project_uuid
LEFT JOIN project_images pi ON p.uuid = pi.project_uuid AND pi.is_active = TRUE
LEFT JOIN project_tags pt ON p.uuid = pt.project_uuid
LEFT JOIN tags t ON pt.tag_id = t.id
WHERE p.is_active = TRUE
GROUP BY p.id;

-- Create stored procedures
DELIMITER //

-- Procedure to increment project view count
CREATE PROCEDURE sp_increment_project_views(IN p_uuid VARCHAR(36))
BEGIN
    UPDATE projects SET view_count = view_count + 1 WHERE uuid = p_uuid;
    
    INSERT INTO project_statistics (project_uuid, date, view_count)
    VALUES (p_uuid, CURDATE(), 1)
    ON DUPLICATE KEY UPDATE view_count = view_count + 1;
END//

-- Procedure to get project statistics
CREATE PROCEDURE sp_get_project_stats(IN p_uuid VARCHAR(36), IN days INT)
BEGIN
    SELECT 
        date,
        view_count,
        unique_visitors,
        contact_count
    FROM project_statistics
    WHERE project_uuid = p_uuid 
    AND date >= DATE_SUB(CURDATE(), INTERVAL days DAY)
    ORDER BY date DESC;
END//

DELIMITER ;

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ZeYang_db.* TO 'ZeYang'@'localhost';
-- FLUSH PRIVILEGES;