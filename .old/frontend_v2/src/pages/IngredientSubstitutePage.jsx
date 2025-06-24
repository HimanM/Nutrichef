import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { authenticatedFetch } from '../utils/apiUtil.js';

const NUTRITION_WARNING_MESSAGES = [
    'Detailed nutritional data not available or incomplete.',
];

function toTitleCase(str) {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}


const IngredientSubstitutePage = () => {
  const [ingredientName, setIngredientName] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const auth = useAuth();
  const appName = "NutriChef";

  const fetchNutritionForSubstitute = async (substituteName, index) => {
    try {
      const response = await authenticatedFetch(`/api/nutrition/${encodeURIComponent(substituteName)}`, { method: 'GET' }, auth);
      const nutritionData = await response.json();

      setResults(prevResults => {
        const newResults = [...prevResults];
        if (!newResults[index]) return prevResults;
        const currentItem = newResults[index];

        if (response.ok) {
          if (nutritionData.success) {
            if (nutritionData.nutrition && Object.keys(nutritionData.nutrition).length > 0) {
              newResults[index] = { ...currentItem, nutrition: nutritionData.nutrition, isLoadingNutrition: false, nutritionError: null };
            } else {
              const message = (nutritionData.warning && typeof nutritionData.warning === 'string' && nutritionData.warning.trim() !== '')
                ? nutritionData.warning
                : 'Detailed nutritional data not available or incomplete.';
              newResults[index] = { ...currentItem, nutrition: null, isLoadingNutrition: false, nutritionError: message };
            }
          } else {
            newResults[index] = { ...currentItem, nutrition: null, isLoadingNutrition: false, nutritionError: nutritionData.error || 'Failed to retrieve nutritional details.' };
          }
        } else {
          newResults[index] = { ...currentItem, nutrition: null, isLoadingNutrition: false, nutritionError: nutritionData.error || `Failed to fetch nutritional data (status: ${response.status}).` };
        }
        return newResults;
      });
    } catch (err) {
      console.error(`Network error fetching nutrition for ${substituteName}:`, err);
      setResults(prevResults => {
        const newResults = [...prevResults];
        if (newResults[index]) {
          newResults[index] = { ...newResults[index], nutrition: null, isLoadingNutrition: false, nutritionError: 'Network error occurred while fetching nutritional data.' };
        }
        return newResults;
      });
    }
  };

  const handleSearch = async () => {
    if (!ingredientName.trim()) {
      setError('Please enter an ingredient name.');
      setResults([]);
      return;
    }
    setError(null);
    setResults([]);

    try {
      const response = await authenticatedFetch('/api/substitute', {
        method: 'POST',
        body: JSON.stringify({ ingredientName }),
      }, auth);

      const data = await response.json();
      // setIsSearchLoading(false);

      if (response.ok) {
        if (!data || data.length === 0) {
          setError('No substitutes found for this ingredient. Try a more common ingredient or check spelling.');
          setResults([]);
        } else {
          const newSubstitutes = data.map(sub => ({
            name: sub.name,
            score: sub.score,
            nutrition: null,
            isLoadingNutrition: true,
            nutritionError: null,
          }));
          setResults(newSubstitutes);
          setError(null);
          newSubstitutes.forEach((sub, index) => {
            fetchNutritionForSubstitute(sub.name, index);
          });
        }
      } else {
        setError(data.message || 'Failed to fetch substitutes.');
        setResults([]);
      }
    } catch (err) {
      console.error('Network error during initial substitute search:', err);
      setError('A network error occurred. Please try again.');
      setResults([]);
    }
  };

  const commonInputClassName = "mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 sm:text-sm";

  return (
    <div className="page-container my-8"> 
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl"> 
          Find Ingredient Substitutes
        </h1>
        <p className="mt-3 text-md text-gray-400 max-w-xl mx-auto">
          Enter an ingredient to discover potential substitutes and their nutritional information. (e.g., apple, butter, flour, etc.)
        </p>
      </div>

      <div className="max-w-lg mx-auto mb-8 bg-gray-800 p-6 shadow-lg rounded-lg">
        <label htmlFor="ingredientName" className="block text-sm font-medium text-gray-300">Ingredient Name</label>
        <input
          type="text"
          id="ingredientName"
          value={ingredientName}
          onChange={(e) => setIngredientName(e.target.value)}
          className={commonInputClassName}
          placeholder="e.g., Butter, Flour, Egg"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="gradient-button mt-4 w-full flex justify-center disabled:opacity-75"
        >
          Search
        </button>
      </div>

      {error && (
        <div className="my-4 p-3 bg-red-700 border border-red-500 text-red-200 rounded-md text-sm max-w-lg mx-auto">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-6 mt-8">
          <h2 className="text-2xl text-center">
            Suggested Substitutes for "{toTitleCase(ingredientName)}"
          </h2>
          {results.map((substitute, index) => (
            <div key={index} className="bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3">
                <span className={`inline-block px-3 py-1 text-lg font-semibold text-white rounded-full ${
                  substitute.score > 0.7 ? 'bg-green-600' : substitute.score > 0.4 ? 'bg-yellow-600' : 'bg-red-600'
                }`}>
                  {toTitleCase(substitute.name)}
                </span>
                {typeof substitute.score !== 'undefined' && (
                  <p className="text-sm text-gray-400 mt-2 sm:mt-0">
                    Confidence: <span className="font-semibold">{(substitute.score * 100).toFixed(0)}%</span>
                  </p>
                )}
              </div>

              {substitute.isLoadingNutrition && (
                <div className="flex items-center justify-center my-4 p-3">
                  <svg className="animate-spin h-5 w-5 text-indigo-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <p className="text-sm text-gray-400">Loading nutritional data...</p>
                </div>
              )}

              {substitute.nutritionError && !substitute.isLoadingNutrition && (
                <div className={`my-2 p-3 rounded-md text-sm ${
                  NUTRITION_WARNING_MESSAGES.includes(substitute.nutritionError) ?
                  'bg-yellow-600 border border-yellow-500 text-yellow-100' :
                  'bg-red-700 border border-red-500 text-red-200'
                }`}>
                  {substitute.nutritionError}
                </div>
              )}

              {substitute.nutrition && !substitute.isLoadingNutrition && !substitute.nutritionError && (
                <div className="mt-3">
                  <h4 className="text-sm mb-1">Nutritional Information (per 100g approx.):</h4>
                  {Object.keys(substitute.nutrition).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(substitute.nutrition).map(([nutrientName, nutrientDetails]) => {
                        if (nutrientDetails && typeof nutrientDetails.amount !== 'undefined' && nutrientDetails.unit) {
                          const amountDisplay = typeof nutrientDetails.amount === 'number'
                            ? nutrientDetails.amount.toFixed(1)
                            : nutrientDetails.amount;
                          return (
                            <span key={nutrientName} title={`Value: ${amountDisplay} ${nutrientDetails.unit}`}
                                  className="px-2 py-0.5 bg-gray-700 text-gray-200 text-xs font-medium rounded-full border border-gray-600">
                              {toTitleCase(nutrientName)}: {amountDisplay}{nutrientDetails.unit}
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">Detailed nutritional data not available.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IngredientSubstitutePage;
