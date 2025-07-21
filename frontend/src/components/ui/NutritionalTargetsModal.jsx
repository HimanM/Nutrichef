import React, { useState, useEffect } from 'react';
import { MdClose, MdSave, MdInfo, MdWarning } from 'react-icons/md';
import ResponsiveModal from './ResponsiveModal';

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

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nutritional Targets"
      maxWidth="max-w-3xl"
      dragToClose={true}
      desktopClassName="bg-gradient-to-r from-emerald-50 to-blue-50"
    >
      <div className="space-y-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className={`flex-1 px-4 py-3 bg-white border text-gray-900 placeholder-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 touch-manipulation ${
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-3 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation"
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
    </ResponsiveModal>
  );
};

export default NutritionalTargetsModal; 