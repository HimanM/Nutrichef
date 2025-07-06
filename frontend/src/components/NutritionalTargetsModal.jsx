import React, { useState, useEffect } from 'react';
import { MdClose, MdSave, MdInfo, MdWarning } from 'react-icons/md';

const NutritionalTargetsModal = ({ isOpen, onClose, onSave, currentTargets = {} }) => {
  const [targets, setTargets] = useState({
    DailyCalories: '',
    DailyProtein: '',
    DailyCarbs: '',
    DailyFat: '',
    DailyFiber: '',
    DailySugar: '',
    DailySodium: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setTargets({
        DailyCalories: currentTargets.DailyCalories || '',
        DailyProtein: currentTargets.DailyProtein || '',
        DailyCarbs: currentTargets.DailyCarbs || '',
        DailyFat: currentTargets.DailyFat || '',
        DailyFiber: currentTargets.DailyFiber || '',
        DailySugar: currentTargets.DailySugar || '',
        DailySodium: currentTargets.DailySodium || ''
      });
      setErrors({});
    }
  }, [isOpen, currentTargets]);

  const handleInputChange = (field, value) => {
    // Only allow positive numbers
    const numValue = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
    setTargets(prev => ({
      ...prev,
      [field]: numValue
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateTargets = () => {
    const newErrors = {};
    let hasAtLeastOneTarget = false;

    // Check if at least one target is set
    Object.entries(targets).forEach(([key, value]) => {
      if (value !== '' && value !== null && value > 0) {
        hasAtLeastOneTarget = true;
      }
    });

    if (!hasAtLeastOneTarget) {
      newErrors.general = 'Please set at least one nutritional target to track your progress.';
    }

    // Validate individual fields
    Object.entries(targets).forEach(([key, value]) => {
      if (value !== '' && value !== null) {
        if (value <= 0) {
          newErrors[key] = 'Value must be greater than 0';
        } else if (value > 10000) {
          newErrors[key] = 'Value seems too high. Please check.';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateTargets()) {
      return;
    }

    setIsSaving(true);
    try {
      // Convert empty strings to null for backend
      const targetsToSave = Object.fromEntries(
        Object.entries(targets).map(([key, value]) => [key, value === '' ? null : value])
      );
      await onSave(targetsToSave);
      onClose();
    } catch (error) {
      console.error('Error saving nutritional targets:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const nutritionFields = [
    { key: 'DailyCalories', label: 'Daily Calories', unit: 'kcal', placeholder: '2000', description: 'Recommended daily calorie intake', max: 10000 },
    { key: 'DailyProtein', label: 'Daily Protein', unit: 'g', placeholder: '50', description: 'Recommended daily protein intake', max: 500 },
    { key: 'DailyCarbs', label: 'Daily Carbohydrates', unit: 'g', placeholder: '250', description: 'Recommended daily carbohydrate intake', max: 1000 },
    { key: 'DailyFat', label: 'Daily Fat', unit: 'g', placeholder: '65', description: 'Recommended daily fat intake', max: 200 },
    { key: 'DailyFiber', label: 'Daily Fiber', unit: 'g', placeholder: '25', description: 'Recommended daily fiber intake', max: 100 },
    { key: 'DailySugar', label: 'Daily Sugar', unit: 'g', placeholder: '50', description: 'Recommended daily sugar intake', max: 200 },
    { key: 'DailySodium', label: 'Daily Sodium', unit: 'mg', placeholder: '2300', description: 'Recommended daily sodium intake', max: 10000 }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/60 backdrop-blur-md overflow-y-auto h-full w-full flex justify-center items-start z-40 px-4 py-6">
      <div className="bg-white/90 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-emerald-100 mt-20">
        {/* Header */}
        <div className="px-8 py-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-blue-50">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-emerald-700">Nutritional Targets</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
            >
              <MdClose className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 overflow-y-auto space-y-6 flex-grow">
          {/* Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <MdInfo className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-semibold text-emerald-700">Set your daily nutritional goals</h3>
            </div>
            <p className="text-sm text-gray-600">
              These targets will be used to track your nutritional progress in the meal planner. 
              You must set at least one target to enable progress tracking.
            </p>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <MdWarning className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700">{errors.general}</span>
              </div>
            </div>
          )}

          {/* Nutritional Fields */}
          <div className="space-y-4">
            {nutritionFields.map(({ key, label, unit, placeholder, description, max }) => (
              <div key={key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {label}
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    value={targets[key]}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    placeholder={placeholder}
                    className={`flex-1 px-4 py-3 bg-white border text-gray-900 placeholder-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                      errors[key] ? 'border-red-300 bg-red-50' : 'border-emerald-200'
                    }`}
                    min="0"
                    max={max}
                    step="0.1"
                  />
                  <span className="text-sm font-medium text-gray-600 min-w-[3rem]">
                    {unit}
                  </span>
                </div>
                {errors[key] && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <MdWarning className="w-3 h-3" />
                    {errors[key]}
                  </p>
                )}
                <p className="text-xs text-gray-500">{description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-emerald-100 bg-gradient-to-r from-emerald-50 to-blue-50">
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <>
                  <MdSave className="w-4 h-4" />
                  Save Targets
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionalTargetsModal; 