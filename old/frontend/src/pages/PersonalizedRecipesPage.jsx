import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import RecipeCard from '../components/RecipeCard.jsx'; // Assuming RecipeCard is in components folder
import {
    Container, Typography, Grid, CircularProgress, Alert, Box
} from '@mui/material';

function PersonalizedRecipesPage() {
    const [recipes, setRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { isAuthenticated, loading: authLoading, currentUser, token, showExpiryMessageAndLogout } = useAuth();

    const fetchPersonalizedRecipes = useCallback(async () => {
        if (!isAuthenticated || !currentUser?.UserID || !token) {
            // If not authenticated or user details are missing, don't attempt to fetch.
            // The main component render will handle showing login prompts.
            setRecipes([]); // Clear any existing recipes
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/users/${currentUser.UserID}/personalized_recipes`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.status === 401) {
                showExpiryMessageAndLogout("Your session has expired. Please log in again.");
                setRecipes([]);
                return;
            }

            const data = await response.json();
            if (!response.ok) {
                setError(data.message || data.error || `Failed to fetch personalized recipes. Status: ${response.status}`);
                setRecipes([]);
            } else {
                // Assuming the backend returns { recipes: [...] } or an array directly
                setRecipes(data.recipes || data || []);
            }
        } catch (err) {
            console.error("Error fetching personalized recipes:", err);
            setError('An error occurred while fetching personalized recipes. Please try again later.');
            setRecipes([]);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, currentUser, token, showExpiryMessageAndLogout]); // Added showExpiryMessageAndLogout

    useEffect(() => {
        // Only fetch if authenticated and all necessary auth data is available.
        if (isAuthenticated && currentUser?.UserID && token) {
            fetchPersonalizedRecipes();
        } else if (!authLoading && !isAuthenticated) {
            // If auth is loaded and user is not authenticated, clear recipes and potentially set an error
            // or rely on the main return block to show login prompt.
            setRecipes([]);
            // setError("Please log in to see personalized recipes."); // Optional: set error here
        }
    }, [fetchPersonalizedRecipes, isAuthenticated, currentUser, token, authLoading]); // authLoading added

    if (authLoading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 1 }}>Loading authentication...</Typography>
            </Container>
        );
    }

    if (!isAuthenticated) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Alert severity="warning">Please log in to view your personalized recipes.</Alert>
            </Container>
        );
    }

    if (isLoading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2, mt: 1 }}>Loading your personalized recipes...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                 <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                    Personalized Recipes
                </Typography>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                Your Personalized Recipes
            </Typography>
            {recipes.length === 0 ? (
                <Typography variant="subtitle1" sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
                    No personalized recipes found. This could be based on your preferences, allergies, or available interactions. Try exploring all recipes or adjusting your settings.
                </Typography>
            ) : (
                <Grid container spacing={3} justifyContent="center">
                    {recipes.map((recipe) => (
                        <Grid item key={recipe.RecipeID} sx={{ display: 'flex' }}>
                            {/* Pass the entire recipe object to RecipeCard.
                                RecipeCard handles its own structure including image, title, description.
                                The RecipeCard itself should have a fixed width and appropriate margins.
                            */}
                            <RecipeCard recipe={recipe} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}

export default PersonalizedRecipesPage;
