import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { authenticatedFetch } from '../utils/apiUtil.js';
import RequireLoginModal from '../components/auth/RequireLoginModal.jsx';
import RecipeSubmissionModal from '../components/RecipeSubmissionModal.jsx';
import FloatingLoader from '../components/FloatingLoader.jsx';
import { HiOutlineRefresh, HiOutlineSearch } from 'react-icons/hi';

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
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <HiOutlineRefresh className="animate-spin h-10 w-10 text-blue-400" />
      </div>
    );
  }

  if (error && recipes.length === 0) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="p-4 bg-red-700/[0.8] border-l-4 border-red-500 text-red-200 rounded-md">
          <p>Error fetching recipes: {error}</p>
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
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8"> 
      <h1 className="text-3xl sm:text-4xl text-center mb-8">
        {showPrivateRecipes ? "My Private Recipes" : "Browse Public Recipes"}
      </h1>
      <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mb-8 flex items-center space-x-2">
        <button
          onClick={handleToggleRecipeView}
          disabled={isToggleButtonDisabled}
          title={isToggleButtonDisabled ? "Log in to view your private recipes" : ""}
          className={`gradient-button-no-format py-2 px-4 mt-1 min-w-fit ${isToggleButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
          {showPrivateRecipes ? "Public Recipes" : "Private Recipes"}
        </button>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Search recipes..."
          className="flex-grow mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-gray-400"
        />
        <button type="submit" className="gradient-button py-2.5 px-4 disabled:opacity-75 mt-1">
          <HiOutlineSearch className="w-5 h-5 text-white" />
        </button>
      </form>

      {error && recipes.length > 0 && (
         <div className="my-4 p-3 bg-red-700/[0.8] border border-red-500 text-red-200 rounded-md text-sm max-w-lg mx-auto">
          {error}
        </div>
      )}

      <div className="min-h-[50vh]">
        {loading && recipes.length > 0 && (
             <div className="flex justify-center items-center py-8"><HiOutlineRefresh className="animate-spin h-10 w-10 text-blue-400" /></div>
        )}
        {!loading && recipes.length === 0 ? (
          <p className="text-center text-gray-400 mt-6 text-lg">
            {searchTerm ? `No ${showPrivateRecipes ? 'private' : 'public'} recipes found for "${searchTerm}".` : 
                         `No ${showPrivateRecipes ? 'private' : 'public'} recipes available at the moment.`}
            {showPrivateRecipes && !isAuthenticated && " Please log in to see your private recipes."}
          </p>
        ) : (
          <div className="flex justify-center">
            <div className="flex flex-wrap justify-center gap-6">
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
                      className={`w-full mt-2 px-3 py-1.5 text-xs font-medium rounded-md flex items-center justify-center transition-colors ${
                        isRecipeInPalette
                          ? 'bg-green-700 text-green-200 cursor-default'
                          : 'bg-blue-600 text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-70'
                      }`}
                    >
                      {isRecipeInPalette ? <CheckIcon /> : <AddIcon />}
                      {isRecipeInPalette ? 'In Palette' : 'Add to Palette'}
                    </button>
                  )}
                />
              );
            })}
          </div>
        </div>
        )}
      </div>

      {totalRecipes > 0 && !loading && (
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex space-x-2">
            <button onClick={handlePreviousPage} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-600 disabled:opacity-50">Prev</button>
            <span className="px-4 py-2 text-sm text-gray-300 bg-gray-700 rounded-md">
              Page {currentPage} of {Math.ceil(totalRecipes / recipesPerPage)}
            </span>
            <button onClick={handleNextPage} disabled={currentPage * recipesPerPage >= totalRecipes} className="px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-600 disabled:opacity-50">Next</button>
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="recipesPerPageSelect" className="text-sm text-gray-300">Show:</label>
            <select
              id="recipesPerPageSelect"
              value={recipesPerPage}
              onChange={handleRecipesPerPageChange}
              className="px-2 py-1.5 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-300">per page</span>
          </div>
        </div>
      )}
      
      


      <button
        type="button"
        aria-label="add recipe"
        onClick={handleOpenRecipeSubmissionModal}
        className="fixed bottom-5 right-20 sm:right-24 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 transition-transform duration-150 ease-in-out hover:scale-110 z-30"
      >
        <AddIcon className="w-6 h-6"/>
      </button>

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
