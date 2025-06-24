import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { HiOutlineHome, HiOutlineExclamation } from 'react-icons/hi';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="container-modern text-center max-w-2xl animate-fade-in">
        <div className="card-glass p-12">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
              <HiOutlineExclamation className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-6xl sm:text-8xl font-extrabold gradient-text mb-4">
              404
            </h1>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              The page you are looking for might have been moved, renamed, or is temporarily unavailable.
              Don't worry, let's get you back on track!
            </p>
          </div>
          
          <div className="space-y-4">
            <RouterLink
              to="/"
              className="btn-primary inline-flex items-center justify-center"
            >
              <HiOutlineHome className="w-5 h-5 mr-2" />
              Go to Homepage
            </RouterLink>
            
            <div className="text-sm text-gray-500">
              <p>Or try one of these popular pages:</p>
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                <RouterLink to="/recipes" className="text-emerald-600 hover:text-emerald-700 transition-colors">
                  Browse Recipes
                </RouterLink>
                <RouterLink to="/classifier" className="text-emerald-600 hover:text-emerald-700 transition-colors">
                  Ingredient Classifier
                </RouterLink>
                <RouterLink to="/contact-us" className="text-emerald-600 hover:text-emerald-700 transition-colors">
                  Contact Us
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
