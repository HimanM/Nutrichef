import React from 'react';
import { Box, Paper, Typography, Tooltip, CardMedia, IconButton } from '@mui/material'; // Added IconButton just in case renderActions uses it directly

const MealItemCard = ({ recipe, onClick, renderActions }) => {
  if (!recipe) {
    return null; // Or some placeholder/error
  }

  const cardHeight = '65px';
  const imageSize = '50px'; // For a square image area

  return (
    <Paper
      onClick={onClick} // If onClick is provided, the whole paper is clickable
      sx={(theme) => ({ // Changed to a function to access theme
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(1), // Consistent padding using theme.spacing
        height: cardHeight,
        width: '100%',
        minWidth: 'auto',
        maxWidth: '220px',
        cursor: onClick ? 'pointer' : 'default',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper, // Use theme background
        boxShadow: theme.shadows[2], // Initial shadow, slightly less than RecipeCard
        transition: 'box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out', // Added transform transition
        '&:hover': {
          boxShadow: onClick ? theme.shadows[4] : theme.shadows[2], // Hover effect if clickable
          transform: onClick ? 'translateY(-2px)' : 'none', // Slight lift effect
        },
      })}
    >
      <CardMedia
        component="img"
        sx={(theme) => ({ // Changed to a function to access theme
          width: imageSize,
          height: imageSize,
          minWidth: imageSize,
          objectFit: 'cover',
          borderRadius: theme.shape.borderRadius, // Use theme border radius
          marginRight: theme.spacing(1.5), // Margin to the right of image
          backgroundColor: theme.palette.grey[200], // Placeholder bg
        })}
        image={recipe.ImageURL || '/placeholder-image.jpg'}
        alt={recipe.Title || 'Recipe image'}
      />
      <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Tooltip title={recipe.Title || 'Untitled Recipe'} arrow placement="top">
          <Typography
            variant="body2" // Will use theme's body2
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              // fontWeight is inherited from theme.typography.body2
            }}
          >
            {recipe.Title || 'Untitled Recipe'}
          </Typography>
        </Tooltip>
      </Box>
      {renderActions && typeof renderActions === 'function' && (
        <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
          {renderActions(recipe)}
        </Box>
      )}
    </Paper>
  );
};

export default MealItemCard;
