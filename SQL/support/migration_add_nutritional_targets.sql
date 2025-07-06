-- Migration: Add nutritional target fields to Users table
-- Date: 2025-01-27
-- Description: Adds daily nutritional target fields to track user's nutritional goals

USE nutrichef;

-- Add nutritional target columns to Users table
ALTER TABLE `Users` 
ADD COLUMN `DailyCalories` INT NULL COMMENT 'Daily calorie target in kcal',
ADD COLUMN `DailyProtein` FLOAT NULL COMMENT 'Daily protein target in grams',
ADD COLUMN `DailyCarbs` FLOAT NULL COMMENT 'Daily carbohydrate target in grams',
ADD COLUMN `DailyFat` FLOAT NULL COMMENT 'Daily fat target in grams',
ADD COLUMN `DailyFiber` FLOAT NULL COMMENT 'Daily fiber target in grams',
ADD COLUMN `DailySugar` FLOAT NULL COMMENT 'Daily sugar target in grams',
ADD COLUMN `DailySodium` FLOAT NULL COMMENT 'Daily sodium target in mg';

-- Add indexes for better performance on nutritional queries
CREATE INDEX `idx_users_nutritional_targets` ON `Users` (`DailyCalories`, `DailyProtein`, `DailyCarbs`, `DailyFat`);

-- Update existing users with default values (optional)
-- UPDATE `Users` SET 
--   `DailyCalories` = 2000,
--   `DailyProtein` = 50,
--   `DailyCarbs` = 250,
--   `DailyFat` = 65,
--   `DailyFiber` = 25,
--   `DailySugar` = 50,
--   `DailySodium` = 2300
-- WHERE `DailyCalories` IS NULL;

COMMIT; 