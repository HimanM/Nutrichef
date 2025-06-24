import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { HiOutlineViewGrid, HiOutlineUsers, HiOutlineCollection, HiOutlineChartBar, HiOutlineExternalLink, HiOutlineLogout } from 'react-icons/hi';
import { MdOutlineMessage } from 'react-icons/md';

const AdminNavigationBar = () => {
  const { currentUser, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <nav className="bg-gray-800/50 inset-0 backdrop-blur-sm text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/admin" className="text-xl font-bold">NutriChef Admin</Link>
            <span className="text-sm">Loading user...</span>
          </div>
        </div>
      </nav>
    );
  }

  const buttonLinkClasses = "px-3 py-2 rounded-md text-sm font-medium border border-transparent hover:bg-gray-700 transition-colors flex items-center";


  return (
      <nav className="bg-gray-800/50 inset-0 backdrop-blur-sm text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/admin" className="text-xl font-bold hover:text-gray-200 pr-6">
            NutriChef Admin
          </Link>

          <div className="hidden md:flex items-center space-x-2">
            <Link to="/admin" className="animated-gradient-button"><HiOutlineViewGrid className="h-5 w-5 mr-1.5" />Dashboard</Link>
            <Link to="/admin/users" className="animated-gradient-button"><HiOutlineUsers className="h-5 w-5 mr-1.5" />Users</Link>
            <Link to="/admin/recipes" className="animated-gradient-button"><HiOutlineCollection className="h-5 w-5 mr-1.5" />Recipes</Link>
            <Link to="/admin/classification-scores" className="animated-gradient-button"><HiOutlineChartBar className="h-5 w-5 mr-1.5" />Scores</Link>
            <Link to="/admin/contact-messages" className="animated-gradient-button"><MdOutlineMessage className="h-5 w-5 mr-1.5" />Messages</Link>
          </div>

          <div className="flex-grow"></div>

          <div className="hidden md:flex items-center space-x-3">
            <Link to="/" className={buttonLinkClasses}><HiOutlineExternalLink className="h-5 w-5 mr-1.5" />View Main Site</Link>
            {currentUser ? (
              <>
                <span className="text-sm font-medium">
                  {currentUser.Name || currentUser.Email}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 flex items-center"
                >
                  <HiOutlineLogout className="h-5 w-5 mr-1.5" />Logout
                </button>
              </>
            ) : (
              <Link to="/login" className={buttonLinkClasses}>Login</Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default AdminNavigationBar;
