-- Test script for nutritional targets functionality
-- This script tests the new nutritional target columns in the Users table

-- 1. Check if the nutritional target columns exist
DESCRIBE Users;

-- 2. Insert a test user with nutritional targets
INSERT INTO Users (Name, Email, PasswordHash, role, IsEmailVerified, 
                   DailyCalories, DailyProtein, DailyCarbs, DailyFat, 
                   DailyFiber, DailySugar, DailySodium) 
VALUES ('Test User', 'test@example.com', 'test_hash', 'user', 1,
        2000, 150, 200, 65, 25, 50, 2300);

-- 3. Verify the insertion
SELECT UserID, Name, Email, DailyCalories, DailyProtein, DailyCarbs, 
       DailyFat, DailyFiber, DailySugar, DailySodium 
FROM Users 
WHERE Email = 'test@example.com';

-- 4. Update nutritional targets
UPDATE Users 
SET DailyCalories = 1800, DailyProtein = 120, DailyCarbs = 180, 
    DailyFat = 60, DailyFiber = 30, DailySugar = 45, DailySodium = 2000
WHERE Email = 'test@example.com';

-- 5. Verify the update
SELECT UserID, Name, Email, DailyCalories, DailyProtein, DailyCarbs, 
       DailyFat, DailyFiber, DailySugar, DailySodium 
FROM Users 
WHERE Email = 'test@example.com';

-- 6. Test recipe nutritional data
SELECT RecipeID, Title, 
       JSON_EXTRACT(NutritionInfoJSON, '$.nutrition.calories.amount') as Calories,
       JSON_EXTRACT(NutritionInfoJSON, '$.nutrition.protein.amount') as Protein,
       JSON_EXTRACT(NutritionInfoJSON, '$.nutrition.carbohydrates.amount') as Carbs,
       JSON_EXTRACT(NutritionInfoJSON, '$.nutrition.fat.amount') as Fat,
       JSON_EXTRACT(NutritionInfoJSON, '$.nutrition.fiber.amount') as Fiber,
       JSON_EXTRACT(NutritionInfoJSON, '$.nutrition.sugar.amount') as Sugar,
       JSON_EXTRACT(NutritionInfoJSON, '$.nutrition.sodium.amount') as Sodium
FROM Recipes 
LIMIT 5;

-- 7. Clean up test data
DELETE FROM Users WHERE Email = 'test@example.com';

-- 8. Verify cleanup
SELECT COUNT(*) as RemainingUsers FROM Users WHERE Email = 'test@example.com'; 