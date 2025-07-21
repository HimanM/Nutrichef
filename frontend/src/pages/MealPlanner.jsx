import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useMealPlanSelection } from '../context/MealPlanSelectionContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { authenticatedFetch } from '../utils/apiUtil.js';
import { consolidateBasketItems } from '../utils/basketUtils.js';
import MealItemCard from '../components/MealItemCard.jsx';
import RequireLoginModal from '../components/auth/RequireLoginModal.jsx';
import NutritionalProgress from '../components/NutritionalProgress.jsx';
import NutritionalTargetsModal from '../components/NutritionalTargetsModal.jsx';
import MealSuggestions from '../components/MealSuggestions.jsx';
import jsPDF from 'jspdf';
import { format, addDays, startOfToday as getStartOfToday, isToday, isTomorrow, isBefore, parseISO } from 'date-fns';
import { 
  MdClear, MdDeleteOutline, MdSave, MdCloudDownload, MdDownload, MdClose, 
  MdShoppingCart, MdAddShoppingCart, MdCalendarToday, MdViewWeek, MdViewDay, MdSettings,
  MdAdd, MdExpandMore, MdExpandLess, MdList
} from 'react-icons/md';
import { AiOutlineLoading } from 'react-icons/ai';
import { 
  HiOutlineCalendar, HiOutlineCloudUpload, HiOutlineDocumentDownload, 
  HiOutlineEye, HiOutlineEyeOff, HiOutlineShoppingBag, HiOutlinePlus,
  HiOutlineMinus, HiOutlineTrash, HiOutlineRefresh, HiOutlineMenu, HiOutlineSparkles
} from 'react-icons/hi';

const MEAL_PLAN_PALETTE_KEY = 'mealPlanPaletteRecipes';
const PLANNED_MEALS_KEY = 'plannedMealsData';
const SHOPPING_BASKET_KEY = 'shoppingBasketItems';


