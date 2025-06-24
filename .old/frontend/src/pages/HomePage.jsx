// frontend/src/pages/HomePage.jsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Typography, Button, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext'; // Import useAuth

// Using a Pexels image URL that's generally good for backgrounds
const HERO_IMAGE_URL = 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'; // Example: Bowl of berries

const HomePage = () => {
  const { isAuthenticated } = useAuth(); // Get authentication status

  return (
    <Box
      sx={{
        minHeight: '100vh', // Make this section take full viewport height (starts after static navbar)
        backgroundImage: `url(${HERO_IMAGE_URL})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3 }, // Padding for the outer container
      }}
    >
      <Box
        sx={{
          textAlign: 'center',
          p: { xs: 3, sm: 4, md: 5 },
          backgroundColor: 'rgba(0, 0, 0, 0.25)', // Slightly adjusted dark overlay
          backdropFilter: 'blur(8px) saturate(100%)', // Refined blur
          WebkitBackdropFilter: 'blur(8px) saturate(100%)', // Safari
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: 3, // More subtle shadow
          maxWidth: 'md',
          mx: 'auto',
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          className="fade-in-slide-up staggered-item-1" // Animation class
          sx={{
            color: 'white',
            fontWeight: 'medium',
            mb: 2.5,
            textShadow: '1px 1px 4px rgba(0,0,0,0.6)',
          }}
        >
          NutriChef
        </Typography>
        <Typography
          variant="h6"
          component="p"
          className="fade-in-slide-up staggered-item-2" // Animation class
          sx={{
            color: 'grey.300',
            mb: 4,
            textShadow: '1px 1px 3px rgba(0,0,0,0.6)',
            maxWidth: '550px',
            mx: 'auto',
            lineHeight: 1.6
          }}
        >
          Your personal assistant for healthy eating. Discover recipes,
          plan your meals, and track your nutritional intake with ease.
        </Typography>
        {!isAuthenticated && (
          <Button
            variant="contained"
            color="secondary"
            size="large"
            component={RouterLink}
            to="/register"
            className="fade-in-slide-up staggered-item-3" // Animation class
            sx={{
              py: 1.25,
              px: { xs: 3, sm: 4 },
              fontSize: { xs: '0.9rem', sm: '1rem' },
              fontWeight: 'medium',
            }}
          >
            Register Now
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default HomePage;
