import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { authenticatedFetch } from '../utils/apiUtil.js';
import { HiOutlineSearch, HiOutlineRefresh, HiOutlineExclamation, HiOutlineCheckCircle } from 'react-icons/hi';

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
  const [searchedIngredient, setSearchedIngredient] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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
      setSearchedIngredient('');
      return;
    }
    setError(null);
    setResults([]);
    setIsLoading(true);
    setSearchedIngredient(ingredientName.trim());

    try {
      const response = await authenticatedFetch('/api/substitute', {
        method: 'POST',
        body: JSON.stringify({ ingredientName }),
      }, auth);

      const data = await response.json();

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="section-padding">
        <div className="container-modern">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Find Ingredient Substitutes</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Enter an ingredient to discover potential substitutes and their nutritional information
            </p>
          </div>

          {/* Search Section */}
          <div className="card-glass p-8 mb-8 animate-fade-in">
            <div className="max-w-lg mx-auto">
              <label htmlFor="ingredientName" className="form-label">Ingredient Name</label>
              <div className="flex gap-4">
                <input
                  type="text"
                  id="ingredientName"
                  value={ingredientName}
                  onChange={(e) => setIngredientName(e.target.value)}
                  className="form-input flex-1"
                  placeholder="e.g., Butter, Flour, Egg"
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="btn-primary disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <HiOutlineRefresh className="animate-spin h-5 w-5" />
                  ) : (
                    <>
                      <HiOutlineSearch className="w-5 h-5 mr-2" />
                      Search
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="card p-6 border-red-200 bg-red-50 mb-8 animate-fade-in">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <HiOutlineExclamation className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Search Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 text-center">
                Suggested Substitutes for "{toTitleCase(searchedIngredient)}"
              </h2>
              {results.map((substitute, index) => (
                <div key={index} className="card-glass p-6">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                    <div className="flex items-center mb-2 sm:mb-0">
                      <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500 mr-2" />
                      <span className={`inline-block px-4 py-2 text-lg font-semibold text-white rounded-full ${
                        substitute.score > 0.7 ? 'bg-emerald-500' : substitute.score > 0.4 ? 'bg-amber-500' : 'bg-red-500'
                      }`}>
                        {toTitleCase(substitute.name)}
                      </span>
                    </div>
                    {typeof substitute.score !== 'undefined' && (
                      <p className="text-sm text-gray-600">
                        Confidence: <span className="font-semibold text-emerald-600">{(substitute.score * 100).toFixed(0)}%</span>
                      </p>
                    )}
                  </div>

                  {substitute.isLoadingNutrition && (
                    <div className="flex items-center justify-center my-4 p-4 bg-gray-50 rounded-lg">
                      <HiOutlineRefresh className="animate-spin h-5 w-5 text-emerald-500 mr-2" />
                      <p className="text-sm text-gray-600">Loading nutritional data...</p>
                    </div>
                  )}

                  {substitute.nutritionError && !substitute.isLoadingNutrition && (
                    <div className="my-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-3">
                          <h5 className="text-sm font-medium text-blue-800">Nutritional Information</h5>
                          <p className="text-sm text-blue-700">
                            Nutritional data is not available for this substitute at the moment.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {substitute.nutrition && !substitute.isLoadingNutrition && !substitute.nutritionError && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3">Nutritional Information (per 100g approx.)</h4>
                      {Object.keys(substitute.nutrition).length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {Object.entries(substitute.nutrition).map(([nutrientName, nutrientDetails]) => {
                            if (nutrientDetails && typeof nutrientDetails.amount !== 'undefined' && nutrientDetails.unit) {
                              const amountDisplay = typeof nutrientDetails.amount === 'number'
                                ? nutrientDetails.amount.toFixed(1)
                                : nutrientDetails.amount;
                              return (
                                <div key={nutrientName} className="bg-white border border-gray-200 rounded-lg p-3">
                                  <h5 className="font-semibold text-gray-800 text-sm">{toTitleCase(nutrientName)}</h5>
                                  <p className="text-emerald-600 font-medium">
                                    {amountDisplay} {nutrientDetails.unit}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No nutritional data available</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IngredientSubstitutePage;
