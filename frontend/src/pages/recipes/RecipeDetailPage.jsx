import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useConditionalAuth } from '../../components/auth/AuthGuard.jsx';
import { authenticatedFetch } from '../../utils/apiUtil.js';
import { consolidateBasketItems } from '../../utils/basketUtils.js';
import { PageLoaderSpinner, InlineSpinner } from '../../components/common/LoadingComponents.jsx';
import StarRating from '../../components/ui/StarRating';
import RequireLoginModal from '../../components/auth/RequireLoginModal.jsx';
import InteractiveModal from '../../components/ui/InteractiveModal.jsx';
import RecipeComments from '../../components/pages/recipe/RecipeComments.jsx';
import { FiLock, FiUnlock } from 'react-icons/fi';

const SHOPPING_BASKET_KEY = 'shoppingBasketItems';

function RecipeDetailPage() {
  const { recipeId } = useParams();
  const [recipeData, setRecipeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = useAuth();
  const { isAuthenticated, currentUser } = auth;
  const { attemptAuthAction, isSessionExpired } = useConditionalAuth();
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

  const navigate = useNavigate();

  const handleRateRecipe = async (newRating) => {
    return attemptAuthAction(async () => {
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
    }, () => {
      // Fallback when not authenticated and session hasn't expired
      if (!isSessionExpired) {
        setIsLoginModalOpen(true);
      }
    });
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
        } catch {
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
        } catch {
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
        } catch {
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
    const originalNameRegex = new RegExp(`\\b${originalIngredientNameForReplacement.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
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
    const currentSubstituteNameRegex = new RegExp(`\\b${currentSubstituteName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
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
    return attemptAuthAction(() => {
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
        
        // Use consolidation logic to merge ingredients with same name and unit
        const existingBasketString = localStorage.getItem(SHOPPING_BASKET_KEY);
        const existingBasket = existingBasketString ? JSON.parse(existingBasketString) : [];
        const consolidatedBasket = consolidateBasketItems(existingBasket, itemsToAdd);
        
        localStorage.setItem(SHOPPING_BASKET_KEY, JSON.stringify(consolidatedBasket));
        setBasketMessage(`Ingredients added to your shopping basket!`);
        setTimeout(() => setBasketMessage(''), 3000);
      } catch {
        setBasketMessage('Failed to add items to basket.'); setTimeout(() => setBasketMessage(''), 3000);
      }
    }, () => {
      // Fallback when not authenticated and session hasn't expired
      if (!isSessionExpired) {
        setIsLoginModalOpen(true);
      }
    });
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


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex justify-center items-center">
        <div className="flex flex-col items-center justify-center text-center">
          <PageLoaderSpinner />
          <p className="mt-4 text-gray-600">Loading recipe details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex justify-center items-center">
        <div className="container-modern text-center max-w-2xl animate-fade-in">
          <div className="card-glass p-8">
            <h1 className="text-3xl font-bold mb-6 gradient-text">Recipe Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <RouterLink to="/recipes" className="btn-primary">
              Browse Recipes
            </RouterLink>
          </div>
        </div>
      </div>
    );
  }

  if (!recipeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex justify-center items-center">
        <div className="flex flex-col items-center justify-center text-center">
          <PageLoaderSpinner />
          <p className="mt-4 text-gray-600">No recipe data available...</p>
        </div>
      </div>
    );
  }

  const renderInstructions = (instructionsString) => {
    if (!instructionsString) return <p className="text-gray-400">No instructions provided.</p>;
    return instructionsString.split('\n').map((step, index) => (
      <p key={index} className="mb-2 text-gray-700 leading-relaxed whitespace-pre-line">
        <span className="font-semibold">{index + 1}.</span> {step}
      </p>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Title and Description OUTSIDE main container */}
      <div className="section-padding">
        <div className="container-modern">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">{recipeData.Title}</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              {recipeData.Description || 'A delicious recipe for you to try'}
            </p>
            
            {/* Recipe Tags */}
            {recipeData.tags && recipeData.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {recipeData.tags.map((tag) => (
                  <span
                    key={tag.TagID}
                    className="px-3 py-1 text-sm font-medium text-white rounded-full shadow-sm"
                    style={{ backgroundColor: tag.TagColor || '#6B7280' }}
                  >
                    {tag.TagName}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Main Card Container */}
          <div className="max-w-4xl mx-auto mb-8 p-4 sm:p-8 rounded-3xl bg-white/70 shadow-xl backdrop-blur-md border border-emerald-100">
            {/* Image */}
            {recipeData.ImageURL && (
              <div className="w-full h-72 sm:h-96 bg-gradient-to-br from-emerald-50 to-blue-50 flex justify-center items-center overflow-hidden mb-8">
                <img src={recipeData.ImageURL} alt={recipeData.Title} className="w-full h-full object-contain" />
              </div>
            )}

            {/* Public Average Rating - below image */}
            {recipeData.average_rating !== undefined && recipeData.average_rating > 0 ? (
              <div className="flex flex-col items-center mb-6">
                <StarRating rating={recipeData.average_rating} interactive={false} size="text-3xl" />
                <span className="ml-2 mt-1 text-gray-500">({recipeData.average_rating.toFixed(1)} average from users)</span>
              </div>
            ) : (
              <p className="text-gray-400 mb-6 text-center">This recipe has not been rated yet.</p>
            )}

            {/* Toggle Public/Private for Owner - left before ratings */}
            {isAuthenticated && currentUser && recipeData && currentUser.UserID === recipeData.UserID && (
              <div className="flex mb-6">
                <button
                  onClick={handleTogglePublicStatus}
                  className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg border shadow-sm transition-colors
                    ${recipeData.is_public ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200' : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'}`}
                >
                  {recipeData.is_public ? <FiLock className="text-lg" /> : <FiUnlock className="text-lg" />}
                  {recipeData.is_public ? 'Make Private' : 'Make Public'}
                </button>
              </div>
            )}

            {/* Instructions - FULL WIDTH */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-3 text-emerald-700">Instructions</h2>
              {typeof recipeData.Instructions === 'string' ?
                renderInstructions(recipeData.Instructions) :
                (Array.isArray(recipeData.Instructions) ?
                  recipeData.Instructions.map((step, index) => (
                    <p key={index} className="mb-2 text-gray-700 leading-relaxed whitespace-pre-line bg-white/60 rounded-xl p-3 border border-emerald-50 shadow-sm"><span className="font-semibold text-emerald-700">{index + 1}.</span> {step}</p>
                  )) : <p className="text-gray-400">No instructions provided.</p>)
              }
            </div>

            {/* Ingredients - GRID */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-3 text-emerald-700">Ingredients {allergiesLoading && <InlineSpinner />}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
                {(recipeData.ingredients || []).map((ing, index) => {
                  const currentIngredient = recipeData.ingredients[index];
                  const hasActiveSubstitute = currentIngredient && currentIngredient.selectedSubstitute;
                  const nameToFetchSubstitutesFor = currentIngredient.originalName;
                  const ingredientAllergies = ingredientsAllergyMap[ing.IngredientID] || [];
                  return (
                    <div key={currentIngredient.RecipeIngredientID || currentIngredient.IngredientID || index} className="bg-white/80 border border-emerald-100 rounded-xl p-4 shadow flex flex-col h-full">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-emerald-900">
                            {ing.IngredientName}
                            {hasActiveSubstitute && <span className="text-xs text-gray-400 italic ml-1">(Sub: {currentIngredient.originalName})</span>}
                          </span>
                          <span className="text-sm text-gray-500">
                            {ing.Quantity || ''} {ing.Unit || ''}
                          </span>
                        </div>
                        <button
                          onClick={() => hasActiveSubstitute ? handleRevertSubstitute(index) : handleFetchSubstitutes(nameToFetchSubstitutesFor, index)}
                          disabled={substituteLoading[index]}
                          className="px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-300 rounded-lg hover:bg-emerald-50 transition disabled:opacity-50 whitespace-nowrap"
                        >
                          {substituteLoading[index] ? <InlineSpinner /> : (hasActiveSubstitute ? 'Revert' : 'Substitutes')}
                        </button>
                      </div>
                      {ingredientAllergies.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          <span className="text-xs italic text-red-500 mr-1">Allergies:</span>
                          {ingredientAllergies.map(allergy => (
                            <span key={allergy.id} className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded-full border border-red-200">{allergy.name}</span>
                          ))}
                        </div>
                      )}
                      {substituteLoading[index] && <div className="mt-1 text-center"><InlineSpinner /></div>}
                      {substituteError[index] && !substituteLoading[index] && (
                        <div className="mt-1 p-1.5 text-xs bg-amber-100 text-amber-800 border border-amber-200 rounded-md">
                          {substituteError[index]}
                          <button onClick={() => setSubstituteError(prev => ({...prev, [index]: null}))} className="ml-1 text-amber-700 font-bold">x</button>
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
                            className="w-full p-1.5 bg-white border border-emerald-100 text-emerald-700 rounded-md text-xs focus:ring-emerald-400 focus:border-emerald-400"
                          >
                            <option value="" disabled>Choose substitute...</option>
                            {substituteSuggestions[index].map((sub) => (
                              <option key={sub.name || sub} value={sub.name || sub}>{sub.name || sub}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Add to Basket Button - moved below ingredients */}
            <div className="pt-2 pb-8 text-center">
              <button
                onClick={handleAddToBasket}
                disabled={!recipeData || !recipeData.ingredients || recipeData.ingredients.length === 0}
                className="btn-primary px-8 py-3 text-base font-semibold rounded-lg shadow-md transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none"
              >
                Add All Ingredients to Basket
              </button>
              {basketMessage && <p className="mt-3 text-sm text-emerald-600">{basketMessage}</p>}
            </div>

            {/* Nutritional Information Section */}
            {recipeData.NutritionInfo && (
              <div className="mb-8 pt-6 border-t border-emerald-100">
                <h2 className="text-xl font-semibold mb-4 text-emerald-700">Nutritional Information</h2>
                {recipeData.NutritionInfo.success ? (
                  <div className="bg-white/60 rounded-xl p-6 border border-emerald-50 shadow-sm">
                    {recipeData.NutritionInfo.nutrition && Object.keys(recipeData.NutritionInfo.nutrition).length > 0 ? (
                      <div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {Object.entries(recipeData.NutritionInfo.nutrition).map(([nutrientName, nutrientData]) => {
                            if (nutrientData && typeof nutrientData === 'object' && nutrientData.amount !== undefined) {
                              const amount = typeof nutrientData.amount === 'number' 
                                ? nutrientData.amount.toFixed(1) 
                                : nutrientData.amount;
                              return (
                                <div key={nutrientName} className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                  <div className="text-sm font-medium text-emerald-700 capitalize">
                                    {nutrientName.replace(/([A-Z])/g, ' $1').trim()}
                                  </div>
                                  <div className="text-lg font-bold text-emerald-800">
                                    {amount} {nutrientData.unit || ''}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                        {recipeData.NutritionInfo.per_serving && (
                          <p className="text-sm text-gray-600 italic text-center">
                            Values shown per serving
                          </p>
                        )}
                        {recipeData.NutritionInfo.notes && (
                          <p className="text-sm text-gray-600 italic text-center mt-2">
                            {recipeData.NutritionInfo.notes}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center">No detailed nutritional data available</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-amber-800 text-center">
                      {recipeData.NutritionInfo.error || 'Unable to retrieve nutritional information'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Ratings Section */}
            <div className="my-8 pt-6 border-t border-emerald-100">
              {isAuthenticated && currentUser ? (
                <div className="flex flex-col items-center">
                  <p className="text-gray-600 mb-2 text-lg">Your rating:</p>
                  <StarRating rating={userRating || 0} onRate={handleRateRecipe} interactive={!isRatingSubmitting} size="text-4xl" />
                  {isRatingSubmitting && <p className="text-sm text-blue-400 mt-2">Submitting rating...</p>}
                  {ratingError && <p className="text-sm text-red-400 mt-2">{ratingError}</p>}
                </div>
              ) : (
                <div className="mt-4 text-center">
                  <p className="text-gray-400">
                    <button
                      onClick={() => navigate('/login', { state: { from: location } })}
                      className="text-emerald-600 hover:underline"
                    >
                      Log in
                    </button> to rate and comment on this recipe.
                  </p>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="my-8 pt-6 border-t border-emerald-100">
              <RecipeComments recipeId={recipeId} />
            </div>
          </div>
        </div>
      </div>
      {/* Modals */}
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
      {/* Only show login modal if session hasn't expired (global modal handles expiry) */}
      {!isSessionExpired && (
        <RequireLoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          title="Login Required"
          message="Please log in to perform this action (e.g., rate recipes, add to basket)."
          redirectState={{ from: location }}
        />
      )}
    </div>
  );
}

export default RecipeDetailPage;
