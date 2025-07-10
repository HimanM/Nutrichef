import React, { useState } from 'react';
import { MdExpandMore, MdExpandLess, MdSettings } from 'react-icons/md';

const NutritionalProgress = ({ 
  dayMeals = [], 
  userNutritionalTargets = {}, 
  isExpanded = false, 
  onToggleExpand,
  onOpenSettings 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(!isExpanded);

  const calculateDailyNutrition = (meals) => {
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    };

    console.log('Calculating nutrition for meals:', meals);

    meals.forEach(meal => {
      console.log('Processing meal:', meal.Title, 'NutritionInfo:', meal.NutritionInfo);
      
      if (meal.NutritionInfo && meal.NutritionInfo.nutrition) {
        const nutrition = meal.NutritionInfo.nutrition;
        console.log('Using nested nutrition structure:', nutrition);
        
        // Handle the nested structure from the database
        totals.calories += nutrition.calories?.amount || 0;
        totals.protein += nutrition.protein?.amount || 0;
        totals.carbs += nutrition.carbohydrates?.amount || 0;
        totals.fat += nutrition.fat?.amount || 0;
        totals.fiber += nutrition.fiber?.amount || 0;
        totals.sugar += nutrition.sugar?.amount || 0;
        totals.sodium += nutrition.sodium?.amount || 0;
      } else if (meal.NutritionInfo) {
        // Handle flat structure (fallback)
        console.log('Using flat nutrition structure:', meal.NutritionInfo);
        totals.calories += meal.NutritionInfo.calories || 0;
        totals.protein += meal.NutritionInfo.protein || 0;
        totals.carbs += meal.NutritionInfo.carbs || 0;
        totals.fat += meal.NutritionInfo.fat || 0;
        totals.fiber += meal.NutritionInfo.fiber || 0;
        totals.sugar += meal.NutritionInfo.sugar || 0;
        totals.sodium += meal.NutritionInfo.sodium || 0;
      } else {
        console.log('No nutrition info found for meal:', meal.Title);
      }
    });

    console.log('Calculated totals:', totals);
    return totals;
  };

  const dailyNutrition = calculateDailyNutrition(dayMeals);

  const getProgressPercentage = (current, target) => {
    if (!target || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage < 70) return 'bg-red-500';
    if (percentage < 90) return 'bg-yellow-500';
    if (percentage <= 110) return 'bg-green-500';
    return 'bg-orange-500';
  };

  const nutritionItems = [
    { key: 'calories', label: 'Calories', unit: 'kcal', current: dailyNutrition.calories, target: userNutritionalTargets.DailyCalories },
    { key: 'protein', label: 'Protein', unit: 'g', current: dailyNutrition.protein, target: userNutritionalTargets.DailyProtein },
    { key: 'carbs', label: 'Carbs', unit: 'g', current: dailyNutrition.carbs, target: userNutritionalTargets.DailyCarbs },
    { key: 'fat', label: 'Fat', unit: 'g', current: dailyNutrition.fat, target: userNutritionalTargets.DailyFat },
    { key: 'fiber', label: 'Fiber', unit: 'g', current: dailyNutrition.fiber, target: userNutritionalTargets.DailyFiber },
    { key: 'sugar', label: 'Sugar', unit: 'g', current: dailyNutrition.sugar, target: userNutritionalTargets.DailySugar },
    { key: 'sodium', label: 'Sodium', unit: 'mg', current: dailyNutrition.sodium, target: userNutritionalTargets.DailySodium }
  ];

  const hasTargets = Object.values(userNutritionalTargets).some(target => target && target > 0);
  const hasMeals = dayMeals.length > 0;

  console.log('NutritionalProgress - hasTargets:', hasTargets, 'userNutritionalTargets:', userNutritionalTargets);
  console.log('NutritionalProgress - hasMeals:', hasMeals, 'dayMeals:', dayMeals);

  if (!hasTargets && !hasMeals) {
    return null;
  }

  return (
    <div className="mt-4 border-t border-gray-200 pt-4 px-4 pb-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-gray-700">Nutritional Progress</h4>
          {hasMeals && (
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
              {dayMeals.length} meal{dayMeals.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!hasTargets && (
            <button
              onClick={onOpenSettings}
              className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded-md transition-colors"
              title="Set nutritional targets"
            >
              <MdSettings className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            {isCollapsed ? <MdExpandMore className="w-4 h-4" /> : <MdExpandLess className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* No targets set message */}
      {!hasTargets && hasMeals && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 mb-2">Set your daily nutritional targets to track progress</p>
          <button
            onClick={onOpenSettings}
            className="text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1 rounded-md transition-colors"
          >
            Set Targets
          </button>
        </div>
      )}

      {/* Progress bars */}
      {!isCollapsed && hasTargets && (
        <div className="space-y-4">
          {nutritionItems.map(({ key, label, unit, current, target }) => {
            if (!target || target === 0) return null;
            
            const percentage = getProgressPercentage(current, target);
            const progressColor = getProgressColor(percentage);
            
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600 font-medium">{label}</span>
                  <span className="text-gray-500">
                    {Math.round(current)} / {target} {unit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1 mb-1">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex justify-end text-xs text-gray-400 pr-1">
                  <span className={percentage > 100 ? 'text-orange-600 font-medium' : ''}>
                    {Math.round(percentage)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary when collapsed */}
      {isCollapsed && hasTargets && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {Math.round(dailyNutrition.calories)} / {userNutritionalTargets.DailyCalories || 0} kcal
          </span>
          <span className="text-emerald-600">
            {Math.round(getProgressPercentage(dailyNutrition.calories, userNutritionalTargets.DailyCalories))}%
          </span>
        </div>
      )}
    </div>
  );
};

export default NutritionalProgress; 