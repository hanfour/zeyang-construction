-- ZeYang Database Schema
-- Version: 1.0.0

SET FOREIGN_KEY_CHECKS = 0;

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','editor','viewer') DEFAULT 'viewer',
  `is_active` tinyint(1) DEFAULT '1',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Projects table
CREATE TABLE IF NOT EXISTS `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `identifier` varchar(100) NOT NULL,
  `name` varchar(200) NOT NULL,
  `nameEn` varchar(200) DEFAULT NULL,
  `type` enum('residential','commercial','mixed','other') NOT NULL,
  `status` enum('planning','in_progress','completed','on_hold') DEFAULT 'planning',
  `description` text,
  `descriptionEn` text,
  `location` varchar(200) DEFAULT NULL,
  `locationEn` varchar(200) DEFAULT NULL,
  `price` decimal(15,2) DEFAULT NULL,
  `priceMin` decimal(15,2) DEFAULT NULL,
  `priceMax` decimal(15,2) DEFAULT NULL,
  `area` decimal(10,2) DEFAULT NULL,
  `areaMin` decimal(10,2) DEFAULT NULL,
  `areaMax` decimal(10,2) DEFAULT NULL,
  `developer` varchar(200) DEFAULT NULL,
  `developerEn` varchar(200) DEFAULT NULL,
  `architect` varchar(200) DEFAULT NULL,
  `architectEn` varchar(200) DEFAULT NULL,
  `yearStarted` int DEFAULT NULL,
  `yearCompleted` int DEFAULT NULL,
  `units` int DEFAULT NULL,
  `floors` int DEFAULT NULL,
  `features` json DEFAULT NULL,
  `featuresEn` json DEFAULT NULL,
  `mainImage` varchar(500) DEFAULT NULL,
  `videoUrl` varchar(500) DEFAULT NULL,
  `website` varchar(500) DEFAULT NULL,
  `brochureUrl` varchar(500) DEFAULT NULL,
  `isFeatured` tinyint(1) DEFAULT '0',
  `displayOrder` int DEFAULT '0',
  `viewCount` int DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `identifier` (`identifier`),
  KEY `idx_type_status` (`type`,`status`),
  KEY `idx_featured` (`isFeatured`,`displayOrder`),
  KEY `idx_created_at` (`created_at`),
  KEY `fk_created_by` (`created_by`),
  KEY `fk_updated_by` (`updated_by`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `projects_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Project Images table
CREATE TABLE IF NOT EXISTS `project_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `filename` varchar(255) NOT NULL,
  `originalName` varchar(255) DEFAULT NULL,
  `path` varchar(500) NOT NULL,
  `url` varchar(500) NOT NULL,
  `thumbnailUrl` varchar(500) DEFAULT NULL,
  `mimeType` varchar(50) DEFAULT NULL,
  `size` int DEFAULT NULL,
  `width` int DEFAULT NULL,
  `height` int DEFAULT NULL,
  `alt` varchar(200) DEFAULT NULL,
  `altEn` varchar(200) DEFAULT NULL,
  `caption` varchar(500) DEFAULT NULL,
  `captionEn` varchar(500) DEFAULT NULL,
  `isMain` tinyint(1) DEFAULT '0',
  `displayOrder` int DEFAULT '0',
  `uploaded_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_project_main` (`project_id`,`isMain`),
  KEY `idx_display_order` (`project_id`,`displayOrder`),
  KEY `fk_uploaded_by` (`uploaded_by`),
  CONSTRAINT `project_images_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_images_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tags table
CREATE TABLE IF NOT EXISTS `tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `identifier` varchar(100) NOT NULL,
  `name` varchar(50) NOT NULL,
  `nameEn` varchar(50) DEFAULT NULL,
  `category` enum('style','feature','location','type','other') DEFAULT 'other',
  `description` text,
  `descriptionEn` text,
  `color` varchar(7) DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `usageCount` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `identifier` (`identifier`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_category` (`category`),
  KEY `idx_usage` (`usageCount` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Project Tags junction table
CREATE TABLE IF NOT EXISTS `project_tags` (
  `project_id` int NOT NULL,
  `tag_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`project_id`,`tag_id`),
  KEY `idx_tag_id` (`tag_id`),
  CONSTRAINT `project_tags_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contacts table
CREATE TABLE IF NOT EXISTS `contacts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `company` varchar(100) DEFAULT NULL,
  `subject` varchar(200) DEFAULT NULL,
  `message` text NOT NULL,
  `projectId` int DEFAULT NULL,
  `source` varchar(50) DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `userAgent` text,
  `isRead` tinyint(1) DEFAULT '0',
  `isReplied` tinyint(1) DEFAULT '0',
  `isStarred` tinyint(1) DEFAULT '0',
  `isSpam` tinyint(1) DEFAULT '0',
  `reply` text,
  `repliedAt` timestamp NULL DEFAULT NULL,
  `repliedBy` int DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_read_created` (`isRead`,`created_at` DESC),
  KEY `idx_email` (`email`),
  KEY `idx_created_at` (`created_at` DESC),
  KEY `fk_project_id` (`projectId`),
  KEY `fk_replied_by` (`repliedBy`),
  CONSTRAINT `contacts_ibfk_1` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `contacts_ibfk_2` FOREIGN KEY (`repliedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity Logs table
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int DEFAULT NULL,
  `details` json DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_action` (`user_id`,`action`),
  KEY `idx_entity` (`entity_type`,`entity_id`),
  KEY `idx_created_at` (`created_at` DESC),
  CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings table
CREATE TABLE IF NOT EXISTS `settings` (
  `key` varchar(100) NOT NULL,
  `value` text,
  `type` enum('string','number','boolean','json') DEFAULT 'string',
  `category` varchar(50) DEFAULT NULL,
  `description` text,
  `updated_by` int DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`),
  KEY `idx_category` (`category`),
  KEY `fk_updated_by` (`updated_by`),
  CONSTRAINT `settings_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- Insert default admin user (password: Admin123!)
INSERT IGNORE INTO `users` (`username`, `email`, `password`, `role`) 
VALUES ('admin', 'admin@ZeYang.com', '$2a$10$YourHashedPasswordHere', 'admin');

-- Insert default settings
INSERT IGNORE INTO `settings` (`key`, `value`, `type`, `category`) VALUES
('site_name', 'ZeYang', 'string', 'general'),
('items_per_page', '20', 'number', 'general'),
('enable_registration', 'true', 'boolean', 'auth'),
('max_upload_size', '268435456', 'number', 'upload');