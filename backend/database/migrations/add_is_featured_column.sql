-- Add isFeatured column to projects table
ALTER TABLE projects 
ADD COLUMN isFeatured TINYINT(1) DEFAULT 0;