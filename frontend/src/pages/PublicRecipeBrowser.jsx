import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { authenticatedFetch } from '../utils/apiUtil.js';
import RequireLoginModal from '../components/auth/RequireLoginModal.jsx';
import RecipeSubmissionModal from '../components/RecipeSubmissionModal.jsx';
import FloatingLoader from '../components/FloatingLoader.jsx';
import { HiOutlineRefresh, HiOutlineSearch, HiOutlinePlus, HiOutlineCheck, HiOutlineEye, HiOutlineEyeOff, HiOutlineHeart, HiHeart, HiOutlineTag, HiOutlineX } from 'react-icons/hi';

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
  const [recipesPerPage, setRecipesPerPage] = useState(12);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState('');
  
  // New state for favorites and tags
  const [currentView, setCurrentView] = useState('public'); // 'public', 'private', 'favorites'
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState(new Set());
  const [showTagsFilter, setShowTagsFilter] = useState(false);

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
    if (isAuthenticated) {
      setIsRecipeSubmissionModalOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
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

  const fetchRecipes = useCallback(async (currentSearchTerm, pageToFetch, limit, viewType, currentUserId, tagIds = []) => {
    setLoading(true);
    setError(null);
    let url = '';
    let fetcher = fetch;

    try {
      if (viewType === 'favorites') {
        if (!currentUserId) {
          setError("You must be logged in to view your favorites.");
          setLoading(false);
          setRecipes([]);
          setTotalRecipes(0);
          setIsLoginModalOpen(true);
          return;
        }
        const data = await fetchUserFavorites(currentUserId, pageToFetch, limit, currentSearchTerm);
        setRecipes(data.recipes || []);
        setTotalRecipes(data.pagination?.total || 0);
        return;
      }

      if (tagIds.length > 0) {
        const data = await fetchRecipesByTags(tagIds, pageToFetch, limit, false);
        let filteredRecipes = data.recipes || [];
        
        // Apply search filter if needed
        if (currentSearchTerm) {
          const searchLower = currentSearchTerm.toLowerCase();
          filteredRecipes = filteredRecipes.filter(recipe => 
            recipe.Title?.toLowerCase().includes(searchLower) ||
            recipe.Description?.toLowerCase().includes(searchLower)
          );
        }
        
        setRecipes(filteredRecipes);
        setTotalRecipes(filteredRecipes.length);
        return;
      }

      if (viewType === 'private') {
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
        // Public recipes
        url = `/api/recipes?page=${pageToFetch}&limit=${limit}`;
        if (currentSearchTerm) {
          url += `&search=${encodeURIComponent(currentSearchTerm)}`;
        }
      }

      const response = await fetcher(url, {}, auth);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch recipes: ${response.status}`);
      }
      const data = await response.json();
      setRecipes(data.recipes || []);
      setTotalRecipes(data.pagination?.total || 0);
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
    fetchRecipes(searchTerm, currentPage, recipesPerPage, currentView, effectiveUserId, selectedTags);

    const existingPaletteString = localStorage.getItem(MEAL_PLAN_PALETTE_KEY);
    const currentPalette = existingPaletteString ? JSON.parse(existingPaletteString) : [];
    setPaletteRecipeIds(new Set(currentPalette.map(r => r.RecipeID)));
  }, [currentPage, recipesPerPage, searchTerm, fetchRecipes, currentView, effectiveUserId, selectedTags]);

  useEffect(() => {
    let hasBeenHiddenOrBlurred = false;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (hasBeenHiddenOrBlurred) {
          fetchRecipes(searchTerm, currentPage, recipesPerPage, currentView, effectiveUserId, selectedTags);
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
  }, [fetchRecipes, searchTerm, currentPage, recipesPerPage, currentView, effectiveUserId, selectedTags]);

  const handleAddToPalette = (recipeToAdd) => {
    if (isAuthenticated) {
      try {
        const existingPaletteString = localStorage.getItem(MEAL_PLAN_PALETTE_KEY);
        let currentPalette = existingPaletteString ? JSON.parse(existingPaletteString) : [];
        if (!currentPalette.some(recipe => recipe.RecipeID === recipeToAdd.RecipeID)) {
          const recipeForPalette = {
            ...recipeToAdd,
            NutritionInfo: recipeToAdd.NutritionInfoJSON || recipeToAdd.NutritionInfo || null
          };
          currentPalette.push(recipeForPalette);
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

  // Favorites API functions
  const toggleFavorite = async (recipeId) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      const isFavorited = favoriteRecipeIds.has(recipeId);
      const method = isFavorited ? 'DELETE' : 'POST';
      const response = await authenticatedFetch(`/api/recipes/${recipeId}/favorite`, {
        method
      }, auth);

      if (!response.ok) {
        throw new Error('Failed to update favorite status');
      }

      const data = await response.json();
      
      // Update local state
      setFavoriteRecipeIds(prev => {
        const newSet = new Set(prev);
        if (data.is_favorited) {
          newSet.add(recipeId);
        } else {
          newSet.delete(recipeId);
        }
        return newSet;
      });

      // Update recipe in current list if needed
      setRecipes(prev => prev.map(recipe => 
        recipe.RecipeID === recipeId 
          ? { ...recipe, is_favorited: data.is_favorited }
          : recipe
      ));

    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError('Failed to update favorite status');
    }
  };

  const fetchUserFavorites = async (userId, page = 1, limit = 12, search = '') => {
    try {
      let url = `/api/users/${userId}/favorites?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      
      const response = await authenticatedFetch(url, {}, auth);
      if (!response.ok) throw new Error('Failed to fetch favorites');
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  };

  // Tags API functions
  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags/by-category');
      if (!response.ok) throw new Error('Failed to fetch tags');
      const data = await response.json();
      return data.tags_by_category || {};
    } catch (error) {
      console.error('Error fetching tags:', error);
      return {};
    }
  };

  const fetchRecipesByTags = async (tagIds, page = 1, limit = 12, matchAll = false) => {
    try {
      const response = await fetch('/api/recipes/by-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag_ids: tagIds, page, limit, match_all: matchAll })
      });
      
      if (!response.ok) throw new Error('Failed to fetch recipes by tags');
      return await response.json();
    } catch (error) {
      console.error('Error fetching recipes by tags:', error);
      throw error;
    }
  };

  // Load user favorites on authentication
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      authenticatedFetch(`/api/users/${currentUser.UserID}/favorites/ids`, {}, auth)
        .then(response => response.json())
        .then(data => {
          setFavoriteRecipeIds(new Set(data.favorite_recipe_ids || []));
        })
        .catch(error => console.error('Error loading user favorites:', error));
    } else {
      setFavoriteRecipeIds(new Set());
    }
  }, [isAuthenticated, currentUser, auth]);

  // Load available tags on component mount
  useEffect(() => {
    fetchTags().then(tagsData => {
      setAvailableTags(tagsData);
    });
  }, []);

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

  // View management functions
  const handleViewChange = (newView) => {
    if ((newView === 'private' || newView === 'favorites') && !isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    setCurrentView(newView);
    setCurrentPage(1);
    setSelectedTags([]); // Clear tag filters when changing views
  };

  // Tag management functions
  const handleTagToggle = (tagId) => {
    setSelectedTags(prev => {
      const newTags = prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId];
      setCurrentPage(1); // Reset to first page when filters change
      return newTags;
    });
  };

  const clearTagFilters = () => {
    setSelectedTags([]);
    setCurrentPage(1);
  };

  const toggleTagsFilter = () => {
    setShowTagsFilter(prev => !prev);
  };

  // Legacy support
  const handleToggleRecipeView = () => {
    const nextView = currentView === 'private' ? 'public' : 'private';
    handleViewChange(nextView);
  };

  const showPrivateRecipes = currentView === 'private'; // Legacy compatibility
  const isToggleButtonDisabled = !isAuthenticated && currentView === 'public';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="section-padding">
        <div className="container-modern">
          {/* Header */}
          <div className="text-center mb-6 animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              <span className="gradient-text">
                {currentView === 'private' ? "My Private Recipes" : 
                 currentView === 'favorites' ? "My Favorite Recipes" : 
                 "Browse Recipes"}
              </span>
            </h1>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              {currentView === 'favorites' ? "Your saved favorite recipes" :
               "Discover delicious recipes and add them to your meal planning palette"}
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="card-glass p-3 mb-4 animate-fade-in">
            {/* Single Line: View Buttons + Search Bar */}
            <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center mb-3">
              {/* View Selection Buttons */}
              <div className="flex gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleViewChange('public')}
                  className={`btn-outline flex items-center text-xs py-2 px-2.5 ${currentView === 'public' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : ''}`}
                >
                  <HiOutlineEye className="w-3 h-3 mr-1" />
                  Public
                </button>
                
                <button
                  type="button"
                  onClick={() => handleViewChange('private')}
                  disabled={!isAuthenticated}
                  title={!isAuthenticated ? "Log in to view your private recipes" : ""}
                  className={`btn-outline flex items-center text-xs py-2 px-2.5 ${currentView === 'private' ? 'bg-blue-100 text-blue-700 border-blue-300' : ''} ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <HiOutlineEyeOff className="w-3 h-3 mr-1" />
                  Private
                </button>
                
                <button
                  type="button"
                  onClick={() => handleViewChange('favorites')}
                  disabled={!isAuthenticated}
                  title={!isAuthenticated ? "Log in to view your favorite recipes" : ""}
                  className={`inline-flex items-center justify-center font-medium text-xs py-2 px-2.5 rounded-lg transition-all duration-200 ${
                    currentView === 'favorites' 
                      ? 'bg-pink-100 text-pink-700 border-2 border-pink-300' 
                      : 'border-2 border-gray-300 text-gray-600 hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50'
                  } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <HiOutlineHeart className="w-3 h-3 mr-1" />
                  Favorites
                </button>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2 items-center">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiOutlineSearch className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="Search recipes by name, ingredients, or cuisine..."
                    className="form-input pl-10 w-full py-2 text-sm"
                  />
                </div>
                
                <button type="submit" className="btn-primary py-2 px-3 flex-shrink-0">
                  <HiOutlineSearch className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Tag Filters Toggle & Section */}
            {currentView === 'public' && Object.keys(availableTags).length > 0 && (
              <div className="border-t pt-2 border-gray-200">
                {/* Toggle Button */}
                <div className="flex items-center justify-between mb-2">
                  <button
                    type="button"
                    onClick={toggleTagsFilter}
                    className={`flex items-center text-xs font-medium transition-colors ${
                      selectedTags.length > 0 ? 'text-emerald-700' : 'text-gray-700 hover:text-gray-600'
                    }`}
                  >
                    <HiOutlineTag className="w-3 h-3 mr-1" />
                    Filter by Tags
                    {selectedTags.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full">
                        {selectedTags.length}
                      </span>
                    )}
                    <svg 
                      className={`w-3 h-3 ml-1 transition-transform duration-200 ${showTagsFilter ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showTagsFilter && selectedTags.length > 0 && (
                    <button
                      type="button"
                      onClick={clearTagFilters}
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                    >
                      <HiOutlineX className="w-3 h-3 mr-0.5" />
                      Clear
                    </button>
                  )}
                </div>
                
                {/* Tags Filter Content */}
                {showTagsFilter && (
                  <div className="animate-fade-in">
                    {Object.entries(availableTags).map(([category, tags]) => (
                      <div key={category} className="mb-2">
                        <h4 className="text-xs font-medium text-gray-600 mb-1 capitalize">{category}</h4>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(tags) && tags.map((tag) => (
                            <button
                              key={tag.TagID}
                              type="button"
                              onClick={() => handleTagToggle(tag.TagID)}
                              className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                                selectedTags.includes(tag.TagID)
                                  ? 'text-white border-transparent'
                                  : 'text-gray-600 border-gray-300 hover:border-gray-400'
                              }`}
                              style={{
                                backgroundColor: selectedTags.includes(tag.TagID) ? tag.TagColor : 'transparent',
                                borderColor: selectedTags.includes(tag.TagID) ? tag.TagColor : undefined
                              }}
                            >
                              {tag.TagName}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && recipes.length > 0 && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-slide-in">
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
                  {searchTerm ? `No ${currentView} recipes found for "${searchTerm}".` : 
                   selectedTags.length > 0 ? "No recipes found with the selected tags." :
                   `No ${currentView} recipes available at the moment.`}
                  {(currentView === 'private' || currentView === 'favorites') && !isAuthenticated && " Please log in to access this feature."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recipes.map((recipe) => {
                  const isRecipeInPalette = paletteRecipeIds.has(recipe.RecipeID);
                  const isFavorited = favoriteRecipeIds.has(recipe.RecipeID) || recipe.is_favorited;
                  
                  return (
                    <RecipeCard
                      key={recipe.RecipeID}
                      recipe={recipe}
                      renderActions={(currentRecipe) => (
                        <div className="flex gap-2 mt-1">
                          {/* Favorites Button - Icon Only */}
                          {isAuthenticated && (
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(currentRecipe.RecipeID); }}
                              className={`p-3 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 ${
                                isFavorited
                                  ? 'bg-pink-500 text-white border border-pink-500 hover:bg-pink-600 shadow-md'
                                  : 'bg-white text-pink-500 border border-pink-300 hover:border-pink-400 hover:bg-pink-50'
                              }`}
                              title={isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
                            >
                              {isFavorited ? (
                                <HiHeart className="w-5 h-5" />
                              ) : (
                                <HiOutlineHeart className="w-5 h-5" />
                              )}
                            </button>
                          )}
                          
                          {/* Add to Palette Button */}
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToPalette(currentRecipe); }}
                            disabled={isRecipeInPalette}
                            className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl flex items-center justify-center transition-all duration-200 ${
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
                        </div>
                      )}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalRecipes > 0 && !loading && recipes.length > 0 && (
            <div className="mt-12">
              {/* Recipe Count Summary */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-sm text-emerald-700">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Showing {((currentPage - 1) * recipesPerPage) + 1} to {Math.min(currentPage * recipesPerPage, totalRecipes)} of {totalRecipes} recipes
                </div>
              </div>

              {/* Pagination Controls */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
                  {/* Page Navigation */}
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={handlePreviousPage} 
                      disabled={currentPage === 1} 
                      className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all duration-200"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, Math.ceil(totalRecipes / recipesPerPage)) }, (_, i) => {
                        const pageNum = i + 1;
                        const isCurrentPage = pageNum === currentPage;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-10 text-sm font-medium rounded-lg transition-all duration-200 ${
                              isCurrentPage
                                ? 'bg-emerald-500 text-white shadow-md'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-emerald-300'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      {Math.ceil(totalRecipes / recipesPerPage) > 5 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                    </div>
                    
                    <button 
                      onClick={handleNextPage} 
                      disabled={currentPage * recipesPerPage >= totalRecipes} 
                      className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all duration-200"
                    >
                      Next
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Page Size Selector */}
                  <div className="flex items-center space-x-3">
                    <label htmlFor="recipesPerPageSelect" className="text-sm font-medium text-gray-700">Show:</label>
                    <select
                      id="recipesPerPageSelect"
                      value={recipesPerPage}
                      onChange={handleRecipesPerPageChange}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
                    >
                      <option value={12}>12 per page</option>
                      <option value={24}>24 per page</option>
                      <option value={36}>36 per page</option>
                    </select>
                  </div>
                </div>

                {/* Single Page Indicator */}
                {totalRecipes <= recipesPerPage && (
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs text-blue-700">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      All recipes displayed
                    </div>
                  </div>
                )}
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
        className="fixed bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 transition-all duration-200 ease-in-out hover:scale-110 z-40
          
          /* Mobile positioning - bottom left, proper spacing */
          bottom-4 left-4 p-3
          sm:bottom-6 sm:left-6 sm:p-4
          
          /* Touch-friendly mobile sizing */
          touch-manipulation
          min-h-[56px] min-w-[56px]
          sm:min-h-[60px] sm:min-w-[60px]
        "
      >
        <HiOutlinePlus className="w-5 h-5 sm:w-6 sm:h-6"/>
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
