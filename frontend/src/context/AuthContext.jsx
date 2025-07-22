import React, { createContext, useState, useEffect, useCallback } from 'react';
import { resetSessionExpiryFlag } from '../utils/apiUtil.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('currentUser');
    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Error parsing stored user:", e);
          localStorage.removeItem('currentUser');
        }
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((newToken, userData) => {
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    setToken(newToken);
    setCurrentUser(userData);
    setSessionExpiredMessage(null);
    // Reset the session expiry flag when user logs in
    resetSessionExpiryFlag();
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setToken(null);
    setCurrentUser(null);
  }, []);

  const showExpiryMessageAndLogout = useCallback((message) => {
    // Only set the message if there isn't already one set
    if (!sessionExpiredMessage) {
      setSessionExpiredMessage(message || "Your session has expired. Please log in again.");
      logout();
    }
  }, [logout, sessionExpiredMessage]);

  const isAuthenticated = !!token;
  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        token,
        currentUser,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        loading,
        sessionExpiredMessage,
        setSessionExpiredMessage,
        showExpiryMessageAndLogout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined || context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
