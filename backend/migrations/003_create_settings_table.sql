-- Create settings table for dynamic configuration
-- Migration: 003_create_settings_table.sql

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

-- Insert default settings
INSERT IGNORE INTO `settings` (`key`, `value`, `type`, `category`, `description`) VALUES
('site_name', 'ZeYang', 'string', 'general', 'Website name'),
('items_per_page', '20', 'number', 'general', 'Default items per page'),
('enable_registration', 'true', 'boolean', 'auth', 'Allow user registration'),
('max_upload_size', '268435456', 'number', 'upload', 'Maximum file upload size in bytes');