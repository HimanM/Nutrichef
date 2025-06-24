import React, { useEffect, useState, useRef } from 'react'; // Add useRef
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
// import Card from '@mui/material/Card'; // No longer used directly
// import CardContent from '@mui/material/CardContent'; // No longer used directly in this file
// import CardMedia from '@mui/material/CardMedia'; // No longer used directly
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
// import Tooltip from '@mui/material/Tooltip'; // No longer used directly
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import DownloadIcon from '@mui/icons-material/Download'; // For Download Plan button
import { Link as RouterLink, useLocation } from 'react-router-dom'; // Added useLocation
import { useMealPlanSelection } from '../context/MealPlanSelectionContext';
// import RecipeCard from '../components/RecipeCard'; // No longer used in this file
import MealItemCard from '../components/MealItemCard'; // Import MealItemCard
import jsPDF from 'jspdf'; // Added for PDF Download
import { useAuth } from '../context/AuthContext'; // Changed
import { useModal } from '../context/ModalContext'; // Added
import { authenticatedFetch } from '../utils/apiUtil'; // Changed
import RequireLoginModal from '../components/auth/RequireLoginModal'; // Added
import {
    format,
    addDays,
    startOfToday as getStartOfToday,
    isToday,
    isTomorrow,
    isBefore,
    parseISO
} from 'date-fns';
// import '../styles/MealPlanner.css'; // Removed CSS import

const MEAL_PLAN_PALETTE_KEY = 'mealPlanPaletteRecipes';
const PLANNED_MEALS_KEY = 'plannedMealsData';

