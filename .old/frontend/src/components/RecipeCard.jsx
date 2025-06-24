import React from 'react';
import { Card, CardMedia, CardContent, Typography, Tooltip, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const RecipeCard = ({ recipe, renderActions, onCardClick }) => {
  // It's good practice to ensure recipe object and its key properties exist before trying to render.
  // However, pages using this card should ideally filter out recipes with missing critical data.
  // For this subtask, assume `recipe` and `recipe.RecipeID` are valid if `recipe` itself is passed.
  if (!recipe || typeof recipe.RecipeID === 'undefined') {
    // console.warn("RecipeCard: Recipe data is invalid or missing RecipeID", recipe);
    return null; // Or render a placeholder/error card
  }

  return (
    <Card
      component={RouterLink}
      to={`/recipe/${recipe.RecipeID}`} // Ensure RecipeID is part of the recipe object
      onClick={(event) => {
        if (typeof onCardClick === 'function') {
          event.preventDefault(); // Prevent RouterLink navigation
          onCardClick(recipe); // Pass the recipe object to the handler
        }
        // If onCardClick is not provided, the RouterLink navigates as usual.
      }}
      sx={(theme) => ({ // Changed to a function to access theme directly
        width: '250px',
        minWidth: '250px',
        maxWidth: '250px',
        height: '380px',
        margin: theme.spacing(1), // Use theme spacing
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        color: 'inherit',
        backgroundColor: theme.palette.background.paper, // Explicitly set from theme
        boxShadow: theme.shadows[3], // Initial shadow
        transition: 'box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out',
        '&:hover': {
          boxShadow: theme.shadows[6],
          transform: 'translateY(-4px)'
        },
      })}
    >
      <CardMedia
        component="img"
        height="140"
        image={recipe.ImageURL || '/placeholder-image.jpg'} // Placeholder should be in /public
        alt={recipe.Title || 'Recipe image'}
        sx={(theme) => ({ // Changed to a function to access theme
            objectFit: 'cover', // Changed back to 'cover' for better image presentation
            backgroundColor: theme.palette.grey[200] // Use theme grey for placeholder background
        })}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 2 }}>
        <Tooltip title={recipe.Title || 'Untitled Recipe'} arrow>
          <Typography
            gutterBottom
            variant="h6" // Will use theme's h6
            component="div"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: '2',
              WebkitBoxOrient: 'vertical',
              // fontWeight is inherited from theme.typography.h6
            }}
          >
            {recipe.Title || 'Untitled Recipe'}
          </Typography>
        </Tooltip>
        <Tooltip title={recipe.Description || "No description available."} arrow>
          <Typography
            variant="body2" // Will use theme's body2
            color="text.secondary" // Will use theme's text.secondary
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: '3',
              WebkitBoxOrient: 'vertical',
              mt: 1,
            }}
          >
            {recipe.Description || "No description available."}
          </Typography>
        </Tooltip>
        {typeof recipe.match_percentage === 'number' && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Match: <strong>{recipe.match_percentage}%</strong>
            {typeof recipe.available_ingredients_count === 'number' &&
             typeof recipe.required_ingredients_count === 'number' && (
              ` (${recipe.available_ingredients_count} of ${recipe.required_ingredients_count} ingredients)`
            )}
          </Typography>
        )}
      </CardContent>
      {renderActions && typeof renderActions === 'function' && (
        <Box sx={{ p: 2, pt: 0, mt: 'auto' }}>
          {renderActions(recipe)}
        </Box>
      )}
    </Card>
  );
};

export default RecipeCard;
