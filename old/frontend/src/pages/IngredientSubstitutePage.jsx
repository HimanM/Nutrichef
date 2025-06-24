import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress'; // Added for loading state
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Grid';

const IngredientSubstitutePage = () => {
  const [ingredientName, setIngredientName] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null); // For general search errors

  // Helper list of known non-critical messages for nutrition fetching
  const NUTRITION_WARNING_MESSAGES = [
    'Detailed nutritional data not available or incomplete.',
    // Add any other specific warning messages from the API if known
  ];

  const fetchNutritionForSubstitute = async (substituteName, index) => {
    try {
      const response = await fetch(`/api/nutrition/${encodeURIComponent(substituteName)}`);
      const nutritionData = await response.json();

      setResults(prevResults => {
        const newResults = [...prevResults];
        // Ensure the item exists at the index before trying to update
        if (!newResults[index]) return prevResults;
        const currentItem = newResults[index];

        if (response.ok) {
          if (nutritionData.success) {
            if (nutritionData.nutrition && Object.keys(nutritionData.nutrition).length > 0) {
              newResults[index] = { ...currentItem, nutrition: nutritionData.nutrition, isLoadingNutrition: false, nutritionError: null };
            } else { // Success true, but nutrition data is empty or missing
              const message = (nutritionData.warning && typeof nutritionData.warning === 'string' && nutritionData.warning.trim() !== '')
                ? nutritionData.warning
                : 'Detailed nutritional data not available or incomplete.';
              newResults[index] = { ...currentItem, nutrition: null, isLoadingNutrition: false, nutritionError: message };
            }
          } else { // API call was ok, but success is false
            newResults[index] = { ...currentItem, nutrition: null, isLoadingNutrition: false, nutritionError: nutritionData.error || 'Failed to retrieve nutritional details.' };
          }
        } else { // HTTP error from nutrition API
          newResults[index] = { ...currentItem, nutrition: null, isLoadingNutrition: false, nutritionError: nutritionData.error || `Failed to fetch nutritional data (status: ${response.status}).` };
        }
        return newResults;
      });
    } catch (err) { // Network error
      console.error(`Network error fetching nutrition for ${substituteName}:`, err);
      setResults(prevResults => {
        const newResults = [...prevResults];
        if (newResults[index]) {
          newResults[index] = { ...newResults[index], nutrition: null, isLoadingNutrition: false, nutritionError: 'Network error occurred while fetching nutritional data.' };
        }
        return newResults;
      });
    }
  };

  const handleSearch = async () => {
    if (!ingredientName.trim()) {
      setError('Please enter an ingredient name.');
      setResults([]);
      return;
    }
    setError(null);
    setResults([]); // Clear previous results immediately

    // Immediately set loading state for the main search (optional, if you want a general loading indicator)
    // setIsLoading(true);

    try {
      const response = await fetch('/api/substitute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredientName }),
      });

      const data = await response.json();
      // setIsLoading(false); // Turn off general loading indicator

      if (response.ok) {
        if (!data || data.length === 0) {
          setError('No substitutes found for this ingredient.');
          setResults([]);
        } else {
          const newSubstitutes = data.map(sub => ({
            name: sub.name,
            score: sub.score,
            nutrition: null,
            isLoadingNutrition: true, // Set true to trigger nutrition fetch
            nutritionError: null,
          }));
          setResults(newSubstitutes);
          setError(null); // Clear previous errors

          // Trigger fetching nutrition data for each new substitute
          newSubstitutes.forEach((sub, index) => {
            // Pass the actual name and its current index in the `newSubstitutes` array
            // Note: The `fetchNutritionForSubstitute` will update the `results` state via setResults(prevResults => ...)
            fetchNutritionForSubstitute(sub.name, index);
          });
        }
      } else {
        setError(data.message || 'Failed to fetch substitutes.');
        setResults([]);
      }
    } catch (err) {
      // setIsLoading(false); // Turn off general loading indicator
      console.error('Network error during initial substitute search:', err);
      setError('A network error occurred. Please try again.');
      setResults([]);
    }
  };

  return (
    <Container maxWidth="md"> {/* Changed to md for more space for results */}
      <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
          Find Ingredient Substitutes
        </Typography>
        <Box sx={{ width: '100%', maxWidth: '500px', mb: 3 }}> {/* Max width for input area */}
          <TextField
            label="Ingredient Name"
            variant="outlined"
            value={ingredientName}
            onChange={(e) => setIngredientName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            fullWidth
            sx={{ mt: 2, py: 1.5 }}
          >
            Search
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%', maxWidth: '500px' }}>
            {error}
          </Alert>
        )}

        {results.length > 0 && (
          <Box sx={{ mt: 4, width: '100%' }}>
            <Typography variant="h5" component="h2" gutterBottom align="center">
              Suggested Substitutes
            </Typography>
            {results.map((substitute, index) => {
              // Using theme colors, including accents.
              // Note: 'error', 'warning', 'info', 'success' are standard Chip colors that map to theme palette.
              // For custom accents, we'll use sx.
              const substituteColorConfigs = [
                { color: 'primary' }, // Uses theme.palette.primary.main
                { color: 'secondary' }, // Uses theme.palette.secondary.main
                { sx: { backgroundColor: 'accent.brown', color: 'white' } }, // Custom from theme
                { sx: { backgroundColor: 'accent.yellow', color: 'black' } }, // Custom from theme, black text for contrast
                { color: 'success' },
                { color: 'info' },
              ];
              const chipConfig = substituteColorConfigs[index % substituteColorConfigs.length];

              return (
              <Card key={index} sx={{ mb: 2, width: '100%' }}>
                <CardContent sx={{ p: 2.5 }}> {/* Adjusted CardContent padding */}
                  <Chip 
                    label={substitute.name.charAt(0).toUpperCase() + substitute.name.slice(1)}
                    color={chipConfig.color || undefined} // Pass color prop if defined
                    sx={{ 
                      mb: 1.5, // Increased margin bottom
                      fontSize: '1.3rem', // Slightly larger font
                      ...(chipConfig.sx || {}) // Spread sx from config
                    }}
                  />
                  {typeof substitute.score !== 'undefined' && (
                    <Typography sx={{ mb: 1 }} color="text.secondary"> {/* Increased margin bottom slightly */}
                      Confidence: {substitute.score.toFixed(2)}
                    </Typography>
                  )}

                  {substitute.isLoadingNutrition && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2, mb: 1 }}>
                      <CircularProgress size={24} sx={{ mr: 1.5 }} />
                      <Typography variant="body2" color="text.secondary">Loading nutritional data...</Typography>
                    </Box>
                  )}

                  {substitute.nutritionError && !substitute.isLoadingNutrition && (
                    <Alert
                      severity={NUTRITION_WARNING_MESSAGES.includes(substitute.nutritionError) ? "warning" : "error"}
                      sx={{ mt: 1.5, mb: 0.5 }}
                    >
                      {substitute.nutritionError}
                    </Alert>
                  )}

                  {substitute.nutrition && !substitute.isLoadingNutrition && !substitute.nutritionError && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', mb: 1.5 }}>Nutritional Information (per 100g/100ml approx.):</Typography>
                      {Object.keys(substitute.nutrition).length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}> {/* Adjusted gap */}
                          {Object.entries(substitute.nutrition).map(([nutrientName, nutrientDetails], nutrientIndex) => {
                            if (nutrientDetails && typeof nutrientDetails.amount !== 'undefined' && nutrientDetails.unit) {
                              const amountDisplay = typeof nutrientDetails.amount === 'number'
                                ? nutrientDetails.amount.toFixed(2)
                                : nutrientDetails.amount;
                              const nutrientChipLabel = nutrientName.charAt(0).toUpperCase() + nutrientName.slice(1);
                              const tooltipTitle = `Value: ${amountDisplay} ${nutrientDetails.unit}`;
                              
                              const nutrientChipColor = "rgba(0, 0, 0, 0.08)";

                              return (
                                <Tooltip title={tooltipTitle} key={nutrientName} arrow> {/* Added arrow to tooltip */}
                                  <Chip
                                    label={nutrientChipLabel}
                                    size="small"
                                    sx={{ 
                                      backgroundColor: nutrientChipColor,
                                      mr: 0.5, // Added small margin right
                                      mb: 0.5, // Added small margin bottom for wrapped lines
                                    }}
                                  />
                                </Tooltip>
                              );
                            }
                            return null;
                          })}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Detailed nutritional data not available. 
                        </Typography> 
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default IngredientSubstitutePage;
