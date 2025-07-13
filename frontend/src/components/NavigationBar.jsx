import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { HiOutlineUserCircle, HiMenu, HiOutlineSparkles, HiOutlineLogin, HiOutlineUserAdd, HiOutlineLogout, HiX } from 'react-icons/hi';
import { RiAdminFill } from "react-icons/ri";
import { FaShoppingCart } from "react-icons/fa";

const NavigationBar = () => {
  const { isAuthenticated, currentUser, isAdmin, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const toolsDropdownTimeout = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isAdmin && location.pathname.startsWith('/admin')) {
    return null;
  }

  if (loading) {
    return (
      <nav className="glass sticky top-0 z-50 border-b border-white/20 shadow-soft">
        <div className="container-modern">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center animate-fade-in">
              <HiOutlineSparkles className="w-7 h-7 mr-2 text-emerald-500" />
              <span className="font-bold text-xl navbar-logo">NutriChef</span>
            </div>
            <div className="animate-pulse">
              <div className="h-2 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/recipes", label: "Recipes" },
    { to: "/classifier", label: "Classify" },
    { to: "/ingredient-substitute", label: "Substitutes" },
    { to: "/food-lookup", label: "Food Lookup" },
    { to: "/contact-us", label: "Contact" },
  ];

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/20 shadow-soft backdrop-blur-xl">
      <div className="container-modern">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center animate-fade-in">
            <Link to="/" className="flex items-center hover:scale-105 transition-transform duration-200">
              <div className="relative">
                <HiOutlineSparkles className="w-7 h-7 mr-2 text-emerald-500" />
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-sm"></div>
              </div>
              <span className="font-bold text-xl navbar-logo">NutriChef</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${location.pathname === link.to ? 'nav-link-active' : ''}`}
              >
                {link.icon && <span className="mr-1">{link.icon}</span>}
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <div
                className="relative group"
                onMouseEnter={() => {
                  clearTimeout(toolsDropdownTimeout.current);
                  setToolsDropdownOpen(true);
                }}
                onMouseLeave={() => {
                  toolsDropdownTimeout.current = setTimeout(() => setToolsDropdownOpen(false), 300);
                }}
                onFocus={() => setToolsDropdownOpen(true)}
                onBlur={() => toolsDropdownTimeout.current = setTimeout(() => setToolsDropdownOpen(false), 300)}
                tabIndex={0}
              >
                <button className="nav-link flex items-center gap-1" aria-haspopup="true" aria-expanded={toolsDropdownOpen}>
                  Tools
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {toolsDropdownOpen && (
                  <div 
                    className="absolute left-0 mt-2 w-48 bg-white/90 rounded-xl shadow-lg border border-gray-100 z-50 animate-fade-in"
                    onMouseEnter={() => {
                      clearTimeout(toolsDropdownTimeout.current);
                      setToolsDropdownOpen(true);
                    }}
                    onMouseLeave={() => {
                      toolsDropdownTimeout.current = setTimeout(() => setToolsDropdownOpen(false), 300);
                    }}
                  >
                    <Link to="/personalized-recipes" className="block px-4 py-3 text-gray-700 hover:bg-emerald-50 rounded-t-xl transition-colors duration-200">For You</Link>
                    <Link to="/meal-planner" className="block px-4 py-3 text-gray-700 hover:bg-emerald-50 transition-colors duration-200">Meal Plan</Link>
                    <Link to="/pantry" className="block px-4 py-3 text-gray-700 hover:bg-emerald-50 transition-colors duration-200">My Pantry</Link>
                    <Link to="/basket" className="block px-4 py-3 text-gray-700 hover:bg-emerald-50 rounded-b-xl transition-colors duration-200">Basket</Link>
                  </div>
                )}
              </div>
            )}
            {isAdmin && (
              <Link to="/admin" className="btn-ghost text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                <RiAdminFill className="h-5 w-5" />
              </Link>
            )}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Link to="/settings" className="btn-ghost flex items-center">
                  <HiOutlineUserCircle className="h-5 w-5 mr-1.5" />
                  <span className="text-sm">{currentUser?.Name || currentUser?.Email?.split('@')[0] || 'User'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-danger-outline"
                >
                  <HiOutlineLogout className="h-4 w-4 mr-1.5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">
                  <HiOutlineLogin className="h-4 w-4 mr-1.5" />
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  <HiOutlineUserAdd className="h-4 w-4 mr-1.5" />
                  Register
                </Link>
              </>
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
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      location.pathname === link.to
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    {link.icon && <span className="mr-2">{link.icon}</span>}
                    {link.label}
                  </Link>
                ))}
                
                {isAuthenticated && (
                  <div
                    className="relative group"
                    onMouseEnter={() => {
                      clearTimeout(toolsDropdownTimeout.current);
                      setToolsDropdownOpen(true);
                    }}
                    onMouseLeave={() => {
                      toolsDropdownTimeout.current = setTimeout(() => setToolsDropdownOpen(false), 300);
                    }}
                    onFocus={() => setToolsDropdownOpen(true)}
                    onBlur={() => toolsDropdownTimeout.current = setTimeout(() => setToolsDropdownOpen(false), 300)}
                    tabIndex={0}
                  >
                    <button className="nav-link flex items-center gap-1" aria-haspopup="true" aria-expanded={toolsDropdownOpen}>
                      Tools
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {toolsDropdownOpen && (
                      <div 
                        className="absolute left-0 mt-2 w-48 bg-white/90 rounded-xl shadow-lg border border-gray-100 z-50 animate-fade-in"
                        onMouseEnter={() => {
                          clearTimeout(toolsDropdownTimeout.current);
                          setToolsDropdownOpen(true);
                        }}
                        onMouseLeave={() => {
                          toolsDropdownTimeout.current = setTimeout(() => setToolsDropdownOpen(false), 300);
                        }}
                      >
                        <Link to="/personalized-recipes" className="block px-4 py-3 text-gray-700 hover:bg-emerald-50 rounded-t-xl transition-colors duration-200">For You</Link>
                        <Link to="/meal-planner" className="block px-4 py-3 text-gray-700 hover:bg-emerald-50 transition-colors duration-200">Meal Plan</Link>
                        <Link to="/pantry" className="block px-4 py-3 text-gray-700 hover:bg-emerald-50 transition-colors duration-200">My Pantry</Link>
                        <Link to="/basket" className="block px-4 py-3 text-gray-700 hover:bg-emerald-50 rounded-b-xl transition-colors duration-200">Basket</Link>
                      </div>
                    )}
                  </div>
                )}

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition-colors duration-200"
                  >
                    <RiAdminFill className="h-4 w-4 inline mr-2" />
                    Admin Panel
                  </Link>
                )}

                <div className="border-t border-gray-200 my-2"></div>

                {isAuthenticated ? (
                  <>
                    <Link
                      to="/settings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200"
                    >
                      <HiOutlineUserCircle className="h-4 w-4 inline mr-2" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                    >
                      <HiOutlineLogout className="h-4 w-4 inline mr-2" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200"
                    >
                      <HiOutlineLogin className="h-4 w-4 inline mr-2" />
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors duration-200"
                    >
                      <HiOutlineUserAdd className="h-4 w-4 inline mr-2" />
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;
