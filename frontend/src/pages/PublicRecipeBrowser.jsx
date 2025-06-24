import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { authenticatedFetch } from '../utils/apiUtil.js';
import RequireLoginModal from '../components/auth/RequireLoginModal.jsx';
import RecipeSubmissionModal from '../components/RecipeSubmissionModal.jsx';
import FloatingLoader from '../components/FloatingLoader.jsx';
import { HiOutlineRefresh, HiOutlineSearch, HiOutlinePlus, HiOutlineCheck, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

const AddIcon = ({ className = "w-5 h-5 mr-1" }) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>;
const CheckIcon = ({ className = "w-5 h-5 mr-1" }) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>;

const MEAL_PLAN_PALETTE_KEY = 'mealPlanPaletteRecipes';

function PublicRecipeBrowser() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paletteRecipeIds, setPaletteRecipeIds] = useState(new Set());
  const [isRecipeSubmissionModalOpen, setIsRecipeSubmissionModalOpen] = useState(false);
  const [isProcessingRecipeSubmission, setIsProcessingRecipeSubmission] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recipesPerPage, setRecipesPerPage] = useState(10);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [showPrivateRecipes, setShowPrivateRecipes] = useState(false);

  const auth = useAuth();
  const { isAuthenticated, currentUser } = auth;
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const location = useLocation();

  const handlePreviousPage = () => setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
  const handleNextPage = () => {
    const totalPages = Math.ceil(totalRecipes / recipesPerPage);
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
  };
  const handleRecipesPerPageChange = (event) => {
    setRecipesPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  const effectiveUserId = isAuthenticated && currentUser ? String(currentUser.UserID) : null;

  const handleOpenRecipeSubmissionModal = () => {
    if (isAuthenticated) setIsRecipeSubmissionModalOpen(true); else setIsLoginModalOpen(true);
  };
  const handleCloseRecipeSubmissionModal = () => {
    setIsRecipeSubmissionModalOpen(false);
    if (isProcessingRecipeSubmission) setIsProcessingRecipeSubmission(false);
  };

  const handleInputChange = (event) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    if (newValue === '' && searchTerm !== '') {
      setSearchTerm(''); setCurrentPage(1);
    }
  };
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (inputValue !== searchTerm) {
      setSearchTerm(inputValue); setCurrentPage(1);
    } else if (inputValue === searchTerm && currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const fetchRecipes = useCallback(async (currentSearchTerm, pageToFetch, limit, showPrivate, currentUserId) => {
    setLoading(true);
    setError(null);
    let url = '';
    let fetcher = fetch;

    if (showPrivate) {
      if (!currentUserId) {
        setError("You must be logged in to view private recipes.");
        setLoading(false);
        setRecipes([]);
        setTotalRecipes(0);
        setIsLoginModalOpen(true);
        return;
      }
      url = `/api/recipes/my-private?page=${pageToFetch}&limit=${limit}&user_id=${currentUserId}`; 
      if (currentSearchTerm) {
        url += `&search=${encodeURIComponent(currentSearchTerm)}`;
      }
      fetcher = authenticatedFetch;
    } else {
      url = `/api/recipes?page=${pageToFetch}&limit=${limit}`;
      if (currentSearchTerm) {
        url += `&search=${encodeURIComponent(currentSearchTerm)}`;
      }
    }

    try {
      const response = await fetcher(url, {}, auth);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch recipes: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched recipes data with average_rating check:', data.recipes); 
      setRecipes(data.recipes || []);
      setTotalRecipes(data.total || 0);
    } catch (err) {
      setError(err.message);
      setRecipes([]);
      setTotalRecipes(0);
      console.error("Error fetching recipes:", err);
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    fetchRecipes(searchTerm, currentPage, recipesPerPage, showPrivateRecipes, effectiveUserId);

    const existingPaletteString = localStorage.getItem(MEAL_PLAN_PALETTE_KEY);
    const currentPalette = existingPaletteString ? JSON.parse(existingPaletteString) : [];
    setPaletteRecipeIds(new Set(currentPalette.map(r => r.RecipeID)));
  }, [currentPage, recipesPerPage, searchTerm, fetchRecipes, showPrivateRecipes, effectiveUserId]);

  useEffect(() => {
    let hasBeenHiddenOrBlurred = false;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (hasBeenHiddenOrBlurred) {
          fetchRecipes(searchTerm, currentPage, recipesPerPage, showPrivateRecipes, effectiveUserId);
        }
      } else {
        hasBeenHiddenOrBlurred = true;
      }
    };

    if (document.visibilityState === 'hidden') {
      hasBeenHiddenOrBlurred = true;
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchRecipes, searchTerm, currentPage, recipesPerPage, showPrivateRecipes, effectiveUserId]);

  const handleAddToPalette = (recipeToAdd) => {
    if (isAuthenticated) {
      try {
        const existingPaletteString = localStorage.getItem(MEAL_PLAN_PALETTE_KEY);
        let currentPalette = existingPaletteString ? JSON.parse(existingPaletteString) : [];
        if (!currentPalette.some(recipe => recipe.RecipeID === recipeToAdd.RecipeID)) {
          currentPalette.push({ RecipeID: recipeToAdd.RecipeID, Title: recipeToAdd.Title, ImageURL: recipeToAdd.ImageURL });
          localStorage.setItem(MEAL_PLAN_PALETTE_KEY, JSON.stringify(currentPalette));
          setPaletteRecipeIds(prevIds => new Set(prevIds).add(recipeToAdd.RecipeID));
        }
      } catch (error) {
        console.error("Error adding recipe to palette:", error);
        setError("Failed to add recipe to palette. Please try again.");
      }
    } else {
      setIsLoginModalOpen(true);
    }
  };

  if (loading && recipes.length === 0) {
    return (
      <div className="section-padding">
        <div className="container-modern">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="text-center">
              <HiOutlineRefresh className="animate-spin h-12 w-12 text-emerald-500 mx-auto mb-4" />
              <p className="text-gray-600">Loading recipes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && recipes.length === 0) {
    return (
      <div className="section-padding">
        <div className="container-modern">
          <div className="card p-6 border-red-200 bg-red-50 animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading recipes</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const commonButtonClassNameUnused = "px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300";

  const handleToggleRecipeView = () => {
    if (!showPrivateRecipes && !isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    setShowPrivateRecipes(prev => !prev);
    setCurrentPage(1);
  };

  const isToggleButtonDisabled = !isAuthenticated && !showPrivateRecipes;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="section-padding">
        <div className="container-modern">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">
                {showPrivateRecipes ? "My Private Recipes" : "Browse Recipes"}
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover delicious recipes and add them to your meal planning palette
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="card-glass p-6 mb-8 animate-fade-in">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4 items-center">
              <button
                onClick={handleToggleRecipeView}
                disabled={isToggleButtonDisabled}
                title={isToggleButtonDisabled ? "Log in to view your private recipes" : ""}
                className={`btn-outline flex items-center ${isToggleButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {showPrivateRecipes ? (
                  <>
                    <HiOutlineEyeOff className="w-4 h-4 mr-2" />
                    Public Recipes
                  </>
                ) : (
                  <>
                    <HiOutlineEye className="w-4 h-4 mr-2" />
                    Private Recipes
                  </>
                )}
              </button>
              
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <HiOutlineSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Search recipes by name, ingredients, or cuisine..."
                  className="form-input pl-12 w-full"
                />
              </div>
              
              <button type="submit" className="btn-primary">
                <HiOutlineSearch className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Error Message */}
          {error && recipes.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-slide-in">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && recipes.length > 0 && (
            <div className="flex justify-center items-center py-8">
              <HiOutlineRefresh className="animate-spin h-8 w-8 text-emerald-500" />
            </div>
          )}

          {/* Recipes Grid */}
          <div className="min-h-[50vh]">
            {!loading && recipes.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <HiOutlineSearch className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No recipes found</h3>
                <p className="text-gray-600">
                  {searchTerm ? `No ${showPrivateRecipes ? 'private' : 'public'} recipes found for "${searchTerm}".` : 
                               `No ${showPrivateRecipes ? 'private' : 'public'} recipes available at the moment.`}
                  {showPrivateRecipes && !isAuthenticated && " Please log in to see your private recipes."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recipes.map((recipe) => {
                  const isRecipeInPalette = paletteRecipeIds.has(recipe.RecipeID);
                  return (
                    <RecipeCard
                      key={recipe.RecipeID}
                      recipe={recipe}
                      renderActions={(currentRecipe) => (
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToPalette(currentRecipe); }}
                          disabled={isRecipeInPalette}
                          className={`w-full mt-4 px-4 py-2 text-sm font-medium rounded-xl flex items-center justify-center transition-all duration-200 ${
                            isRecipeInPalette
                              ? 'bg-emerald-100 text-emerald-700 cursor-default'
                              : 'btn-secondary hover:scale-105'
                          }`}
                        >
                          {isRecipeInPalette ? (
                            <>
                              <HiOutlineCheck className="w-4 h-4 mr-2" />
                              Added to Palette
                            </>
                          ) : (
                            <>
                              <HiOutlinePlus className="w-4 h-4 mr-2" />
                              Add to Palette
                            </>
                          )}
                        </button>
                      )}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalRecipes > 0 && !loading && (
            <div className="mt-12 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handlePreviousPage} 
                  disabled={currentPage === 1} 
                  className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg">
                  Page {currentPage} of {Math.ceil(totalRecipes / recipesPerPage)}
                </span>
                <button 
                  onClick={handleNextPage} 
                  disabled={currentPage * recipesPerPage >= totalRecipes} 
                  className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <label htmlFor="recipesPerPageSelect" className="text-sm text-gray-600">Show:</label>
                <select
                  id="recipesPerPageSelect"
                  value={recipesPerPage}
                  onChange={handleRecipesPerPageChange}
                  className="form-input px-3 py-1.5 text-sm w-20"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-600">per page</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Add Recipe Button */}
      <button
        type="button"
        aria-label="add recipe"
        onClick={handleOpenRecipeSubmissionModal}
        className="fixed bottom-6 left-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 transition-all duration-200 ease-in-out hover:scale-110 z-40"
      >
        <HiOutlinePlus className="w-6 h-6"/>
      </button>

      {/* Modals */}
      {isAuthenticated && effectiveUserId && (
        <RecipeSubmissionModal
          open={isRecipeSubmissionModalOpen}
          onClose={handleCloseRecipeSubmissionModal}
          userId={effectiveUserId}
          isLoading={isProcessingRecipeSubmission}
          setIsLoading={setIsProcessingRecipeSubmission}
        />
      )}
      <RequireLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        title="Login Required"
        message="You need to be logged in to add recipes to your palette or submit a new recipe."
        redirectState={{ from: location }}
      />
      {isProcessingRecipeSubmission && <FloatingLoader text="Submitting recipe..."/>}
    </div>
  );
}

export default PublicRecipeBrowser;
