import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RecipeCard from '../components/RecipeCard.jsx'; // Import the enhanced RecipeCard
import {
    Container, Box, Typography, TextField, Button, Grid, CircularProgress, Alert
} from '@mui/material';

function RecipeSuggestionsPage() {
    const [apiResponse, setApiResponse] = useState({ recipes: [], message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { isAuthenticated, loading: authLoading, token, showExpiryMessageAndLogout } = useAuth();

    const [matchThreshold, setMatchThreshold] = useState(0.5);
    const [inputValue, setInputValue] = useState(String(matchThreshold));

    const fetchSuggestions = useCallback(async (threshold) => {
        if (!isAuthenticated || !token) return;
        setIsLoading(true);
        setError('');
        setApiResponse({ recipes: [], message: '' }); // Clear previous results

        let url = '/api/pantry/suggest-recipes';
        if (threshold !== undefined && threshold !== null) {
            url += `?match_threshold=${threshold}`;
        }

        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                showExpiryMessageAndLogout("Your session has expired. Please log in again.");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || `Failed to fetch suggestions: ${response.statusText}`);
            }

            setApiResponse({
                recipes: data.recipes || [],
                message: data.message || ''
            });
        } catch (err) {
            setError(err.message || 'Failed to fetch recipe suggestions.');
            setApiResponse({ recipes: [], message: err.message || 'Failed to fetch recipe suggestions.' });
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, token, showExpiryMessageAndLogout]);

    useEffect(() => {
        fetchSuggestions(matchThreshold);
    }, [fetchSuggestions, matchThreshold]);

    const handleThresholdInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleApplyThreshold = () => {
        const newThreshold = parseFloat(inputValue);
        if (!isNaN(newThreshold) && newThreshold >= 0 && newThreshold <= 1) {
            setMatchThreshold(newThreshold); // This will trigger useEffect via fetchSuggestions dependency change
            setError('');
        } else {
            setError("Match threshold must be a number between 0.0 and 1.0.");
        }
    };

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
                <Alert severity="warning">Please log in to get recipe suggestions.</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                Recipe Suggestions
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Button component={RouterLink} to="/pantry" variant="outlined">
                    Back to Pantry
                </Button>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                        label="Match Threshold"
                        type="number"
                        size="small"
                        value={inputValue}
                        onChange={handleThresholdInputChange}
                        inputProps={{ step: "0.1", min: "0", max: "1" }}
                        sx={{ width: '130px' }} // Slightly wider for label
                        variant="outlined"
                    />
                    <Button variant="contained" onClick={handleApplyThreshold} disabled={isLoading}>
                        {isLoading && apiResponse.recipes.length === 0 ? <CircularProgress size={24} color="inherit"/> : 'Apply'}
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 1 }}>Loading suggestions...</Typography>
                </Box>
            )}

            {!isLoading && apiResponse.recipes.length > 0 && (
                <Grid container spacing={3} sx={{ mt: 0 }} justifyContent="center">
                    {apiResponse.recipes.map(recipe => (
                        <Grid item key={recipe.RecipeID} sx={{ display: 'flex' }}>
                            <RecipeCard recipe={recipe} />
                        </Grid>
                    ))}
                </Grid>
            )}

            {!isLoading && apiResponse.recipes.length === 0 && (
                 <Typography sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
                    {apiResponse.message || "No recipes found with the current filter. Try adjusting the threshold or adding more ingredients to your pantry."}
                </Typography>
            )}
        </Container>
    );
}

export default RecipeSuggestionsPage;
