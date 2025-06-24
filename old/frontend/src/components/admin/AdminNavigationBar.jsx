import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link as RouterLink, useNavigate } from 'react-router-dom'; // Renamed Link to RouterLink
import { useAuth } from '../../context/AuthContext'; // Adjust path if context is elsewhere

export default function AdminNavigationBar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login after admin logout
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="secondary"> {/* Different color for admin bar */}
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <RouterLink to="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>
              NutriChef Admin
            </RouterLink>
          </Typography>

          <Button color="inherit" component={RouterLink} to="/admin">Dashboard</Button>
          <Button color="inherit" component={RouterLink} to="/admin/users">Users</Button>
          <Button color="inherit" component={RouterLink} to="/admin/recipes">Recipes</Button>
          <Button color="inherit" component={RouterLink} to="/admin/classification-scores">Scores</Button>

          <Box sx={{ flexGrow: 1 }} /> {/* Spacer */}

          <Button color="inherit" component={RouterLink} to="/">View Main Site</Button>

          {currentUser ? (
            <>
              <Typography variant="subtitle1" sx={{ ml: 2, mr: 1 }}>
                {currentUser.Name || currentUser.Email}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            // Should not happen if this bar is only shown to authenticated admins,
            // but as a fallback:
            <Button color="inherit" component={RouterLink} to="/login">Login</Button>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
