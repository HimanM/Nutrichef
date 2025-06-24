import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { useLocation } from 'react-router-dom'; // Added useLocation
import { useAuth } from '../context/AuthContext'; // Added useAuth
import RequireLoginModal from '../components/auth/RequireLoginModal'; // Added RequireLoginModal

const SHOPPING_BASKET_KEY = 'shoppingBasketItems';

function RecipeDetail() {
  const { recipeId } = useParams();
  const [recipeData, setRecipeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth(); // Get authentication status
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // State for login modal
  const location = useLocation(); // For redirect state after login

  const [substituteSuggestions, setSubstituteSuggestions] = useState({});
  const [substituteLoading, setSubstituteLoading] = useState({});
  const [substituteError, setSubstituteError] = useState({});
  const [basketMessage, setBasketMessage] = useState('');

  const [ingredientsAllergyMap, setIngredientsAllergyMap] = useState({});
  const [allergiesLoading, setAllergiesLoading] = useState(false);

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/recipes/${recipeId}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch recipe details: ${response.status}`);
        }
        let data = await response.json();

        if (data && data.ingredients) {
            const processedIngredients = (data.ingredients || []).map(ingredient => ({
                ...ingredient,
                originalName: ingredient.IngredientName,
                selectedSubstitute: null
            }));
            const finalData = { ...data, ingredients: processedIngredients };
            delete finalData.Ingredients;
            setRecipeData(finalData);
        } else {
           setRecipeData(prevData => ({...(prevData || data || {}), ingredients: [] }));
        }
      } catch (err) {
        setError(err.message);
        console.error(`Error fetching recipe ${recipeId}:`, err);
      } finally {
        setLoading(false);
      }
    };
    if (recipeId) {
      fetchRecipeDetails();
    }
  }, [recipeId]);

  useEffect(() => {
    const fetchAllergiesForIngredients = async () => {
      if (!recipeData || !recipeData.ingredients || recipeData.ingredients.length === 0) {
        setIngredientsAllergyMap({});
        return;
      }
      const ingredientIds = [...new Set(recipeData.ingredients.map(ing => ing.IngredientID).filter(id => id != null))];
      if (ingredientIds.length === 0) {
        setIngredientsAllergyMap({});
        return;
      }
      setAllergiesLoading(true);
      try {
        const response = await fetch('/api/ingredients/allergies_for_list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', },
          body: JSON.stringify({ ingredient_ids: ingredientIds }),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch allergies: ${response.status}`);
        }
        const allergiesMap = await response.json();
        setIngredientsAllergyMap(allergiesMap || {});
      } catch (err) {
        console.error("Error fetching allergies for ingredients list:", err);
        setIngredientsAllergyMap({});
      } finally {
        setAllergiesLoading(false);
      }
    };
    if (recipeData) {
        fetchAllergiesForIngredients();
    }
  }, [recipeData]);


  const handleFetchSubstitutes = async (ingredientNameToFetch, index) => { /* ... existing ... */
    setSubstituteLoading(prev => ({ ...prev, [index]: true }));
    setSubstituteError(prev => ({ ...prev, [index]: null }));
    setSubstituteSuggestions(prev => ({ ...prev, [index]: [] }));
    try {
      const response = await fetch('/api/substitute', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredientName: ingredientNameToFetch }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch substitutes: ${response.status}`);
      }
      const subs = await response.json();
      if (Array.isArray(subs)) {
           setSubstituteSuggestions(prev => ({ ...prev, [index]: subs.slice(0, 5) }));
           if (subs.length === 0) {
               setSubstituteError(prev => ({ ...prev, [index]: "No substitutes found." }));
           }
      } else {
           console.error("Substitutes API did not return an array:", subs);
           setSubstituteError(prev => ({ ...prev, [index]: "Unexpected response from server."}));
      }
    } catch (err) {
      console.error(`Error fetching substitutes for ${ingredientNameToFetch}:`, err);
      setSubstituteError(prev => ({ ...prev, [index]: err.message }));
    } finally {
      setSubstituteLoading(prev => ({ ...prev, [index]: false }));
    }
  };
  const handleSubstituteSelected = (originalIngredientNameForReplacement, newSubstituteName, ingredientIndex) => { /* ... existing ... */
    if (!recipeData || !recipeData.ingredients || !recipeData.Instructions) return;
    const newRecipeData = JSON.parse(JSON.stringify(recipeData));
    if (newRecipeData.ingredients[ingredientIndex]) {
      newRecipeData.ingredients[ingredientIndex].IngredientName = newSubstituteName;
      newRecipeData.ingredients[ingredientIndex].selectedSubstitute = newSubstituteName;
    }
    const originalNameRegex = new RegExp(`\\b${originalIngredientNameForReplacement}\\b`, 'gi');
    if (typeof newRecipeData.Instructions === 'string') {
      newRecipeData.Instructions = newRecipeData.Instructions.replace(originalNameRegex, newSubstituteName);
    } else if (Array.isArray(newRecipeData.Instructions)) {
      newRecipeData.Instructions = newRecipeData.Instructions.map(step =>
        step.replace(originalNameRegex, newSubstituteName)
      );
    }
    setRecipeData(newRecipeData);
    setSubstituteSuggestions(prev => ({ ...prev, [ingredientIndex]: [] }));
    setSubstituteError(prev => ({ ...prev, [ingredientIndex]: null }));
  };
  const handleRevertSubstitute = (ingredientIndex) => {
    if (!recipeData || !recipeData.ingredients || !recipeData.ingredients[ingredientIndex]) return;
    const ingredientToRevert = recipeData.ingredients[ingredientIndex];
    const originalName = ingredientToRevert.originalName;
    const currentSubstituteName = ingredientToRevert.IngredientName;
    if (!originalName || currentSubstituteName === originalName) return;
    const newRecipeData = JSON.parse(JSON.stringify(recipeData));
    newRecipeData.ingredients[ingredientIndex].IngredientName = originalName;
    newRecipeData.ingredients[ingredientIndex].selectedSubstitute = null;
    const currentSubstituteNameRegex = new RegExp(`\\b${currentSubstituteName}\\b`, 'gi');
    if (typeof newRecipeData.Instructions === 'string') {
        newRecipeData.Instructions = newRecipeData.Instructions.replace(currentSubstituteNameRegex, originalName);
    } else if (Array.isArray(newRecipeData.Instructions)) {
        newRecipeData.Instructions = newRecipeData.Instructions.map(step =>
            step.replace(currentSubstituteNameRegex, originalName)
        );
    }
    setRecipeData(newRecipeData);
    setSubstituteSuggestions(prev => ({ ...prev, [ingredientIndex]: [] }));
    setSubstituteError(prev => ({ ...prev, [ingredientIndex]: null }));
  };
  const handleAddToBasket = () => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    if (!recipeData || !recipeData.ingredients || recipeData.ingredients.length === 0) {
      setBasketMessage('No ingredients to add.');
      setTimeout(() => setBasketMessage(''), 3000);
      return;
    }
    try {
      const itemsToAdd = recipeData.ingredients.map(ing => ({
        id: `${ing.RecipeIngredientID || ing.IngredientID}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: ing.IngredientName,
        originalName: ing.originalName === ing.IngredientName ? null : ing.originalName,
        quantity: ing.Quantity || '',
        unit: ing.Unit || '',
        recipeTitle: recipeData.Title,
        recipeId: recipeData.RecipeID,
        isChecked: false
      }));
      const existingBasketString = localStorage.getItem(SHOPPING_BASKET_KEY);
      let basket = existingBasketString ? JSON.parse(existingBasketString) : [];
      basket = [...basket, ...itemsToAdd];
      localStorage.setItem(SHOPPING_BASKET_KEY, JSON.stringify(basket));
      setBasketMessage(`${itemsToAdd.length} item(s) added to your shopping basket!`);
      setTimeout(() => setBasketMessage(''), 3000);
    } catch (error) {
      console.error("Error adding ingredients to basket:", error);
      setBasketMessage('Failed to add items to basket.');
      setTimeout(() => setBasketMessage(''), 3000);
    }
  };

  if (loading) return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Container>;
  if (error) return <Container sx={{ mt: 2, textAlign: 'center' }}><Alert severity="error" sx={{mb: 2}}>Error: {error}</Alert><Button component={RouterLink} to="/recipes" variant="outlined">Back to Recipes</Button></Container>;
  if (!recipeData) return <Container sx={{ mt: 2, textAlign: 'center' }}><Typography variant="h6">Recipe not found.</Typography><Button component={RouterLink} to="/recipes" variant="outlined" sx={{ mt: 2 }}>Back to Recipes</Button></Container>;

  const renderInstructions = (instructionsString) => {
    if (!instructionsString) return <Typography variant="body1">No instructions provided.</Typography>;
    return instructionsString.split('\n').map((step, index) => (
      <Box key={index} component="div" sx={{ mb: 1.5, whiteSpace: 'pre-line' }}>
        {index + 1}. {step}
      </Box>
    ));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 3 }}> {/* Adjusted mb based on .recipe-title from CSS */}
          {recipeData.Title}
        </Typography>

        {recipeData.ImageURL && (
  <Box
    sx={{
      maxWidth: 600, // Keep maxWidth for the container
      width: '100%',  // Make container responsive
      height: 400,    // Set fixed height for the container box
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#e0e0e0', // A light grey background (MUI grey[300])
      borderRadius: 2, // theme.shape.borderRadius can also be used if theme is in scope
      mb: 3,
      ml: 'auto', // Changed from marginLeft for consistency
      mr: 'auto', // Changed from marginRight for consistency
      boxShadow: (theme) => theme.shadows[4], // Assuming theme is available here
      overflow: 'hidden' // Ensures image respects border radius of container
    }}
  >
    <Box
      component="img"
      sx={{
        maxHeight: '100%', // Image should not exceed container height
        maxWidth: '100%',  // Image should not exceed container width
        objectFit: 'contain', // Display full image, scaled down if necessary
        display: 'block'    // Removes any potential extra space beneath the image
      }}
      alt={recipeData.Title}
      src={recipeData.ImageURL}
    />
  </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          {recipeData.PreparationTimeMinutes && <Chip label={`Prep: ${recipeData.PreparationTimeMinutes} min`} />}
          {recipeData.CookingTimeMinutes && <Chip label={`Cook: ${recipeData.CookingTimeMinutes} min`} />}
          {recipeData.Servings && <Chip label={`Servings: ${recipeData.Servings}`} />}
        </Box>

        {recipeData.Description && (
          <Box sx={{mb:3}}>
            <Typography variant="h5" component="h2" gutterBottom>Description</Typography>
            <Typography variant="body1" paragraph sx={{ fontStyle: 'italic', whiteSpace: 'pre-line', lineHeight: 1.7 }}>{recipeData.Description}</Typography> {/* Added lineHeight */}
          </Box>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Typography variant="h5" component="h2" gutterBottom>
              Ingredients {allergiesLoading && <CircularProgress size={16} sx={{ ml: 1 }} />}
            </Typography>
            <List dense sx={{p:0}}>
              {(recipeData.ingredients || []).map((ing, index) => {
                const currentIngredient = recipeData.ingredients[index];
                const hasActiveSubstitute = currentIngredient && currentIngredient.selectedSubstitute;
                const nameToFetchSubstitutesFor = currentIngredient.originalName;
                const ingredientAllergies = ingredientsAllergyMap[ing.IngredientID] || [];

                return (
                  <React.Fragment key={currentIngredient.RecipeIngredientID || currentIngredient.IngredientID || index}>
                    <ListItem sx={{ pl:0, pr:0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', mb: 0.5 }}>
                        <ListItemText
                          primary={`${ing.Quantity || ''} ${ing.Unit || ''} ${ing.IngredientName}`}
                          secondary={hasActiveSubstitute ? `(Substituted for: ${currentIngredient.originalName})` : null}
                          primaryTypographyProps={{ sx: { fontWeight: 500 } }}
                          secondaryTypographyProps={{ sx: { fontStyle: 'italic' } }}
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ ml: 1, whiteSpace: 'nowrap' }}
                          onClick={() => {
                            if (hasActiveSubstitute) {
                              handleRevertSubstitute(index);
                            } else {
                              handleFetchSubstitutes(nameToFetchSubstitutesFor, index);
                            }
                          }}
                          disabled={substituteLoading[index]}
                        >
                          {substituteLoading[index] ? 'Finding...' : (hasActiveSubstitute ? `Revert` : 'Find Substitutes')}
                        </Button>
                      </Box>

                      {/* Display Allergies for this ingredient */}
                      {ingredientAllergies.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, pl: 0, mt: 0.5, mb: 0.5 }}>
                          <Typography variant="caption" sx={{mr: 0.5, fontStyle: 'italic', color: 'warning.main' }}>Allergies:</Typography>
                          {ingredientAllergies.map(allergy => (
                            <Chip key={allergy.id} label={allergy.name} size="small" variant="outlined" color="warning" />
                          ))}
                        </Box>
                      )}

                      <Box sx={{ pl: 0, pt: 0.5, width: '100%' }} > {/* Removed className */}
                        {substituteLoading[index] && <CircularProgress size={20} sx={{mt:1, display:'block', margin:'auto'}} />}
                        {substituteError[index] && !substituteLoading[index] && (
                          <Alert severity="warning" size="small" sx={{mt:1, width: '100%'}} onClose={() => setSubstituteError(prev => ({...prev, [index]: null})) }>
                            {substituteError[index]}
                          </Alert>
                        )}
                        {!substituteLoading[index] && !substituteError[index] && substituteSuggestions[index] && substituteSuggestions[index].length > 0 && (
                          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                            <Select
                              value={currentIngredient.selectedSubstitute || ""}
                              onChange={(e) => {
                                const selectedSubName = e.target.value;
                                if (selectedSubName) {
                                  handleSubstituteSelected(currentIngredient.originalName, selectedSubName, index);
                                }
                              }}
                              displayEmpty
                              renderValue={(selectedValue) => {
                                  if (!selectedValue) { return <em style={{opacity: 0.7}}>Choose a substitute...</em>; }
                                  return selectedValue;
                              }}
                            >
                              <MenuItem value="" disabled><em>Choose a substitute...</em></MenuItem>
                              {substituteSuggestions[index].map((sub) => (
                                <MenuItem key={sub.name || sub} value={sub.name || sub}>
                                  {sub.name || sub}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      </Box>
                    </ListItem>
                    {index < (recipeData.ingredients || []).length - 1 && <Divider component="li" />}
                  </React.Fragment>
                );
              })}
            </List>
          </Grid>
          <Grid item xs={12} md={7}> {/* Instructions */}
            {/* ... (instructions rendering as before) ... */}
            <Typography variant="h5" component="h2" gutterBottom>Instructions</Typography>
            {typeof recipeData.Instructions === 'string' ?
              renderInstructions(recipeData.Instructions) : // renderInstructions already applies sx
              (Array.isArray(recipeData.Instructions) ?
                recipeData.Instructions.map((step, index) => (
                  <Box key={index} component="div" sx={{ mb: 1.5, whiteSpace: 'pre-line', lineHeight: 1.7, color: 'text.secondary' }}>{index + 1}. {step}</Box>
                )) : <Typography variant="body1">No instructions provided.</Typography>)
            }
          </Grid>
        </Grid>
        <Box sx={{mt: 4, textAlign: 'center'}}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddToBasket}
            disabled={!recipeData || !recipeData.ingredients || recipeData.ingredients.length === 0}
          >
            Add All Ingredients to Basket
          </Button>
          {basketMessage && <Typography sx={{mt:1, color: 'green'}}>{basketMessage}</Typography>}
        </Box>
      </Paper>
      <RequireLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        title="Login to Add Ingredients"
        redirectState={{ from: location }}
      />
    </Container>
  );
}

export default RecipeDetail;
