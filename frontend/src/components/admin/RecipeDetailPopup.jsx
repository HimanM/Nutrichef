import React, { useState, useEffect } from 'react';
import { HiX } from 'react-icons/hi';

const RecipeDetailPopup = ({ recipe, onClose }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (!recipe) {
    return null;
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Mobile Modal Component
  const MobileModal = () => {
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const handleTouchStart = (e) => {
      setStartY(e.touches[0].clientY);
      setCurrentY(e.touches[0].clientY);
      setIsDragging(true);
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      setCurrentY(e.touches[0].clientY);
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;
      
      const deltaY = currentY - startY;
      
      // If dragged down more than 100px, close the modal
      if (deltaY > 100) {
        onClose();
      }
      
      setIsDragging(false);
      setStartY(0);
      setCurrentY(0);
    };

    const handleBackdropClick = (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    const translateY = isDragging ? Math.max(0, currentY - startY) : 0;

    return (
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50"
        onClick={handleBackdropClick}
      >
        <div 
          className="relative bg-white rounded-t-3xl shadow-2xl w-full max-h-[90vh] overflow-hidden mobile-modal-enter"
          style={{
            transform: `translateY(${translateY}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Mobile Header with drag indicator */}
          <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
            {/* Drag indicator */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>
            
            <div className="px-4 pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{recipe.Title}</h2>
                  <p className="text-gray-500 text-sm">Recipe ID: {recipe.RecipeID}</p>
                  {recipe.AuthorName && (
                    <p className="text-gray-500 text-sm">By: {recipe.AuthorName}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 flex-shrink-0"
                >
                  <HiX className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Content */}
          <div className="p-4 pb-8 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Recipe Image */}
            {recipe.ImageURL && (
              <div className="mb-4">
                <img
                  src={recipe.ImageURL}
                  alt={recipe.Title}
                  className="w-full h-48 object-cover rounded-xl shadow-lg"
                />
              </div>
            )}

            {/* Mobile Layout - Single Column */}
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-emerald-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  Description
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">
                    {recipe.Description || 'No description available.'}
                  </p>
                </div>
              </div>

              {/* Recipe Details */}
              <div>
                <h3 className="text-lg font-semibold text-emerald-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  Recipe Details
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      recipe.Status === 'approved' ? 'bg-green-100 text-green-800' :
                      recipe.Status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {recipe.Status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-800">
                      {recipe.CreatedAt ? new Date(recipe.CreatedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  {recipe.Servings && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Servings:</span>
                      <span className="text-gray-800">{recipe.Servings}</span>
                    </div>
                  )}
                  {recipe.CookingTimeMinutes && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cooking Time:</span>
                      <span className="text-gray-800">{recipe.CookingTimeMinutes} minutes</span>
                    </div>
                  )}
                  {recipe.PreparationTimeMinutes && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Preparation Time:</span>
                      <span className="text-gray-800">{recipe.PreparationTimeMinutes} minutes</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <h3 className="text-lg font-semibold text-emerald-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  Ingredients
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {recipe.ingredients && recipe.ingredients.length > 0 ? (
                    <ul className="space-y-2">
                      {recipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                          <span className="text-gray-800 font-medium">
                            {ingredient.IngredientName}
                          </span>
                          <span className="text-gray-600 text-sm">
                            {ingredient.Quantity} {ingredient.Unit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">No ingredients listed.</p>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="text-lg font-semibold text-emerald-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  Instructions
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {recipe.Instructions ? (
                    <ol className="space-y-3">
                      {recipe.Instructions.split('\n').filter(step => step.trim()).map((instruction, index) => (
                        <li key={index} className="flex">
                          <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                            {index + 1}
                          </span>
                          <p className="text-gray-700 leading-relaxed">{instruction.trim()}</p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-gray-500 italic">No instructions available.</p>
                  )}
                </div>
              </div>

              {/* Allergies Section */}
              {recipe.ingredients && recipe.ingredients.some(ing => ing.Allergies && ing.Allergies.length > 0) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-emerald-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                    Allergies & Dietary Information
                  </h3>
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(
                        recipe.ingredients
                          .filter(ing => ing.Allergies && ing.Allergies.length > 0)
                          .flatMap(ing => ing.Allergies.map(allergy => allergy.name))
                      )).map((allergy, index) => (
                        <span key={index} className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Desktop Modal Component  
  const DesktopModal = () => (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-emerald-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{recipe.Title}</h2>
              <p className="text-emerald-100 text-sm">Recipe ID: {recipe.RecipeID}</p>
              {recipe.AuthorName && (
                <p className="text-emerald-100 text-sm">By: {recipe.AuthorName}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-emerald-200 transition-colors duration-200 p-1"
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pb-8 lg:pb-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Recipe Image */}
          {recipe.ImageURL && (
            <div className="mb-6">
              <img
                src={recipe.ImageURL}
                alt={recipe.Title}
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-emerald-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  Description
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">
                    {recipe.Description || 'No description available.'}
                  </p>
                </div>
              </div>

              {/* Recipe Details */}
              <div>
                <h3 className="text-lg font-semibold text-emerald-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  Recipe Details
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      recipe.Status === 'approved' ? 'bg-green-100 text-green-800' :
                      recipe.Status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {recipe.Status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-800">
                      {recipe.CreatedAt ? new Date(recipe.CreatedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  {recipe.Servings && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Servings:</span>
                      <span className="text-gray-800">{recipe.Servings}</span>
                    </div>
                  )}
                  {recipe.CookingTimeMinutes && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cooking Time:</span>
                      <span className="text-gray-800">{recipe.CookingTimeMinutes} minutes</span>
                    </div>
                  )}
                  {recipe.PreparationTimeMinutes && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Preparation Time:</span>
                      <span className="text-gray-800">{recipe.PreparationTimeMinutes} minutes</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Ingredients */}
              <div>
                <h3 className="text-lg font-semibold text-emerald-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  Ingredients
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {recipe.ingredients && recipe.ingredients.length > 0 ? (
                    <ul className="space-y-2">
                      {recipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                          <span className="text-gray-800 font-medium">
                            {ingredient.IngredientName}
                          </span>
                          <span className="text-gray-600 text-sm">
                            {ingredient.Quantity} {ingredient.Unit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">No ingredients listed.</p>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="text-lg font-semibold text-emerald-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  Instructions
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {recipe.Instructions ? (
                    <ol className="space-y-3">
                      {recipe.Instructions.split('\n').filter(step => step.trim()).map((instruction, index) => (
                        <li key={index} className="flex">
                          <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                            {index + 1}
                          </span>
                          <p className="text-gray-700 leading-relaxed">{instruction.trim()}</p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-gray-500 italic">No instructions available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Allergies Section */}
          {recipe.ingredients && recipe.ingredients.some(ing => ing.Allergies && ing.Allergies.length > 0) && (
            <div className="mt-6 mb-6 lg:mb-4">
              <h3 className="text-lg font-semibold text-emerald-700 mb-3 flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                Allergies & Dietary Information
              </h3>
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(
                    recipe.ingredients
                      .filter(ing => ing.Allergies && ing.Allergies.length > 0)
                      .flatMap(ing => ing.Allergies.map(allergy => allergy.name))
                  )).map((allergy, index) => (
                    <span key={index} className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return isMobile ? <MobileModal /> : <DesktopModal />;
};

export default RecipeDetailPopup;
