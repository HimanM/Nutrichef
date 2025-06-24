import React from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RequireAdminModal from './auth/RequireAdminModal';

const AdminRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate(); // Hook for navigation

  if (loading) {
    return null; // Display nothing while loading authentication state
  }

  if (!isAuthenticated) {
    // If not authenticated, redirect to login page.
    // Pass the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    // If authenticated but not an admin, display the modal.
    // The modal is always open if this condition is met.
    // Its onClose will handle navigation.
    return (
      <RequireAdminModal
        isOpen={true} // Always open because the condition (!isAdmin) is met
        onClose={() => {
          navigate('/', { replace: true }); // Redirect to home page
        }}
        title="Admin Access Denied"
      />
    );
    // Do not render <Outlet />
  }

  // Authenticated Admin: Render the nested route (children)
  return <Outlet />;
};

export default AdminRoute;
