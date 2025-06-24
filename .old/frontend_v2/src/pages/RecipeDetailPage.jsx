import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { authenticatedFetch } from '../utils/apiUtil.js';
import StarRating from '../components/StarRating';
import RequireLoginModal from '../components/auth/RequireLoginModal.jsx';
import InteractiveModal from '../components/InteractiveModal.jsx';

const PageLoaderSpinner = () => <svg className="animate-spin h-10 w-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const InlineSpinner = () => <svg className="animate-spin h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

const SHOPPING_BASKET_KEY = 'shoppingBasketItems';

function RecipeDetailPage() {
  const { recipeId } = useParams();
  const [recipeData, setRecipeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = useAuth();
  const { isAuthenticated, currentUser } = auth;
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const location = useLocation();
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState('');
  const [userRating, setUserRating] = useState(null);

  const [substituteSuggestions, setSubstituteSuggestions] = useState({});
  const [substituteLoading, setSubstituteLoading] = useState({});
  const [substituteError, setSubstituteError] = useState({});
  const [basketMessage, setBasketMessage] = useState('');

  const [ingredientsAllergyMap, setIngredientsAllergyMap] = useState({});
  const [allergiesLoading, setAllergiesLoading] = useState(false);

  const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', onConfirm: null, iconType: null, confirmText: 'Confirm', showCancelButton: true });

  const handleRateRecipe = async (newRating) => {
    if (!isAuthenticated || !currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    setIsRatingSubmitting(true);
    setRatingError('');
    try {
      const response = await authenticatedFetch(`/api/recipes/${recipeId}/rate`, {
        method: 'POST',
        body: JSON.stringify({ rating: newRating, user_id: currentUser.UserID })
      }, auth);

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit rating.');
      }
      setRecipeData(prev => ({ ...prev, average_rating: result.average_rating }));
      setUserRating(result.user_rating.Rating);
    } catch (err) {
      setRatingError(err.message);
    } finally {
      setIsRatingSubmitting(false);
    }
  };


  const fetchRecipeDetails = useCallback(async () => {
    setLoading(true); setError(null); setRatingError('');
    try {
      const fetchUrl = currentUser ? `/api/recipes/${recipeId}?user_id_for_rating_testing=${currentUser.UserID}` : `/api/recipes/${recipeId}`;
      const response = await fetch(fetchUrl); 
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { error: `Failed to fetch recipe details: ${response.statusText || response.status}` };
        }
        throw new Error(errorData.error || `Failed to fetch recipe details: ${response.statusText || response.status}`);
      }
      let data = await response.json();
      if (data && data.ingredients) {
          const processedIngredients = (data.ingredients || []).map(ingredient => ({
              ...ingredient, originalName: ingredient.IngredientName, selectedSubstitute: null
          }));
          setRecipeData({ ...data, ingredients: processedIngredients });
          setUserRating(data.current_user_rating !== undefined ? data.current_user_rating : null);
      } else {
         setRecipeData(prevData => ({...(prevData || data || {}), ingredients: [] }));
         setUserRating(null);
      }
    } catch (err) {
      setError(err.message); console.error(`Error fetching recipe ${recipeId}:`, err);
    } finally {
      setLoading(false);
    }
  }, [recipeId, currentUser]);

  useEffect(() => {
    if (recipeId) {
        fetchRecipeDetails();
        setUserRating(null);
        setRatingError('');
    }
  }, [recipeId, fetchRecipeDetails]);

  const fetchAllergiesForIngredients = useCallback(async () => {
    if (!recipeData || !recipeData.ingredients || recipeData.ingredients.length === 0) {
      setIngredientsAllergyMap({}); return;
    }
    const ingredientIds = [...new Set(recipeData.ingredients.map(ing => ing.IngredientID).filter(id => id != null))];
    if (ingredientIds.length === 0) { setIngredientsAllergyMap({}); return; }
    setAllergiesLoading(true);
    try {
      const response = await fetch('/api/ingredients/allergies_for_list', {
        method: 'POST', headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ ingredient_ids: ingredientIds }),
      });
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { error: `Failed to fetch allergies: ${response.statusText || response.status}` };
        }
        throw new Error(errorData.error || `Failed to fetch allergies: ${response.statusText || response.status}`);
      }
      setIngredientsAllergyMap(await response.json() || {});
    } catch (err) {
      console.error("Error fetching allergies for ingredients list:", err);
      setError(err.message || "Could not fetch allergy information.");
      setIngredientsAllergyMap({});
    } finally {
      setAllergiesLoading(false);
    }
  }, [recipeData]);

  useEffect(() => {
    if (recipeData) fetchAllergiesForIngredients();
  }, [recipeData, fetchAllergiesForIngredients]);

  const handleFetchSubstitutes = async (ingredientNameToFetch, index) => {
    setSubstituteLoading(prev => ({ ...prev, [index]: true }));
    setSubstituteError(prev => ({ ...prev, [index]: null }));
    setSubstituteSuggestions(prev => ({ ...prev, [index]: [] }));
    try {
      const response = await fetch('/api/substitute', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredientName: ingredientNameToFetch, recipe_id: recipeId }),
      });
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { error: `Failed to fetch substitutes: ${response.statusText || response.status}` };
        }
        throw new Error(errorData.error || `Failed to fetch substitutes: ${response.statusText || response.status}`);
      }
      const subs = await response.json();
      if (Array.isArray(subs)) {
           setSubstituteSuggestions(prev => ({ ...prev, [index]: subs.slice(0, 5) }));
           if (subs.length === 0) setSubstituteError(prev => ({ ...prev, [index]: "No substitutes found." }));
      } else {
           setSubstituteError(prev => ({ ...prev, [index]: "Unexpected response format from server."}));
      }
    } catch (err) {
      setSubstituteError(prev => ({ ...prev, [index]: err.message || "Could not fetch substitutes." }));
    } finally {
      setSubstituteLoading(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleSubstituteSelected = (originalIngredientNameForReplacement, newSubstituteName, ingredientIndex) => {
    if (!recipeData || !recipeData.ingredients || !recipeData.Instructions) return;
    const newRecipeData = JSON.parse(JSON.stringify(recipeData));
    if (newRecipeData.ingredients[ingredientIndex]) {
      newRecipeData.ingredients[ingredientIndex].IngredientName = newSubstituteName;
      newRecipeData.ingredients[ingredientIndex].selectedSubstitute = newSubstituteName;
    }
    const originalNameRegex = new RegExp(`\\b${originalIngredientNameForReplacement.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
    if (typeof newRecipeData.Instructions === 'string') {
      newRecipeData.Instructions = newRecipeData.Instructions.replace(originalNameRegex, newSubstituteName);
    } else if (Array.isArray(newRecipeData.Instructions)) {
      newRecipeData.Instructions = newRecipeData.Instructions.map(step => step.replace(originalNameRegex, newSubstituteName));
    }
    setRecipeData(newRecipeData);
    setSubstituteSuggestions(prev => ({ ...prev, [ingredientIndex]: [] }));
    setSubstituteError(prev => ({ ...prev, [ingredientIndex]: null }));
  };

  const handleRevertSubstitute = (ingredientIndex) => {
    if (!recipeData || !recipeData.ingredients || !recipeData.ingredients[ingredientIndex]) return;
    const ingredientToRevert = recipeData.ingredients[ingredientIndex];
    const originalName = ingredientToRevert.originalName;
    const currentSubstituteName = ingredientToRevert.IngredientName;
    if (!originalName || currentSubstituteName === originalName) return;
    const newRecipeData = JSON.parse(JSON.stringify(recipeData));
    newRecipeData.ingredients[ingredientIndex].IngredientName = originalName;
    newRecipeData.ingredients[ingredientIndex].selectedSubstitute = null;
    const currentSubstituteNameRegex = new RegExp(`\\b${currentSubstituteName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
    if (typeof newRecipeData.Instructions === 'string') {
        newRecipeData.Instructions = newRecipeData.Instructions.replace(currentSubstituteNameRegex, originalName);
    } else if (Array.isArray(newRecipeData.Instructions)) {
        newRecipeData.Instructions = newRecipeData.Instructions.map(step => step.replace(currentSubstituteNameRegex, originalName));
    }
    setRecipeData(newRecipeData);
    setSubstituteSuggestions(prev => ({ ...prev, [ingredientIndex]: [] }));
    setSubstituteError(prev => ({ ...prev, [ingredientIndex]: null }));
  };

  const handleAddToBasket = () => {
    if (!isAuthenticated) { setIsLoginModalOpen(true); return; }
    if (!recipeData || !recipeData.ingredients || recipeData.ingredients.length === 0) {
      setBasketMessage('No ingredients to add.'); setTimeout(() => setBasketMessage(''), 3000); return;
    }
    try {
      const itemsToAdd = recipeData.ingredients.map(ing => ({
        id: `${ing.RecipeIngredientID || ing.IngredientID}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: ing.IngredientName, originalName: ing.originalName === ing.IngredientName ? null : ing.originalName,
        quantity: ing.Quantity || '', unit: ing.Unit || '',
        recipeTitle: recipeData.Title, recipeId: recipeData.RecipeID, isChecked: false
      }));
      const existingBasketString = localStorage.getItem(SHOPPING_BASKET_KEY);
      let basket = existingBasketString ? JSON.parse(existingBasketString) : [];
      basket = [...basket, ...itemsToAdd];
      localStorage.setItem(SHOPPING_BASKET_KEY, JSON.stringify(basket));
      setBasketMessage(`${itemsToAdd.length} item(s) added to your shopping basket!`);
      setTimeout(() => setBasketMessage(''), 3000);
    } catch (error) {
      setBasketMessage('Failed to add items to basket.'); setTimeout(() => setBasketMessage(''), 3000);
    }
  };

  const handleTogglePublicStatus = async () => {
    if (!recipeData || !currentUser || currentUser.UserID !== recipeData.UserID) {
      setModalState({
        isOpen: true,
        title: 'Error',
        message: 'You are not authorized to perform this action.',
        iconType: 'error',
        showCancelButton: false,
        confirmText: 'OK',
        onConfirm: () => setModalState({ isOpen: false }),
      });
      return;
    }

    const currentStatusBecomes = recipeData.is_public ? 'private' : 'public';
    const actionText = recipeData.is_public ? 'Make Private' : 'Make Public';

    setModalState({
      isOpen: true,
      title: 'Confirm Change',
      message: `Are you sure you want to make this recipe ${currentStatusBecomes}?`,
      confirmText: actionText,
      showCancelButton: true,
      iconType: null,
      onConfirm: async () => {
        setModalState(prev => ({ ...prev, isLoading: true }));
        try {
          const response = await authenticatedFetch(`/api/recipes/${recipeId}/toggle-public`, { method: 'PATCH' }, auth);
          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Failed to update recipe status.');
          }

          setRecipeData(prevData => ({ ...prevData, is_public: result.recipe.is_public }));
          setModalState({
            isOpen: true,
            title: 'Success',
            message: 'Recipe status updated successfully!',
            iconType: 'success',
            showCancelButton: false,
            confirmText: 'OK',
            onConfirm: () => setModalState({ isOpen: false }),
          });
        } catch (err) {
          setModalState({
            isOpen: true,
            title: 'Error',
            message: err.message || 'An error occurred while updating recipe status.',
            iconType: 'error',
            showCancelButton: false,
            confirmText: 'OK',
            onConfirm: () => setModalState({ isOpen: false }),
          });
        }
      },
      onCancel: () => setModalState({ isOpen: false }),
    });
  };


  if (loading) return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><PageLoaderSpinner /></div>;
  if (error) return (
    <div className="page-container my-8 text-center">
      <div className="p-4 bg-red-700/[0.5] border-l-4 border-red-500 text-red-200 rounded-md mb-4">{error}</div>
      <RouterLink to="/recipes" className="gradient-button px-6 py-2 text-sm font-medium">Back to Recipes</RouterLink>
    </div>
  );
  if (!recipeData) return (
    <div className="page-container my-8 text-center">
      <p className="text-xl text-gray-400 mb-4">Recipe not found.</p>
      <RouterLink to="/recipes" className="gradient-button px-6 py-2 text-sm font-medium">Back to Recipes</RouterLink>
    </div>
  );

  const renderInstructions = (instructionsString) => {
    if (!instructionsString) return <p className="text-gray-400">No instructions provided.</p>;
    return instructionsString.split('\n').map((step, index) => (
      <p key={index} className="mb-2 text-gray-300 leading-relaxed whitespace-pre-line">
        <span className="font-semibold">{index + 1}.</span> {step}
      </p>
    ));
  };

  return (
    <div className="max-w-4xl mx-auto mb-8 p-6 rounded-lg">
      <div className="bg-gray-800 shadow-2xl rounded-lg overflow-hidden">
        {recipeData.ImageURL && (
          <div className="w-full h-72 sm:h-96 bg-gray-700 flex justify-center items-center overflow-hidden">
            <img src={recipeData.ImageURL} alt={recipeData.Title} className="w-full h-full object-contain" />
          </div>
        )}
        <div className="p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl mb-4 text-center">{recipeData.Title}</h1>
          {recipeData.average_rating !== undefined && recipeData.average_rating > 0 ? (
              <div className="flex flex-col items-center mb-4">
                <StarRating rating={recipeData.average_rating} interactive={false} size="text-3xl" />
                <span className="ml-2 mt-1 text-gray-300">({recipeData.average_rating.toFixed(1)} average from users)</span>
              </div>
            ) : (
              <p className="text-gray-400 mb-4 text-center">This recipe has not been rated yet.</p>
            )}

          <div className="flex justify-center items-center space-x-4 mb-6 text-sm text-gray-400">
            {recipeData.PreparationTimeMinutes && <span>Prep: <span className="font-medium">{recipeData.PreparationTimeMinutes} min</span></span>}
            {recipeData.CookingTimeMinutes && <span>Cook: <span className="font-medium">{recipeData.CookingTimeMinutes} min</span></span>}
            {recipeData.Servings && <span>Servings: <span className="font-medium">{recipeData.Servings}</span></span>}
            
          </div>

          {recipeData.Description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-300 italic whitespace-pre-line leading-relaxed">{recipeData.Description}</p>
            </div>
          )}

          {isAuthenticated && currentUser && recipeData && currentUser.UserID === recipeData.UserID && (
            <div className="mt-3 pb-6 border-gray-700">
              <button
                onClick={handleTogglePublicStatus}
                className="gradient-button px-6 py-2 text-sm font-medium"
              >
                {recipeData.is_public ? 'Make Private' : 'Make Public'}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="md:col-span-1">
              <h2 className="text-xl font-semibold mb-3">Ingredients {allergiesLoading && <InlineSpinner />}</h2>
              <ul className="space-y-2 text-gray-300"> 
                {(recipeData.ingredients || []).map((ing, index) => {
                  const currentIngredient = recipeData.ingredients[index];
                  const hasActiveSubstitute = currentIngredient && currentIngredient.selectedSubstitute;
                  const nameToFetchSubstitutesFor = currentIngredient.originalName;
                  const ingredientAllergies = ingredientsAllergyMap[ing.IngredientID] || [];

                  return (
                    <li key={currentIngredient.RecipeIngredientID || currentIngredient.IngredientID || index} className="py-2 border-b border-gray-700 last:border-b-0">
                      <div className="flex flex-col">
                        <div className="flex justify-between items-center">
                            <span className="font-medium">
                                {ing.Quantity || ''} {ing.Unit || ''} {ing.IngredientName}
                                {hasActiveSubstitute && <span className="text-xs text-gray-400 italic ml-1">(Sub: {currentIngredient.originalName})</span>}
                            </span>
                            <button
                                onClick={() => hasActiveSubstitute ? handleRevertSubstitute(index) : handleFetchSubstitutes(nameToFetchSubstitutesFor, index)}
                                disabled={substituteLoading[index]}
                                className="ml-2 px-2 py-0.5 text-xs font-medium text-indigo-300 border border-indigo-500 rounded-md hover:bg-indigo-700/[0.5] disabled:opacity-50 whitespace-nowrap"
                            >
                                {substituteLoading[index] ? <InlineSpinner /> : (hasActiveSubstitute ? 'Revert' : 'Substitutes')}
                            </button>
                        </div>

                        {ingredientAllergies.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                                <span className="text-xs italic text-red-400 mr-1">Allergies:</span>
                                {ingredientAllergies.map(allergy => (
                                    <span key={allergy.id} className="px-1.5 py-0.5 text-xs bg-red-700/[0.5] text-red-200 rounded-full">{allergy.name}</span>
                                ))}
                            </div>
                        )}

                        {substituteLoading[index] && <div className="mt-1 text-center"><InlineSpinner /></div>}
                        {substituteError[index] && !substituteLoading[index] && (
                          <div className="mt-1 p-1.5 text-xs bg-yellow-700/[0.5] text-yellow-200 border border-yellow-600 rounded-md">
                            {substituteError[index]}
                            <button onClick={() => setSubstituteError(prev => ({...prev, [index]: null}))} className="ml-1 text-yellow-100 font-bold">x</button>
                          </div>
                        )}
                        {!substituteLoading[index] && !substituteError[index] && substituteSuggestions[index] && substituteSuggestions[index].length > 0 && (
                          <div className="mt-1">
                            <select
                              value={currentIngredient.selectedSubstitute || ""}
                              onChange={(e) => {
                                const selectedSubName = e.target.value;
                                if (selectedSubName) handleSubstituteSelected(currentIngredient.originalName, selectedSubName, index);
                              }}
                              className="w-full p-1.5 bg-gray-700 border border-gray-600 text-white rounded-md text-xs focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="" disabled>Choose substitute...</option>
                              {substituteSuggestions[index].map((sub) => (
                                <option key={sub.name || sub} value={sub.name || sub}>{sub.name || sub}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-3">Instructions</h2>
              {typeof recipeData.Instructions === 'string' ?
                renderInstructions(recipeData.Instructions) :
                (Array.isArray(recipeData.Instructions) ?
                  recipeData.Instructions.map((step, index) => (
                    <p key={index} className="mb-2 text-gray-300 leading-relaxed whitespace-pre-line"><span className="font-semibold">{index + 1}.</span> {step}</p>
                  )) : <p className="text-gray-400">No instructions provided.</p>)
              }
            </div>
          </div>

          <div className="my-8 pt-6 border-t border-gray-700">
            {isAuthenticated && currentUser ? (
              <div className="flex flex-col items-center">
                <p className="text-gray-300 mb-2 text-lg">Your rating:</p>
                <StarRating rating={userRating || 0} onRate={handleRateRecipe} interactive={!isRatingSubmitting} size="text-4xl" />
                {isRatingSubmitting && <p className="text-sm text-blue-400 mt-2">Submitting rating...</p>}
                {ratingError && <p className="text-sm text-red-400 mt-2">{ratingError}</p>}
              </div>
            ) : (
              <div className="mt-4 text-center">
                <p className="text-gray-400">
                  <button onClick={() => setIsLoginModalOpen(true)} className="text-indigo-400 hover:underline">Log in</button> to rate this recipe.
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-gray-700 text-center"> 
            <button
              onClick={handleAddToBasket}
              disabled={!recipeData || !recipeData.ingredients || recipeData.ingredients.length === 0}
              className="gradient-button px-8 py-3 text-base font-medium disabled:opacity-75"
            >
              Add All Ingredients to Basket
            </button>
            {basketMessage && <p className="mt-3 text-sm text-green-400">{basketMessage}</p>} 
          </div>
        </div>
      </div>
      <InteractiveModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title={modalState.title}
        message={modalState.message}
        isLoading={modalState.isLoading}
        iconType={modalState.iconType}
        onConfirm={modalState.onConfirm}
        confirmText={modalState.confirmText}
        onCancel={modalState.onCancel ? modalState.onCancel : () => setModalState({ ...modalState, isOpen: false })}
        cancelText={modalState.cancelText || 'Cancel'}
        showCancelButton={modalState.showCancelButton}
      />
      <RequireLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        title="Login Required"
        message="Please log in to perform this action (e.g., rate recipes, add to basket)."
        redirectState={{ from: location }}
      />
    </div>
  );
}

export default RecipeDetailPage;
