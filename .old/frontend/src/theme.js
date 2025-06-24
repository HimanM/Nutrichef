// frontend/src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#00796B', // Modern Teal
      contrastText: '#FFFFFF', // White for good contrast on Teal
    },
    secondary: {
      main: '#FFC107', // Vibrant Amber
      contrastText: '#000000', // Black for good contrast on Amber
    },
    error: { // Standard MUI key for error states
      main: '#F44336', // Red
      contrastText: '#FFFFFF',
    },
    warning: { // Standard MUI key for warning states
      main: '#FF9800', // Orange
      contrastText: '#000000',
    },
    success: { // Standard MUI key for success states
      main: '#4CAF50', // Green
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#ECEFF1', // Light Blue Grey - for a modern, clean look
      paper: '#FFFFFF',   // White - for cards and surfaces
    },
    text: {
      primary: '#263238', // Dark Blue Grey - for better readability
      secondary: '#546E7A', // Medium Blue Grey
    },
    // The existing 'accent' key is not standard MUI,
    // but can be kept if used for custom components.
    // For now, I'll remove it to keep things standard.
    // If specific custom accent colors are needed later, they can be added.
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem', // Increased size
      fontWeight: 500,
    },
    h2: {
      fontSize: '2.5rem', // Increased size
      fontWeight: 500,
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 400, // Adjusted weight
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 400, // Adjusted weight
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 400,
      color: '#546E7A', // Medium Blue Grey for subtitles
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500, // Slightly bolder for emphasis
      color: '#546E7A',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
    },
    button: {
      textTransform: 'none', // Modern buttons often don't use ALL CAPS
      fontWeight: 500,
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      color: '#78909C', // Lighter Blue Grey for captions
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 500, // Bolder for overline
      textTransform: 'uppercase', // Overlines are often uppercase
      color: '#78909C',
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Keep rounded buttons
          // Example: Add padding or other global button styles if needed
          // padding: '10px 20px',
        },
        containedPrimary: { // Ensure primary buttons have good contrast
          color: '#FFFFFF', // White text
          backgroundColor: '#00796B', // Teal background
          '&:hover': {
            backgroundColor: '#004D40', // Darker Teal on hover
          }
        },
        containedSecondary: { // Ensure secondary buttons have good contrast
          color: '#000000', // Black text
          backgroundColor: '#FFC107', // Amber background
          '&:hover': {
            backgroundColor: '#FFA000', // Darker Amber on hover
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#00796B', // Teal AppBar
          color: '#FFFFFF', // White text on AppBar
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          // Example: Add a subtle box shadow to Paper components for depth
          // boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.06), 0px 4px 5px 0px rgba(0,0,0,0.06), 0px 1px 10px 0px rgba(0,0,0,0.08)',
        }
      }
    }
    // Other component overrides can be added here
  }
});

export default theme;
