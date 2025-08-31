import React from 'react';
import { SpinnerIcon } from '../common/LoadingComponents.jsx';

const FloatingLoader = ({ text = "Parsing recipe, please wait..." }) => {
  return (
    <div className="fixed bottom-6 left-6 flex items-center glass px-6 py-4 rounded-2xl shadow-lg z-50 animate-fade-in">
      <SpinnerIcon size="h-5 w-5" className="mr-3" />
      <p className="text-sm font-medium text-gray-700">{text}</p>
    </div>
  );
};

export default FloatingLoader;
