import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Global authentication guard hook that prevents multiple login prompts
 * when session expires. This provides a single point of session expiration handling.
 */
export const useAuthGuard = () => {
  const { isAuthenticated, sessionExpiredMessage, setSessionExpiredMessage, showExpiryMessageAndLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasTriggeredExpiry = useRef(false);

  // Reset the trigger when authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      hasTriggeredExpiry.current = false;
    }
  }, [isAuthenticated]);

  // Check if session has expired and we should bypass additional login prompts
  const isSessionExpired = sessionExpiredMessage !== null;

  // Function to check if user needs authentication
  const requiresAuth = (showModal = true) => {
    if (!isAuthenticated) {
      // If session has already expired and modal is shown, don't show additional modals
      if (isSessionExpired) {
        return false; // Session expired modal is already handling this
      }

      // If this is the first authentication check and no session expiry yet
      if (showModal && !hasTriggeredExpiry.current) {
        hasTriggeredExpiry.current = true;
        // Use the global session expiry system
        showExpiryMessageAndLogout("Please log in to continue.");
        return false;
      }

      // Don't show additional modals if we've already triggered expiry
      return !hasTriggeredExpiry.current;
    }
    return true;
  };

  // Function to silently check auth without showing any modals
  const isAuthenticatedSilent = () => {
    return isAuthenticated && !isSessionExpired;
  };

  // Function to navigate to login if needed (for manual redirects)
  const redirectToLogin = () => {
    if (!isAuthenticated && !isSessionExpired) {
      navigate('/login', { state: { from: location } });
    }
  };

  return {
    isAuthenticated: isAuthenticatedSilent(),
    requiresAuth,
    isSessionExpired,
    redirectToLogin,
    hasTriggeredExpiry: hasTriggeredExpiry.current
  };
};
