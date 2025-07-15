import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { HiOutlineViewGrid, HiOutlineUsers, HiOutlineCollection, HiOutlineChartBar, HiOutlineLogout, HiOutlineHome, HiMenu, HiX } from 'react-icons/hi';
import { MdOutlineMessage } from 'react-icons/md';

const AdminNavigationBar = () => {
  const { currentUser, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const adminNavLinks = [
    { to: "/admin", label: "Dashboard", icon: HiOutlineViewGrid },
    { to: "/admin/users", label: "Users", icon: HiOutlineUsers },
    { to: "/admin/recipes", label: "Recipes", icon: HiOutlineCollection },
    { to: "/admin/classification-scores", label: "Scores", icon: HiOutlineChartBar },
    { to: "/admin/contact-messages", label: "Messages", icon: MdOutlineMessage },
  ];

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/20 shadow-soft backdrop-blur-xl">
      <div className="container-modern">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/admin" className="font-bold text-xl gradient-text pr-6 animate-fade-in">
            NutriChef Admin
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {adminNavLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <Link key={link.to} to={link.to} className="btn-ghost">
                  <IconComponent className="h-5 w-5 mr-1.5" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex-grow"></div>

          {/* Desktop Auth Section */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link to="/" className="btn-ghost px-3 py-2">
              <HiOutlineHome className="h-5 w-5 mr-1.5" />
              View Main Site
            </Link>
            {currentUser ? (
              <>
                <span className="text-sm font-medium text-gray-700 truncate max-w-32">
                  {currentUser.Name || currentUser.Email}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn-primary flex items-center"
                >
                  <HiOutlineLogout className="h-5 w-5 mr-1.5" />
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-ghost">Login</Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="btn-ghost p-2"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <HiX className="w-6 h-6" />
              ) : (
                <HiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden animate-slide-in">
            <div className="glass mt-2 rounded-xl border border-white/20 shadow-soft">
              <div className="px-4 py-2 space-y-1">
                {adminNavLinks.map((link) => {
                  const IconComponent = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200"
                    >
                      <IconComponent className="h-4 w-4 mr-3" />
                      {link.label}
                    </Link>
                  );
                })}

                <div className="border-t border-gray-200 my-2"></div>

                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200"
                >
                  <HiOutlineHome className="h-4 w-4 mr-3" />
                  View Main Site
                </Link>

                {currentUser ? (
                  <>
                    <div className="px-4 py-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Logged in as
                      </span>
                      <div className="text-sm font-medium text-gray-700 mt-1 truncate">
                        {currentUser.Name || currentUser.Email}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                    >
                      <HiOutlineLogout className="h-4 w-4 mr-3" />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-lg text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors duration-200"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavigationBar;
