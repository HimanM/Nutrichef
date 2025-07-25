import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { HiOutlineUserCircle, HiMenu, HiOutlineLogin, HiOutlineUserAdd, HiOutlineLogout, HiX, HiChevronDown } from 'react-icons/hi';
import { RiAdminFill } from "react-icons/ri";

const NavigationBar = () => {
  const { isAuthenticated, currentUser, isAdmin, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const toolsDropdownTimeout = useRef(null);
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
        setToolsDropdownOpen(false);
        setMobileToolsOpen(false);
      }
    };

    if (isMobileMenuOpen || toolsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobileMenuOpen, toolsDropdownOpen]);

  if (isAdmin && location.pathname.startsWith('/admin')) {
    return null;
  }

  if (loading) {
    return (
      <nav className="glass sticky top-0 z-50 border-b border-white/20 shadow-soft">
        <div className="container-modern">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center animate-fade-in">
              <div className="nutrichef-logo nutrichef-logo-md mr-2"></div>
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
    { to: "/forum", label: "Forum" },
    { to: "/classifier", label: "Classify" },
    { to: "/ingredient-substitute", label: "Substitutes" },
    { to: "/food-lookup", label: "Food Lookup" },
    { to: "/contact-us", label: "Contact" },
  ];

  return (
    <nav ref={navRef} className="glass sticky top-0 z-50 border-b border-white/20 shadow-soft backdrop-blur-xl">
      <div className="container-modern-nav">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center animate-fade-in">
            <Link to="/" className="flex items-center hover:scale-105 transition-transform duration-200">
              <div className="relative flex items-center">
                <div className="nutrichef-logo nutrichef-logo-md mr-3"></div>
                
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
                  <HiChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
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
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${location.pathname === link.to
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                  >
                    {link.icon && <span className="mr-2">{link.icon}</span>}
                    {link.label}
                  </Link>
                ))}

                {isAuthenticated && (
                  <div className="border-t border-gray-200 my-2"></div>
                )}

                {isAuthenticated && (
                  <>
                    <button
                      onClick={() => setMobileToolsOpen(!mobileToolsOpen)}
                      className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200"
                    >
                      <span>Tools</span>
                      <HiChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileToolsOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {mobileToolsOpen && (
                      <div className="ml-4 space-y-1 animate-fade-in">
                        <Link
                          to="/personalized-recipes"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-4 py-2 rounded-lg text-sm text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200"
                        >
                          For You
                        </Link>
                        <Link
                          to="/meal-planner"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-4 py-2 rounded-lg text-sm text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200"
                        >
                          Meal Plan
                        </Link>
                        <Link
                          to="/pantry"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-4 py-2 rounded-lg text-sm text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200"
                        >
                          My Pantry
                        </Link>
                        <Link
                          to="/basket"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-4 py-2 rounded-lg text-sm text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200"
                        >
                          Basket
                        </Link>
                      </div>
                    )}
                  </>
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
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;
