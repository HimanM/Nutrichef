import React from 'react';

/**
 * Reusable spinner components for consistent loading states across the application
 */

// Proper circular spinner icon that looks natural when spinning
export const SpinnerIcon = ({ size = 'h-5 w-5', color = 'text-emerald-500', className = '' }) => (
  <svg 
    className={`animate-spin ${size} ${color} ${className}`} 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24"
  >
    <circle 
      className="opacity-25" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4"
    />
    <path 
      className="opacity-75" 
      fill="currentColor" 
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const PageLoaderSpinner = ({ size = 'h-10 w-10', color = 'text-indigo-400' }) => (
  <svg 
    className={`animate-spin ${size} ${color}`} 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24"
  >
    <circle 
      className="opacity-25" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4"
    />
    <path 
      className="opacity-75" 
      fill="currentColor" 
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const InlineSpinner = ({ size = 'h-5 w-5', color = 'text-indigo-400', className = '' }) => (
  <svg 
    className={`animate-spin ${size} ${color} ${className}`} 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24"
  >
    <circle 
      className="opacity-25" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4"
    />
    <path 
      className="opacity-75" 
      fill="currentColor" 
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const TableSpinner = ({ size = 'h-6 w-6', color = 'text-indigo-400' }) => (
  <svg 
    className={`animate-spin ${size} ${color}`} 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24"
  >
    <circle 
      className="opacity-25" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4"
    />
    <path 
      className="opacity-75" 
      fill="currentColor" 
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const ButtonSpinner = ({ size = 'h-5 w-5', color = 'text-white' }) => (
  <svg 
    className={`animate-spin ${size} ${color}`} 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24"
  >
    <circle 
      className="opacity-25" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4"
    />
    <path 
      className="opacity-75" 
      fill="currentColor" 
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const EmeraldSpinner = ({ size = 'h-10 w-10', color = 'text-emerald-500' }) => (
  <svg 
    className={`animate-spin ${size} ${color}`} 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24"
  >
    <circle 
      className="opacity-25" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4"
    />
    <path 
      className="opacity-75" 
      fill="currentColor" 
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const BlueSpinner = ({ size = 'h-8 w-8', color = 'text-blue-400' }) => (
  <svg 
    className={`animate-spin ${size} ${color}`} 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24"
  >
    <circle 
      className="opacity-25" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4"
    />
    <path 
      className="opacity-75" 
      fill="currentColor" 
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

/**
 * Loading component with text
 */
// eslint-disable-next-line no-unused-vars
export const LoadingWithText = ({ text = 'Loading...', SpinnerComponent = PageLoaderSpinner }) => (
  <div className="flex items-center justify-center py-8">
    <SpinnerComponent />
    <span className="ml-3 text-gray-600">{text}</span>
  </div>
);

/**
 * Centered loading component for full-page loading
 */
// eslint-disable-next-line no-unused-vars
export const CenteredLoader = ({ text = 'Loading...', SpinnerComponent = PageLoaderSpinner }) => (
  <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
    <SpinnerComponent />
    <p className="ml-2 text-gray-700">{text}</p>
  </div>
);

export default {
  SpinnerIcon,
  PageLoaderSpinner,
  InlineSpinner,
  TableSpinner,
  ButtonSpinner,
  EmeraldSpinner,
  BlueSpinner,
  LoadingWithText,
  CenteredLoader
};
