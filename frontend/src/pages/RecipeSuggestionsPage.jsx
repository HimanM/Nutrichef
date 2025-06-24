import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import RecipeCard from '../components/RecipeCard.jsx';
import { authenticatedFetch } from '../utils/apiUtil.js';
import { HiOutlineRefresh } from 'react-icons/hi';

function RecipeSuggestionsPage() {
    const [apiResponse, setApiResponse] = useState({ recipes: [], message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const auth = useAuth();
    const { isAuthenticated, loading: authLoading, token } = auth;

    const [currentPage, setCurrentPage] = useState(1);
    const [recipesPerPage, setRecipesPerPage] = useState(10);
    const [totalRecipes, setTotalRecipes] = useState(0);

    const [matchThreshold, setMatchThreshold] = useState(0.5);
    const [inputValue, setInputValue] = useState(String(matchThreshold));

    const fetchSuggestions = useCallback(async (threshold, page, limit) => {
        if (!isAuthenticated || !token) return;
        setIsLoading(true); setError('');
        if (apiResponse.recipes.length === 0) {
            setApiResponse({ recipes: [], message: '' });
        }

        let url = `/api/pantry/suggest-recipes?match_threshold=${threshold}&page=${page}&limit=${limit}`;

        try {
            const response = await authenticatedFetch(url, { method: 'GET' }, auth);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || data.error || `Failed to fetch suggestions: ${response.statusText}`);
            }
            setApiResponse({ recipes: data.recipes || [], message: data.message || '' });
            setTotalRecipes(data.total || 0);
        } catch (err) {
            setError(err.message || 'Failed to fetch recipe suggestions.');
            setApiResponse({ recipes: [], message: err.message || 'Failed to fetch recipe suggestions.' });
            setTotalRecipes(0);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, token, auth, apiResponse.recipes.length]);

    useEffect(() => {
      if (isAuthenticated && token) {
        fetchSuggestions(matchThreshold, currentPage, recipesPerPage);
      } else if (!authLoading && !isAuthenticated) {
        setApiResponse({ recipes: [], message: '' });
        setTotalRecipes(0);
        setError("Please log in to get recipe suggestions.");
      }
    }, [fetchSuggestions, matchThreshold, isAuthenticated, token, authLoading, currentPage, recipesPerPage]);


    const handleThresholdInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleApplyThreshold = () => {
        const newThreshold = parseFloat(inputValue);
        if (!isNaN(newThreshold) && newThreshold >= 0 && newThreshold <= 1) {
            setMatchThreshold(newThreshold);
            setError('');
        } else {
            setError("Match threshold must be a number between 0.0 and 1.0.");
        }
    };

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => {
            const totalPages = Math.ceil(totalRecipes / recipesPerPage);
            return Math.min(prev + 1, totalPages);
        });
    };

    const handleRecipesPerPageChange = (e) => {
        setRecipesPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const commonButtonClassNameBase = "px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50";

    if (authLoading) {
        return (
            <div className="max-w-6xl mx-auto py-8 px-4 text-center">
                <HiOutlineRefresh className="animate-spin h-10 w-10 text-blue-400 mx-auto" /> <p className="mt-2 text-gray-400">Loading authentication...</p>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
            <div className="section-padding">
                <div className="container-modern">
                    {/* Header */}
                    <div className="text-center mb-12 animate-fade-in">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            <span className="gradient-text">Recipe Suggestions</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Personalized recipe recommendations based on your pantry ingredients and preferences
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
                    )}
                    <div className="bg-white/80 shadow-xl rounded-3xl p-8 border border-emerald-100 mb-8">
                        <div className="mb-6 p-4 bg-white/80 shadow-md rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 border border-emerald-100">
                            <RouterLink
                                to="/pantry"
                                className={`${commonButtonClassNameBase} btn-secondary w-full sm:w-auto`}
                            >
                                Back to Pantry
                            </RouterLink>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <label htmlFor="matchThreshold" className="text-sm font-medium text-emerald-700 whitespace-nowrap">Match Threshold:</label>
                                <input
                                    type="number"
                                    id="matchThreshold"
                                    value={inputValue}
                                    onChange={handleThresholdInputChange}
                                    step="0.1" min="0" max="1"
                                    className="w-24 px-2 py-1.5 bg-white border border-emerald-100 text-emerald-700 rounded-md shadow-sm focus:outline-none focus:ring-emerald-400 focus:border-emerald-400 sm:text-sm placeholder-emerald-300"
                                />
                                <button
                                    onClick={handleApplyThreshold}
                                    disabled={isLoading}
                                    className={`btn-primary ${commonButtonClassNameBase} flex items-center justify-center min-w-[80px] disabled:opacity-75`}
                                >
                                    {isLoading ? <HiOutlineRefresh className="animate-spin h-5 w-5 text-white" /> : 'Apply'}
                                </button>
                            </div>
                        </div>

                        {isLoading && apiResponse.recipes.length === 0 && (
                            <div className="flex flex-col items-center justify-center my-10">
                                <HiOutlineRefresh className="animate-spin h-10 w-10 text-blue-400" />
                                <p className="mt-2 text-gray-400">Loading suggestions...</p>
                            </div>
                        )}

                        {apiResponse.recipes.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {apiResponse.recipes.map(recipe => (
                                    <div key={recipe.RecipeID} className="animate-fade-in">
                                        <RecipeCard recipe={recipe} />
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {isLoading && apiResponse.recipes.length > 0 && (
                             <div className="flex justify-center items-center py-8"><HiOutlineRefresh className="animate-spin h-8 w-8 text-blue-400" /></div>
                        )}

                        {!isLoading && apiResponse.recipes.length === 0 && (
                             <p className="text-center text-gray-400 mt-10 text-lg">
                                {(totalRecipes > 0 && apiResponse.recipes.length === 0)
                                    ? "No recipes on this page. Try a different page or adjust filters."
                                    : (apiResponse.message || "No recipes found with the current filter. Try adjusting the threshold or adding more ingredients to your pantry.")
                                }
                            </p>
                        )}

                        {totalRecipes > 0 && !isLoading && apiResponse.recipes.length > 0 && (
                            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 pt-6 border-t border-gray-100">
                                <div className="flex items-center space-x-2">
                                    <label htmlFor="recipesPerPageSelect" className="text-sm text-gray-600">Show:</label>
                                    <select
                                        id="recipesPerPageSelect"
                                        value={recipesPerPage}
                                        onChange={handleRecipesPerPageChange}
                                        className="px-3 py-1.5 border border-gray-200 bg-white text-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                    >
                                        <option value={12}>12</option>
                                        <option value={24}>24</option>
                                        <option value={36}>36</option>
                                    </select>
                                    <span className="text-sm text-gray-600">per page</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button 
                                        onClick={handlePreviousPage} 
                                        disabled={currentPage === 1} 
                                        className="btn-outline px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200">
                                        Page {currentPage} of {Math.ceil(totalRecipes / recipesPerPage)}
                                    </span>
                                    <button 
                                        onClick={handleNextPage} 
                                        disabled={currentPage * recipesPerPage >= totalRecipes} 
                                        className="btn-outline px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RecipeSuggestionsPage;
