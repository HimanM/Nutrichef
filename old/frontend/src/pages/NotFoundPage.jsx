import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';

const NotFoundPage = () => {
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          minHeight: '70vh', // Ensure it takes up significant screen height
        }}
      >
        <Typography component="h1" variant="h1" sx={{ fontSize: '6rem', fontWeight: 'bold', color: 'primary.main' }}>
          404
        </Typography>
        <Typography component="h2" variant="h5" sx={{ mt: 2, mb: 1, color: 'text.secondary' }}>
          Oops! Page Not Found.
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.disabled' }}>
          The page you are looking for might have been moved, renamed, or is temporarily unavailable.
        </Typography>
        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          Go to Homepage
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
