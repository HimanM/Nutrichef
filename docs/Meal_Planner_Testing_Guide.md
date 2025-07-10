# Meal Planner Testing Guide

This guide helps you test the fixes for the meal planner issues:

## Issues Fixed

1. **Meal data persistence after page refresh**
2. **Nutritional Progress not updating**
3. **Nutritional Targets form styling and validation**

## Testing Steps

### 1. Test Meal Data Persistence

1. **Add recipes to palette:**
   - Go to Recipe Browser page
   - Add 2-3 recipes to your palette
   - Verify they appear in the meal planner palette

2. **Plan meals:**
   - In the meal planner, drag recipes to different days
   - Add multiple recipes to the same day
   - Verify they appear correctly

3. **Test persistence:**
   - Refresh the page (F5 or Ctrl+R)
   - Verify all planned meals are still there
   - Check browser console for debug logs showing data loading

### 2. Test Nutritional Progress

1. **Set nutritional targets:**
   - Click "Set Nutritional Targets" button
   - Fill in at least one target (e.g., Calories: 2000)
   - Save the targets

2. **Add meals and check progress:**
   - Add recipes to your meal plan
   - Look for progress bars below each day
   - Verify progress bars show correct percentages
   - Check browser console for nutrition calculation logs

3. **Test progress updates:**
   - Add/remove meals from days
   - Verify progress bars update immediately
   - Check that color coding works (green/yellow/red)

### 3. Test Nutritional Targets Form

1. **Test validation:**
   - Open the nutritional targets modal
   - Try to save without entering any values
   - Verify error message appears
   - Verify Save button is disabled

2. **Test input validation:**
   - Enter negative numbers
   - Enter very large numbers (>10000)
   - Verify appropriate error messages

3. **Test styling:**
   - Verify form follows app design system
   - Check that error states are properly styled
   - Verify buttons have proper hover states

### 4. Debug Information

Check browser console for these debug logs:

```
// When loading meal plan
"Loaded meal plan from localStorage: {...}"
"Keeping meal data for date: 2024-01-15 [...]"
"Final meal plan after filtering: {...}"

// When saving meal plan
"Saved meal plan to localStorage: {...}"

// When adding recipes
"Updated meal plan: {...}"

// When calculating nutrition
"Calculating nutrition for meals: [...]"
"Processing meal: Recipe Title NutritionInfo: {...}"
"Calculated totals: {...}"

// When fetching/updating targets
"Fetched nutritional targets: {...}"
"Updated nutritional targets: {...}"
```

### 5. Expected Behavior

#### Meal Data Persistence
- ✅ Meals should persist after page refresh
- ✅ Only future/today meals should be kept (past meals filtered out)
- ✅ localStorage should be updated immediately when meals change

#### Nutritional Progress
- ✅ Progress bars should appear below each day with meals
- ✅ Progress should calculate correctly based on recipe nutrition data
- ✅ Color coding: Green (70-110%), Yellow (70-90%), Red (<70%), Orange (>110%)
- ✅ Progress should update immediately when meals are added/removed

#### Nutritional Targets Form
- ✅ Form should require at least one target to be set
- ✅ Input validation should prevent invalid values
- ✅ Error messages should be clear and helpful
- ✅ Form should follow app design system
- ✅ Save button should be disabled when validation fails

### 6. Troubleshooting

If issues persist:

1. **Check browser console** for error messages
2. **Clear localStorage** and test again:
   ```javascript
   localStorage.removeItem('plannedMealsData');
   localStorage.removeItem('mealPlanPaletteRecipes');
   ```
3. **Verify recipe data** has nutrition information
4. **Check network tab** for API errors

### 7. Data Structure Verification

Verify that recipe data in localStorage includes:
```json
{
  "RecipeID": 1,
  "Title": "Recipe Name",
  "ImageURL": "...",
  "NutritionInfo": {
    "nutrition": {
      "calories": {"amount": 300, "unit": "kcal"},
      "protein": {"amount": 15, "unit": "g"},
      "carbohydrates": {"amount": 45, "unit": "g"},
      "fat": {"amount": 10, "unit": "g"},
      "fiber": {"amount": 5, "unit": "g"},
      "sugar": {"amount": 8, "unit": "g"},
      "sodium": {"amount": 400, "unit": "mg"}
    }
  }
}
```

## Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ Data persists correctly
- ✅ Progress bars update properly
- ✅ Form validation works
- ✅ UI follows design system 