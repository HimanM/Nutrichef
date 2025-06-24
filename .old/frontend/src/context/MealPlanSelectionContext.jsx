import React, { createContext, useState, useContext } from 'react';

const MealPlanSelectionContext = createContext(null);

export const MealPlanSelectionProvider = ({ children }) => {
  const [recipeSelectedForPlanning, setRecipeSelectedForPlanningState] = useState(null);
  // Optional: could add an 'operationType' state if needed for 'move' vs 'add' later.
  // const [operationType, setOperationType] = useState(null); // e.g., 'add', 'move'

  const setRecipeSelectedForPlanning = (recipe) => {
    setRecipeSelectedForPlanningState(recipe);
    // if (recipe) setOperationType('add'); // Example if using operationType
  };

  // Function to clear selection, could be useful
  const clearRecipeSelection = () => {
     setRecipeSelectedForPlanningState(null);
     // setOperationType(null);
  }

  return (
    <MealPlanSelectionContext.Provider
      value={{
        recipeSelectedForPlanning,
        setRecipeSelectedForPlanning,
        clearRecipeSelection
        // operationType,
        // setOperationType (if implemented)
      }}
    >
      {children}
    </MealPlanSelectionContext.Provider>
  );
};

// Custom hook to use the meal plan selection context
export const useMealPlanSelection = () => {
  const context = useContext(MealPlanSelectionContext);
  if (context === undefined || context === null) {
    throw new Error('useMealPlanSelection must be used within a MealPlanSelectionProvider');
  }
  return context;
};

export default MealPlanSelectionContext;
