import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { authenticatedFetch } from '../utils/apiUtil.js';

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
  const appName = "NutriChef";

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

  const commonInputClassName = "mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400 disabled:bg-gray-600 disabled:opacity-75";

  return (
    <div className="page-container max-w-5xl my-8">
      <h1 className="sm:text-4xl text-center mb-8">
        Food Nutrition Lookup
      </h1>

      <div className="max-w-2xl mx-auto mb-8 bg-gray-800 p-6 shadow-lg rounded-lg">
        <div className="flex items-center space-x-2 mb-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter food name (e.g., apple, banana, etc.)"
            className={`flex-grow ${commonInputClassName}`}
            disabled={isLoading}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="gradient-button whitespace-nowrap disabled:opacity-75"
          >
            {isLoading && !foodData ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : "Search"}
          </button>
        </div>
        <button
          onClick={handleClearSearch}
          disabled={isLoading}
          className="px-4 py-2 text-sm border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-md disabled:opacity-50"
        >
          New Search
        </button>
      </div>

      {isLoading && !error && (
        <div className="flex justify-center my-6">
          <svg className="animate-spin h-8 w-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>
      )}

      {error && (
        <div className="my-4 p-4 max-w-2xl mx-auto bg-red-700 border border-red-500 text-red-200 rounded-md text-sm">
          {error}
        </div>
      )}

      {foodData && !error && !isLoading && (
        <div className="max-w-2xl mx-auto mb-8 bg-gray-800 p-6 shadow-lg rounded-lg">
          {foodData.food && foodData.data && Object.keys(foodData.data).length > 0 && (
            <div className="">
              <h2 className="text-2xl mb-1">
                {toTitleCase(foodData.food)}
                <span className="text-sm font-normal text-gray-400 align-super ml-1">(per 100g)</span>
              </h2>
              <div className="overflow-x-auto mt-2">
                <table className="min-w-full divide-y divide-gray-700"> 
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nutrient</th> 
                      <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Value</th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Unit</th> 
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700"> 
                    {Object.entries(foodData.data).map(([key, nutrient]) => (
                      <tr key={key} className="even:bg-gray-900/[0.5] hover:bg-gray-700">
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-100">{toTitleCase(key)}</td> 
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300 text-right">{nutrient.value}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300"> 
                          {nutrient.unit ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-700 text-blue-200">{nutrient.unit}</span> : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {foodData.food && foodData.data && Object.keys(foodData.data).length === 0 && foodData.message && (
             <div className="bg-gray-800 p-4 sm:p-6 shadow-lg rounded-lg mb-6 text-center">
                <h2 className="text-xl mb-2">{toTitleCase(foodData.food)}</h2>
                <p className="text-gray-400">{foodData.message}</p>
             </div>
          )}

          {foodData.matches && foodData.matches.length > 0 && (
            <div className="bg-gray-800 p-4 sm:p-6 shadow-lg rounded-lg">
              <h3 className="text-xl mb-3">
                {foodData.message || 'Multiple matches found. Please select one:'}
              </h3>
              <ul className="space-y-2">
                {foodData.matches.map((matchName, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleSelectedFoodMatch(matchName)}
                      className="w-full text-left px-4 py-2 text-sm text-indigo-300 bg-gray-700 hover:bg-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                    >
                      {toTitleCase(matchName)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FoodLookupPage;
