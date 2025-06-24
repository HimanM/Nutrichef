import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

const FloatingLoader = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16, // Positioned at the bottom-left
        left: 16,
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.75)', // Slightly more opaque background
        padding: '10px 18px', // Slightly larger padding
        borderRadius: '8px', // More rounded corners
        zIndex: 1500, // Ensures it's above most elements, but below modals (typically 1300 for Dialog)
                      // Note: MUI Dialog has zIndex 1300. FAB is around 1050. This should be fine.
        color: 'white',
        boxShadow: '0px 4px 12px rgba(0,0,0,0.5)', // Added a subtle shadow
      }}
    >
      <CircularProgress size={22} color="inherit" sx={{ mr: 1.5 }} /> {/* Slightly larger spinner */}
      <Typography variant="body1">Parsing recipe, please wait...</Typography> {/* Changed to body1 for slightly larger text */}
    </Box>
  );
};

export default FloatingLoader;
