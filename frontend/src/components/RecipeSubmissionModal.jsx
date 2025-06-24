import React, { useState } from 'react';
import { authenticatedFetch } from '../utils/apiUtil.js';
import { useAuth } from '../context/AuthContext.jsx';
import InteractiveModal from './InteractiveModal.jsx';
import { MdAddCircleOutline, MdDelete } from 'react-icons/md';

const initialIngredient = { name: '', quantity: '', unit: '' };

function RecipeSubmissionModal({ open, onClose, userId, isLoading, setIsLoading }) {
  const [recipeName, setRecipeName] = useState('');
  const [description, setDescription] = useState('');
  const [recipeImageFile, setRecipeImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [imageUploadError, setImageUploadError] = useState('');
  const [imageUploadSuccessMsg, setImageUploadSuccessMsg] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [mode, setMode] = useState('structured');
  const [ingredients, setIngredients] = useState([{ ...initialIngredient }]);
  const [rawRecipeText, setRawRecipeText] = useState('');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [errorModalTitle, setErrorModalTitle] = useState('');
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [successModalTitle, setSuccessModalTitle] = useState('');
  const [successModalMessage, setSuccessModalMessage] = useState('');

  const auth = useAuth();

  const handleCloseErrorModal = () => setIsErrorModalOpen(false);
  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
    onClose();
  };

  const handleModeChange = (event) => setMode(event.target.value);
  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };
  const handleAddIngredient = () => setIngredients([...ingredients, { ...initialIngredient }]);
  const handleRemoveIngredient = (index) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!recipeName.trim()) {
      setErrorModalTitle("Validation Error");
      setErrorModalMessage("Recipe name is required.");
      setIsErrorModalOpen(true);
      return;
    }

    if (!uploadedImageUrl) {
      setErrorModalTitle("Validation Error");
      setErrorModalMessage("Recipe image is required.");
      setIsErrorModalOpen(true);
      return;
    }

    if (setIsLoading) setIsLoading(true);

    try {
      let recipeData = {
        title: recipeName.trim(),
        description: description.trim(),
        image_url: uploadedImageUrl,
        is_public: isPublic,
        user_id: userId
      };

      if (mode === 'structured') {
        const validIngredients = ingredients.filter(ing => ing.name.trim());
        if (validIngredients.length === 0) {
          setErrorModalTitle("Validation Error");
          setErrorModalMessage("At least one ingredient is required.");
          setIsErrorModalOpen(true);
          return;
        }
        recipeData.ingredients = validIngredients.map(ing => ({
          name: ing.name.trim(),
          quantity: ing.quantity.trim(),
          unit: ing.unit.trim()
        }));
      } else {
        if (!rawRecipeText.trim()) {
          setErrorModalTitle("Validation Error");
          setErrorModalMessage("Recipe text is required.");
          setIsErrorModalOpen(true);
          return;
        }
        recipeData.raw_text = rawRecipeText.trim();
      }

      const response = await authenticatedFetch('/api/recipes', {
        method: 'POST',
        body: JSON.stringify(recipeData)
      }, auth);

      const data = await response.json();

      if (response.ok) {
        setSuccessModalTitle("Success!");
        setSuccessModalMessage("Recipe submitted successfully!");
        setIsSuccessModalOpen(true);
      } else {
        setErrorModalTitle("Submission Failed");
        setErrorModalMessage(`Recipe submission failed: ${data.error || 'Unknown error'}`);
        setIsErrorModalOpen(true);
      }
    } catch (error) {
      setErrorModalTitle("Network Error");
      setErrorModalMessage(`Network error during submission: ${error.message}`);
      setIsErrorModalOpen(true);
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  };

  const handleImageFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setRecipeImageFile(file);
      setImageUploadError('');
      setImageUploadSuccessMsg('');
      setUploadedImageUrl('');
      uploadRecipeImage(file);
    }
  };

  const uploadRecipeImage = async (fileToUpload) => {
    setIsUploadingImage(true);
    setImageUploadError('');
    setImageUploadSuccessMsg('');
    const formData = new FormData();
    formData.append('file', fileToUpload);
    
    try {
      const response = await authenticatedFetch('/api/recipes/upload_image', {
        method: 'POST',
        body: formData
      }, auth);
      
      const data = await response.json();
      if (response.ok) {
        setUploadedImageUrl(data.imageUrl);
        setImageUploadSuccessMsg('Image uploaded successfully!');
      } else {
        setImageUploadError(data.error || 'Image upload failed.');
        setUploadedImageUrl('');
      }
    } catch (error) {
      setImageUploadError('Network error during image upload.');
      setUploadedImageUrl('');
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-white/60 backdrop-blur-md overflow-y-auto h-full w-full flex justify-center items-start z-40 px-4 py-6">
      <div className="bg-white/90 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-emerald-100 mt-20">
        {/* Header */}
        <div className="px-8 py-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-blue-50">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-emerald-700">Add New Recipe</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 overflow-y-auto space-y-6 flex-grow">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-700 border-b border-emerald-100 pb-2">Basic Information</h3>
            
            <div>
              <label htmlFor="recipeName" className="block text-sm font-medium text-gray-700 mb-2">
                Recipe Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="recipeName"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                disabled={isLoading || isUploadingImage}
                className="w-full px-4 py-3 bg-white border border-emerald-200 text-gray-900 placeholder-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 disabled:bg-gray-50 disabled:opacity-75"
                placeholder="Enter recipe name..."
              />
            </div>

            <div>
              <label htmlFor="recipeImageFile" className="block text-sm font-medium text-gray-700 mb-2">
                Recipe Image <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => document.getElementById('recipeImageFileInput').click()}
                  disabled={isLoading || isUploadingImage}
                  className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploadingImage ? 'Uploading...' : 'Choose Image'}
                </button>
                <input
                  type="file"
                  id="recipeImageFileInput"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                  disabled={isLoading || isUploadingImage}
                />
                {uploadedImageUrl && (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-emerald-600 font-medium">Image uploaded</span>
                  </div>
                )}
              </div>
              {imageUploadError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {imageUploadError}
                </div>
              )}
              {imageUploadSuccessMsg && (
                <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">
                  {imageUploadSuccessMsg}
                </div>
              )}
              {uploadedImageUrl && (
                <div className="mt-3">
                  <img
                    src={uploadedImageUrl}
                    alt="Recipe Preview"
                    className="w-full max-h-48 object-contain rounded-lg border border-emerald-200"
                  />
                </div>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white border border-emerald-200 text-gray-900 placeholder-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 disabled:bg-gray-50 disabled:opacity-75"
                placeholder="Describe your recipe..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublicCheckbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-5 w-5 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500 focus:ring-2"
              />
              <label htmlFor="isPublicCheckbox" className="ml-3 text-sm text-gray-700">
                Make this recipe public (visible to everyone)
              </label>
            </div>
          </div>

          {/* Input Mode Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-700 border-b border-emerald-100 pb-2">Recipe Input Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="relative">
                <input
                  type="radio"
                  className="sr-only"
                  name="mode"
                  value="structured"
                  checked={mode === 'structured'}
                  onChange={handleModeChange}
                  disabled={isLoading || isUploadingImage}
                />
                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  mode === 'structured'
                    ? 'border-emerald-500 bg-emerald-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-25'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      mode === 'structured' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                    }`}>
                      {mode === 'structured' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Structured Input</h4>
                      <p className="text-sm text-gray-600">Add ingredients and instructions separately</p>
                    </div>
                  </div>
                </div>
              </label>

              <label className="relative">
                <input
                  type="radio"
                  className="sr-only"
                  name="mode"
                  value="raw"
                  checked={mode === 'raw'}
                  onChange={handleModeChange}
                  disabled={isLoading || isUploadingImage}
                />
                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  mode === 'raw'
                    ? 'border-emerald-500 bg-emerald-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-25'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      mode === 'raw' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                    }`}>
                      {mode === 'raw' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Raw Text Input</h4>
                      <p className="text-sm text-gray-600">Paste your complete recipe text</p>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Structured Input */}
          {mode === 'structured' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-emerald-700 border-b border-emerald-100 pb-2">Ingredients</h3>
              <div className="space-y-3">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="col-span-4">
                      <input
                        type="text"
                        placeholder="Ingredient name"
                        value={ingredient.name}
                        onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="Quantity"
                        value={ingredient.quantity}
                        onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="Unit"
                        value={ingredient.unit}
                        onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      {ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(index)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-all duration-200"
                        >
                          <MdDelete className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="flex items-center space-x-2 px-4 py-2 text-emerald-600 border border-emerald-300 rounded-lg hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200"
                >
                  <MdAddCircleOutline className="w-5 h-5" />
                  <span>Add Ingredient</span>
                </button>
              </div>
            </div>
          )}

          {/* Raw Text Input */}
          {mode === 'raw' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-emerald-700 border-b border-emerald-100 pb-2">Recipe Text</h3>
              <div>
                <label htmlFor="rawRecipeText" className="block text-sm font-medium text-gray-700 mb-2">
                  Paste your complete recipe <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="rawRecipeText"
                  value={rawRecipeText}
                  onChange={(e) => setRawRecipeText(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 bg-white border border-emerald-200 text-gray-900 placeholder-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  placeholder="Paste your complete recipe here, including ingredients, instructions, etc..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-emerald-100 bg-gray-50">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading || isUploadingImage}
              className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Submitting...' : 'Submit Recipe'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Modal */}
      <InteractiveModal
        isOpen={isErrorModalOpen}
        onClose={handleCloseErrorModal}
        title={errorModalTitle}
        message={errorModalMessage}
        iconType="error"
        confirmText="OK"
      />

      {/* Success Modal */}
      <InteractiveModal
        isOpen={isSuccessModalOpen}
        onClose={handleCloseSuccessModal}
        title={successModalTitle}
        message={successModalMessage}
        iconType="success"
        confirmText="OK"
      />
    </div>
  );
}

export default RecipeSubmissionModal;
