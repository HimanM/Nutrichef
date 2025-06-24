import React, { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
// import Card from '@mui/material/Card'; // No longer needed directly
// import CardMedia from '@mui/material/CardMedia'; // No longer needed directly
// import CardContent from '@mui/material/CardContent'; // No longer needed directly
// import CardActions from '@mui/material/CardActions'; // No longer needed directly
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton'; // Added IconButton
import SearchIcon from '@mui/icons-material/Search'; // Added SearchIcon
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check'; // For "In Palette" state
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
// import Tooltip from '@mui/material/Tooltip'; // No longer needed directly
import { useLocation, useNavigate } from 'react-router-dom'; // RouterLink removed, useLocation/useNavigate kept if used elsewhere
import RecipeSubmissionModal from '../components/RecipeSubmissionModal';
import FloatingLoader from '../components/FloatingLoader';
import RecipeCard from '../components/RecipeCard'; // Import RecipeCard
import { useAuth } from '../context/AuthContext'; // Import useAuth
import RequireLoginModal from '../components/auth/RequireLoginModal'; // Import RequireLoginModal

const MEAL_PLAN_PALETTE_KEY = 'mealPlanPaletteRecipes';

function PublicRecipeBrowser() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true); // Page content loading, distinct from submission processing
  const [error, setError] = useState(null);
  const [paletteRecipeIds, setPaletteRecipeIds] = useState(new Set());
  const [isRecipeSubmissionModalOpen, setIsRecipeSubmissionModalOpen] = useState(false); // Renamed for clarity
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recipesPerPage, setRecipesPerPage] = useState(10);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [searchTerm, setSearchTerm] = useState(''); // This will be the DEBOUNCED search term
  const [inputValue, setInputValue] = useState(''); // Immediate value from TextField

  const { isAuthenticated, currentUser } = useAuth(); // Get isAuthenticated and currentUser
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // State for RequireLoginModal
  const location = useLocation(); // For redirectState
  // const navigate = useNavigate(); // Not strictly needed here if modal handles cancel locally

  const handlePreviousPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(totalRecipes / recipesPerPage);
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
  };

  const handleRecipesPerPageChange = (event) => {
    setRecipesPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  // Determine effectiveUserId based on authentication status
  const effectiveUserId = isAuthenticated && currentUser ? String(currentUser.UserID) : null;
  // console.log(`User ID for Recipe Submission: ${effectiveUserId}`); // For debugging

  const handleOpenRecipeSubmissionModal = () => {
    if (isAuthenticated) {
      setIsRecipeSubmissionModalOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleCloseRecipeSubmissionModal = () => {
    setIsRecipeSubmissionModalOpen(false);
    if (isProcessing) { // If modal is closed while processing, turn off loader
      setIsProcessing(false);
    }
  };

  // Renamed handleSearchChange to handleInputChange for clarity
  const handleInputChange = (event) => {
    const newValue = event.target.value;
    setInputValue(newValue);

    if (newValue === '') {
      // If the input is cleared, automatically fetch all recipes
      if (searchTerm !== '') { // Only trigger if there was an active search term
        setSearchTerm('');
        setCurrentPage(1);
      }
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault(); // Prevent default form submission
    if (inputValue !== searchTerm) { // Only trigger search if the input value is different from current active search
        setSearchTerm(inputValue);
        setCurrentPage(1); // Reset to page 1 for new search
    } else if (inputValue === searchTerm && currentPage !==1) {
        // If the search term is the same, but user might want to reset to page 1 (e.g. if they navigated away)
        // This case might be optional depending on desired UX. For now, a submit on same term resets to page 1.
        setCurrentPage(1);
    }
    // If inputValue is the same as searchTerm and currentPage is already 1, this submit does nothing new.
  };

  // Function to fetch recipes
  const fetchRecipes = async (currentSearchTerm, pageToFetch) => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/recipes?page=${pageToFetch}&limit=${recipesPerPage}`;
      if (currentSearchTerm) {
        url += `&search=${encodeURIComponent(currentSearchTerm)}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch recipes: ${response.status}`);
      }
      const data = await response.json();
      setRecipes(data.recipes || []); // Ensure recipes is always an array
      setTotalRecipes(data.total || 0); // Ensure totalRecipes is a number
    } catch (err) {
      setError(err.message);
      setRecipes([]); // Clear recipes on error
      setTotalRecipes(0); // Reset totalRecipes on error
      console.error("Error fetching recipes:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load (recipes and palette IDs)
  useEffect(() => {
    // Fetch recipes when the (submitted) searchTerm, currentPage, or recipesPerPage changes
    fetchRecipes(searchTerm, currentPage);

    // Load existing paletteRecipeIds from localStorage - this can run independently of recipe fetching
    const existingPaletteString = localStorage.getItem(MEAL_PLAN_PALETTE_KEY);
    const currentPalette = existingPaletteString ? JSON.parse(existingPaletteString) : [];
    setPaletteRecipeIds(new Set(currentPalette.map(r => r.RecipeID)));
  }, [currentPage, recipesPerPage, searchTerm]); // Re-fetch recipes when currentPage, recipesPerPage, or (submitted) searchTerm changes

  const handleAddToPalette = (recipeToAdd) => {
    if (isAuthenticated) {
      try {
        const existingPaletteString = localStorage.getItem(MEAL_PLAN_PALETTE_KEY);
        let currentPalette = existingPaletteString ? JSON.parse(existingPaletteString) : [];

        if (!currentPalette.some(recipe => recipe.RecipeID === recipeToAdd.RecipeID)) {
          const recipeForPalette = {
            RecipeID: recipeToAdd.RecipeID,
            Title: recipeToAdd.Title,
            ImageURL: recipeToAdd.ImageURL,
            // Add other relevant fields if needed by the planner's palette display
          };
          currentPalette.push(recipeForPalette);
          localStorage.setItem(MEAL_PLAN_PALETTE_KEY, JSON.stringify(currentPalette));
          setPaletteRecipeIds(prevIds => new Set(prevIds).add(recipeToAdd.RecipeID));
          console.log(`${recipeToAdd.Title} added to palette.`);
          // Add user feedback (e.g., snackbar) if desired
        } else {
          console.log(`${recipeToAdd.Title} is already in palette.`);
          // Optionally, implement toggle to remove if clicked again
          // For now, it just prevents re-adding.
        }
      } catch (error) {
        console.error("Error adding recipe to palette:", error);
        // Add user feedback for error (e.g., Alert or Snackbar)
        setError("Failed to add recipe to palette. Please try again."); // Example error feedback
      }
    } else {
      setIsLoginModalOpen(true);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && recipes.length === 0) { // Show general fetch error only if no recipes loaded
    return (
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Alert severity="error">Error fetching recipes: {error}</Alert>
      </Container>
    );
  }
  // If there's a general error but some recipes were loaded, it might be shown differently or not at all.
  // Action-specific errors (like failing to add to palette) could be handled by a Snackbar.

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Browse Recipes
      </Typography>
      <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TextField
          label="Search Recipes"
          variant="outlined"
          fullWidth
          value={inputValue}
          onChange={handleInputChange}
          sx={{ mr: 1 }} // Add some margin to the right of the text field
        />
        <IconButton type="submit" aria-label="search">
          <SearchIcon />
        </IconButton>
      </Box>
      {/* Results Area */}
      <Box sx={{ minHeight: '50vh', mt: 2 }}> {/* Added Box with minHeight and margin-top */}
        {/* Removed Alert for recipeSelectedForPlanning as context usage is removed */}
        {recipes.length === 0 && !loading ? (
          <Typography variant="subtitle1" sx={{ textAlign: 'center', mt: 2 }}> {/* Consistent margin top */}
            {searchTerm ? `No recipes found for "${searchTerm}".` : 'No recipes found.'}
          </Typography>
        ) : (
          <Grid container spacing={3} sx={{ mt: 0, justifyContent: 'center' }}> {/* Adjusted margin if Box now handles it, or keep if specific to grid */}
            {recipes.map((recipe) => {
              const isRecipeInPalette = paletteRecipeIds.has(recipe.RecipeID);
            return (
              <Grid item key={recipe.RecipeID} sx={{ display: 'flex', justifyContent: 'center' }}>
                <RecipeCard
                    recipe={recipe}
                    renderActions={(currentRecipe) => (
                        <Button
                            size="small"
                            variant={isRecipeInPalette ? "text" : "outlined"}
                            startIcon={isRecipeInPalette ? <CheckIcon /> : <AddIcon />}
                            onClick={(e) => {
                                e.preventDefault(); // Crucial: Prevent card navigation
                                e.stopPropagation(); // Crucial: Stop event bubbling
                                handleAddToPalette(currentRecipe); // Pass the specific recipe for this card
                            }}
                            disabled={isRecipeInPalette}
                            sx={{ width: '100%' }} // Make button full width within actions area of RecipeCard
                        >
                            {isRecipeInPalette ? 'In Palette' : 'Add to Palette'}
                        </Button>
                    )}
                />
              </Grid>
            );
          })}
          </Grid>
        )}
      </Box>

      {/* Pagination Controls */}
      {totalRecipes > 0 && (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4, mb: 2 }}>
        <Button
          variant="contained"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          sx={{ mr: 2 }}
        >
          Previous Page
        </Button>
        <Typography sx={{ mx: 2 }}>
          Page {currentPage} of {Math.ceil(totalRecipes / recipesPerPage)}
        </Typography>
        <Button
          variant="contained"
          onClick={handleNextPage}
          disabled={currentPage * recipesPerPage >= totalRecipes || totalRecipes === 0}
          sx={{ ml: 2 }}
        >
          Next Page
        </Button>
        <FormControl sx={{ m: 1, minWidth: 120, ml: 4 }} size="small">
          <InputLabel id="recipes-per-page-label">Recipes Per Page</InputLabel>
          <Select
            labelId="recipes-per-page-label"
            id="recipes-per-page-select"
            value={recipesPerPage}
            label="Recipes Per Page"
            onChange={handleRecipesPerPageChange}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>
      </Box>
      )}

      <Fab
        color="primary"
        aria-label="add recipe"
        sx={{ position: 'fixed', bottom: 20, right: 96 }} // Adjusted bottom/right for better visibility
        onClick={handleOpenRecipeSubmissionModal} // Updated handler
      >
        <AddIcon />
      </Fab>
      {isAuthenticated && effectiveUserId && ( // Conditionally render RecipeSubmissionModal
        <RecipeSubmissionModal
          open={isRecipeSubmissionModalOpen}
          onClose={handleCloseRecipeSubmissionModal} // Updated handler
          userId={effectiveUserId} // Pass the determined effectiveUserId
          isLoading={isProcessing}
          setIsLoading={setIsProcessing}
        />
      )}
      <RequireLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        title="Login Required"
        redirectState={{ from: location }}
      />
      {isProcessing && <FloatingLoader />}
    </Container>
  );
}

export default PublicRecipeBrowser;
