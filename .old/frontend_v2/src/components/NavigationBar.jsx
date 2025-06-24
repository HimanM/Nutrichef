import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { HiOutlineUserCircle, HiMenu, HiOutlineSparkles, HiOutlineLogin, HiOutlineUserAdd, HiOutlineLogout } from 'react-icons/hi';
import { RiAdminFill } from "react-icons/ri";
import { FaShoppingCart } from "react-icons/fa";

const NavigationBar = () => {
  const { isAuthenticated, currentUser, isAdmin, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isAdmin && location.pathname.startsWith('/admin')) {
    return null;
  }

  if (loading) {
    return (
      <nav className="bg-gray-800/50 inset-0 backdrop-blur-sm text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="font-semibold text-xl">NutriChef</span>
            </div>
            <div>
              <span className="text-sm">Loading...</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-800/50 inset-0 backdrop-blur-sm text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-white hover:text-gray-300">
              <HiOutlineSparkles className="w-7 h-7 mr-2" />
              <span className="font-semibold text-xl">NutriChef</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <Link to="/" className="animated-gradient-button">
              Home
            </Link>
            <Link to="/recipes" className="animated-gradient-button">
               Recipes
            </Link>
            <Link to="/classifier" className="animated-gradient-button">
              Classify
            </Link>
            <Link to="/ingredient-substitute" className="animated-gradient-button">
              Substitutes
            </Link>
            <Link to="/food-lookup" className="animated-gradient-button">
              Food Lookup
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/personalized-recipes" className="animated-gradient-button">
                   For You
                </Link>
                <Link to="/meal-planner" className="animated-gradient-button">
                   Meal Plan
                </Link>
                <Link to="/pantry" className="animated-gradient-button">
                   My Pantry
                </Link>
                <Link to="/basket" className="animated-gradient-button" aria-label="Shopping Basket">
                  <FaShoppingCart className="h-5 w-5 pr-1" /> Basket
                </Link>
              </>
            )}

            <Link to="/contact-us" className="animated-gradient-button">
              Contact Us
            </Link>

            {isAdmin && (
              <Link to="/admin" className="admin-action-gradient-button" ria-label="Shopping Basket">
                 <RiAdminFill className="h-5 w-5" />
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <Link to="/settings" className="profile-gradient-button">
                  <HiOutlineUserCircle className="h-5 w-5 mr-1.5" />
                  <span>{currentUser?.Name || currentUser?.Email?.split('@')[0] || 'User'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 flex items-center"
                >
                  <HiOutlineLogout className="h-5 w-5 mr-1.5" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="animated-gradient-button">
                  <HiOutlineLogin className="h-5 w-5 mr-1.5" /> Login
                </Link>
                <Link to="/register" className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 flex items-center text-white">
                  <HiOutlineUserAdd className="h-5 w-5 mr-1.5" /> Register
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button className="outline-none mobile-menu-button p-2 rounded-md hover:bg-gray-700">
              <HiMenu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="hidden mobile-menu">
        <Link to="/" className="block py-2 px-4 text-sm hover:bg-gray-700">Home</Link>
        <Link to="/recipes" className="block py-2 px-4 text-sm hover:bg-gray-700">Recipes</Link>
        {isAuthenticated ? (
          <>
            <Link to="/settings" className="block py-2 px-4 text-sm hover:bg-gray-700">Profile</Link>
            <button onClick={handleLogout} className="block w-full text-left py-2 px-4 text-sm hover:bg-gray-700">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="block py-2 px-4 text-sm hover:bg-gray-700">Login</Link>
            <Link to="/register" className="block py-2 px-4 text-sm hover:bg-gray-700">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;
