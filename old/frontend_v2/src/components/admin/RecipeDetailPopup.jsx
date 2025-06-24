import React from 'react';
import { IoMdClose } from 'react-icons/io';

const RecipeDetailPopup = ({ recipe, onClose }) => {
  if (!recipe) {
    return null;
  }

  const overallAllergies = [];
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    recipe.ingredients.forEach(ingredient => {
      if (ingredient.Allergies && ingredient.Allergies.length > 0) {
        ingredient.Allergies.forEach(allergy => {
          if (!overallAllergies.includes(allergy.name)) {
            overallAllergies.push(allergy.name);
          }
        });
      }
    });
  }

  return (
    <div 
      className="fixed inset-0 bg-gray-800/30 backdrop-blur-sm flex items-center justify-center z-40 p-4"
      onClick={onClose}
    >
      <div 
        className="relative bg-gray-800 text-gray-100 p-6 rounded-lg shadow-xl max-w-2xl w-full border border-gray-700 max-h-[70vh] z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-1 right-3 text-gray-400 hover:text-red-200 transition-colors p-3"
          aria-label="Close recipe details"
        >
          <IoMdClose size={24} />
        </button>
        <h2 className="pl-5 text-2xl font-semibold mb-4 text-green-400 pt-2 pr-10">{recipe.Title}</h2> 
        <div className="overflow-y-auto p-5 mb-4 max-h-[55vh]">
          
          
          <div className="mb-4">
            <strong className="text-green-300">Description:</strong>
            <p className="text-gray-300 whitespace-pre-wrap">{recipe.Description || 'No description provided.'}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <strong className="text-green-300">Recipe ID:</strong>
              <p className="text-gray-300">{recipe.RecipeID}</p>
            </div>
            <div>
              <strong className="text-green-300">Author UserID:</strong>
              <p className="text-gray-300">{recipe.UserID}</p>
            </div>
            <div>
              <strong className="text-green-300">Public:</strong>
              <p className="text-gray-300">{recipe.is_public ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <strong className="text-green-300">Average Rating:</strong>
              <p className="text-gray-300">{recipe.average_rating !== undefined && recipe.average_rating !== null ? Number(recipe.average_rating).toFixed(1) : 'N/A'}</p>
            </div>
          </div>

          <div className="mb-4">
            <strong className="text-green-300">Overall Recipe Allergies:</strong>
            <p className="text-gray-300">
              {overallAllergies.length > 0 ? overallAllergies.join(', ') : 'None'}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3 text-green-400">Ingredients:</h3>
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              <ul className="space-y-2">
                {recipe.ingredients.map((ing, index) => (
                  <li key={index} className="text-gray-300 bg-gray-700 p-3 rounded-md">
                    <span className="font-semibold text-green-300">{ing.IngredientName || ing.Name || 'Unknown Ingredient'}</span>: {ing.Quantity} {ing.Unit}
                    {ing.Allergies && ing.Allergies.length > 0 && (
                      <div className="pl-1 mt-1">
                        <p className="text-xs text-yellow-400">
                          <span className="font-semibold">Contains:</span> {ing.Allergies.map(a => a.name).join(', ')}
                        </p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No ingredients listed.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailPopup;
