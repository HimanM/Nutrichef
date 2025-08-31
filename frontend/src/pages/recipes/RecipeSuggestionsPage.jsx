import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
// import { useConditionalAuth } from '../../components/auth/AuthGuard.jsx';
import RecipeCard from '../../components/pages/recipe/RecipeCard.jsx';
import { authenticatedFetch } from '../../utils/apiUtil.js';
import { SpinnerIcon } from '../../components/common/LoadingComponents.jsx';

function RecipeSuggestionsPage() {
    const [apiResponse, setApiResponse] = useState({ recipes: [], message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const auth = useAuth();
    const { isAuthenticated, loading: authLoading, token } = auth;
    // const { isSessionExpired } = useConditionalAuth();

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
                <SpinnerIcon size="h-10 w-10" color="text-blue-400" className="mx-auto" /> <p className="mt-2 text-gray-400">Loading authentication...</p>
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
                                    {isLoading ? <SpinnerIcon size="h-5 w-5" color="text-white" /> : 'Apply'}
                                </button>
                            </div>
                        </div>

                        {isLoading && apiResponse.recipes.length === 0 && (
                            <div className="flex flex-col items-center justify-center my-10">
                                <SpinnerIcon size="h-10 w-10" color="text-blue-400" />
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
                            <div className="flex justify-center items-center py-8"><SpinnerIcon size="h-8 w-8" color="text-blue-400" /></div>
                        )}

                        {!isLoading && apiResponse.recipes.length === 0 && (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                                    {(totalRecipes > 0 && apiResponse.recipes.length === 0)
                                        ? "No recipes on this page"
                                        : "No recipe matches found"
                                    }
                                </h3>
                                <div className="max-w-md mx-auto mb-6">
                                    <p className="text-gray-600 mb-4">
                                        {(totalRecipes > 0 && apiResponse.recipes.length === 0)
                                            ? "Try navigating to a different page or adjusting your filters."
                                            : "We couldn't find recipes that match your pantry ingredients with the current threshold."
                                        }
                                    </p>
                                    {!(totalRecipes > 0 && apiResponse.recipes.length === 0) && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                                            <div className="font-medium mb-2">Try these suggestions:</div>
                                            <ul className="space-y-1 text-left">
                                                <li className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Lower the match threshold (try 0.3 or 0.4)
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Add more ingredients to your pantry
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Check common ingredients like flour, salt, or oil
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <RouterLink
                                        to="/pantry"
                                        className="btn-primary px-6 py-3 rounded-lg font-medium inline-flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                        Manage Pantry
                                    </RouterLink>
                                    <button
                                        onClick={() => {
                                            setInputValue('0.3');
                                            setMatchThreshold(0.3);
                                        }}
                                        className="btn-outline px-6 py-3 rounded-lg font-medium inline-flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                        </svg>
                                        Try Lower Threshold (0.3)
                                    </button>
                                </div>
                            </div>
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
