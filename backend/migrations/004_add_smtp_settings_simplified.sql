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