function MealPlanner() {
  const [paletteRecipes, setPaletteRecipes] = useState([]);
  const [loadingPalette, setLoadingPalette] = useState(true);
  const [paletteError, setPaletteError] = useState(null);
  const [plannedMeals, setPlannedMeals] = useState({});
  const [currentWeekDates, setCurrentWeekDates] = useState([]);
  const [isSavingToCloud, setIsSavingToCloud] = useState(false);
  const [isLoadingFromCloud, setIsLoadingFromCloud] = useState(false);
  const [isRequireLoginModalOpen, setIsRequireLoginModalOpen] = useState(false);
  const [isPaletteVisible, setIsPaletteVisible] = useState(false);
  const [viewMode, setViewMode] = useState('week'); // 'week', 'day'
  const [isAddingToBasket, setIsAddingToBasket] = useState(false);
  const [basketMessage, setBasketMessage] = useState('');
  const [expandedDays, setExpandedDays] = useState(new Map()); // Track expanded state for each day
  const [userNutritionalTargets, setUserNutritionalTargets] = useState({});
  const [isNutritionalTargetsModalOpen, setIsNutritionalTargetsModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null); // Simplified selection state
  const [isMobile, setIsMobile] = useState(false);
  const [showMealSuggestions, setShowMealSuggestions] = useState(false);
  const [suggestionDate, setSuggestionDate] = useState(null);
  const isInitialMount = useRef(true);
  const isInitializing = useRef(true);
  const [visibleEmptyDays, setVisibleEmptyDays] = useState([]);
  const paletteRef = useRef(null);

  const { recipeSelectedForPlanning, setRecipeSelectedForPlanning, clearRecipeSelection } = useMealPlanSelection();
  const auth = useAuth();
  const { showModal } = useModal();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Redirect unauthenticated users to login page
  useEffect(() => {
    if (!auth.token) {
      setIsRequireLoginModalOpen(true);
    }
  }, [auth.token]);

  const handleRequireLoginModalClose = () => {
    setIsRequireLoginModalOpen(false);
    navigate('/login', { state: { from: location } });
  };

  // Handle recipe selection for mobile/desktop
  const handleRecipeSelect = (recipe) => {
    setSelectedRecipe(recipe);
    if (isMobile) {
      setIsPaletteVisible(false); // Close palette on mobile after selection
    }
  };

  const clearSelection = () => {
    setSelectedRecipe(null);
    clearRecipeSelection();
  };

  // Handle meal suggestions
  const handleOpenSuggestions = (date) => {
    setSuggestionDate(date);
    setShowMealSuggestions(true);
  };

  const handleAddSuggestionToDay = (recipe) => {
    if (suggestionDate) {
      const dayKey = format(suggestionDate, 'yyyy-MM-dd');
      handleAssignRecipeToDay(dayKey, recipe);
      setShowMealSuggestions(false);
    }
  };

  // Handle clicks outside palette to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isPaletteVisible) return;
      
      // Don't close if clicking on the palette itself
      if (paletteRef.current && paletteRef.current.contains(event.target)) {
        return;
      }
      
      // Don't close if clicking on the show/hide recipes button
      if (event.target.closest('[data-palette-toggle]')) {
        return;
      }
      
      // Don't close if clicking on a day card (to assign recipe)
      if (event.target.closest('[data-day-card]')) {
        return;
      }
      
      // Close palette for any other clicks
      setIsPaletteVisible(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPaletteVisible]);

  // Fetch user nutritional targets
  const fetchUserNutritionalTargets = useCallback(async () => {
    if (!auth.token) return;
    
    try {
      const response = await authenticatedFetch('/api/user/preferences', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }, auth);
      
      if (response.ok) {
        const userData = await response.json();
        const targets = {
          DailyCalories: userData.DailyCalories,
          DailyProtein: userData.DailyProtein,
          DailyCarbs: userData.DailyCarbs,
          DailyFat: userData.DailyFat,
          DailyFiber: userData.DailyFiber,
          DailySugar: userData.DailySugar,
          DailySodium: userData.DailySodium
        };
        setUserNutritionalTargets(targets);
      } else {
        console.error('Failed to fetch user preferences. Response status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user nutritional targets:', error);
      showModal('alert', 'Error', 'Failed to fetch user nutritional targets. Please try again later.', {iconType: 'error'});
    }
  }, [auth]);

  // Fetch nutritional targets when auth changes
  useEffect(() => {
    if (auth.token) {
      fetchUserNutritionalTargets();
    }
  }, [auth.token, fetchUserNutritionalTargets]);

  // Save nutritional targets
  const handleSaveNutritionalTargets = async (targets) => {
    if (!auth.token) {
      setIsRequireLoginModalOpen(true);
      return;
    }

    try {
      const response = await authenticatedFetch('/api/user/nutritional-targets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(targets),
      }, auth);

      if (response.ok) {
        const result = await response.json();
        setUserNutritionalTargets(targets);
        showModal('alert', 'Success', 'Nutritional targets updated successfully!', {iconType: 'success'});
        
        // Refresh the targets to ensure they're up to date
        setTimeout(() => {
          fetchUserNutritionalTargets();
        }, 100);
      } else {
        const error = await response.json();
        showModal('alert', 'Error', error.error || 'Failed to update nutritional targets', {iconType: 'error'});
      }
    } catch (error) {
      showModal('alert', 'Error', 'Failed to save nutritional targets', {iconType: 'error'});
    }
  };

  // Initialize dates and load saved data
  useEffect(() => {
    const todayForDateGen = getStartOfToday();
    const dates = Array.from({length: 14}, (_, i) => addDays(todayForDateGen, i));
    setCurrentWeekDates(dates);
    setLoadingPalette(true); 
    setPaletteError(null);
    
    try {
      const storedPalette = localStorage.getItem(MEAL_PLAN_PALETTE_KEY);
      setPaletteRecipes(storedPalette ? JSON.parse(storedPalette) : []);
    } catch (err) {
      setPaletteError("Could not load saved recipes palette.");
    } finally { 
      setLoadingPalette(false); 
    }

    try {
      const storedPlannedMealsString = localStorage.getItem(PLANNED_MEALS_KEY);
      if (storedPlannedMealsString) {
        const loadedPlannedMeals = JSON.parse(storedPlannedMealsString);
        
        const today = getStartOfToday();
        const futureOrTodayPlannedMeals = {};
        for (const dateKey in loadedPlannedMeals) {
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
            const entryDate = parseISO(dateKey);
            if (!isBefore(entryDate, today)) {
              futureOrTodayPlannedMeals[dateKey] = loadedPlannedMeals[dateKey];
            }
          }
        }
        setPlannedMeals(futureOrTodayPlannedMeals);
      } else {
        setPlannedMeals({});
      }
    } catch (err) { 
      console.error('Error loading meal plan from localStorage:', err);
      setPlannedMeals({}); 
    }
    
    // Mark initialization as complete after loading data with a small delay
    setTimeout(() => {
      isInitialMount.current = false;
      isInitializing.current = false;
    }, 100);
  }, []);

  // Save planned meals to localStorage
  useEffect(() => {
    // Skip saving during initial mount/load
    if (isInitialMount.current || isInitializing.current) { 
      return; 
    }
    
    try {
      if (Object.keys(plannedMeals).length > 0) {
        const dataToSave = JSON.stringify(plannedMeals);
        localStorage.setItem(PLANNED_MEALS_KEY, dataToSave);
      } else {
        localStorage.removeItem(PLANNED_MEALS_KEY);
      }
    } catch (error) {
      console.error('Error saving meal plan to localStorage:', error);
    }
  }, [plannedMeals]);



  // Fetch recipe ingredients for shopping basket
  const fetchRecipeIngredients = async (recipeId) => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch recipe: ${response.status}`);
      }
      const recipeData = await response.json();
      return recipeData.ingredients || [];
    } catch (error) {
      console.error(`Error fetching ingredients for recipe ${recipeId}:`, error);
      return [];
    }
  };

  // Add all ingredients from meal plan to shopping basket
  const handleAddAllToBasket = async () => {
    if (!auth.token) { 
      setIsRequireLoginModalOpen(true); 
      return; 
    }

    if (Object.keys(plannedMeals).length === 0) {
      showModal('alert', 'Empty Plan', 'Your meal plan is empty.', {iconType: 'info'});
      return;
    }

    setIsAddingToBasket(true);
    setBasketMessage('');

    try {
      // Collect all unique recipes from the meal plan
      const uniqueRecipes = new Map();
      for (const dateKey in plannedMeals) {
        plannedMeals[dateKey].forEach(meal => {
          if (!uniqueRecipes.has(meal.RecipeID)) {
            uniqueRecipes.set(meal.RecipeID, meal);
          }
        });
      }

      // Fetch ingredients for all recipes
      const allIngredients = [];
      for (const [recipeId, recipe] of uniqueRecipes) {
        const ingredients = await fetchRecipeIngredients(recipeId);
        ingredients.forEach(ingredient => {
          allIngredients.push({
            id: `${ingredient.RecipeIngredientID || ingredient.IngredientID}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: ingredient.IngredientName,
            quantity: ingredient.Quantity || '',
            unit: ingredient.Unit || '',
            recipeTitle: recipe.Title,
            recipeId: recipe.RecipeID,
            isChecked: false
          });
        });
      }

      if (allIngredients.length === 0) {
        showModal('alert', 'No Ingredients', 'No ingredients found in your meal plan recipes.', {iconType: 'info'});
        return;
      }

      // Add to existing basket using consolidation logic
      const existingBasketString = localStorage.getItem(SHOPPING_BASKET_KEY);
      const existingBasket = existingBasketString ? JSON.parse(existingBasketString) : [];
      const consolidatedBasket = consolidateBasketItems(existingBasket, allIngredients);
      localStorage.setItem(SHOPPING_BASKET_KEY, JSON.stringify(consolidatedBasket));

      setBasketMessage(`${allIngredients.length} ingredients added to shopping basket!`);
      setTimeout(() => setBasketMessage(''), 3000);
      
      showModal('alert', 'Success', `${allIngredients.length} ingredients added to your shopping basket!`, {iconType: 'success'});

    } catch (error) {
      console.error('Error adding ingredients to basket:', error);
      showModal('alert', 'Error', 'Failed to add ingredients to shopping basket.', {iconType: 'error'});
    } finally {
      setIsAddingToBasket(false);
    }
  };

  const handleAssignRecipeToDay = (dayKey, recipeToAssign) => {
    if (!recipeToAssign) return;
    
    // Ensure the recipe has the proper structure with NutritionInfo
    const recipeWithNutrition = {
      ...recipeToAssign,
      NutritionInfo: recipeToAssign.NutritionInfoJSON || recipeToAssign.NutritionInfo || null,
      planInstanceId: `${recipeToAssign.RecipeID}-${Date.now()}`
    };
    
    setPlannedMeals(prev => {
      const dayItems = [...(prev[dayKey] || [])];
      dayItems.push(recipeWithNutrition);
      const newPlannedMeals = { ...prev, [dayKey]: dayItems };
      return newPlannedMeals;
    });
    
    // Clear selection after assignment
    clearSelection();
    setVisibleEmptyDays(prev => prev.filter(key => key !== dayKey));
    
    // Show success message
    showModal('alert', 'Recipe Added', `${recipeToAssign.Title} has been added to your meal plan.`, {iconType: 'success'});
  };

  const handleRemoveRecipeFromDay = (dayKey, planInstanceIdToRemove) => {
    setPlannedMeals(prev => {
      const dayItems = (prev[dayKey] || []).filter(item => item.planInstanceId !== planInstanceIdToRemove);
      if (dayItems.length === 0) { 
        const newPlan = {...prev}; 
        delete newPlan[dayKey]; 
        return newPlan; 
      }
      return { ...prev, [dayKey]: dayItems };
    });
  };

  const handleRemoveFromPalette = (recipeIdToRemove) => {
    const updatedPalette = paletteRecipes.filter(r => r.RecipeID !== recipeIdToRemove);
    setPaletteRecipes(updatedPalette);
    localStorage.setItem(MEAL_PLAN_PALETTE_KEY, JSON.stringify(updatedPalette));
    if (selectedRecipe?.RecipeID === recipeIdToRemove) {
      clearSelection();
    }
  };

  const handleClearPalette = () => {
    showModal('confirm', 'Clear Recipe Palette?', `Are you sure you want to remove all ${paletteRecipes.length} recipes from your palette? This action cannot be undone.`).then(confirmed => {
      if (confirmed) {
        setPaletteRecipes([]);
        localStorage.removeItem(MEAL_PLAN_PALETTE_KEY);
        clearSelection();
        showModal('alert', 'Palette Cleared', 'All recipes have been removed from your palette.', {iconType: 'success'});
      }
    });
  };

  const handleSaveToCloud = async () => {
    if (!auth.token) { 
      setIsRequireLoginModalOpen(true); 
      return; 
    }
    setIsSavingToCloud(true);
    try {
      const response = await authenticatedFetch('/api/meal-planner/save', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plannedMeals)
      }, auth);
      const data = await response.json();
      if (response.ok) showModal('alert', 'Success', data.msg || 'Meal plan saved!', {iconType: 'success'});
      else throw new Error(data.msg || `Failed to save. Status: ${response.status}`);
    } catch (error) { 
      showModal('alert', 'Save Error', error.message, {iconType: 'error'});
    } finally { 
      setIsSavingToCloud(false); 
    }
  };

  const handleLoadFromCloudLogic = async () => {
    if (!auth.token) { 
      setIsRequireLoginModalOpen(true); 
      return; 
    }
    setIsLoadingFromCloud(true);
    try {
      const response = await authenticatedFetch('/api/meal-planner/load', { method: 'GET' }, auth);
      const loadedData = await response.json();
      if (!response.ok) throw new Error(loadedData.msg || `Failed to load. Status: ${response.status}`);
      
      if (loadedData && typeof loadedData === 'object' && Object.keys(loadedData).length > 0) {
        const today = getStartOfToday(); 
        const futureOrTodayPlannedMeals = {};
        for (const dateKey in loadedData) {
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
            const entryDate = parseISO(dateKey);
            if (!isBefore(entryDate, today)) futureOrTodayPlannedMeals[dateKey] = loadedData[dateKey];
          }
        }
        setPlannedMeals(futureOrTodayPlannedMeals);
        if (Object.keys(futureOrTodayPlannedMeals).length > 0) localStorage.setItem(PLANNED_MEALS_KEY, JSON.stringify(futureOrTodayPlannedMeals));
        else localStorage.removeItem(PLANNED_MEALS_KEY);
        showModal('alert', 'Success', 'Meal plan loaded from cloud.', {iconType: 'success'});
      } else {
        setPlannedMeals({}); 
        localStorage.removeItem(PLANNED_MEALS_KEY);
        showModal('alert', 'Info', 'No meal plan found in cloud or it was empty.', {iconType: 'info'});
      }
    } catch (error) { 
      showModal('alert', 'Load Error', error.message, {iconType: 'error'});
    } finally { 
      setIsLoadingFromCloud(false); 
    }
  };

  const handleLoadFromCloudConfirmation = () => {
    showModal('confirm', 'Load from Cloud?', 'Overwrite local changes with cloud data?').then(confirmed => {
      if (confirmed) handleLoadFromCloudLogic();
    });
  };

  const handleDownloadTXT = () => {
    if (Object.keys(plannedMeals).length === 0) { 
      showModal('alert', 'Empty Plan', 'Your meal plan is empty.', {iconType: 'info'}); 
      return; 
    }
    let content = 'Your Meal Plan\n\n';
    currentWeekDates.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      const mealsForDay = plannedMeals[dateKey];
      if (mealsForDay && mealsForDay.length > 0) {
        content += `${format(date, 'EEEE, MMMM d, yyyy')}:\n`;
        mealsForDay.forEach(recipe => content += `- ${recipe.Title}\n`);
        content += '\n';
      }
    });
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob); 
    link.download = 'meal-plan.txt';
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link); 
    URL.revokeObjectURL(link.href);
  };

  const handleDownloadPDF = () => {
    if (Object.keys(plannedMeals).length === 0) { 
      showModal('alert', 'Empty Plan', 'Your meal plan is empty.', {iconType: 'info'}); 
      return; 
    }
    const doc = new jsPDF(); 
    let y = 15; 
    const lh = 7; 
    const m = 10; 
    const pw = doc.internal.pageSize.width - m * 2;
    doc.setFontSize(18); 
    doc.text('Your Meal Plan', m, y); 
    y += 12;
    currentWeekDates.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      const meals = plannedMeals[dateKey];
      if (meals && meals.length > 0) {
        if (y > doc.internal.pageSize.height - 30) { 
          doc.addPage(); 
          y = m; 
        }
        doc.setFontSize(14); 
        doc.text(format(date, 'EEEE, MMMM d, yyyy'), m, y); 
        y += 8;
        meals.forEach(recipe => {
          if (y > doc.internal.pageSize.height - 20) { 
            doc.addPage(); 
            y = m; 
          }
          doc.setFontSize(11); 
          const lines = doc.splitTextToSize(`- ${recipe.Title}`, pw - 5);
          doc.text(lines, m + 5, y); 
          y += (lines.length * 5) + 2;
        });
        y += 5;
      }
    });
    doc.save('meal-plan.pdf');
  };

  const toggleExpanded = (dayKey, e) => {
    e.stopPropagation();
    setExpandedDays(prev => {
      const newMap = new Map(prev);
      newMap.set(dayKey, !newMap.get(dayKey));
      return newMap;
    });
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
        {/* Day Header */}
        <div className="p-3 sm:p-4 border-b border-gray-50">
          {/* Mobile layout (single row for very small screens) */}
          <div className="sm:hidden">
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

          {/* Desktop/Tablet layout (two rows for better spacing) */}
          <div className="hidden sm:block">
            {/* Top row - Title and main actions */}
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-semibold text-sm ${
                isToday(date) ? 'text-emerald-600' : isTomorrow(date) ? 'text-blue-600' : 'text-gray-700'
              }`}>
                {dayLabel}
              </h3>
              <div className="flex items-center gap-1.5">
                {/* Suggestion Button */}
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
                {/* Expand/Collapse Button */}
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
            
            {/* Bottom row - Meal counter */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-medium">
                {dayItems.length} meal{dayItems.length !== 1 ? 's' : ''}
              </span>
              {/* Optional: Add more secondary info here */}
              <div className="text-xs text-gray-400">
                {/* Could add total calories or other quick stats */}
              </div>
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

  const togglePaletteVisibility = () => {
    setIsPaletteVisible(!isPaletteVisible);
  };

  const getVisibleDates = () => {
    return viewMode === 'week' ? currentWeekDates.slice(0, 7) : currentWeekDates;
  };

  const handleAddEmptyDay = () => {
    // Find the first date in currentWeekDates that is not already shown
    const shownDates = new Set([
      ...Object.keys(plannedMeals),
      ...visibleEmptyDays
    ]);
    const nextAvailable = currentWeekDates.find(date => {
      const key = format(date, 'yyyy-MM-dd');
      return !shownDates.has(key);
    });
    if (nextAvailable) {
      setVisibleEmptyDays(prev => [...prev, format(nextAvailable, 'yyyy-MM-dd')]);
    }
  };

  // Simplified palette rendering
  const renderPalette = () => {
    if (!isPaletteVisible) return null;

    const PaletteContent = () => (
      <div ref={paletteRef} className="bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl border border-emerald-200 overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b border-emerald-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
              <MdList className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-emerald-800">Recipe Palette</h3>
            <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded-full font-medium">
              {paletteRecipes.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {paletteRecipes.length > 0 && (
              <button
                onClick={handleClearPalette}
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-md transition-all duration-200 font-medium"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsPaletteVisible(false)}
              className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-200 p-1.5 rounded-md transition-all duration-200"
            >
              <MdClose className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-emerald-50" style={{ maxHeight: `${Math.min(600, Math.max(200, paletteRecipes.length * 80 + 100))}px` }}>
          {loadingPalette && (
            <div className="flex items-center justify-center py-8">
              <AiOutlineLoading className="animate-spin h-8 w-8 text-emerald-500" />
            </div>
          )}
          
          {paletteError && (
            <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-lg">{paletteError}</div>
          )}
          
          {!loadingPalette && paletteRecipes.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <HiOutlinePlus className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-gray-500 text-sm mb-3">No recipes in palette</p>
              <RouterLink to="/recipes" className="btn-primary text-sm px-4 py-2 inline-block">
                Browse Recipes
              </RouterLink>
            </div>
          )}
          
          {!loadingPalette && paletteRecipes.length > 0 && (
            <div className="space-y-2">
              {paletteRecipes.map((recipe) => (
                <div
                  key={recipe.RecipeID}
                  className={`relative border rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                    (selectedRecipe || recipeSelectedForPlanning)?.RecipeID === recipe.RecipeID
                      ? 'border-emerald-500 bg-emerald-50 shadow-md'
                      : 'border-gray-200 hover:border-emerald-300 hover:shadow-sm'
                  }`}
                  onClick={() => {
                    handleRecipeSelect(recipe);
                    setRecipeSelectedForPlanning(recipe);
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Recipe Thumbnail */}
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
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
                    
                    {/* Recipe Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-800 leading-tight mb-1" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {recipe.Title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {recipe.CookingTime ? `${recipe.CookingTime} min` : 'Quick recipe'} • {recipe.Servings || 1} servings
                      </p>
                      {recipe.Description && (
                        <p className="text-xs text-gray-400 mt-1" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {recipe.Description}
                        </p>
                      )}
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromPalette(recipe.RecipeID);
                      }}
                      className="text-gray-400 hover:text-red-500 p-1 transition-colors flex-shrink-0 mt-1"
                      title="Remove from palette"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Selection Indicator */}
                  {(selectedRecipe || recipeSelectedForPlanning)?.RecipeID === recipe.RecipeID && (
                    <div className="mt-2 pt-2 border-t border-emerald-200 text-xs text-emerald-600 font-medium">
                      ✓ Selected • Click on a day to add
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );

    // Mobile: Full screen overlay
    if (isMobile) {
      return (
        <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          isPaletteVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <div className={`w-full max-w-md max-h-[80vh] overflow-hidden transition-all duration-500 transform ${
            isPaletteVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'
          }`}>
            <div ref={paletteRef} className="bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl border border-emerald-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b border-emerald-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                    <MdList className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-emerald-800">Recipe Palette</h3>
                  <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded-full font-medium">
                    {paletteRecipes.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {paletteRecipes.length > 0 && (
                    <button
                      onClick={handleClearPalette}
                      className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-md transition-all duration-200 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setIsPaletteVisible(false)}
                    className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-200 p-1.5 rounded-md transition-all duration-200"
                  >
                    <MdClose className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-emerald-50" style={{ maxHeight: `${Math.min(600, Math.max(200, paletteRecipes.length * 80 + 100))}px` }}>
                {loadingPalette && (
                  <div className="flex items-center justify-center py-8">
                    <AiOutlineLoading className="animate-spin h-8 w-8 text-emerald-500" />
                  </div>
                )}
                
                {paletteError && (
                  <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-lg">{paletteError}</div>
                )}
                
                {!loadingPalette && paletteRecipes.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <HiOutlinePlus className="w-6 h-6 text-emerald-400" />
                    </div>
                    <p className="text-gray-500 text-sm mb-3">No recipes in palette</p>
                    <RouterLink to="/recipes" className="btn-primary text-sm px-4 py-2 inline-block">
                      Browse Recipes
                    </RouterLink>
                  </div>
                )}
                
                {!loadingPalette && paletteRecipes.length > 0 && (
                  <div className="space-y-2">
                    {paletteRecipes.map((recipe) => (
                      <div
                        key={recipe.RecipeID}
                        className={`relative border rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                          (selectedRecipe || recipeSelectedForPlanning)?.RecipeID === recipe.RecipeID
                            ? 'border-emerald-500 bg-emerald-50 shadow-md'
                            : 'border-gray-200 hover:border-emerald-300 hover:shadow-sm'
                        }`}
                        onClick={() => {
                          handleRecipeSelect(recipe);
                          setRecipeSelectedForPlanning(recipe);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {/* Recipe Thumbnail */}
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
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
                          
                          {/* Recipe Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-800 leading-tight mb-1" style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {recipe.Title}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {recipe.CookingTime ? `${recipe.CookingTime} min` : 'Quick recipe'} • {recipe.Servings || 1} servings
                            </p>
                            {recipe.Description && (
                              <p className="text-xs text-gray-400 mt-1" style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}>
                                {recipe.Description}
                              </p>
                            )}
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromPalette(recipe.RecipeID);
                            }}
                            className="text-gray-400 hover:text-red-500 p-1 transition-colors flex-shrink-0 mt-1"
                            title="Remove from palette"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Selection Indicator */}
                        {(selectedRecipe || recipeSelectedForPlanning)?.RecipeID === recipe.RecipeID && (
                          <div className="mt-2 pt-2 border-t border-emerald-200 text-xs text-emerald-600 font-medium">
                            ✓ Selected • Click on a day to add
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Desktop: Sidebar
    return (
      <div className={`fixed left-16 top-1/2 z-40 w-96 transition-all duration-500 ease-in-out ${
        isPaletteVisible 
          ? 'transform -translate-y-1/2 translate-x-0 opacity-100' 
          : 'transform -translate-y-1/2 -translate-x-full opacity-0'
      }`}>
        <PaletteContent />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Main Content */}
      <div className={`transition-all duration-300 ${isPaletteVisible && !isMobile ? 'lg:ml-[25rem]' : ''}`}>
        <div className="section-padding">
          <div className="container-modern max-w-7xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                <span className="gradient-text">Meal Planner</span>
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Plan your weekly meals, organize recipes, and create shopping lists with ease
              </p>
            </div>

            {/* Selected Recipe Banner */}
            {(selectedRecipe || recipeSelectedForPlanning) && (
              <div className="bg-emerald-100 border border-emerald-200 rounded-xl p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                    <MdAdd className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-emerald-800">
                      Ready to add: {(selectedRecipe || recipeSelectedForPlanning)?.Title}
                    </p>
                    <p className="text-sm text-emerald-600">
                      Click on any day to add this recipe to your meal plan
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearSelection}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors font-medium"
                >
                  <MdClose className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}

            {/* Action Bar */}
            <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-4 mb-8 border border-emerald-100">
              <div className="flex flex-wrap gap-4 justify-between items-center">
                {/* Left side - View controls */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={togglePaletteVisibility}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm"
                    data-palette-toggle
                  >
                    <MdList className="w-4 h-4" />
                    {isPaletteVisible ? 'Hide' : 'Show'} Recipes
                  </button>
                  
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('week')}
                      className={`px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                        viewMode === 'week' 
                          ? 'bg-white text-emerald-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <MdViewWeek className="w-4 h-4 inline mr-1 sm:mr-2" />
                      <span className="hidden xs:inline sm:hidden md:inline">Week View</span>
                      <span className="inline xs:hidden sm:inline md:hidden">Week</span>
                    </button>
                    <button
                      onClick={() => setViewMode('day')}
                      className={`px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                        viewMode === 'day' 
                          ? 'bg-white text-emerald-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <MdViewDay className="w-4 h-4 inline mr-1 sm:mr-2" />
                      <span className="hidden xs:inline sm:hidden md:inline">2 Week View</span>
                      <span className="inline xs:hidden sm:inline md:hidden">2 Week</span>
                    </button>
                  </div>
                </div>

                {/* Right side - Action buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsNutritionalTargetsModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    title="Set nutritional targets"
                  >
                    <MdSettings className="w-4 h-4" />
                    <span>Nutrition</span>
                  </button>
                  
                  <button
                    onClick={handleAddAllToBasket}
                    disabled={isAddingToBasket || Object.keys(plannedMeals).length === 0}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isAddingToBasket ? (
                      <AiOutlineLoading className="animate-spin w-4 h-4" />
                    ) : (
                      <MdAddShoppingCart className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">Add to Basket</span>
                  </button>
                  
                  <div className="flex items-center bg-gray-100 rounded-lg">
                    <button
                      onClick={handleSaveToCloud}
                      disabled={isSavingToCloud}
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-200 rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {isSavingToCloud ? (
                        <AiOutlineLoading className="animate-spin w-4 h-4" />
                      ) : (
                        <HiOutlineCloudUpload className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline">Save</span>
                    </button>
                    
                    <button
                      onClick={handleLoadFromCloudConfirmation}
                      disabled={isLoadingFromCloud}
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-200 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium border-l border-gray-200"
                    >
                      {isLoadingFromCloud ? (
                        <AiOutlineLoading className="animate-spin w-4 h-4" />
                      ) : (
                        <HiOutlineCalendar className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline">Load</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center bg-gray-100 rounded-lg">
                    <button
                      onClick={handleDownloadTXT}
                      className="flex items-center justify-center p-2 text-gray-600 hover:bg-gray-200 rounded-l-lg transition-colors"
                      title="Download as TXT"
                    >
                      <HiOutlineDocumentDownload className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleDownloadPDF}
                      className="flex items-center justify-center p-2 text-gray-600 hover:bg-gray-200 rounded-r-lg transition-colors border-l border-gray-200"
                      title="Download as PDF"
                    >
                      <MdDownload className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Basket success message */}
              {basketMessage && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 font-medium">{basketMessage}</p>
                </div>
              )}
            </div>

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
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          </div>
        </div>
      </div>

      {/* Recipe Palette */}
      {renderPalette()}

      {/* Modals */}
      <RequireLoginModal
        isOpen={isRequireLoginModalOpen}
        onClose={handleRequireLoginModalClose}
        title="Login Required"
        message="You need to be logged in to save and load meal plans from the cloud."
        redirectState={{ from: location }}
      />

      <NutritionalTargetsModal
        isOpen={isNutritionalTargetsModalOpen}
        onClose={() => setIsNutritionalTargetsModalOpen(false)}
        onSave={handleSaveNutritionalTargets}
        currentTargets={userNutritionalTargets}
      />

      {/* Meal Suggestions Modal */}
      <MealSuggestions
        selectedDate={suggestionDate}
        existingMeals={suggestionDate ? plannedMeals[format(suggestionDate, 'yyyy-MM-dd')] || [] : []}
        userNutritionalTargets={userNutritionalTargets}
        onAddSuggestion={handleAddSuggestionToDay}
        isVisible={showMealSuggestions}
        onClose={() => setShowMealSuggestions(false)}
        isMobile={isMobile}
      />
    </div>
  );
}

export default MealPlanner;
