import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
// import MenuIcon from '@mui/icons-material/Menu'; // Keep for future hamburger, but not implementing now
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import FoodBankIcon from '@mui/icons-material/FoodBank';
import Inventory2Icon from '@mui/icons-material/Inventory2'; // Icon for Pantry
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TuneIcon from '@mui/icons-material/Tune';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SearchIcon from '@mui/icons-material/Search';
import ContactMailIcon from '@mui/icons-material/ContactMail'; // Import ContactMailIcon

export default function NavigationBar() {
  const { isAuthenticated, currentUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const hideCondition = isAdmin && location.pathname.startsWith('/admin');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (hideCondition) {
    return null;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="home"
            component={Link}
            to="/"
            sx={{ mr: 1 }} // Add some margin if it's the very first item
          >
            <FoodBankIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              NutriChef
            </Link>
          </Typography>

          <Button color="inherit" component={Link} to="/" startIcon={<HomeIcon />}>Home</Button>
          <Button color="inherit" component={Link} to="/recipes" startIcon={<MenuBookIcon />}>Recipes</Button>
          <Button color="inherit" component={Link} to="/classifier" startIcon={<TuneIcon />}>Classify</Button>
          <Button color="inherit" component={Link} to="/ingredient-substitute" startIcon={<SwapHorizIcon />}>Substitutes</Button>
          <Button color="inherit" component={Link} to="/food-lookup" startIcon={<SearchIcon />}>Food Lookup</Button>
          <Button color="inherit" component={Link} to="/contact-us" startIcon={<ContactMailIcon />}>Contact Us</Button> {/* Add Contact Us Button */}

          {isAuthenticated && (
            <>
              <Button color="inherit" component={Link} to="/personalized-recipes" startIcon={<RestaurantMenuIcon />}>For You</Button>
              <Button color="inherit" component={Link} to="/meal-planner" startIcon={<FastfoodIcon />}>Meal Plan</Button>
              <Button color="inherit" component={Link} to="/pantry" startIcon={<Inventory2Icon />}>My Pantry</Button>
              <Button color="inherit" component={Link} to="/basket" startIcon={<ShoppingCartIcon />}>Basket</Button>
            </>
          )}

          {isAdmin && (
            <Button color="inherit" component={Link} to="/admin" startIcon={<AdminPanelSettingsIcon />}>
              Admin
            </Button>
          )}

          {isAuthenticated ? (
            <>
              <IconButton color="inherit" component={Link} to="/settings" sx={{ ml: 1 }}>
                <AccountCircleIcon />
                <Typography variant="caption" sx={{ ml: 0.5, display: { xs: 'none', md: 'inline' } }}>
                  {currentUser?.Name || currentUser?.Email?.split('@')[0] || 'User'}
                </Typography>
              </IconButton>
              <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />} sx={{
                backgroundColor: 'error.main', // Use theme's error color
                color: 'error.contrastText',
                '&:hover': {
                  backgroundColor: 'error.dark', // Darken on hover
                }
              }}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login" startIcon={<LoginIcon />}>
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
