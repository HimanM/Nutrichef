-- Migration script for adding favorites and tags functionality
-- Run this script on existing NutriChef databases

-- Create RecipeTags table
CREATE TABLE IF NOT EXISTS `RecipeTags` (
  `TagID` int NOT NULL AUTO_INCREMENT,
  `TagName` varchar(100) NOT NULL,
  `TagCategory` varchar(50) DEFAULT 'general',
  `TagColor` varchar(7) DEFAULT '#6B7280',
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`TagID`),
  UNIQUE KEY `TagName` (`TagName`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4;

-- Insert predefined tags
INSERT INTO `RecipeTags` (`TagID`, `TagName`, `TagCategory`, `TagColor`, `CreatedAt`) VALUES
(1, 'Vegetarian', 'diet', '#10B981', '2025-07-13 10:00:00'),
(2, 'Vegan', 'diet', '#059669', '2025-07-13 10:00:00'),
(3, 'Gluten-Free', 'diet', '#F59E0B', '2025-07-13 10:00:00'),
(4, 'Low-Carb', 'diet', '#3B82F6', '2025-07-13 10:00:00'),
(5, 'Keto', 'diet', '#8B5CF6', '2025-07-13 10:00:00'),
(6, 'Quick & Easy', 'difficulty', '#10B981', '2025-07-13 10:00:00'),
(7, 'Beginner', 'difficulty', '#10B981', '2025-07-13 10:00:00'),
(8, 'Intermediate', 'difficulty', '#F59E0B', '2025-07-13 10:00:00'),
(9, 'Advanced', 'difficulty', '#EF4444', '2025-07-13 10:00:00'),
(10, 'Italian', 'cuisine', '#EF4444', '2025-07-13 10:00:00'),
(11, 'Asian', 'cuisine', '#F59E0B', '2025-07-13 10:00:00'),
(12, 'Mexican', 'cuisine', '#10B981', '2025-07-13 10:00:00'),
(13, 'Breakfast', 'course', '#F97316', '2025-07-13 10:00:00'),
(14, 'Lunch', 'course', '#EAB308', '2025-07-13 10:00:00'),
(15, 'Dinner', 'course', '#3B82F6', '2025-07-13 10:00:00'),
(16, 'Dessert', 'course', '#EC4899', '2025-07-13 10:00:00'),
(17, 'Healthy', 'general', '#10B981', '2025-07-13 10:00:00');

-- Create RecipeTagAssignments table
CREATE TABLE IF NOT EXISTS `RecipeTagAssignments` (
  `AssignmentID` int NOT NULL AUTO_INCREMENT,
  `RecipeID` int NOT NULL,
  `TagID` int NOT NULL,
  `AssignedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`AssignmentID`),
  UNIQUE KEY `unique_recipe_tag` (`RecipeID`, `TagID`),
  KEY `TagID` (`TagID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create UserFavoriteRecipes table
CREATE TABLE IF NOT EXISTS `UserFavoriteRecipes` (
  `FavoriteID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `RecipeID` int NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`FavoriteID`),
  UNIQUE KEY `unique_user_recipe` (`UserID`, `RecipeID`),
  KEY `RecipeID` (`RecipeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add foreign key constraints
ALTER TABLE `RecipeTagAssignments`
  ADD CONSTRAINT `recipetagassignments_ibfk_1` FOREIGN KEY (`RecipeID`) REFERENCES `Recipes` (`RecipeID`) ON DELETE CASCADE,
  ADD CONSTRAINT `recipetagassignments_ibfk_2` FOREIGN KEY (`TagID`) REFERENCES `RecipeTags` (`TagID`) ON DELETE CASCADE;

ALTER TABLE `UserFavoriteRecipes`
  ADD CONSTRAINT `userfavoriterecipes_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE,
  ADD CONSTRAINT `userfavoriterecipes_ibfk_2` FOREIGN KEY (`RecipeID`) REFERENCES `Recipes` (`RecipeID`) ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX `idx_user_favorites_user_id` ON `UserFavoriteRecipes` (`UserID`);
CREATE INDEX `idx_user_favorites_recipe_id` ON `UserFavoriteRecipes` (`RecipeID`);
CREATE INDEX `idx_recipe_tags_recipe_id` ON `RecipeTagAssignments` (`RecipeID`);
CREATE INDEX `idx_recipe_tags_tag_id` ON `RecipeTagAssignments` (`TagID`);
CREATE INDEX `idx_tags_category` ON `RecipeTags` (`TagCategory`);

-- Optional: Auto-assign some basic tags to existing recipes based on their titles/content
-- This can be run manually or as a background job

-- Example: Tag recipes with "pasta" in title as Italian
INSERT IGNORE INTO `RecipeTagAssignments` (`RecipeID`, `TagID`)
SELECT r.RecipeID, 10 as TagID 
FROM `Recipes` r 
WHERE LOWER(r.Title) LIKE '%pasta%' OR LOWER(r.Title) LIKE '%italian%';

-- Example: Tag quick recipes (prep + cook time < 30 minutes)
INSERT IGNORE INTO `RecipeTagAssignments` (`RecipeID`, `TagID`)
SELECT r.RecipeID, 6 as TagID 
FROM `Recipes` r 
WHERE (COALESCE(r.PreparationTimeMinutes, 0) + COALESCE(r.CookingTimeMinutes, 0)) <= 30;

-- Example: Tag breakfast recipes
INSERT IGNORE INTO `RecipeTagAssignments` (`RecipeID`, `TagID`)
SELECT r.RecipeID, 13 as TagID 
FROM `Recipes` r 
WHERE LOWER(r.Title) LIKE '%breakfast%' OR LOWER(r.Title) LIKE '%pancake%' OR LOWER(r.Title) LIKE '%egg%' OR LOWER(r.Title) LIKE '%smoothie%';

-- Example: Tag desserts
INSERT IGNORE INTO `RecipeTagAssignments` (`RecipeID`, `TagID`)
SELECT r.RecipeID, 16 as TagID 
FROM `Recipes` r 
WHERE LOWER(r.Title) LIKE '%cake%' OR LOWER(r.Title) LIKE '%cookie%' OR LOWER(r.Title) LIKE '%dessert%' OR LOWER(r.Title) LIKE '%sweet%';

COMMIT;
