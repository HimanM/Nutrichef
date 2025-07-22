# Meal Planner Suggestions Implementation

## Overview
This implementation adds an intelligent meal suggestion feature to the NutriChef meal planner with full mobile responsive design.

## Features Implemented

### Backend (`backend/services/meal_suggestion_service.py`)
- **MealSuggestionService**: Core service for generating meal suggestions
- **Nutritional Analysis**: Calculates remaining daily nutritional needs based on existing meals
- **Recipe Scoring Algorithm**: Scores recipes based on how well they fit nutritional targets
- **Smart Filtering**: Only suggests recipes with decent nutritional fit (score > 0.1)

### API Endpoint (`backend/routes/meal_planner_routes.py`)
- **POST `/api/meal-planner/suggest-meals`**: Returns personalized meal suggestions
- **Parameters**: 
  - `target_date`: Date for suggestions
  - `existing_meals`: Array of meals already planned for that day
- **Response**: Suggestions with nutrition scores and fit descriptions

### Frontend Component (`frontend/src/components/MealSuggestions.jsx`)

#### Mobile Layout (< 768px)
- **Full-screen modal**: Takes up entire viewport
- **Compact header**: Smaller icons and condensed information
- **Vertical layout**: Stacked recipe cards with side-by-side image and info
- **Touch-friendly**: Larger touch targets and appropriate spacing
- **Safe area support**: Respects device safe areas with `pb-safe` class

#### Desktop Layout (≥ 768px)
- **Overlay modal**: Centered modal with backdrop blur
- **Grid layout**: 3-column grid for recipe suggestions
- **Larger cards**: Full-size recipe images and detailed information
- **Hover effects**: Enhanced interactivity with mouse

### Integration (`frontend/src/pages/MealPlanner.jsx`)
- **Sparkle button**: Added to each day card header
- **State management**: Added suggestion modal state and date tracking
- **Event handlers**: Added functions for opening suggestions and adding to meal plan

## Mobile Responsive Design Features

### 1. Adaptive Layout
```jsx
// Mobile layout detection
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);
```

### 2. Conditional Rendering
```jsx
// Different layouts based on screen size
if (isMobile) {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Mobile-specific layout */}
    </div>
  );
}

// Desktop layout
return (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
    {/* Desktop-specific layout */}
  </div>
);
```

### 3. Responsive Grid Systems
```jsx
// Mobile: Single column list
<div className="space-y-3">
  {suggestions.map((recipe) => (
    // Compact card layout
  ))}
</div>

// Desktop: Multi-column grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {suggestions.map((recipe) => (
    // Full card layout
  ))}
</div>
```

### 4. Touch-Optimized UI
- **Button sizes**: Minimum 44px touch targets
- **Spacing**: Adequate spacing between interactive elements
- **Typography**: Appropriate font sizes for mobile reading
- **Safe areas**: Support for device notches and home indicators

### 5. Performance Optimizations
- **Conditional loading**: Only load suggestions when modal is visible
- **Image optimization**: Fallback to initials when images fail
- **Efficient scrolling**: Virtual scrolling for large lists

## Nutritional Intelligence

### Scoring Algorithm
The system uses a weighted scoring algorithm that considers:
- **Calories**: 30% weight
- **Protein**: 25% weight
- **Carbohydrates**: 15% weight
- **Fat**: 15% weight
- **Fiber**: 10% weight
- **Sugar**: 5% weight (lower is better)
- **Sodium**: 5% weight (lower is better)

### Target Calculation
```python
def _calculate_remaining_targets(self, daily_targets, existing_meals):
    # Calculate what's already consumed
    consumed = {nutrient: 0 for nutrient in targets}
    
    # Sum nutrition from existing meals
    for meal in existing_meals:
        # Add meal nutrition to consumed totals
    
    # Calculate remaining needs
    remaining = {}
    for nutrient in consumed.keys():
        remaining[nutrient] = max(0, daily_targets[nutrient] - consumed[nutrient])
    
    return remaining
```

## Usage Flow

1. **User sets nutritional targets** in the meal planner settings
2. **User clicks sparkle icon** (✨) on any day card
3. **System analyzes** existing meals for that day
4. **Calculates remaining** nutritional needs
5. **AI suggests recipes** that best fit the remaining targets
6. **User can add suggestions** directly to their meal plan

## Technical Requirements

### Dependencies
- React 18+
- Tailwind CSS
- date-fns for date formatting
- React Icons for UI icons

### Backend Requirements
- Flask with SQLAlchemy
- JWT authentication
- User model with nutritional target fields

### Database Schema
The User model should include these nutritional target fields:
- `DailyCalories` (Integer)
- `DailyProtein` (Float)
- `DailyCarbs` (Float)
- `DailyFat` (Float)
- `DailyFiber` (Float)
- `DailySugar` (Float)
- `DailySodium` (Float)

## Future Enhancements

1. **Machine Learning Integration**: Use ML to learn from user preferences
2. **Dietary Restriction Filtering**: Filter suggestions based on allergies/preferences
3. **Seasonal Suggestions**: Incorporate seasonal ingredient availability
4. **Cuisine Type Preferences**: Allow users to specify preferred cuisines
5. **Macro Balance Optimization**: Advanced algorithms for optimal macro distribution

## Testing

The implementation includes basic error handling and fallbacks:
- Network error handling
- Empty state management
- Loading state indicators
- Responsive design testing across devices

Run the application and test on various screen sizes to ensure proper responsive behavior.
