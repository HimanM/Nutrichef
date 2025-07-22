import React from 'react';
import { MdDelete } from 'react-icons/md';

const RecipeSubmissionDesktopView = ({ 
    ingredients, 
    handleIngredientChange, 
    handleRemoveIngredient, 
    isLoading, 
    isUploadingImage 
}) => {
    return (
        <div className="space-y-4">
            {ingredients.map((ingredient, index) => (
                <div key={index} className="hidden sm:flex space-x-2">
                    <input
                        type="text"
                        value={ingredient.name}
                        onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                        disabled={isLoading || isUploadingImage}
                        placeholder="Ingredient name"
                        className="flex-1 px-4 py-3 bg-white border border-emerald-200 text-gray-900 placeholder-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 disabled:bg-gray-50 disabled:opacity-75"
                    />
                    <input
                        type="text"
                        value={ingredient.quantity}
                        onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                        disabled={isLoading || isUploadingImage}
                        placeholder="Quantity"
                        className="w-24 px-4 py-3 bg-white border border-emerald-200 text-gray-900 placeholder-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 disabled:bg-gray-50 disabled:opacity-75"
                    />
                    <input
                        type="text"
                        value={ingredient.unit}
                        onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                        disabled={isLoading || isUploadingImage}
                        placeholder="Unit"
                        className="w-24 px-4 py-3 bg-white border border-emerald-200 text-gray-900 placeholder-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 disabled:bg-gray-50 disabled:opacity-75"
                    />
                    <button
                        type="button"
                        onClick={() => handleRemoveIngredient(index)}
                        disabled={isLoading || isUploadingImage || ingredients.length === 1}
                        className="px-3 py-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <MdDelete className="w-5 h-5" />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default RecipeSubmissionDesktopView;
