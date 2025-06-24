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
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl text-center mb-8">
                Recipe Suggestions
            </h1>

            <div className="mb-6 p-4 bg-gray-800 shadow-md rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
                <RouterLink
                    to="/pantry"
                    className={`${commonButtonClassNameBase} bg-gray-700 text-gray-300 hover:bg-gray-600 focus:ring-gray-500 w-full sm:w-auto`}
                >
                    Back to Pantry
                </RouterLink>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label htmlFor="matchThreshold" className="text-sm font-medium text-gray-300 whitespace-nowrap">Match Threshold:</label>
                    <input
                        type="number"
                        id="matchThreshold"
                        value={inputValue}
                        onChange={handleThresholdInputChange}
                        step="0.1" min="0" max="1"
                        className="w-24 px-2 py-1.5 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-gray-400"
                    />
                    <button
                        onClick={handleApplyThreshold}
                        disabled={isLoading}
                        className={`gradient-button ${commonButtonClassNameBase} flex items-center justify-center min-w-[80px] disabled:opacity-75`}
                    >
                        {isLoading ? <HiOutlineRefresh className="animate-spin h-5 w-5 text-white" /> : 'Apply'}
                    </button>
                </div>
            </div>

            {error &&
                <div className="my-4 p-3 bg-red-700 border border-red-500 text-red-200 rounded-md text-sm">
                    {error}
                </div>
            }

            {isLoading && apiResponse.recipes.length === 0 && (
                <div className="flex flex-col items-center justify-center my-10">
                    <HiOutlineRefresh className="animate-spin h-10 w-10 text-blue-400" />
                    <p className="mt-2 text-gray-400">Loading suggestions...</p>
                </div>
            )}

            {apiResponse.recipes.length > 0 && (
                <div className="flex justify-center">
                    <div className="flex flex-wrap justify-center gap-2">
                        {apiResponse.recipes.map(recipe => (
                        <RecipeCard key={recipe.RecipeID} recipe={recipe} />
                    ))}
                    </div>
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
                <div className="mt-10 flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="flex space-x-2">
                        <button 
                            onClick={handlePreviousPage} 
                            disabled={currentPage === 1} 
                            className="px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-600 disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span className="px-4 py-2 text-sm text-gray-300 bg-gray-700 rounded-md">
                            Page {currentPage} of {Math.ceil(totalRecipes / recipesPerPage)}
                        </span>
                        <button 
                            onClick={handleNextPage} 
                            disabled={currentPage * recipesPerPage >= totalRecipes} 
                            className="px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-600 disabled:opacity-50"
                        >
                            Next
                        </button>
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
        </div>
    );
}

export default RecipeSuggestionsPage;
