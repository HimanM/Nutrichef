# Nutritional Tracking Feature

## Overview

The nutritional tracking feature allows users to set daily nutritional targets and track their progress through the meal planner. This feature provides visual feedback on how well their planned meals align with their nutritional goals.

## Features

### 1. Nutritional Target Setting
- Users can set daily targets for:
  - Calories (kcal)
  - Protein (g)
  - Carbohydrates (g)
  - Fat (g)
  - Fiber (g)
  - Sugar (g)
  - Sodium (mg)

### 2. Progress Tracking
- Real-time calculation of nutritional content from planned meals
- Visual progress bars showing percentage of daily targets met
- Color-coded progress indicators:
  - Red: < 70% of target
  - Yellow: 70-90% of target
  - Green: 90-110% of target
  - Orange: > 110% of target (exceeded)

### 3. Clean UI Design
- Collapsible nutritional progress section to avoid cluttering
- Summary view when collapsed (shows calories and percentage)
- Expandable view with detailed breakdown of all nutrients
- Settings button to quickly access nutritional target configuration

## Implementation Details

### Database Changes

#### Users Table
Added nutritional target columns:
```sql
ALTER TABLE `Users` 
ADD COLUMN `DailyCalories` INT NULL,
ADD COLUMN `DailyProtein` FLOAT NULL,
ADD COLUMN `DailyCarbs` FLOAT NULL,
ADD COLUMN `DailyFat` FLOAT NULL,
ADD COLUMN `DailyFiber` FLOAT NULL,
ADD COLUMN `DailySugar` FLOAT NULL,
ADD COLUMN `DailySodium` FLOAT NULL;
```

### Backend Components

#### User Model (`backend/models/user.py`)
- Added nutritional target fields
- Updated `to_dict()` method to include nutritional data

#### User Service (`backend/services/user_service.py`)
- Added `update_nutritional_targets()` method
- Validates input data and handles database updates

#### User Routes (`backend/routes/user_routes.py`)
- Added `PUT /api/user/nutritional-targets` endpoint
- Requires authentication

### Frontend Components

#### NutritionalProgress Component (`frontend/src/components/NutritionalProgress.jsx`)
- Displays nutritional progress for each day
- Calculates totals from planned meals
- Shows progress bars with color coding
- Handles collapsed/expanded states

#### NutritionalTargetsModal Component (`frontend/src/components/NutritionalTargetsModal.jsx`)
- Modal for setting nutritional targets
- Form validation and user-friendly interface
- Saves targets to backend

#### MealPlanner Integration (`frontend/src/pages/MealPlanner.jsx`)
- Fetches user nutritional targets on load
- Integrates NutritionalProgress component into day cards
- Adds "Nutrition" button to action bar

## Usage

### Setting Nutritional Targets
1. Click the "Nutrition" button in the meal planner action bar
2. Enter your daily targets for each nutrient
3. Click "Save Targets" to store your preferences

### Viewing Progress
1. Plan meals for each day in the meal planner
2. Nutritional progress will automatically appear below each day's meals
3. Click the expand/collapse arrow to see detailed breakdown
4. Progress bars show how much of each nutrient your planned meals provide

### Progress Indicators
- **Red**: You're significantly under your target
- **Yellow**: You're close to your target but could add more
- **Green**: You're within your target range
- **Orange**: You've exceeded your target (consider adjusting portions)

## Technical Notes

### Data Flow
1. User sets nutritional targets → Saved to Users table
2. User plans meals → Nutritional data calculated from recipe NutritionInfo
3. Progress calculated → Displayed in NutritionalProgress component

### Recipe Nutritional Data
- Nutritional information is stored in the `NutritionInfoJSON` field of recipes
- Expected format (nested structure):
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

The NutritionalProgress component handles both nested and flat structures for backward compatibility.

### Performance Considerations
- Nutritional calculations are done client-side for real-time updates
- Database queries are optimized with indexes on nutritional fields
- Progress bars use CSS transitions for smooth animations

## Future Enhancements

1. **Weekly Overview**: Show nutritional trends across the week
2. **Smart Recommendations**: Suggest meals to meet nutritional gaps
3. **Nutritional Goals**: Support for different goal types (weight loss, muscle gain, etc.)
4. **Export Reports**: Generate nutritional reports for meal plans
5. **Mobile Optimization**: Improve mobile experience for nutritional tracking

## Migration

To add this feature to an existing database, run the migration script:

```bash
mysql -u username -p database_name < SQL/migration_add_nutritional_targets.sql
```

This will add the necessary columns to the Users table without affecting existing data. 