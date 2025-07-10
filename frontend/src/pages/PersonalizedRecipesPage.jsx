import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import RecipeCard from '../components/RecipeCard.jsx'; // Tailwind version
import { authenticatedFetch } from '../utils/apiUtil.js';
import { HiOutlineRefresh } from 'react-icons/hi';

function PersonalizedRecipesPage() {
    const [recipes, setRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const auth = useAuth();
    const { isAuthenticated, loading: authLoading, currentUser, token } = auth;

    const [currentPage, setCurrentPage] = useState(1);
    const [recipesPerPage, setRecipesPerPage] = useState(12); // Changed to 12 for better 3-column layout
    const [totalRecipes, setTotalRecipes] = useState(0);

    const fetchPersonalizedRecipes = useCallback(async (page, limit) => {
        if (!isAuthenticated || !currentUser?.UserID || !token) {
            setRecipes([]);
            setTotalRecipes(0);
            return;
        }
        setIsLoading(true); setError(null);
        if (recipes.length === 0) {
            setRecipes([]);
        }

        try {
            const response = await authenticatedFetch(`/api/users/${currentUser.UserID}/personalized_recipes?page=${page}&limit=${limit}`, { method: 'GET' }, auth);
            const data = await response.json();
            if (!response.ok) {
                setError(data.message || data.error || `Failed to fetch personalized recipes. Status: ${response.status}`);
                if (recipes.length === 0) setTotalRecipes(0);
            } else {
                setRecipes(data.recipes || []); 
                setTotalRecipes(data.total || 0);
            }
        } catch (err) {
            console.error("Error fetching personalized recipes:", err);
            setError('An error occurred while fetching personalized recipes. Please try again later.');
            if (recipes.length === 0) {
                setRecipes([]);
                setTotalRecipes(0);
            }
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, currentUser, token, auth, recipes.length]);

    useEffect(() => {
        if (isAuthenticated && currentUser?.UserID && token) {
            fetchPersonalizedRecipes(currentPage, recipesPerPage);
        } else if (!authLoading && !isAuthenticated) {
            setRecipes([]);
            setTotalRecipes(0);
        }
    }, [fetchPersonalizedRecipes, isAuthenticated, currentUser, token, authLoading, currentPage, recipesPerPage]);

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

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <HiOutlineRefresh className="animate-spin h-12 w-12 text-emerald-500 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Loading authentication...</p>
                </div>
            </div>
        );
    }
    
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
                <div className="max-w-md mx-auto p-6">
                    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-emerald-100">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Login Required</h3>
                            <p className="text-gray-600">Please log in to view your personalized recipes.</p>
                        </div>
                    </div>
                </div>
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
                            <span className="gradient-text">Personalized Recipes</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Discover recipes tailored to your dietary preferences, allergies, and nutritional goals
                        </p>
                    </div>

                    {/* Summary Section */}
                    <div className="card-glass p-6 mb-8 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">Your Personalized Recommendations</h2>
                                <p className="text-gray-600 text-sm">Based on your preferences</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-emerald-600">{totalRecipes}</div>
                                <div className="text-gray-600 text-sm">Total Recipes</div>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-fade-in">
                            {error}
                        </div>
                    )}

                    {/* Loading State for initial load */}
                    {isLoading && recipes.length === 0 && (
                        <div className="flex flex-col items-center justify-center min-h-[40vh]">
                            <HiOutlineRefresh className="animate-spin h-12 w-12 text-emerald-500 mb-4" />
                            <p className="text-gray-600 text-lg">Loading your personalized recipes...</p>
                        </div>
                    )}

                    {/* Recipes Grid */}
                    <div className="min-h-[50vh]">
                        {!isLoading && recipes.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Recipes Found</h3>
                                <p className="text-gray-600 max-w-md mx-auto">
                                    {(totalRecipes > 0 && recipes.length === 0)
                                        ? "No personalized recipes on this page. Try a different page."
                                        : "No personalized recipes found. This could be based on your preferences, allergies, or available pantry items. Try exploring all recipes or adjusting your settings."
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {recipes.map((recipe) => (
                                    <div key={recipe.RecipeID} className="animate-fade-in">
                                        <RecipeCard recipe={recipe} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Loading indicator for pagination */}
                    {isLoading && recipes.length > 0 && (
                        <div className="flex justify-center items-center py-8">
                            <HiOutlineRefresh className="animate-spin h-8 w-8 text-emerald-500" />
                        </div>
                    )}

                    {/* Pagination */}
                    {totalRecipes > 0 && !isLoading && recipes.length > 0 && (
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
                                    <option value={12}>12</option>
                                    <option value={24}>24</option>
                                    <option value={36}>36</option>
                                </select>
                                <span className="text-sm text-gray-600">per page</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PersonalizedRecipesPage;
