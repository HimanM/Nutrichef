import React, { useState } from 'react';
import { HiFilter, HiX, HiSearch, HiChevronDown, HiChevronUp } from 'react-icons/hi';

const AdminFilters = ({ 
  filters = [], 
  onFilterChange, 
  onClearFilters, 
  activeFiltersCount = 0,
  className = "" 
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (filterKey, value) => {
    if (onFilterChange) {
      onFilterChange(filterKey, value);
    }
  };

  const handleClearAll = () => {
    if (onClearFilters) {
      onClearFilters();
    }
  };

  const renderFilterField = (filter) => {
    const baseClasses = "w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent transition-colors";
    
    switch (filter.type) {
      case 'text':
      case 'search':
        return (
          <div className="relative">
            {filter.type === 'search' && (
              <HiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
            )}
            <input
              type="text"
              value={filter.value || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              placeholder={filter.placeholder}
              className={filter.type === 'search' ? `pl-7 ${baseClasses}` : baseClasses}
            />
          </div>
        );
      
      case 'select':
        return (
          <select
            value={filter.value || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className={baseClasses}
          >
            {filter.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={filter.value || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className={baseClasses}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={filter.value || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            placeholder={filter.placeholder}
            min={filter.min}
            max={filter.max}
            className={baseClasses}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Filter Header */}
      <div className="px-3 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiFilter className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-medium text-gray-900">Search Filters</h4>
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                title="Clear all filters"
              >
                <HiX className="w-3 h-3" />
                Clear
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
            >
              {showFilters ? (
                <>
                  <HiChevronUp className="w-3 h-3" />
                  <span className="hidden sm:inline text-xs">Hide</span>
                </>
              ) : (
                <>
                  <HiChevronDown className="w-3 h-3" />
                  <span className="hidden sm:inline text-xs">Show</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Content */}
      {showFilters && (
        <div className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">
                  {filter.label}
                  {filter.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderFilterField(filter)}
                {filter.description && (
                  <p className="text-xs text-gray-500">{filter.description}</p>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Clear Button */}
          {activeFiltersCount > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 sm:hidden">
              <button
                onClick={handleClearAll}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
              >
                <HiX className="w-3 h-3" />
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminFilters;
