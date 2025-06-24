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
    const [recipesPerPage, setRecipesPerPage] = useState(10);
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
            <div className="max-w-6xl mx-auto py-8 px-4 text-center">
                <HiOutlineRefresh className="animate-spin h-10 w-10 text-blue-400 mx-auto" /> <p className="mt-2 text-gray-400">Loading authentication...</p>
            </div>
        );
    }
    if (!isAuthenticated) {
        return (
            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="p-4 bg-yellow-700/[0.5] border-l-4 border-yellow-500 text-yellow-200 rounded-md">
                    <p>Please log in to view your personalized recipes.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl text-center mb-10">
                Your Personalized Recipes
            </h1>

            {error && (
                <div className="mb-6 p-3 bg-red-700 border border-red-500 text-red-200 rounded-md text-sm">
                    {error}
                </div>
            )}

            {isLoading && recipes.length === 0 && (
                <div className="flex flex-col items-center justify-center my-10">
                    <HiOutlineRefresh className="animate-spin h-10 w-10 text-blue-400" />
                    <p className="mt-2 text-gray-400">Loading your personalized recipes...</p>
                </div>
            )}

            {recipes.length > 0 && (
                <div className="flex justify-center">
                    <div className="flex flex-wrap justify-center gap-2">
                        {recipes.map((recipe) => (
                        <RecipeCard key={recipe.RecipeID} recipe={recipe} />
                    ))}
                    </div>
                </div>
            )}
            
            {isLoading && recipes.length > 0 && (
                 <div className="flex justify-center items-center py-8"><HiOutlineRefresh className="animate-spin h-8 w-8 text-blue-400" /></div>
            )}

            {!isLoading && !error && recipes.length === 0 && (
                <p className="text-center text-gray-400 mt-6 text-lg">
                    {(totalRecipes > 0 && recipes.length === 0)
                        ? "No personalized recipes on this page. Try a different page."
                        : "No personalized recipes found. This could be based on your preferences, allergies, or available pantry items. Try exploring all recipes or adjusting your settings."
                    }
                </p>
            )}

            {totalRecipes > 0 && recipes.length > 0 && ( 
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

export default PersonalizedRecipesPage;
