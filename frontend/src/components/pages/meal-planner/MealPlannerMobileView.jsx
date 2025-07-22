import React from 'react';
import { format, isToday, isTomorrow } from 'date-fns';
import { MdAdd, MdExpandMore, MdExpandLess } from 'react-icons/md';
import { HiOutlineSparkles } from 'react-icons/hi';
import MealItemCard from './MealItemCard.jsx';
import NutritionalProgress from '../../ui/NutritionalProgress.jsx';

function MealPlannerMobileView({
  currentWeekDates,
  viewMode,
  plannedMeals,
  expandedDays,
  toggleExpanded,
  selectedRecipe,
  recipeSelectedForPlanning,
  handleAssignRecipeToDay,
  handleRemoveRecipeFromDay,
  handleOpenSuggestions,
  userNutritionalTargets,
  setIsNutritionalTargetsModalOpen,
  visibleEmptyDays,
  handleAddEmptyDay
}) {
  const getVisibleDates = () => {
    return viewMode === 'week' ? currentWeekDates.slice(0, 7) : currentWeekDates;
  };

  const renderDayCard = (date) => {
    const dayKey = format(date, 'yyyy-MM-dd');
    const dayItems = plannedMeals[dayKey] || [];
    let dayLabel = format(date, 'MMM d (EEE)');
    if (isToday(date)) dayLabel = `Today (${format(date, 'MMM d')})`;
    else if (isTomorrow(date)) dayLabel = `Tomorrow (${format(date, 'MMM d')})`;

    const hasSelectedRecipe = selectedRecipe || recipeSelectedForPlanning;
    const isExpanded = expandedDays.get(dayKey) || false;

    const handleDayClick = () => {
      if (hasSelectedRecipe) {
        handleAssignRecipeToDay(dayKey, selectedRecipe || recipeSelectedForPlanning);
      }
    };

    return (
      <div 
        key={dayKey} 
        className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
          hasSelectedRecipe 
            ? 'border-emerald-300 bg-emerald-50 cursor-pointer hover:bg-emerald-100' 
            : 'border-gray-100'
        }`}
        onClick={handleDayClick}
        data-day-card
      >
        {/* Day Header - Mobile layout */}
        <div className="p-3 border-b border-gray-50">
          <div className="flex items-center justify-between">
            {/* Title and meal count together */}
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold text-sm ${
                isToday(date) ? 'text-emerald-600' : isTomorrow(date) ? 'text-blue-600' : 'text-gray-700'
              }`}>
                {format(date, 'EEE d')} {/* Shorter format for mobile */}
              </h3>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                {dayItems.length}
              </span>
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenSuggestions(date);
                }}
                className="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                title="Get meal suggestions"
              >
                <HiOutlineSparkles className="w-4 h-4" />
              </button>
              {dayItems.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(dayKey, e);
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? (
                    <MdExpandLess className="w-4 h-4" />
                  ) : (
                    <MdExpandMore className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Day Content */}
        <div className="p-4">
          {dayItems.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MdAdd className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-3">No meals planned</p>
              {hasSelectedRecipe && (
                <div className="p-3 bg-emerald-100 border border-emerald-200 rounded-lg">
                  <p className="text-sm text-emerald-700 font-medium">
                    Click to add "{(selectedRecipe || recipeSelectedForPlanning)?.Title}"
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Always show first meal */}
              <MealItemCard
                key={dayItems[0].planInstanceId}
                recipe={dayItems[0]}
                onRemove={() => handleRemoveRecipeFromDay(dayKey, dayItems[0].planInstanceId)}
                isInPalette={false}
                isCompact={!isExpanded}
              />
              
              {/* Show additional meals if expanded or if only one additional meal */}
              {dayItems.length > 1 && (
                <div className={`transition-all duration-300 ${
                  isExpanded || dayItems.length === 2 ? 'block' : 'hidden'
                }`}>
                  {dayItems.slice(1).map((item) => (
                    <MealItemCard
                      key={item.planInstanceId}
                      recipe={item}
                      onRemove={() => handleRemoveRecipeFromDay(dayKey, item.planInstanceId)}
                      isInPalette={false}
                      isCompact={true}
                    />
                  ))}
                </div>
              )}
              
              {/* Show more indicator for collapsed state */}
              {!isExpanded && dayItems.length > 2 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(dayKey, e);
                  }}
                  className="w-full text-center py-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  Show {dayItems.length - 1} more meals
                </button>
              )}
              
              {/* Add recipe prompt when recipe is selected */}
              {hasSelectedRecipe && (
                <div className="p-3 bg-emerald-100 border border-emerald-200 rounded-lg">
                  <p className="text-sm text-emerald-700 font-medium">
                    Click to add "{(selectedRecipe || recipeSelectedForPlanning)?.Title}"
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Nutritional Progress */}
          {dayItems.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <NutritionalProgress
                dayMeals={dayItems}
                userNutritionalTargets={userNutritionalTargets}
                isExpanded={isExpanded}
                onToggleExpand={() => toggleExpanded(dayKey)}
                onOpenSettings={() => setIsNutritionalTargetsModalOpen(true)}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Add Day Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleAddEmptyDay}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-lg hover:shadow-xl"
        >
          <MdAdd className="w-5 h-5" />
          Add New Day
        </button>
      </div>
      
      {/* Calendar Grid - Mobile optimized single column */}
      <div className="grid grid-cols-1 gap-6">
        {getVisibleDates().map((date) => {
          const dayKey = format(date, 'yyyy-MM-dd');
          const dayItems = plannedMeals[dayKey] || [];
          
          // Show days with meals or explicitly visible empty days
          if (dayItems.length > 0 || visibleEmptyDays.includes(dayKey)) {
            return renderDayCard(date);
          }
          
          return null;
        })}
      </div>
    </>
  );
}

export default MealPlannerMobileView;
