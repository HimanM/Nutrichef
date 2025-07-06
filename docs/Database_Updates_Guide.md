# Database Updates Guide

## Overview

This guide provides step-by-step instructions for updating your database to support the new nutritional tracking feature.

## Required Updates

### 1. Add Nutritional Target Fields to Users Table

Run the migration script to add nutritional target columns to the Users table:

```bash
mysql -u username -p database_name < SQL/migration_add_nutritional_targets.sql
```

This will add the following columns:
- `DailyCalories` (INT) - Daily calorie target in kcal
- `DailyProtein` (FLOAT) - Daily protein target in grams
- `DailyCarbs` (FLOAT) - Daily carbohydrate target in grams
- `DailyFat` (FLOAT) - Daily fat target in grams
- `DailyFiber` (FLOAT) - Daily fiber target in grams
- `DailySugar` (FLOAT) - Daily sugar target in grams
- `DailySodium` (FLOAT) - Daily sodium target in mg

### 2. Update Recipe Nutritional Data (Optional)

If you want to update existing recipes with more realistic and varied nutritional data, run:

```bash
mysql -u username -p database_name < SQL/update_recipe_nutrition.sql
```

This script updates all 22 existing recipes with realistic nutritional values based on their ingredients and typical serving sizes.

## Database Schema Changes

### Users Table Changes

```sql
-- New columns added to Users table
ALTER TABLE `Users` 
ADD COLUMN `DailyCalories` INT NULL COMMENT 'Daily calorie target in kcal',
ADD COLUMN `DailyProtein` FLOAT NULL COMMENT 'Daily protein target in grams',
ADD COLUMN `DailyCarbs` FLOAT NULL COMMENT 'Daily carbohydrate target in grams',
ADD COLUMN `DailyFat` FLOAT NULL COMMENT 'Daily fat target in grams',
ADD COLUMN `DailyFiber` FLOAT NULL COMMENT 'Daily fiber target in grams',
ADD COLUMN `DailySugar` FLOAT NULL COMMENT 'Daily sugar target in grams',
ADD COLUMN `DailySodium` FLOAT NULL COMMENT 'Daily sodium target in mg';
```

### Recipe Nutritional Data Format

The `NutritionInfoJSON` field in the Recipes table now uses a standardized format:

```json
{
  "notes": "Nutritional values are estimates based on typical ingredient values",
  "success": true,
  "nutrition": {
    "calories": {"unit": "kcal", "amount": 380},
    "protein": {"unit": "g", "amount": 14},
    "carbohydrates": {"unit": "g", "amount": 65},
    "fat": {"unit": "g", "amount": 8},
    "fiber": {"unit": "g", "amount": 4},
    "sugar": {"unit": "g", "amount": 3},
    "sodium": {"unit": "mg", "amount": 450}
  },
  "per_serving": true
}
```

## Sample Nutritional Data

Here are examples of the updated nutritional data for different recipe types:

### High-Protein Meals
- **Sheet Pan Lemon Herb Salmon**: 380 kcal, 42g protein, 8g carbs, 20g fat
- **Pan-Seared Pork Chops**: 420 kcal, 38g protein, 8g carbs, 26g fat
- **Chicken and Vegetable Skewers**: 280 kcal, 35g protein, 12g carbs, 12g fat

### Vegetarian Options
- **Lentil Salad with Roasted Vegetables**: 320 kcal, 18g protein, 45g carbs, 12g fat, 12g fiber
- **Black Bean Burgers**: 280 kcal, 12g protein, 35g carbs, 12g fat, 8g fiber
- **Caprese Salad**: 180 kcal, 8g protein, 6g carbs, 14g fat

### Light Meals
- **Berry Smoothie**: 220 kcal, 8g protein, 35g carbs, 6g fat, 25g sugar
- **Berry Chia Pudding**: 180 kcal, 6g protein, 25g carbs, 8g fat, 8g fiber
- **Simple Guacamole**: 160 kcal, 2g protein, 8g carbs, 14g fat, 6g fiber

## Verification

After running the updates, verify the changes:

```sql
-- Check if nutritional target columns were added
DESCRIBE Users;

-- Check if recipe nutritional data was updated
SELECT RecipeID, Title, NutritionInfoJSON FROM Recipes LIMIT 5;

-- Check for users with nutritional targets
SELECT UserID, Name, DailyCalories, DailyProtein FROM Users WHERE DailyCalories IS NOT NULL;
```

## Backward Compatibility

The nutritional tracking system is designed to be backward compatible:

1. **Users without nutritional targets**: The system gracefully handles users who haven't set nutritional targets
2. **Recipes without nutritional data**: Meals without nutritional information won't break the tracking
3. **Mixed data formats**: The system handles both nested and flat nutritional data structures

## Troubleshooting

### Common Issues

1. **Migration fails**: Ensure you have proper database permissions
2. **Nutritional data not showing**: Check that recipes have valid JSON in NutritionInfoJSON field
3. **Progress bars not updating**: Verify that user nutritional targets are set

### Rollback

If you need to rollback the changes:

```sql
-- Remove nutritional target columns
ALTER TABLE `Users` 
DROP COLUMN `DailyCalories`,
DROP COLUMN `DailyProtein`,
DROP COLUMN `DailyCarbs`,
DROP COLUMN `DailyFat`,
DROP COLUMN `DailyFiber`,
DROP COLUMN `DailySugar`,
DROP COLUMN `DailySodium`;
```

## Performance Considerations

- Added indexes on nutritional fields for better query performance
- Nutritional calculations are done client-side for real-time updates
- Database queries are optimized to minimize impact on existing functionality

## Next Steps

After completing the database updates:

1. Restart your backend application
2. Test the nutritional tracking feature in the meal planner
3. Set nutritional targets for test users
4. Verify that progress bars display correctly with planned meals 