function MealPlannerPage() {
  const [paletteRecipes, setPaletteRecipes] = useState([]);
  const [loadingPalette, setLoadingPalette] = useState(true);
  const [paletteError, setPaletteError] = useState(null);
  const [plannedMeals, setPlannedMeals] = useState({});
  const [currentWeekDates, setCurrentWeekDates] = useState([]);

  // Cloud sync states
  const [isSavingToCloud, setIsSavingToCloud] = useState(false);
  const [isLoadingFromCloud, setIsLoadingFromCloud] = useState(false);
  const [isRequireLoginModalOpen, setIsRequireLoginModalOpen] = useState(false); // Added

  const isInitialMount = useRef(true); // Initialize isInitialMount Ref

  const { recipeSelectedForPlanning, setRecipeSelectedForPlanning, clearRecipeSelection } = useMealPlanSelection();
  const auth = useAuth(); // Changed from token to auth
  const { showModal, hideModal } = useModal(); // Added
  const location = useLocation(); // Added

  // Generate dates and load data from localStorage
  useEffect(() => {
    const todayForDateGen = getStartOfToday();
    const dates = [];
    for (let i = 0; i < 14; i++) {
      dates.push(addDays(todayForDateGen, i));
    }
    setCurrentWeekDates(dates);

    setLoadingPalette(true);
    setPaletteError(null);
    try {
      const storedPalette = localStorage.getItem(MEAL_PLAN_PALETTE_KEY);
      setPaletteRecipes(storedPalette ? JSON.parse(storedPalette) : []);
    } catch (err) {
      console.error("Error parsing palette recipes from localStorage:", err);
      setPaletteError("Could not load your saved recipes. The data might be corrupted.");
      setPaletteRecipes([]);
    } finally {
      setLoadingPalette(false);
    }

    // Load Planned Meals and filter out past dates
    try {
      const storedPlannedMealsString = localStorage.getItem(PLANNED_MEALS_KEY);

      if (storedPlannedMealsString) {
        const loadedPlannedMeals = JSON.parse(storedPlannedMealsString);

        const today = getStartOfToday();
        const futureOrTodayPlannedMeals = {};

        for (const dateKey in loadedPlannedMeals) {
          const entryDate = parseISO(dateKey);
          if (!isBefore(entryDate, today)) {
            futureOrTodayPlannedMeals[dateKey] = loadedPlannedMeals[dateKey];
          }
        }
        setPlannedMeals(futureOrTodayPlannedMeals);
      } else {
        setPlannedMeals({});
      }
    } catch (err) {
      console.error("Error processing planned meals from localStorage:", err);
      setPlannedMeals({});
    }
  }, []); // Empty dependency array: run once on mount

  // Persist plannedMeals to localStorage whenever it changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false; // Set to false after the first run
    } else {
      // This logic will now only run on subsequent updates to plannedMeals,
      // not on the initial mount.
      // This effect now primarily handles local persistence.
      // Cloud saving is a manual action.
      if (Object.keys(plannedMeals).length > 0) {
        try {
          const stringifiedPlannedMeals = JSON.stringify(plannedMeals);
          localStorage.setItem(PLANNED_MEALS_KEY, stringifiedPlannedMeals);
        } catch (error) {
          console.error('Error stringifying or saving plannedMeals:', error);
        }
      } else {
        // If plannedMeals becomes empty, remove it from localStorage
        // This behavior is often desired to reflect an empty state.
        // If retention of an empty object in localStorage is needed, this line should be removed.
        localStorage.removeItem(PLANNED_MEALS_KEY);
      }
    }
  }, [plannedMeals]); // Save effect runs on plannedMeals changes

  const handleAssignRecipeToDay = (dayKey, recipeToAssign) => {
    if (!recipeToAssign) return;
    setPlannedMeals(prevPlannedMeals => {
      const newPlannedMeals = { ...prevPlannedMeals };
      const dayItems = [...(newPlannedMeals[dayKey] || [])];
      const recipeInstance = {
          ...recipeToAssign,
          planInstanceId: `${recipeToAssign.RecipeID}-${Date.now()}`
      };
      dayItems.push(recipeInstance);
      newPlannedMeals[dayKey] = dayItems;
      return newPlannedMeals;
    });
    clearRecipeSelection();
  };

  const handleRemoveRecipeFromDay = (dayKey, planInstanceIdToRemove) => {
    setPlannedMeals(prevPlannedMeals => {
      const newPlannedMeals = { ...prevPlannedMeals };
      if (newPlannedMeals[dayKey]) {
        newPlannedMeals[dayKey] = newPlannedMeals[dayKey].filter(
          item => item.planInstanceId !== planInstanceIdToRemove
        );
        if (newPlannedMeals[dayKey].length === 0) {
          delete newPlannedMeals[dayKey];
        }
      }
      return newPlannedMeals;
    });
  };

  const handleRemoveFromPalette = (recipeIdToRemove) => {
    const updatedPaletteRecipes = paletteRecipes.filter(recipe => recipe.RecipeID !== recipeIdToRemove);
    setPaletteRecipes(updatedPaletteRecipes);
    localStorage.setItem(MEAL_PLAN_PALETTE_KEY, JSON.stringify(updatedPaletteRecipes));
    if (recipeSelectedForPlanning?.RecipeID === recipeIdToRemove) {
        clearRecipeSelection();
    }
  };

  // --- Cloud Operations ---

  const handleSaveToCloud = async () => {
    if (!auth.token) { // Check auth.token
      setIsRequireLoginModalOpen(true); // Changed
      return;
    }
    setIsSavingToCloud(true);
    try {
      const response = await authenticatedFetch(
        '/api/meal-planner/save',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }, // authenticatedFetch adds Authorization
          body: JSON.stringify(plannedMeals)
        },
        auth // Pass the whole auth object
      );

      const data = await response.json(); // Always try to parse JSON

      if (response.ok) {
        showModal('alert', 'Success', data.msg || 'Meal plan saved to cloud successfully!');
      } else {
        throw new Error(data.msg || `Failed to save meal plan. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving meal plan to cloud:', error);
      showModal('alert', 'Save Error', error.message || 'An unexpected error occurred.');
    } finally {
      setIsSavingToCloud(false);
    }
  };

  const handleLoadFromCloud = async () => {
    // hideModal(); // Not strictly necessary here as ModalContext will hide on promise resolution.
    if (!auth.token) { // Check auth.token
      setIsRequireLoginModalOpen(true); // Changed
      return;
    }
    setIsLoadingFromCloud(true);
    try {
      const response = await authenticatedFetch(
        '/api/meal-planner/load',
        { method: 'GET' }, // authenticatedFetch adds Authorization
        auth // Pass the whole auth object
      );

      const loadedDataFromCloud = await response.json(); // API returns data directly

      if (!response.ok) {
        throw new Error(loadedDataFromCloud.msg || `Failed to load meal plan. Status: ${response.status}`);
      }
      
      // Assuming loadedDataFromCloud is the meal plan object directly, or an empty object
      if (loadedDataFromCloud && typeof loadedDataFromCloud === 'object' && Object.keys(loadedDataFromCloud).length > 0) {
        const today = getStartOfToday();
        const futureOrTodayPlannedMeals = {};
        for (const dateKey in loadedDataFromCloud) {
          // Ensure dateKey is valid before parsing
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
            const entryDate = parseISO(dateKey);
            if (!isBefore(entryDate, today)) {
              futureOrTodayPlannedMeals[dateKey] = loadedDataFromCloud[dateKey];
            }
          } else {
            console.warn(`Invalid date key found in cloud data: ${dateKey}`);
          }
        }
        setPlannedMeals(futureOrTodayPlannedMeals); // Update state
        // Also update localStorage with the cloud data
        if (Object.keys(futureOrTodayPlannedMeals).length > 0) {
          localStorage.setItem(PLANNED_MEALS_KEY, JSON.stringify(futureOrTodayPlannedMeals));
        } else {
          localStorage.removeItem(PLANNED_MEALS_KEY);
        }
        showModal('alert', 'Success', 'Meal plan loaded from cloud.');
      } else {
         // If loadedDataFromCloud is empty object {}
        setPlannedMeals({}); // Clear current plan
        localStorage.removeItem(PLANNED_MEALS_KEY); // Clear local storage
        showModal('alert', 'Info', 'No meal plan found in the cloud or it was empty.');
      }
    } catch (error) {
      console.error('Error loading meal plan from cloud:', error);
      showModal('alert', 'Load Error', error.message || 'An unexpected error occurred.');
    } finally {
      setIsLoadingFromCloud(false);
    }
  };

  const handleLoadFromCloudConfirmation = () => {
    showModal(
      'confirm',
      'Load from Cloud Confirmation',
      'Loading your meal plan from the cloud will overwrite any unsaved local changes. Are you sure you want to proceed?'
    ).then(confirmed => {
      if (confirmed) {
        handleLoadFromCloud();
      } else {
        console.log("Load from cloud cancelled by user."); // Optional
      }
    });
  };

  // --- Download Plan Functionality ---
  const handleDownloadTXT = () => {
    if (Object.keys(plannedMeals).length === 0) {
      showModal('alert', 'Empty Plan', 'Your meal plan is empty. There is nothing to download.');
      return;
    }

    let content = 'Your Meal Plan\n\n';
    currentWeekDates.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      const mealsForDay = plannedMeals[dateKey];
      if (mealsForDay && mealsForDay.length > 0) {
        content += `${format(date, 'EEEE, MMMM d, yyyy')}:\n`;
        mealsForDay.forEach(recipe => {
          content += `- ${recipe.Title}\n`;
        });
        content += '\n'; // Extra line break between days
      }
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'meal-plan.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    if (Object.keys(plannedMeals).length === 0) {
      showModal('alert', 'Empty Plan', 'Your meal plan is empty. There is nothing to download.');
      return;
    }

    const doc = new jsPDF();
    let yPosition = 15; // Initial Y position, increased for a bit more top margin
    const pageHeight = doc.internal.pageSize.height;
    const leftMargin = 10;
    const contentWidth = doc.internal.pageSize.width - (leftMargin * 2); // Max content width

    doc.setFontSize(18);
    doc.text('Your Meal Plan', leftMargin, yPosition);
    yPosition += 12;

    currentWeekDates.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      const mealsForDay = plannedMeals[dateKey];

      if (mealsForDay && mealsForDay.length > 0) {
        if (yPosition > pageHeight - 30) { // Check for page break before printing date
          doc.addPage();
          yPosition = 15;
        }
        doc.setFontSize(14);
        doc.text(format(date, 'EEEE, MMMM d, yyyy'), leftMargin, yPosition);
        yPosition += 8;

        mealsForDay.forEach(recipe => {
          if (yPosition > pageHeight - 20) { // Check for page break before printing recipe
            doc.addPage();
            yPosition = 15;
            // Optionally re-print day header if it's a new page for the same day's items
            // doc.setFontSize(14);
            // doc.text(format(date, 'EEEE, MMMM d, yyyy'), leftMargin, yPosition - 8); // Re-adjust if needed
          }
          doc.setFontSize(11);
          // Use splitTextToSize for wrapping long recipe titles
          const recipeTitleLines = doc.splitTextToSize(`- ${recipe.Title}`, contentWidth - 5); // -5 for indent
          doc.text(recipeTitleLines, leftMargin + 5, yPosition);
          yPosition += (recipeTitleLines.length * 5) + 2; // Adjust space based on lines + small buffer
        });
        yPosition += 5; // Extra space between days
      }
    });

    doc.save('meal-plan.pdf');
  };

  // --- Rendering ---

  const renderMealPlanningArea = () => {
    if (currentWeekDates.length === 0) return <CircularProgress />;

    const weekOneDates = currentWeekDates.slice(0, 7);
    const weekTwoDates = currentWeekDates.slice(7, 14);

    const renderWeek = (dates, weekNumber) => (
      <>
        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>Week {weekNumber}</Typography>
        <Grid container spacing={1} sx={{ mb: 3, flexWrap: 'nowrap', overflowX: 'auto', pb: 1 }}>
          {dates.map((date, index) => {
            const dayKey = format(date, 'yyyy-MM-dd');
            const dayItems = plannedMeals[dayKey] || [];
            let dayLabel = format(date, 'MMM d (EEE)');
            if (isToday(date)) {
              dayLabel = `Today (${format(date, 'MMM d')})`;
            } else if (isTomorrow(date)) {
              dayLabel = `Tomorrow (${format(date, 'MMM d')})`;
            }

            return (
              <Grid item key={dayKey} 
                sx={{
                  minWidth: '180px',    // Increased minimum width
                  flexGrow: 1,          // Allow growing to fill available space
                  flexBasis: '0',       // Start from 0 and grow
                  display: 'flex',
                  flexDirection: 'column',
                }}
              > 
                <Paper elevation={2} sx={{ p: 1, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    variant="subtitle1"
                    sx={(theme) => ({
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      pb:0.5, mb:0.5,
                      fontWeight: (isToday(date) || isTomorrow(date)) ? theme.typography.fontWeightBold : theme.typography.fontWeightRegular
                    })}
                  >
                    {dayLabel}
                  </Typography>
                  <Box
                    sx={(theme) => ({
                      minHeight: 300,
                      backgroundColor: theme.palette.background.default, 
                      borderRadius: theme.shape.borderRadius, 
                      p: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      cursor: recipeSelectedForPlanning ? 'pointer' : 'default',
                      border: recipeSelectedForPlanning ? `2px dashed ${theme.palette.primary.main}` : `2px solid transparent`, 
                      transition: theme.transitions.create(['border-color', 'background-color'], {
                        duration: theme.transitions.duration.short,
                      }),
                      '&:hover': {
                        borderColor: recipeSelectedForPlanning ? theme.palette.primary.dark : 'transparent', 
                        backgroundColor: recipeSelectedForPlanning ? theme.palette.action.hover : theme.palette.background.default, 
                      },
                      flexGrow: 1 // Added to make the Box fill the Paper
                    })}
                    onClick={() => {
                      if (recipeSelectedForPlanning) {
                        handleAssignRecipeToDay(dayKey, recipeSelectedForPlanning);
                      }
                    }}
                  >
                    {dayItems.map((recipeItem) => (
                      <MealItemCard
                        key={recipeItem.planInstanceId}
                        recipe={recipeItem}
                        renderActions={(currentRecipe) => (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation(); 
                              handleRemoveRecipeFromDay(dayKey, currentRecipe.planInstanceId);
                            }}
                            aria-label="remove recipe from day"
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        )}
                        sx={{ 
                          mb: 0.5, 
                          width: '100%', 
                          maxWidth: '100%', // Ensures it respects the container's width
                          boxSizing: 'border-box', // Still good to keep
                        }} 
                      />
                    ))}
                    {dayItems.length === 0 && !recipeSelectedForPlanning && (
                      <Typography variant="caption" color="text.secondary" sx={{m:'auto', fontStyle:'italic'}}>
                        (Select a recipe then click here)
                      </Typography>
                    )}
                    {dayItems.length === 0 && recipeSelectedForPlanning && (
                      <Typography variant="caption" color="primary" sx={{m:'auto', fontWeight:'bold'}}>
                        Assign "{recipeSelectedForPlanning.Title}" to {format(date, 'MMM d')}?
                      </Typography>
                    )}
                     {dayItems.length > 0 && recipeSelectedForPlanning && (
                      <Typography variant="caption" color="primary" sx={{m:'auto', fontWeight:'bold', mt:1}}>
                        Add "{recipeSelectedForPlanning.Title}"?
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </>
    );

    return (
      <Box> {/* Parent Box that can handle overflow if needed */}
        <Typography variant="h5" gutterBottom align="center" sx={{mb:2}}>Your 14-Day Meal Plan</Typography>
        {renderWeek(weekOneDates, 1)}
        {renderWeek(weekTwoDates, 2)}
      </Box>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Meal Planner
      </Typography>

      {recipeSelectedForPlanning && (
        <Alert severity="info" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          Selected for planning: <strong>{recipeSelectedForPlanning.Title}</strong>. Click a day slot to assign it.
          <Button size="small" onClick={clearRecipeSelection} sx={{ ml: 'auto' }} variant="outlined">Clear Selection</Button>
        </Alert>
      )}

      <RequireLoginModal
        isOpen={isRequireLoginModalOpen}
        onClose={() => setIsRequireLoginModalOpen(false)}
        redirectState={{ from: location }}
        title="Login Required for Cloud Actions" 
      />

      {/* Cloud Sync Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={isSavingToCloud ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSaveToCloud}
          disabled={isSavingToCloud || isLoadingFromCloud || Object.keys(plannedMeals).length === 0}
        >
          Save to Cloud
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={isLoadingFromCloud ? <CircularProgress size={20} color="inherit" /> : <CloudDownloadIcon />}
          onClick={handleLoadFromCloudConfirmation}
          disabled={isSavingToCloud || isLoadingFromCloud}
        >
          Load from Cloud
        </Button>
        {/* Download Buttons */}
        <Button
            variant="outlined"
            color="secondary"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadTXT}
            disabled={isSavingToCloud || isLoadingFromCloud || Object.keys(plannedMeals).length === 0}
            sx={{ ml: 1 }} // Add some margin if placing next to other buttons in the same Box
        >
            Download TXT
        </Button>
        <Button
            variant="outlined"
            color="secondary"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadPDF}
            disabled={isSavingToCloud || isLoadingFromCloud || Object.keys(plannedMeals).length === 0}
            sx={{ ml: 1 }}
        >
            Download PDF
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}> {/* Recipe Palette - Changed to md={7} */}
          <Paper elevation={3} sx={{ p: 2, maxHeight: '200px', overflowY: 'auto' }}> {/* Adjusted maxHeight */}
            <Typography variant="h6" gutterBottom>Recipe Palette</Typography>
            {loadingPalette && <CircularProgress size={24} /> }
            {paletteError && <Alert severity="error">{paletteError}</Alert>}
            {!loadingPalette && !paletteError && paletteRecipes.length === 0 && (
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                No recipes added to your palette yet. Go to the
                <RouterLink to="/recipes" style={{ textDecoration: 'underline', color: 'inherit', margin: '0 4px' }}>
                   Recipe Browser
                </RouterLink>
                 to add some!
              </Typography>
            )}
            {/* Replace existing Box mapping recipes with this Grid container: */}
            <Grid container spacing={1}> 
                {!loadingPalette && !paletteError && paletteRecipes.map((recipe) => {
                    // const isCurrentlySelectedForPlanning = ... (this logic remains if needed by the card, but RecipeCard doesn't use it for styling now)
                    return (
                        <Grid item key={recipe.RecipeID.toString()} xs={6} sm={4} md={3}>
                            <MealItemCard
                                recipe={recipe}
                                onClick={() => { // Changed from onCardClick to onClick to match MealItemCard prop
                                    if (recipeSelectedForPlanning?.RecipeID === recipe.RecipeID) {
                                        clearRecipeSelection();
                                    } else {
                                        setRecipeSelectedForPlanning(recipe); // Use recipe from map scope
                                    }
                                }}
                                renderActions={(currentRecipe) => ( // currentRecipe is recipe from map scope
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveFromPalette(currentRecipe.RecipeID);
                                        }}
                                        aria-label="remove from palette"
                                        // sx={{ marginLeft: 'auto' }} // MealItemCard actions are already on the right
                                    >
                                        <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                )}
                                // sx prop for MealItemCard can be added here if specific overrides are needed
                                // For now, rely on its internal styling and the grid item's control.
                            />
                        </Grid>
                    );
                })}
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5} sx={{ position: 'sticky', top: '64px' }}> {/* Meal Planning Area - Changed to md={5} */}
          {renderMealPlanningArea()}
        </Grid>
      </Grid>
    </Container>
  );
}

export default MealPlannerPage;
