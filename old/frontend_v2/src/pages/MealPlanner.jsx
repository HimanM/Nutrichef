import React, { useEffect, useState, useRef, useCallback } from 'react';
import Draggable from 'react-draggable'; // Import Draggable
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useMealPlanSelection } from '../context/MealPlanSelectionContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { authenticatedFetch } from '../utils/apiUtil.js'; // Will be mocked locally
import MealItemCard from '../components/MealItemCard.jsx'; // Tailwind version
import RequireLoginModal from '../components/auth/RequireLoginModal.jsx'; // Tailwind version
import jsPDF from 'jspdf';
import { format, addDays, startOfToday as getStartOfToday, isToday, isTomorrow, isBefore, parseISO } from 'date-fns';
import { MdClear, MdDeleteOutline, MdSave, MdCloudDownload, MdDownload, MdClose } from 'react-icons/md';
import { AiOutlineLoading } from 'react-icons/ai';

const MEAL_PLAN_PALETTE_KEY = 'mealPlanPaletteRecipes';
const PLANNED_MEALS_KEY = 'plannedMealsData';

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
  const isInitialMount = useRef(true);
  const paletteRef = useRef(null);

  const { recipeSelectedForPlanning, setRecipeSelectedForPlanning, clearRecipeSelection } = useMealPlanSelection();
  const auth = useAuth();
  const { showModal } = useModal();
  const location = useLocation();

  useEffect(() => {
    const todayForDateGen = getStartOfToday();
    const dates = Array.from({length: 14}, (_, i) => addDays(todayForDateGen, i));
    setCurrentWeekDates(dates);
    setLoadingPalette(true); setPaletteError(null);
    try {
      const storedPalette = localStorage.getItem(MEAL_PLAN_PALETTE_KEY);
      setPaletteRecipes(storedPalette ? JSON.parse(storedPalette) : []);
    } catch (err) {
      setPaletteError("Could not load saved recipes palette.");
    } finally { setLoadingPalette(false); }

    try {
      const storedPlannedMealsString = localStorage.getItem(PLANNED_MEALS_KEY);
      if (storedPlannedMealsString) {
        const loadedPlannedMeals = JSON.parse(storedPlannedMealsString);
        const today = getStartOfToday();
        const futureOrTodayPlannedMeals = {};
        for (const dateKey in loadedPlannedMeals) {
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) { // Validate dateKey format
            const entryDate = parseISO(dateKey);
            if (!isBefore(entryDate, today)) futureOrTodayPlannedMeals[dateKey] = loadedPlannedMeals[dateKey];
          }
        }
        setPlannedMeals(futureOrTodayPlannedMeals);
      } else setPlannedMeals({});
    } catch (err) { setPlannedMeals({}); }
  }, []);

  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return; }
    if (Object.keys(plannedMeals).length > 0) {
        localStorage.setItem(PLANNED_MEALS_KEY, JSON.stringify(plannedMeals));
    } else {
        localStorage.removeItem(PLANNED_MEALS_KEY);
    }
  }, [plannedMeals]);

  const handleAssignRecipeToDay = (dayKey, recipeToAssign) => {
    if (!recipeToAssign) return;
    setPlannedMeals(prev => {
      const dayItems = [...(prev[dayKey] || [])];
      dayItems.push({ ...recipeToAssign, planInstanceId: `${recipeToAssign.RecipeID}-${Date.now()}` });
      return { ...prev, [dayKey]: dayItems };
    });
    clearRecipeSelection();
  };

  const handleRemoveRecipeFromDay = (dayKey, planInstanceIdToRemove) => {
    setPlannedMeals(prev => {
      const dayItems = (prev[dayKey] || []).filter(item => item.planInstanceId !== planInstanceIdToRemove);
      if (dayItems.length === 0) { const newPlan = {...prev}; delete newPlan[dayKey]; return newPlan; }
      return { ...prev, [dayKey]: dayItems };
    });
  };

  const handleRemoveFromPalette = (recipeIdToRemove) => {
    const updatedPalette = paletteRecipes.filter(r => r.RecipeID !== recipeIdToRemove);
    setPaletteRecipes(updatedPalette);
    localStorage.setItem(MEAL_PLAN_PALETTE_KEY, JSON.stringify(updatedPalette));
    if (recipeSelectedForPlanning?.RecipeID === recipeIdToRemove) clearRecipeSelection();
  };

  const handleSaveToCloud = async () => {
    if (!auth.token) { setIsRequireLoginModalOpen(true); return; }
    setIsSavingToCloud(true);
    try {
      const response = await authenticatedFetch('/api/meal-planner/save', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plannedMeals)
      }, auth);
      const data = await response.json();
      if (response.ok) showModal('alert', 'Success', data.msg || 'Meal plan saved!', {iconType: 'success'});
      else throw new Error(data.msg || `Failed to save. Status: ${response.status}`);
    } catch (error) { showModal('alert', 'Save Error', error.message, {iconType: 'error'});
    } finally { setIsSavingToCloud(false); }
  };

  const handleLoadFromCloudLogic = async () => {
    if (!auth.token) { setIsRequireLoginModalOpen(true); return; }
    setIsLoadingFromCloud(true);
    try {
      const response = await authenticatedFetch('/api/meal-planner/load', { method: 'GET' }, auth);
      const loadedData = await response.json();
      if (!response.ok) throw new Error(loadedData.msg || `Failed to load. Status: ${response.status}`);
      
      if (loadedData && typeof loadedData === 'object' && Object.keys(loadedData).length > 0) {
        const today = getStartOfToday(); const futureOrTodayPlannedMeals = {};
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
        setPlannedMeals({}); localStorage.removeItem(PLANNED_MEALS_KEY);
        showModal('alert', 'Info', 'No meal plan found in cloud or it was empty.', {iconType: 'info'});
      }
    } catch (error) { showModal('alert', 'Load Error', error.message, {iconType: 'error'});
    } finally { setIsLoadingFromCloud(false); }
  };

  const handleLoadFromCloudConfirmation = () => {
    showModal('confirm', 'Load from Cloud?', 'Overwrite local changes with cloud data?').then(confirmed => {
      if (confirmed) handleLoadFromCloudLogic();
    });
  };

  const handleDownloadTXT = () => {
    if (Object.keys(plannedMeals).length === 0) { showModal('alert', 'Empty Plan', 'Your meal plan is empty.', {iconType: 'info'}); return; }
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
    link.href = URL.createObjectURL(blob); link.download = 'meal-plan.txt';
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); URL.revokeObjectURL(link.href);
  };
  const handleDownloadPDF = () => {
    if (Object.keys(plannedMeals).length === 0) { showModal('alert', 'Empty Plan', 'Your meal plan is empty.', {iconType: 'info'}); return; }
    const doc = new jsPDF(); let y = 15; const lh = 7; const m = 10; const pw = doc.internal.pageSize.width - m * 2;
    doc.setFontSize(18); doc.text('Your Meal Plan', m, y); y += 12;
    currentWeekDates.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      const meals = plannedMeals[dateKey];
      if (meals && meals.length > 0) {
        if (y > doc.internal.pageSize.height - 30) { doc.addPage(); y = m; }
        doc.setFontSize(14); doc.text(format(date, 'EEEE, MMMM d, yyyy'), m, y); y += 8;
        meals.forEach(recipe => {
          if (y > doc.internal.pageSize.height - 20) { doc.addPage(); y = m; }
          doc.setFontSize(11); const lines = doc.splitTextToSize(`- ${recipe.Title}`, pw - 5);
          doc.text(lines, m + 5, y); y += (lines.length * 5) + 2;
        });
        y += 5;
      }
    });
    doc.save('meal-plan.pdf');
  };

  const renderDayCard = (date) => {
    const dayKey = format(date, 'yyyy-MM-dd');
    const dayItems = plannedMeals[dayKey] || [];
    let dayLabel = format(date, 'MMM d (EEE)');
    if (isToday(date)) dayLabel = `Today (${format(date, 'MMM d')})`;
    else if (isTomorrow(date)) dayLabel = `Tomorrow (${format(date, 'MMM d')})`;

    const isHighlighted = recipeSelectedForPlanning;
    const canDrop = !!recipeSelectedForPlanning;

    const VISIBLE_ITEM_LIMIT = 3;
    const needsScroll = dayItems.length > VISIBLE_ITEM_LIMIT;

    const dayItemsContainerClasses = `min-h-[200px] bg-gray-600 rounded p-1 space-y-1 overflow-y-auto transition-all duration-150 ease-in-out ${needsScroll ? 'max-h-32' : 'max-h-none'}`;

    return (
      <div key={dayKey} className="flex-1 basis-0 min-w-[100px] sm:min-w-[120px] max-w-auto flex-shrink-0">
        <div className="bg-gray-700 rounded-lg shadow-md h-full flex flex-col p-2">
          <h4 className={`text-sm font-semibold text-center pb-1 mb-1 border-b ${isToday(date) || isTomorrow(date) ? 'text-indigo-400 border-indigo-500' : 'text-gray-300 border-gray-600'}`}>
            {dayLabel}
          </h4>
          <div 
            onClick={() => canDrop && handleAssignRecipeToDay(dayKey, recipeSelectedForPlanning)}
            className={`${dayItemsContainerClasses} ${canDrop ? 'cursor-pointer' : ''} ${isHighlighted ? 'border-2 border-dashed border-indigo-500 bg-indigo-700' : 'border-2 border-transparent'}`}
          >
            {dayItems.map((recipeItem) => (
              <MealItemCard
                key={recipeItem.planInstanceId}
                recipe={recipeItem}
                renderActions={() => (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemoveRecipeFromDay(dayKey, recipeItem.planInstanceId); }}
                    className="p-1 text-red-400 hover:text-red-500 hover:bg-red-700 rounded-full"
                    aria-label="Remove recipe from day"
                  >
                    <MdClear className="w-4 h-4" />
                  </button>
                )}
              />
            ))}
            {dayItems.length === 0 && !recipeSelectedForPlanning && (
              <p className="text-xs text-gray-400 text-center italic m-auto">Select recipe then click here</p>
            )}
            {dayItems.length === 0 && recipeSelectedForPlanning && (
              <p className="text-xs text-indigo-300 text-center font-semibold m-auto">Assign "{recipeSelectedForPlanning.Title}"?</p> 
            )}
            {dayItems.length > 0 && recipeSelectedForPlanning && (
              <p className="text-xs text-indigo-300 text-center font-semibold m-auto pt-2">Add "{recipeSelectedForPlanning.Title}"?</p>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  const commonButtonClassName = "px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center";

  const togglePaletteVisibility = () => {
    setIsPaletteVisible(!isPaletteVisible);
  };

  return (
    <div className="max-w-full mx-auto py-8 px-2 sm:px-4 lg:px-6"> 
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-100 text-center mb-6">
        Meal Planner
      </h1>

      {recipeSelectedForPlanning && (
        <div className="mb-4 p-3 bg-blue-800 border border-blue-600 text-blue-300 rounded-md text-sm flex justify-between items-center max-w-2xl mx-auto shadow">
          <span>Selected: <strong>{recipeSelectedForPlanning.Title}</strong>. Click a day slot to assign.</span>
          <button onClick={clearRecipeSelection} className="ml-4 px-2 py-1 text-xs border border-blue-400 text-blue-200 hover:bg-blue-700 rounded">Clear</button>
        </div>
      )}

      <RequireLoginModal isOpen={isRequireLoginModalOpen} onClose={() => setIsRequireLoginModalOpen(false)} redirectState={{ from: location }} title="Login Required for Cloud Actions" />
      
      <div className="flex flex-col lg:flex-row gap-6"> 
        
        <div className="w-auto lg:w-auto relative"> 
          { (
            <Draggable nodeRef={paletteRef} handle=".drag-handle" defaultPosition={{x: 0, y: 0}}>
              <div
                ref={paletteRef}
                className={`fixed top-16 left-4 w-auto z-50 bg-gray-800 p-3 shadow-lg rounded-lg border border-blue-500 flex flex-col items-center transition-all duration-300 ease-in-out transform ${
                  isPaletteVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                }`}
                style={{zIndex: 50}}
              >
                <div className="w-full flex flex-col items-stretch mb-2">
                  <div className="drag-handle w-full flex justify-end">
                    <button 
                      onClick={togglePaletteVisibility} 
                      className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"
                      aria-label="Close palette"
                    >
                      <MdClose className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="drag-handle cursor-move w-full text-center border-b border-gray-700 pb-2">
                    <h2 className="text-lg font-semibold text-gray-200">Recipe Palette</h2>
                  </div>
                </div>
                {loadingPalette && <div className="flex justify-center py-4"><AiOutlineLoading className="animate-spin h-10 w-10 text-indigo-400" /></div>}
                {paletteError && <div className="p-3 bg-red-700 text-red-100 rounded text-xs">{paletteError}</div>}
                {isPaletteVisible && !loadingPalette && !paletteError && paletteRecipes.length === 0 && (
                  <p className="text-xs text-gray-400 italic">
                    No recipes in palette. <RouterLink to="/recipes" className="text-indigo-400 hover:underline">Browse recipes</RouterLink> to add.
                  </p>
                )}
                {isPaletteVisible && !loadingPalette && !paletteError && paletteRecipes.length > 0 && (
                  <div className="max-h-[calc(70vh-50px)] overflow-y-auto space-y-2 p-0">
                    {paletteRecipes.map((recipe) => (
                      <MealItemCard
                        key={recipe.RecipeID}
                        recipe={recipe}
                        onClick={() => recipeSelectedForPlanning?.RecipeID === recipe.RecipeID ? clearRecipeSelection() : setRecipeSelectedForPlanning(recipe)}
                        renderActions={() => (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleRemoveFromPalette(recipe.RecipeID); }}
                            className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-700 rounded-full"
                            aria-label="Remove from palette"
                          >
                            <MdDeleteOutline className="w-5 h-5" />
                          </button>
                        )}
                        className={`${recipeSelectedForPlanning?.RecipeID === recipe.RecipeID ? 'ring-2 ring-indigo-500 shadow-md' : ''}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Draggable>
          ) }
        </div>

        <div className="container mx-auto w-full lg:w-3/4 p-4 rounded-lg shadow-lg flex flex-col"> 
            {currentWeekDates.length === 0 && <div className="flex justify-center py-4"><AiOutlineLoading className="animate-spin h-10 w-10 text-indigo-400" /></div>}
            {currentWeekDates.length > 0 && (
              <>
                <div className="mb-4"> 
                  <h3 className="text-md font-semibold text-gray-300 mb-2">Week 1</h3>
                  <div className="flex overflow-x-auto space-x-3 pb-2 snap-x snap-mandatory">
                    {currentWeekDates.slice(0, 7).map(date => renderDayCard(date))}
                  </div>
                </div>
                <div className="mb-4">
                  <h3 className="text-md font-semibold text-gray-300 mb-2">Week 2</h3>
                  <div className="flex overflow-x-auto space-x-3 pb-2 snap-x snap-mandatory">
                    {currentWeekDates.slice(7, 14).map(date => renderDayCard(date))}
                  </div>
                </div>
              </>
            )}
        </div>
      </div>

      <div className="flex flex-wrap justify-center mb-6 max-w-4xl mx-auto gap-2 p-a shadow-lg rounded-lg ">
          <button 
            onClick={togglePaletteVisibility} 
            className={`${commonButtonClassName} gradient-box`}
            style={{ zIndex: 51 }}
          >
            {isPaletteVisible ? "Hide" : "Show"} Recipe Palette
          </button>

          <button onClick={handleSaveToCloud} disabled={isSavingToCloud || isLoadingFromCloud || Object.keys(plannedMeals).length === 0} className={`${commonButtonClassName}  bg-blue-700 text-white hover:bg-blue-600 focus:ring-blue-500`}>
            {isSavingToCloud ? <AiOutlineLoading className="animate-spin h-5 w-5 mr-2" /> : <MdSave className="w-5 h-5 mr-2" />} Save to Cloud
          </button>
          <button onClick={handleLoadFromCloudConfirmation} disabled={isSavingToCloud || isLoadingFromCloud} className={`${commonButtonClassName} bg-blue-700 text-white hover:bg-blue-600 focus:ring-blue-500`}>
            {isLoadingFromCloud ? <AiOutlineLoading className="animate-spin h-5 w-5 mr-2" /> : <MdCloudDownload className="w-5 h-5 mr-2" />} Load from Cloud
          </button>
          <button onClick={handleDownloadTXT} disabled={Object.keys(plannedMeals).length === 0} className={`${commonButtonClassName} bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500`}>
            <MdDownload className="w-5 h-5 mr-2" /> TXT
          </button>
          <button onClick={handleDownloadPDF} disabled={Object.keys(plannedMeals).length === 0} className={`${commonButtonClassName} bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500`}>
            <MdDownload className="w-5 h-5 mr-2" /> PDF
          </button>
          </div>
      </div>
  );
}

export default MealPlanner;
