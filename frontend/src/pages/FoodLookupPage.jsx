import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { authenticatedFetch } from '../utils/apiUtil.js';
import { HiOutlineSearch, HiOutlineRefresh, HiOutlineX } from 'react-icons/hi';

function toTitleCase(str) {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

function FoodLookupPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [foodData, setFoodData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("Please enter a food name to search.");
      setFoodData(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setFoodData(null);

    const url = `/api/food-lookup?name=${encodeURIComponent(searchTerm)}`;

    try {
      const response = await authenticatedFetch(url, {}, auth);
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errData = await response.json();
          errorMsg = errData.error || errData.message || errorMsg;
        } catch (parseError) {
          console.error("Failed to parse error JSON:", parseError);
        }
        throw new Error(errorMsg);
      }
      const data = await response.json();

      if (data.matches && Array.isArray(data.matches)) {
        const sortedMatches = [...data.matches].sort((a, b) => a.localeCompare(b));
        setFoodData({ ...data, matches: sortedMatches });
      } else {
        setFoodData(data);
      }
      setError(null);
    } catch (err) {
      setError(err.message ? err.message.toString() : 'Failed to fetch data.');
      setFoodData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectedFoodMatch = async (selectedFoodName) => {
    setIsLoading(true);
    setError(null);
    setSearchTerm(selectedFoodName);

    const url = `/api/food-lookup?name=${encodeURIComponent(selectedFoodName)}&is_exact=true`;

    try {
      const response = await authenticatedFetch(url, {}, auth);
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errData = await response.json();
          errorMsg = errData.error || errData.message || errorMsg;
        } catch (parseError) {
          console.error("Failed to parse error JSON:", parseError);
        }
        throw new Error(errorMsg);
      }
      const data = await response.json();
      setFoodData(data);
      setError(null);
    } catch (err) {
      setError(err.message ? err.message.toString() : 'Failed to fetch data for selected food.');
      setFoodData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setFoodData(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="section-padding">
        <div className="container-modern">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 px-4">
              <span className="gradient-text">Food Nutrition Lookup</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Search for detailed nutritional information about any food
            </p>
          </div>

          {/* Search Section */}
          <div className="card-glass p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 animate-fade-in">
            <div className="flex flex-col gap-4 items-stretch">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <HiOutlineSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter food name (e.g., apple, banana, etc.)"
                  className="form-input pl-10 sm:pl-12 w-full text-base"
                  disabled={isLoading}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSearch()}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="btn-primary flex-1 sm:flex-none min-h-[44px] touch-manipulation disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isLoading && !foodData ? (
                    <HiOutlineRefresh className="animate-spin h-5 w-5" />
                  ) : (
                    <>
                      <HiOutlineSearch className="w-5 h-5 mr-2" />
                      Search
                    </>
                  )}
                </button>
                <button
                  onClick={handleClearSearch}
                  disabled={isLoading}
                  className="btn-outline flex-1 sm:flex-none min-h-[44px] touch-manipulation"
                >
                  <HiOutlineX className="w-5 h-5 mr-2" />
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && !error && (
            <div className="flex justify-center my-8">
              <div className="text-center">
                <HiOutlineRefresh className="animate-spin h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <p className="text-gray-600">Searching for nutritional data...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="card p-4 sm:p-6 border-red-200 bg-red-50 mb-6 sm:mb-8 animate-fade-in">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <HiOutlineX className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Search Error</h3>
                  <p className="text-sm text-red-700 mt-1 break-words">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {foodData && !error && !isLoading && (
            <div className="card-glass p-4 sm:p-6 lg:p-8 animate-fade-in">
              {foodData.food && foodData.data && Object.keys(foodData.data).length > 0 && (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 break-words">
                    {toTitleCase(foodData.food)}
                    <span className="text-sm font-normal text-gray-500 ml-2">(per 100g)</span>
                  </h2>
                  <div className="overflow-x-auto mt-4 sm:mt-6">
                    <table className="min-w-full divide-y divide-gray-200"> 
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nutrient</th> 
                          <th scope="col" className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                          <th scope="col" className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th> 
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200"> 
                        {Object.entries(foodData.data).map(([key, nutrient]) => (
                          <tr key={key} className="hover:bg-gray-50">
                            <td className="px-3 sm:px-4 py-3 text-sm font-medium text-gray-900 break-words">{toTitleCase(key)}</td> 
                            <td className="px-3 sm:px-4 py-3 text-sm text-gray-700 text-right">{nutrient.value}</td>
                            <td className="px-3 sm:px-4 py-3 text-sm text-gray-700"> 
                              {nutrient.unit ? (
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">
                                  {nutrient.unit}
                                </span>
                              ) : ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {foodData.food && foodData.data && Object.keys(foodData.data).length === 0 && foodData.message && (
                 <div className="text-center">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 break-words">{toTitleCase(foodData.food)}</h2>
                    <p className="text-gray-600 break-words">{foodData.message}</p>
                 </div>
              )}

              {foodData.matches && foodData.matches.length > 0 && (
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 break-words">
                    {foodData.message || 'Multiple matches found. Please select one:'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    {foodData.matches.map((matchName, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectedFoodMatch(matchName)}
                        className="w-full text-left px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base text-gray-700 bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200 touch-manipulation break-words shadow-sm hover:shadow-md"
                      >
                        {toTitleCase(matchName)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FoodLookupPage;
