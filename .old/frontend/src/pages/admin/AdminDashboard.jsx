import React from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box'; // Added Box for list styling
import { Link as RouterLink } from 'react-router-dom'; // Use alias for clarity

function AdminDashboard() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" gutterBottom>
          Welcome to the Admin Panel. Use the links below or the navigation bar to manage different sections.
        </Typography>
        {/* Using MUI Box with Typography for list items for better control over styling if needed */}
        <Box component="ul" sx={{ pl: 0, listStyle: 'none', mt: 2 }}>
          <Typography component="li" variant="body1" sx={{mb:1}}>
            <RouterLink to="/admin/users" style={{ textDecoration: 'none', color: 'inherit' }}>
              Manage Users
            </RouterLink>
          </Typography>
          <Typography component="li" variant="body1" sx={{mb:1}}>
            <RouterLink to="/admin/recipes" style={{ textDecoration: 'none', color: 'inherit' }}>
              Manage Recipes
            </RouterLink>
          </Typography>
          <Typography component="li" variant="body1">
            <RouterLink to="/admin/classification-scores" style={{ textDecoration: 'none', color: 'inherit' }}>
              View Classification Scores
            </RouterLink>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
export default AdminDashboard;
