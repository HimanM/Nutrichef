import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { HiOutlineViewGrid, HiOutlineUsers, HiOutlineCollection, HiOutlineChartBar, HiOutlineExternalLink, HiOutlineLogout, HiOutlineHome } from 'react-icons/hi';
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
      <nav className="glass sticky top-0 z-50 border-b border-white/20 shadow-soft">
        <div className="container-modern">
          <div className="flex items-center justify-between h-16">
            <Link to="/admin" className="font-bold text-xl gradient-text pr-6">
              NutriChef Admin
            </Link>
            <span className="text-sm">Loading user...</span>
          </div>
        </div>
      </nav>
    );
  }

  const buttonLinkClasses = "px-3 py-2 rounded-md text-sm font-medium border border-transparent hover:bg-emerald-50 transition-colors flex items-center";


  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/20 shadow-soft">
      <div className="container-modern">
        <div className="flex items-center justify-between h-16">
          <Link to="/admin" className="font-bold text-xl gradient-text pr-6">
            NutriChef Admin
          </Link>
          <div className="hidden md:flex items-center space-x-2">
            <Link to="/admin" className="btn-ghost"><HiOutlineViewGrid className="h-5 w-5 mr-1.5" />Dashboard</Link>
            <Link to="/admin/users" className="btn-ghost"><HiOutlineUsers className="h-5 w-5 mr-1.5" />Users</Link>
            <Link to="/admin/recipes" className="btn-ghost"><HiOutlineCollection className="h-5 w-5 mr-1.5" />Recipes</Link>
            <Link to="/admin/classification-scores" className="btn-ghost"><HiOutlineChartBar className="h-5 w-5 mr-1.5" />Scores</Link>
            <Link to="/admin/contact-messages" className="btn-ghost"><MdOutlineMessage className="h-5 w-5 mr-1.5" />Messages</Link>
          </div>
          <div className="flex-grow"></div>
          <div className="hidden md:flex items-center space-x-3">
            <Link to="/" className="btn-ghost px-3 py-2">
              <HiOutlineHome className="h-5 w-5 mr-1.5" />
              View Main Site
            </Link>
            {currentUser ? (
              <>
                <span className="text-sm font-medium text-gray-700">
                  {currentUser.Name || currentUser.Email}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn-primary flex items-center"
                >
                  <HiOutlineLogout className="h-5 w-5 mr-1.5" />Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-ghost">Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavigationBar;
