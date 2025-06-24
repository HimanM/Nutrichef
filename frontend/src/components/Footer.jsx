import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineSparkles, HiOutlineMail, HiOutlineGlobe, HiOutlineHeart } from 'react-icons/hi';
import { FaGithub } from 'react-icons/fa';

const Footer = () => {
  const appName = "NutriChef";
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 shadow-soft">
      <div className="container-modern">
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <HiOutlineSparkles className="w-6 h-6 mr-2 text-emerald-500" />
                <span className="font-bold text-xl gradient-text">{appName}</span>
              </div>
              <p className="text-gray-600 mb-6 max-w-md leading-relaxed">
                Your intelligent partner for healthier eating. Discover recipes, plan meals, manage your pantry, and understand your food like never before.
              </p>
              <div className="flex space-x-4">
                <a 
                  href="mailto:hghimanmanduja@gmail.com.com" 
                  className="text-gray-400 hover:text-emerald-600 transition-colors duration-200"
                  aria-label="Email us"
                >
                  <HiOutlineMail className="w-5 h-5" />
                </a>
                <a 
                  href="/contact-us" 
                  className="text-gray-400 hover:text-emerald-600 transition-colors duration-200"
                  aria-label="Contact us"
                >
                  <HiOutlineGlobe className="w-5 h-5" />
                </a>
                <a 
                  href="https://github.com/HimanM/nutrichef" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-emerald-600 transition-colors duration-200"
                  aria-label="GitHub repository"
                >
                  <FaGithub className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/recipes" className="text-gray-600 hover:text-emerald-600 transition-colors duration-200">
                    Recipes
                  </Link>
                </li>
                <li>
                  <Link to="/meal-planner" className="text-gray-600 hover:text-emerald-600 transition-colors duration-200">
                    Meal Planner
                  </Link>
                </li>
                <li>
                  <Link to="/classifier" className="text-gray-600 hover:text-emerald-600 transition-colors duration-200">
                    Ingredient Classifier
                  </Link>
                </li>
                <li>
                  <Link to="/food-lookup" className="text-gray-600 hover:text-emerald-600 transition-colors duration-200">
                    Food Lookup
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-gray-600 hover:text-emerald-600 transition-colors duration-200">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact-us" className="text-gray-600 hover:text-emerald-600 transition-colors duration-200">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-600 hover:text-emerald-600 transition-colors duration-200">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-100 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 text-sm">
              &copy; {currentYear} {appName}. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm flex items-center">
              Made with <HiOutlineHeart className="w-4 h-4 mx-1 text-red-500" /> for healthy living
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
