-- Remove price_range field from projects table
-- Date: 2025-01-23

USE estatehub_db;

-- Remove price_range column from projects table
ALTER TABLE projects DROP COLUMN price_range;