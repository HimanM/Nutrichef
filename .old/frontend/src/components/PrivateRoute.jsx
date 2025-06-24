import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom'; // Removed Navigate, added useNavigate
import { useAuth } from '../context/AuthContext';
import RequireLoginModal from './auth/RequireLoginModal'; // Import the modal

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation(); // Get current location
  const navigate = useNavigate(); // For programmatic navigation on modal close (cancel)

  if (loading) {
    // Display a loading indicator or null while authentication status is being determined
    return null; // Or your app-wide loading component
  }

  if (!isAuthenticated) {
    // If not authenticated, show the RequireLoginModal.
    // The modal will handle navigation to /login, including the 'from' state.
    // The onClose (Cancel button) could navigate home or to the previous page.
    return (
      <RequireLoginModal
        isOpen={true} // Modal is shown because user is not authenticated
        onClose={() => {
          // When the user clicks "Cancel" or closes the modal without logging in.
          // Redirect to home page as they can't access the private route.
          navigate('/', { replace: true });
        }}
        title="Login Required"
        redirectState={{ from: location }} // Pass the location state for post-login redirect
      />
    );
    // Do not render <Outlet />
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default PrivateRoute;
