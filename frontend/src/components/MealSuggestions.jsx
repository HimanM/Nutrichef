import React, { useState, useEffect } from 'react';
import { MdLightbulb, MdAdd, MdClose, MdRefresh, MdExpandMore, MdExpandLess } from 'react-icons/md';
import { HiOutlineSparkles, HiOutlineX } from 'react-icons/hi';
import { authenticatedFetch } from '../utils/apiUtil.js';
import { useAuth } from '../context/AuthContext.jsx';
import { format } from 'date-fns';
import MobileModal from './MobileModal.jsx';

const MealSuggestions = ({ 
  selectedDate, 
  existingMeals = [], 
  userNutritionalTargets = {},
  onAddSuggestion,
  isVisible = false,
  onClose,
  isMobile = false
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [remainingTargets, setRemainingTargets] = useState({});
  const [expandedCard, setExpandedCard] = useState(null);
  const auth = useAuth();

  const fetchSuggestions = async () => {
    if (!selectedDate || !auth.token) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await authenticatedFetch('/api/meal-planner/suggest-meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_date: format(selectedDate, 'yyyy-MM-dd'),
          existing_meals: existingMeals
        })
      }, auth);

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setRemainingTargets(data.remaining_targets || {});
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch meal suggestions');
      }
    } catch (err) {
      setError('Network error occurred while fetching suggestions');
      console.error('Error fetching meal suggestions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible && selectedDate) {
      fetchSuggestions();
    }
  }, [isVisible, selectedDate, existingMeals]);

  const handleAddSuggestion = (recipe) => {
    if (onAddSuggestion) {
      onAddSuggestion(recipe);
    }
  };

  const toggleCardExpansion = (recipeId) => {
    setExpandedCard(expandedCard === recipeId ? null : recipeId);
  };

  if (!isVisible) return null;

  const hasTargets = Object.values(userNutritionalTargets).some(target => target && target > 0);

  // Shared content component
  const SuggestionContent = () => (
    <div className="space-y-4 md:space-y-6">
      {!hasTargets && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 md:p-4">
          <div className="flex items-center gap-2 mb-2">
            <MdLightbulb className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
            <h3 className="font-medium text-amber-800 text-sm md:text-base">Set Nutritional Targets</h3>
          </div>
          <p className="text-xs md:text-sm text-amber-700">
            {isMobile ? 
              "Set your daily nutritional targets to get personalized meal suggestions." :
              "To get personalized meal suggestions, please set your daily nutritional targets in the meal planner settings."
            }
          </p>
        </div>
      )}

      {/* Remaining Targets Summary */}
      {hasTargets && Object.keys(remainingTargets).length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 md:p-4">
          <h3 className="font-medium text-emerald-800 mb-2 md:mb-3 text-sm md:text-base">Remaining Daily Targets</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 text-xs md:text-sm">
            <div className={isMobile ? "flex justify-between" : ""}>
              <span className="text-emerald-600 font-medium">Calories:</span>
              <span className={`text-emerald-800 ${!isMobile ? 'ml-1' : ''}`}>
                {Math.round(remainingTargets.calories || 0)}{!isMobile && ' kcal'}
              </span>
            </div>
            <div className={isMobile ? "flex justify-between" : ""}>
              <span className="text-emerald-600 font-medium">Protein:</span>
              <span className={`text-emerald-800 ${!isMobile ? 'ml-1' : ''}`}>
                {Math.round(remainingTargets.protein || 0)}g
              </span>
            </div>
            <div className={isMobile ? "flex justify-between" : ""}>
              <span className="text-emerald-600 font-medium">Carbs:</span>
              <span className={`text-emerald-800 ${!isMobile ? 'ml-1' : ''}`}>
                {Math.round(remainingTargets.carbs || 0)}g
              </span>
            </div>
            <div className={isMobile ? "flex justify-between" : ""}>
              <span className="text-emerald-600 font-medium">Fat:</span>
              <span className={`text-emerald-800 ${!isMobile ? 'ml-1' : ''}`}>
                {Math.round(remainingTargets.fat || 0)}g
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8 md:py-12">
          <div className="text-center">
            <MdRefresh className="animate-spin h-6 w-6 md:h-8 md:w-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-gray-600 text-sm md:text-base">
              {isMobile ? "Generating suggestions..." : "Generating personalized suggestions..."}
            </p>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {!isLoading && suggestions.length > 0 && (
        <div className={isMobile ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
          {suggestions.map((recipe) => (
            <div
              key={recipe.RecipeID}
              className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${
                isMobile ? "shadow-sm" : "hover:shadow-md"
              } transition-shadow`}
            >
              {isMobile ? (
                // Mobile card layout
                <div className="p-3">
                  <div className="flex items-start gap-3">
                    {/* Mobile Recipe Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {recipe.ImageURL ? (
                        <img
                          src={recipe.ImageURL}
                          alt={recipe.Title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center ${recipe.ImageURL ? 'hidden' : 'flex'}`}>
                        <span className="text-gray-400 text-lg font-semibold">
                          {recipe.Title?.charAt(0)?.toUpperCase() || 'R'}
                        </span>
                      </div>
                    </div>

                    {/* Mobile Recipe Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 text-sm line-clamp-2 mb-1">
                        {recipe.Title}
                      </h4>
                      
                      {recipe.nutrition_fit && (
                        <p className="text-xs text-emerald-600 mb-2 bg-emerald-50 px-2 py-1 rounded">
                          {recipe.nutrition_fit}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>{recipe.CookingTime ? `${recipe.CookingTime} min` : 'Quick'}</span>
                        <span>{recipe.Servings || 1} servings</span>
                      </div>

                      <button
                        onClick={() => handleAddSuggestion(recipe)}
                        className="w-full bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium touch-manipulation"
                      >
                        <MdAdd className="w-4 h-4" />
                        Add to Plan
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Desktop card layout
                <div className="h-full flex flex-col">
                  <div className="h-32 bg-gray-100 overflow-hidden flex-shrink-0">
                    {recipe.ImageURL ? (
                      <img
                        src={recipe.ImageURL}
                        alt={recipe.Title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center ${recipe.ImageURL ? 'hidden' : 'flex'}`}>
                      <span className="text-gray-400 text-2xl font-semibold">
                        {recipe.Title?.charAt(0)?.toUpperCase() || 'R'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    {/* Title with fixed height */}
                    <div className="h-12 mb-2">
                      <h4 className="font-medium text-gray-800 line-clamp-2 leading-tight">
                        {recipe.Title}
                      </h4>
                    </div>
                    
                    {/* Nutrition fit info with fixed height */}
                    <div className="h-6 mb-2">
                      {recipe.nutrition_fit && (
                        <p className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded line-clamp-1">
                          {recipe.nutrition_fit}
                        </p>
                      )}
                    </div>

                    {/* Recipe details */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>{recipe.CookingTime ? `${recipe.CookingTime} min` : 'Quick recipe'}</span>
                      <span>{recipe.Servings || 1} servings</span>
                    </div>

                    {/* Button pushed to bottom */}
                    <div className="mt-auto">
                      <button
                        onClick={() => handleAddSuggestion(recipe)}
                        className="w-full bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <MdAdd className="w-4 h-4" />
                        Add to Meal Plan
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No Suggestions State */}
      {!isLoading && !error && suggestions.length === 0 && hasTargets && (
        <div className="text-center py-8 md:py-12">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
            <MdLightbulb className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
          </div>
          <h3 className="text-base md:text-lg font-medium text-gray-800 mb-2">No Suggestions Available</h3>
          <p className="text-gray-600 text-sm md:text-base px-4 md:max-w-md md:mx-auto">
            {isMobile ? 
              "We couldn't find suitable meal suggestions based on your current targets." :
              "We couldn't find suitable meal suggestions based on your current nutritional targets and existing meals. Try adjusting your targets or removing some planned meals."
            }
          </p>
        </div>
      )}
    </div>
  );

  // Mobile layout using MobileModal
  if (isMobile) {
    return (
      <MobileModal
        isOpen={isVisible}
        onClose={onClose}
        title="Meal Suggestions"
        dragToClose={true}
        className="max-h-[85vh]"
      >
        {/* Mobile header with date and refresh */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
              <HiOutlineSparkles className="w-3 h-3 text-white" />
            </div>
            <p className="text-sm text-gray-600">
              {format(selectedDate, 'EEE, MMM d')}
            </p>
          </div>
          <button
            onClick={fetchSuggestions}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-emerald-600 rounded-lg transition-colors touch-manipulation"
            title="Refresh suggestions"
          >
            <MdRefresh className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <SuggestionContent />
      </MobileModal>
    );
  }

  // Desktop layout
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Desktop Header */}
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
              <HiOutlineSparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Meal Suggestions</h2>
              <p className="text-sm text-gray-600">
                AI-powered recommendations for {format(selectedDate, 'EEEE, MMMM d')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchSuggestions}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              title="Refresh suggestions"
            >
              <MdRefresh className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <MdClose className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Desktop Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          <SuggestionContent />
        </div>
      </div>
    </div>
  );
};

export default MealSuggestions;
