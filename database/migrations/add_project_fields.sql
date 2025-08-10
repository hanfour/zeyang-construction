-- Add new fields to projects table
-- Date: 2025-01-23

USE estatehub_db;

-- Add new fixed fields to projects table
ALTER TABLE projects
ADD COLUMN base_address VARCHAR(500) AFTER location,
ADD COLUMN floor_plan_info VARCHAR(200) AFTER area,
ADD COLUMN unit_count INT AFTER floor_plan_info,
ADD COLUMN facebook_page VARCHAR(200) AFTER is_featured,
ADD COLUMN booking_phone VARCHAR(50) AFTER facebook_page,
ADD COLUMN info_website VARCHAR(200) AFTER booking_phone;

-- Add custom_fields JSON column to project_details table for dynamic fields
ALTER TABLE project_details
ADD COLUMN custom_fields JSON AFTER nearby_facilities;

-- Update project_details table comment
ALTER TABLE project_details COMMENT = 'Stores detailed project information including custom dynamic fields';