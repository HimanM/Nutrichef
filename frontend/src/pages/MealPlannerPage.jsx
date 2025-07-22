import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useMealPlanSelection } from '../context/MealPlanSelectionContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { authenticatedFetch } from '../utils/apiUtil.js';
import { consolidateBasketItems } from '../utils/basketUtils.js';
import RequireLoginModal from '../components/auth/RequireLoginModal.jsx';
import NutritionalTargetsModal from '../components/ui/NutritionalTargetsModal.jsx';
import MealSuggestions from '../components/pages/meal-planner/MealSuggestions.jsx';
import RecipePalette from '../components/pages/meal-planner/RecipePalette.jsx';
import MealPlannerActionBar from '../components/pages/meal-planner/MealPlannerActionBar.jsx';
import MealPlannerMobileView from '../components/pages/meal-planner/MealPlannerMobileView.jsx';
import MealPlannerDesktopView from '../components/pages/meal-planner/MealPlannerDesktopView.jsx';
import jsPDF from 'jspdf';
import { format, addDays, startOfToday as getStartOfToday, isToday, isTomorrow, isBefore, parseISO } from 'date-fns';
import { MdClose, MdAdd } from 'react-icons/md';

const MEAL_PLAN_PALETTE_KEY = 'mealPlanPaletteRecipes';
const PLANNED_MEALS_KEY = 'plannedMealsData';
const SHOPPING_BASKET_KEY = 'shoppingBasketItems';


function MealPlannerPage() {
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
            <MealPlannerActionBar
              isPaletteVisible={isPaletteVisible}
              togglePaletteVisibility={togglePaletteVisibility}
              viewMode={viewMode}
              setViewMode={setViewMode}
              setIsNutritionalTargetsModalOpen={setIsNutritionalTargetsModalOpen}
              handleAddAllToBasket={handleAddAllToBasket}
              isAddingToBasket={isAddingToBasket}
              plannedMeals={plannedMeals}
              handleSaveToCloud={handleSaveToCloud}
              isSavingToCloud={isSavingToCloud}
              handleLoadFromCloudConfirmation={handleLoadFromCloudConfirmation}
              isLoadingFromCloud={isLoadingFromCloud}
              handleDownloadTXT={handleDownloadTXT}
              handleDownloadPDF={handleDownloadPDF}
              basketMessage={basketMessage}
            />

            {/* Calendar Views */}
            {isMobile ? (
              <MealPlannerMobileView
                currentWeekDates={currentWeekDates}
                viewMode={viewMode}
                plannedMeals={plannedMeals}
                expandedDays={expandedDays}
                toggleExpanded={toggleExpanded}
                selectedRecipe={selectedRecipe}
                recipeSelectedForPlanning={recipeSelectedForPlanning}
                handleAssignRecipeToDay={handleAssignRecipeToDay}
                handleRemoveRecipeFromDay={handleRemoveRecipeFromDay}
                handleOpenSuggestions={handleOpenSuggestions}
                userNutritionalTargets={userNutritionalTargets}
                setIsNutritionalTargetsModalOpen={setIsNutritionalTargetsModalOpen}
                visibleEmptyDays={visibleEmptyDays}
                handleAddEmptyDay={handleAddEmptyDay}
              />
            ) : (
              <MealPlannerDesktopView
                currentWeekDates={currentWeekDates}
                viewMode={viewMode}
                plannedMeals={plannedMeals}
                expandedDays={expandedDays}
                toggleExpanded={toggleExpanded}
                selectedRecipe={selectedRecipe}
                recipeSelectedForPlanning={recipeSelectedForPlanning}
                handleAssignRecipeToDay={handleAssignRecipeToDay}
                handleRemoveRecipeFromDay={handleRemoveRecipeFromDay}
                handleOpenSuggestions={handleOpenSuggestions}
                userNutritionalTargets={userNutritionalTargets}
                setIsNutritionalTargetsModalOpen={setIsNutritionalTargetsModalOpen}
                visibleEmptyDays={visibleEmptyDays}
                handleAddEmptyDay={handleAddEmptyDay}
              />
            )}
          </div>
        </div>
      </div>

      {/* Recipe Palette */}
      <RecipePalette
        isPaletteVisible={isPaletteVisible}
        setIsPaletteVisible={setIsPaletteVisible}
        paletteRecipes={paletteRecipes}
        loadingPalette={loadingPalette}
        paletteError={paletteError}
        selectedRecipe={selectedRecipe}
        recipeSelectedForPlanning={recipeSelectedForPlanning}
        handleRecipeSelect={handleRecipeSelect}
        setRecipeSelectedForPlanning={setRecipeSelectedForPlanning}
        handleRemoveFromPalette={handleRemoveFromPalette}
        handleClearPalette={handleClearPalette}
        isMobile={isMobile}
        paletteRef={paletteRef}
      />

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

export default MealPlannerPage;
