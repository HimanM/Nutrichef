import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { HiOutlineViewGrid, HiOutlineUsers, HiOutlineCollection, HiOutlineChartBar, HiOutlineLogout, HiOutlineHome, HiMenu, HiX, HiTerminal, HiOutlineChat } from 'react-icons/hi';
import { MdOutlineMessage } from 'react-icons/md';

const AdminNavigationBar = () => {
  const { currentUser, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

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
    { to: "/admin/forum", label: "Forum", icon: HiOutlineChat },
    { to: "/admin/classification-scores", label: "Analytics", icon: HiOutlineChartBar },
    { to: "/admin/contact-messages", label: "Messages", icon: MdOutlineMessage },
    { to: "/admin/logs-monitor", label: "Monitor", icon: HiTerminal }
  ];

  return (
    <nav ref={navRef} className="glass sticky top-0 z-50 border-b border-white/20 shadow-soft backdrop-blur-xl">
      <div className="container-modern-nav">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/admin" className="font-bold text-xl gradient-text animate-fade-in flex-shrink-0">
            NutriChef Admin
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2 flex-1 ml-6 xl:ml-8">
            {adminNavLinks.map((link) => {
              const IconComponent = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link 
                  key={link.to} 
                  to={link.to} 
                  className={`${isActive ? 'admin-nav-link-active' : 'admin-nav-link'} px-3 xl:px-4 py-2 text-sm font-medium whitespace-nowrap`}
                >
                  <IconComponent className="h-4 w-4 mr-1.5 flex-shrink-0" />
                  <span className="hidden xl:inline">{link.label}</span>
                  <span className="lg:inline xl:hidden">{link.label.split(' ')[0]}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-3 flex-shrink-0">
            <Link to="/" className="admin-nav-home-link px-3 xl:px-4 py-2 text-sm font-medium whitespace-nowrap">
              <HiOutlineHome className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span className="hidden xl:inline">Main Site</span>
              <span className="lg:inline xl:hidden">Home</span>
            </Link>
            {currentUser ? (
              <>
                <div className="admin-user-badge max-w-32 xl:max-w-48 truncate">
                  {currentUser.Name || currentUser.Email}
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-danger-outline"
                >
                  <HiOutlineLogout className="h-4 w-4 mr-1.5 flex-shrink-0" />
                  <span className="hidden xl:inline">Logout</span>
                  <span className="lg:inline xl:hidden">Exit</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-ghost px-3 py-2">Login</Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 "
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
          <div className="lg:hidden bg-white/95 backdrop-blur-sm border-t border-white/20 shadow-lg absolute left-0 right-0 top-16 z-40 rounded-b-2xl">
            <div className="px-4 py-3 space-y-1">
              {adminNavLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200"
                  >
                    <IconComponent className="h-5 w-5 mr-3" />
                    {link.label}
                  </Link>
                );
              })}

              <div className="border-t border-gray-200 my-2"></div>

              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200"
              >
                <HiOutlineHome className="h-5 w-5 mr-3" />
                View Main Site
              </Link>

              {currentUser ? (
                <>
                  <div className="px-3 py-2">
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
                    className="w-full flex items-center px-3 py-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                  >
                    <HiOutlineLogout className="h-5 w-5 mr-3" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors duration-200"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavigationBar;
