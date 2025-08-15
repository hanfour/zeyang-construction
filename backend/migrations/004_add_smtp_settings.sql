-- Add SMTP settings for contact form email notifications
-- Migration: 004_add_smtp_settings.sql

-- Add SMTP configuration settings
INSERT IGNORE INTO `settings` (`key`, `value`, `type`, `category`, `description`) VALUES
('smtp_enabled', 'false', 'boolean', 'email', 'Enable SMTP email sending for contact forms'),
('smtp_host', '', 'string', 'email', 'SMTP server hostname'),
('smtp_port', '587', 'number', 'email', 'SMTP server port (usually 587 for TLS, 465 for SSL, 25 for unsecure)'),
('smtp_secure', 'true', 'boolean', 'email', 'Use secure connection (TLS/SSL)'),
('smtp_username', '', 'string', 'email', 'SMTP authentication username'),
('smtp_password', '', 'string', 'email', 'SMTP authentication password (encrypted)'),
('smtp_from_email', '', 'string', 'email', 'From email address for outgoing emails'),
('smtp_from_name', 'ZeYang', 'string', 'email', 'From name for outgoing emails'),
('admin_notification_emails', '', 'string', 'email', 'Comma-separated list of admin emails for contact form notifications'),
('send_admin_notifications', 'true', 'boolean', 'email', 'Send email notifications to admins when contact forms are submitted'),
('send_user_confirmations', 'true', 'boolean', 'email', 'Send confirmation emails to users when they submit contact forms');

-- Update contacts table to match the existing service expectations
-- Check and add missing columns that are used in the service but not in schema

-- Check if columns exist and add them if they don't
SET @exist_is_read = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE table_name = 'contacts' AND table_schema = 'ZeYang_db' AND column_name = 'is_read');
SET @exist_is_replied = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE table_name = 'contacts' AND table_schema = 'ZeYang_db' AND column_name = 'is_replied');
SET @exist_read_by = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE table_name = 'contacts' AND table_schema = 'ZeYang_db' AND column_name = 'read_by');
SET @exist_replied_by = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE table_name = 'contacts' AND table_schema = 'ZeYang_db' AND column_name = 'replied_by');
SET @exist_replied_at = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE table_name = 'contacts' AND table_schema = 'ZeYang_db' AND column_name = 'replied_at');

SET @sql1 = IF(@exist_is_read = 0, 'ALTER TABLE `contacts` ADD COLUMN `is_read` tinyint(1) DEFAULT 0;', 'SELECT "Column is_read already exists" AS result;');
SET @sql2 = IF(@exist_is_replied = 0, 'ALTER TABLE `contacts` ADD COLUMN `is_replied` tinyint(1) DEFAULT 0;', 'SELECT "Column is_replied already exists" AS result;');
SET @sql3 = IF(@exist_read_by = 0, 'ALTER TABLE `contacts` ADD COLUMN `read_by` int DEFAULT NULL;', 'SELECT "Column read_by already exists" AS result;');
SET @sql4 = IF(@exist_replied_by = 0, 'ALTER TABLE `contacts` ADD COLUMN `replied_by` int DEFAULT NULL;', 'SELECT "Column replied_by already exists" AS result;');
SET @sql5 = IF(@exist_replied_at = 0, 'ALTER TABLE `contacts` ADD COLUMN `replied_at` timestamp NULL DEFAULT NULL;', 'SELECT "Column replied_at already exists" AS result;');

PREPARE stmt1 FROM @sql1;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

PREPARE stmt3 FROM @sql3;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;

PREPARE stmt4 FROM @sql4;
EXECUTE stmt4;
DEALLOCATE PREPARE stmt4;

PREPARE stmt5 FROM @sql5;
EXECUTE stmt5;
DEALLOCATE PREPARE stmt5;

-- Add indexes and foreign key constraints (ignore errors if they already exist)
ALTER TABLE `contacts` ADD KEY `idx_is_read` (`is_read`);
ALTER TABLE `contacts` ADD KEY `idx_is_replied` (`is_replied`);
ALTER TABLE `contacts` ADD KEY `fk_read_by` (`read_by`);
ALTER TABLE `contacts` ADD KEY `fk_replied_by_new` (`replied_by`);

ALTER TABLE `contacts` ADD CONSTRAINT `contacts_read_by_fk` FOREIGN KEY (`read_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
ALTER TABLE `contacts` ADD CONSTRAINT `contacts_replied_by_fk` FOREIGN KEY (`replied_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;