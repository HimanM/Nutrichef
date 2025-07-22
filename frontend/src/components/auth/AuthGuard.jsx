import React from 'react';
import { useAuthGuard } from '../../hooks/useAuthGuard.js';

/**
 * Higher-order component that wraps components requiring authentication
 * and prevents them from showing individual login modals when session expires.
 * 
 * This provides a clean way to handle authentication at the component level
 * without duplicate login prompts.
 */
export const withAuthGuard = (WrappedComponent, options = {}) => {
  const {
    redirectOnExpiry = false,
    showLoadingSpinner = true,
    customLoadingComponent = null,
    requireAuthForRender = true
  } = options;

  return function AuthGuardedComponent(props) {
    const { isAuthenticated, isSessionExpired, redirectToLogin } = useAuthGuard();

    // If session has expired, let the global SessionExpiredModal handle it
    if (isSessionExpired) {
      // Optionally redirect immediately without showing component
      if (redirectOnExpiry) {
        redirectToLogin();
        return null;
      }
      // Let the component render but it will be in a "disabled" state
      return <WrappedComponent {...props} isAuthenticated={false} isSessionExpired={true} />;
    }

    // If authentication is required and user is not authenticated
    if (requireAuthForRender && !isAuthenticated) {
      if (customLoadingComponent) {
        return customLoadingComponent;
      }
      
      if (showLoadingSpinner) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Checking authentication...</p>
            </div>
          </div>
        );
      }
      
      return null;
    }

    // Render the component with authentication props
    return (
      <WrappedComponent 
        {...props} 
        isAuthenticated={isAuthenticated}
        isSessionExpired={isSessionExpired}
      />
    );
  };
};

/**
 * Hook for components that need to conditionally show content based on auth status
 * without triggering additional login modals when session expires
 */
export const useConditionalAuth = () => {
  const { isAuthenticated, requiresAuth, isSessionExpired } = useAuthGuard();

  // Safe function to check if an action requiring auth can be performed
  const canPerformAuthAction = () => {
    return isAuthenticated && !isSessionExpired;
  };

  // Function to attempt an action that requires auth (won't show modal if session expired)
  const attemptAuthAction = (callback, fallback = null) => {
    if (canPerformAuthAction()) {
      return callback();
    } else if (!isSessionExpired) {
      // Only trigger auth check if session hasn't expired (to avoid duplicate modals)
      requiresAuth(true);
    }
    
    if (fallback) {
      return fallback();
    }
  };

  return {
    isAuthenticated,
    isSessionExpired,
    canPerformAuthAction,
    attemptAuthAction
  };
};
