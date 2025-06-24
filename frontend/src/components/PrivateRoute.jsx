import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { HiOutlineRefresh } from 'react-icons/hi';

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex justify-center items-center">
        <div className="text-center">
          <HiOutlineRefresh className="animate-spin h-8 w-8 text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
