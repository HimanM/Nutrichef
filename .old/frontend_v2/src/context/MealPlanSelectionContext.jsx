import React, { createContext, useState, useContext } from 'react';

const MealPlanSelectionContext = createContext(null);

export const MealPlanSelectionProvider = ({ children }) => {
  const [recipeSelectedForPlanning, setRecipeSelectedForPlanningState] = useState(null);

  const setRecipeSelectedForPlanning = (recipe) => {
    setRecipeSelectedForPlanningState(recipe);
  };

  const clearRecipeSelection = () => {
     setRecipeSelectedForPlanningState(null);
  }

  return (
    <MealPlanSelectionContext.Provider
      value={{
        recipeSelectedForPlanning,
        setRecipeSelectedForPlanning,
        clearRecipeSelection
      }}
    >
      {children}
    </MealPlanSelectionContext.Provider>
  );
};

export const useMealPlanSelection = () => {
  const context = useContext(MealPlanSelectionContext);
  if (context === undefined || context === null) {
    throw new Error('useMealPlanSelection must be used within a MealPlanSelectionProvider');
  }
  return context;
};

export default MealPlanSelectionContext;
