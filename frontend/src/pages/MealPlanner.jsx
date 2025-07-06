import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useMealPlanSelection } from '../context/MealPlanSelectionContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { authenticatedFetch } from '../utils/apiUtil.js';
import MealItemCard from '../components/MealItemCard.jsx';
import RequireLoginModal from '../components/auth/RequireLoginModal.jsx';
import NutritionalProgress from '../components/NutritionalProgress.jsx';
import NutritionalTargetsModal from '../components/NutritionalTargetsModal.jsx';
import jsPDF from 'jspdf';
import { format, addDays, startOfToday as getStartOfToday, isToday, isTomorrow, isBefore, parseISO } from 'date-fns';
import { 
  MdClear, MdDeleteOutline, MdSave, MdCloudDownload, MdDownload, MdClose, 
  MdShoppingCart, MdAddShoppingCart, MdCalendarToday, MdViewWeek, MdViewDay, MdSettings
} from 'react-icons/md';
import { AiOutlineLoading } from 'react-icons/ai';
import { 
  HiOutlineCalendar, HiOutlineCloudUpload, HiOutlineDocumentDownload, 
  HiOutlineEye, HiOutlineEyeOff, HiOutlineShoppingBag, HiOutlinePlus,
  HiOutlineMinus, HiOutlineTrash, HiOutlineRefresh
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
  const [isPaletteVisible, setIsPaletteVisible] = useState(true);
  const [viewMode, setViewMode] = useState('week'); // 'week', 'day'
  const [isAddingToBasket, setIsAddingToBasket] = useState(false);
  const [basketMessage, setBasketMessage] = useState('');
  const [expandedDays, setExpandedDays] = useState(new Map()); // Track expanded state for each day
  const [userNutritionalTargets, setUserNutritionalTargets] = useState({});
  const [isNutritionalTargetsModalOpen, setIsNutritionalTargetsModalOpen] = useState(false);
  const isInitialMount = useRef(true);
  const paletteRef = useRef(null);
  const [visibleEmptyDays, setVisibleEmptyDays] = useState([]);

  const { recipeSelectedForPlanning, setRecipeSelectedForPlanning, clearRecipeSelection } = useMealPlanSelection();
  const auth = useAuth();
  const { showModal } = useModal();
  const location = useLocation();

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
        console.log('Raw user data from preferences:', userData);
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
        console.log('Fetched nutritional targets:', targets);
        console.log('Has targets:', Object.values(targets).some(target => target && target > 0));
      } else {
        console.error('Failed to fetch user preferences:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching user nutritional targets:', error);
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

    console.log('Saving nutritional targets:', targets);
    try {
      const response = await authenticatedFetch('/api/user/nutritional-targets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(targets),
      }, auth);

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('Response result:', result);
        setUserNutritionalTargets(targets);
        console.log('Updated nutritional targets:', targets);
        showModal('alert', 'Success', 'Nutritional targets updated successfully!', {iconType: 'success'});
        
        // Refresh the targets to ensure they're up to date
        setTimeout(() => {
          fetchUserNutritionalTargets();
        }, 100);
      } else {
        const error = await response.json();
        console.error('Error response:', error);
        showModal('alert', 'Error', error.error || 'Failed to update nutritional targets', {iconType: 'error'});
      }
    } catch (error) {
      console.error('Error saving nutritional targets:', error);
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
        console.log('Loaded meal plan from localStorage:', loadedPlannedMeals);
        
        const today = getStartOfToday();
        const futureOrTodayPlannedMeals = {};
        for (const dateKey in loadedPlannedMeals) {
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
            const entryDate = parseISO(dateKey);
            if (!isBefore(entryDate, today)) {
              futureOrTodayPlannedMeals[dateKey] = loadedPlannedMeals[dateKey];
              console.log('Keeping meal data for date:', dateKey, loadedPlannedMeals[dateKey]);
            } else {
              console.log('Filtering out past date:', dateKey);
            }
          }
        }
        setPlannedMeals(futureOrTodayPlannedMeals);
        console.log('Final meal plan after filtering:', futureOrTodayPlannedMeals);
      } else {
        console.log('No meal plan found in localStorage');
        setPlannedMeals({});
      }
    } catch (err) { 
      console.error('Error loading meal plan from localStorage:', err);
      setPlannedMeals({}); 
    }
  }, []);

  // Save planned meals to localStorage
  useEffect(() => {
    if (isInitialMount.current) { 
      isInitialMount.current = false; 
      return; 
    }
    
    try {
      if (Object.keys(plannedMeals).length > 0) {
        const dataToSave = JSON.stringify(plannedMeals);
        localStorage.setItem(PLANNED_MEALS_KEY, dataToSave);
        console.log('Saved meal plan to localStorage:', plannedMeals);
      } else {
        localStorage.removeItem(PLANNED_MEALS_KEY);
        console.log('Removed meal plan from localStorage');
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

      // Add to existing basket
      const existingBasketString = localStorage.getItem(SHOPPING_BASKET_KEY);
      let basket = existingBasketString ? JSON.parse(existingBasketString) : [];
      basket = [...basket, ...allIngredients];
      localStorage.setItem(SHOPPING_BASKET_KEY, JSON.stringify(basket));

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
      console.log('Updated meal plan:', newPlannedMeals);
      return newPlannedMeals;
    });
    clearRecipeSelection();
    setVisibleEmptyDays(prev => prev.filter(key => key !== dayKey));
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
    if (recipeSelectedForPlanning?.RecipeID === recipeIdToRemove) clearRecipeSelection();
  };

  const handleClearPalette = () => {
    showModal('confirm', 'Clear Recipe Palette?', `Are you sure you want to remove all ${paletteRecipes.length} recipes from your palette? This action cannot be undone.`).then(confirmed => {
      if (confirmed) {
        setPaletteRecipes([]);
        localStorage.removeItem(MEAL_PLAN_PALETTE_KEY);
        if (recipeSelectedForPlanning) clearRecipeSelection();
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

    const isHighlighted = recipeSelectedForPlanning;
    const canDrop = !!recipeSelectedForPlanning;
    const hasMultipleItems = dayItems.length > 1;
    const isExpanded = expandedDays.get(dayKey) || false;

    const handleDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = (e) => {
      e.preventDefault();
      try {
        const recipeData = JSON.parse(e.dataTransfer.getData('text/plain'));
        handleAssignRecipeToDay(dayKey, recipeData);
      } catch (error) {
        console.error('Error parsing dropped recipe data:', error);
      }
    };

    const handleDayClick = () => {
      if (recipeSelectedForPlanning) {
        handleAssignRecipeToDay(dayKey, recipeSelectedForPlanning);
      }
    };

    return (
      <div key={dayKey} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
        <div className="p-4 border-b border-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-semibold text-sm ${
                isToday(date) ? 'text-emerald-600' : isTomorrow(date) ? 'text-blue-600' : 'text-gray-700'
              }`}>
                {dayLabel}
              </h3>
              <span className="text-sm bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-medium leading-tight whitespace-nowrap">
                {dayItems.length} meal{dayItems.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {dayItems.length > 0 && (
                <button
                  onClick={(e) => toggleExpanded(dayKey, e)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title={isExpanded ? "Collapse" : "Expand"}
                >
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div 
          className={`transition-all duration-200 ease-in-out ${
            canDrop ? 'bg-emerald-50 border-2 border-dashed border-emerald-300' : ''
          } ${isHighlighted ? 'ring-2 ring-emerald-500' : ''}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleDayClick}
        >
          {dayItems.length === 0 ? (
            <div className="flex items-center justify-center h-16 text-gray-400">
              <p className="text-sm">No meals planned</p>
            </div>
          ) : hasMultipleItems ? (
            <div className="p-4 space-y-3">
              {/* First item always visible */}
              <MealItemCard
                key={dayItems[0].planInstanceId}
                recipe={dayItems[0]}
                onRemove={() => handleRemoveRecipeFromDay(dayKey, dayItems[0].planInstanceId)}
                isInPalette={false}
                isCompact={true}
              />
              
              {/* Additional items - expandable */}
              {dayItems.length > 1 && (
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="space-y-3 pt-3 border-t border-gray-100">
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
                </div>
              )}
              
              {/* Show more indicator */}
              {!isExpanded && dayItems.length > 1 && (
                <div className="text-center py-2">
                  <button
                    onClick={(e) => toggleExpanded(dayKey, e)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center justify-center gap-1 mx-auto"
                  >
                    <span>Show {dayItems.length - 1} more</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4">
              <MealItemCard
                key={dayItems[0].planInstanceId}
                recipe={dayItems[0]}
                onRemove={() => handleRemoveRecipeFromDay(dayKey, dayItems[0].planInstanceId)}
                isInPalette={false}
              />
            </div>
          )}
          
          {canDrop && (
            <div className="flex items-center justify-center h-16 border-2 border-dashed border-emerald-300 rounded-lg bg-emerald-50 mx-4 mb-4">
              <p className="text-sm text-emerald-600 font-medium">Drop recipe here or click to assign</p>
            </div>
          )}
          
          {/* Nutritional Progress */}
          {dayItems.length > 0 && (
            <NutritionalProgress
              dayMeals={dayItems}
              userNutritionalTargets={userNutritionalTargets}
              isExpanded={isExpanded}
              onToggleExpand={() => toggleExpanded(dayKey)}
              onOpenSettings={() => setIsNutritionalTargetsModalOpen(true)}
            />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="section-padding">
        <div className="container-modern">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Meal Planner</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Plan your weekly meals, organize recipes, and create shopping lists
            </p>
          </div>

          {/* Action Bar */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-6 mb-8 border border-emerald-100">
            <div className="flex flex-wrap gap-4 justify-between items-center">
              {/* Left side - View controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePaletteVisibility}
                  className="btn-outline flex items-center gap-2"
                >
                  {isPaletteVisible ? (
                    <>
                      <HiOutlineEyeOff className="w-4 h-4" />
                      Hide Palette
                    </>
                  ) : (
                    <>
                      <HiOutlineEye className="w-4 h-4" />
                      Show Palette
                    </>
                  )}
                </button>
                
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                      viewMode === 'week' 
                        ? 'bg-white text-emerald-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <MdViewWeek className="w-4 h-4 inline mr-1" />
                    Week
                  </button>
                  <button
                    onClick={() => setViewMode('day')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                      viewMode === 'day' 
                        ? 'bg-white text-emerald-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <MdViewDay className="w-4 h-4 inline mr-1" />
                    2 Weeks
                  </button>
                </div>
              </div>

              {/* Center - Selected recipe indicator */}
              {recipeSelectedForPlanning && (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 border border-emerald-200 rounded-lg">
                  <span className="text-sm text-emerald-800 font-medium">
                    Selected: {recipeSelectedForPlanning.Title}
                  </span>
                  <button
                    onClick={clearRecipeSelection}
                    className="text-emerald-600 hover:text-emerald-800 transition-colors"
                    title="Clear selection"
                  >
                    <MdClose className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Right side - Action buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsNutritionalTargetsModalOpen(true)}
                  className="btn-outline flex items-center gap-2"
                  title="Set nutritional targets"
                >
                  <MdSettings className="w-4 h-4" />
                  Nutrition
                </button>
                
                <button
                  onClick={handleAddAllToBasket}
                  disabled={isAddingToBasket || Object.keys(plannedMeals).length === 0}
                  className="btn-primary flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isAddingToBasket ? (
                    <AiOutlineLoading className="animate-spin h-4 w-4" />
                  ) : (
                    <MdAddShoppingCart className="w-4 h-4" />
                  )}
                  Add to Basket
                </button>
                
                <button
                  onClick={handleSaveToCloud}
                  disabled={isSavingToCloud}
                  className="btn-outline flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isSavingToCloud ? (
                    <AiOutlineLoading className="animate-spin h-4 w-4" />
                  ) : (
                    <HiOutlineCloudUpload className="w-4 h-4" />
                  )}
                  Save
                </button>
                
                <button
                  onClick={handleLoadFromCloudConfirmation}
                  disabled={isLoadingFromCloud}
                  className="btn-outline flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isLoadingFromCloud ? (
                    <AiOutlineLoading className="animate-spin h-4 w-4" />
                  ) : (
                    <HiOutlineCalendar className="w-4 h-4" />
                  )}
                  Load
                </button>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleDownloadTXT}
                    className="btn-ghost p-2"
                    title="Download as TXT"
                  >
                    <HiOutlineDocumentDownload className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="btn-ghost p-2"
                    title="Download as PDF"
                  >
                    <MdDownload className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Basket message */}
            {basketMessage && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm text-emerald-700 font-medium">{basketMessage}</p>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleAddEmptyDay}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow"
              title="Add a new day to plan meals"
            >
              <span className="text-xl font-bold">+</span> Add Day
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Recipe Palette */}
            {isPaletteVisible && (
              <div className="lg:col-span-1">
                <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-6 sticky top-4 border border-emerald-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Recipe Palette</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {paletteRecipes.length}
                      </span>
                      {paletteRecipes.length > 0 && (
                        <button
                          onClick={handleClearPalette}
                          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-md transition-colors duration-200 font-medium"
                          title="Clear all recipes from palette"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>
                  
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
                      <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HiOutlinePlus className="w-8 h-8 text-emerald-400" />
                      </div>
                      <p className="text-gray-500 mb-4">No recipes in palette</p>
                      <RouterLink to="/recipes" className="btn-primary">
                        Browse Recipes
                      </RouterLink>
                    </div>
                  )}
                  
                  {!loadingPalette && paletteRecipes.length > 0 && (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {paletteRecipes.map((recipe) => (
                        <MealItemCard
                          key={recipe.RecipeID}
                          recipe={recipe}
                          onRemove={() => handleRemoveFromPalette(recipe.RecipeID)}
                          isInPalette={true}
                          onDragStart={() => setRecipeSelectedForPlanning(recipe)}
                          onDragEnd={clearRecipeSelection}
                          onClick={() => setRecipeSelectedForPlanning(recipe)}
                          isDragging={recipeSelectedForPlanning?.RecipeID === recipe.RecipeID}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Calendar Grid */}
            <div className={`${isPaletteVisible ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-center">
                {getVisibleDates().map((date) => {
                  const dayKey = format(date, 'yyyy-MM-dd');
                  const dayItems = plannedMeals[dayKey] || [];
                  if (dayItems.length === 0 && !visibleEmptyDays.includes(dayKey)) return null;
                  return renderDayCard(date);
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <RequireLoginModal
        isOpen={isRequireLoginModalOpen}
        onClose={() => setIsRequireLoginModalOpen(false)}
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
    </div>
  );
}

export default MealPlanner;
