-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Backup existing data
CREATE TEMPORARY TABLE projects_backup AS SELECT * FROM projects;

-- Drop dependent tables first
DROP TABLE IF EXISTS project_images;
DROP TABLE IF EXISTS project_tags;
DROP TABLE IF EXISTS tags;

-- Drop the old table
DROP TABLE IF EXISTS projects;

-- Create new table with correct structure
CREATE TABLE `projects` (
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

-- Migrate data from backup
INSERT INTO projects (
  id,
  identifier,
  name,
  type,
  status,
  location,
  yearStarted,
  units,
  isFeatured,
  displayOrder,
  viewCount,
  created_by,
  updated_by,
  created_at,
  updated_at
)
SELECT 
  id,
  COALESCE(slug, uuid, CONCAT('project-', id)) as identifier,
  title as name,
  CASE 
    WHEN category = '住宅' THEN 'residential'
    WHEN category = '商業' THEN 'commercial'
    WHEN category = '辦公室' THEN 'commercial'
    ELSE 'other'
  END as type,
  CASE 
    WHEN status = 'planning' THEN 'planning'
    WHEN status = 'pre_sale' THEN 'in_progress'
    WHEN status = 'on_sale' THEN 'in_progress'
    WHEN status = 'completed' THEN 'completed'
    ELSE 'planning'
  END as status,
  location,
  year as yearStarted,
  unit_count as units,
  is_featured as isFeatured,
  display_order as displayOrder,
  view_count as viewCount,
  created_by,
  updated_by,
  created_at,
  updated_at
FROM projects_backup;

-- Drop temporary table
DROP TEMPORARY TABLE projects_backup;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;