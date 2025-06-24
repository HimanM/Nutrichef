import React, { createContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState(null); // New state

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
    setSessionExpiredMessage(null); // Clear any session expiry message on new login
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setToken(null);
    setCurrentUser(null);
    // Redirection should be handled by components reacting to isAuthenticated === false
    // or by a component that specifically calls logout and then navigates.
  }, []); // Empty dependency array as it doesn't depend on component's scope variables that change

  const showExpiryMessageAndLogout = useCallback((message) => {
    setSessionExpiredMessage(message || "Your session has expired. Please log in again.");
    logout();
  }, [logout]); // Depends on the memoized logout function

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
        setSessionExpiredMessage, // To allow components to clear the message
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
