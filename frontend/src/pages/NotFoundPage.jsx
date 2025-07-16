import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { HiOutlineHome, HiOutlineExclamation, HiOutlineCollection, HiOutlineCamera, HiOutlineMail } from 'react-icons/hi';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="container-modern text-center max-w-4xl animate-fade-in">
        {/* Error Icon with floating animation */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
            <HiOutlineExclamation className="w-16 h-16 text-white" />
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-emerald-100 rounded-full opacity-20 animate-ping"></div>
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-36 h-36 bg-emerald-200 rounded-full opacity-30 animate-ping" style={{animationDelay: '0.5s'}}></div>
        </div>

        {/* Error Message */}
        <div className="mb-12">
          <h1 className="text-8xl sm:text-9xl font-extrabold gradient-text mb-6 drop-shadow-lg">
            404
          </h1>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
            Oops! Page Not Found
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            The page you are looking for might have been moved, renamed, or is temporarily unavailable.
            Don't worry, let's get you back on track!
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="mb-12">
          <RouterLink
            to="/"
            className="btn-primary inline-flex items-center justify-center text-lg px-8 py-4 mb-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <HiOutlineHome className="w-6 h-6 mr-3" />
            Go to Homepage
          </RouterLink>
        </div>

        {/* Popular Pages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <RouterLink 
            to="/recipes" 
            className="group p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <HiOutlineCollection className="w-8 h-8 text-emerald-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-800 mb-2">Browse Recipes</h3>
            <p className="text-sm text-gray-600">Discover delicious recipes</p>
          </RouterLink>
          
          <RouterLink 
            to="/classifier" 
            className="group p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <HiOutlineCamera className="w-8 h-8 text-emerald-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-800 mb-2">Ingredient Classifier</h3>
            <p className="text-sm text-gray-600">Classify food items with AI</p>
          </RouterLink>
          
          <RouterLink 
            to="/contact-us" 
            className="group p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <HiOutlineMail className="w-8 h-8 text-emerald-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-800 mb-2">Contact Us</h3>
            <p className="text-sm text-gray-600">Get help and support</p>
          </RouterLink>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
