import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../../../utils/apiUtil.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import InteractiveModal from '../../ui/InteractiveModal.jsx';
import ResponsiveModal from '../../ui/ResponsiveModal.jsx';
import { MdAddCircleOutline } from 'react-icons/md';
import RecipeSubmissionViews from './RecipeSubmissionViews.jsx';

const initialIngredient = { name: '', quantity: '', unit: '' };

function RecipeSubmissionModal({ open, onClose, userId, isLoading, setIsLoading }) {
  const [recipeName, setRecipeName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [_recipeImageFile, setRecipeImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [imageUploadError, setImageUploadError] = useState('');
  const [imageUploadSuccessMsg, setImageUploadSuccessMsg] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [mode, setMode] = useState('structured');
  const [ingredients, setIngredients] = useState([{ ...initialIngredient }]);
  const [preparationTimeMinutes, setPreparationTimeMinutes] = useState('');
  const [cookingTimeMinutes, setCookingTimeMinutes] = useState('');
  const [servings, setServings] = useState('');
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
    if (successModalTitle === "Success") onClose();
  };

  useEffect(() => {
    if (open) {
      setRecipeName('');
      setRecipeImageFile(null);
      setUploadedImageUrl('');
      setIsUploadingImage(false);
      setImageUploadError('');
      setImageUploadSuccessMsg('');
      setDescription('');
      setInstructions('');
      setIngredients([{ ...initialIngredient }]);
      setPreparationTimeMinutes('');
      setCookingTimeMinutes('');
      setServings('');
      setRawRecipeText('');
      setIsPublic(false);
      if (setIsLoading) setIsLoading(false);
    }
  }, [open, setIsLoading]);

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
    if (setIsLoading) setIsLoading(true);
    if (!recipeName.trim() || !uploadedImageUrl.trim()) {
      setErrorModalTitle("Missing Information");
      setErrorModalMessage('Recipe Name and a successfully uploaded Recipe Image are required.');
      setIsErrorModalOpen(true);
      if (setIsLoading) setIsLoading(false);
      return;
    }

    let payload;
    let endpoint = '/api/recipes/process_submission';

    if (mode === 'structured') {
      const finalIngredients = ingredients.filter(ing => ing.name.trim() || ing.quantity.trim() || ing.unit.trim())
        .map(ing => ({ Ingredient: ing.name, Quantity: ing.quantity, Unit: ing.unit }));
      if (finalIngredients.length === 0) {
        setErrorModalTitle("Missing Information");
        setErrorModalMessage('At least one complete ingredient is required for a structured recipe.');
        setIsErrorModalOpen(true);
        if (setIsLoading) setIsLoading(false);
        return;
      }
      payload = {
        user_id: userId,
        Title: recipeName,
        ImageURL: uploadedImageUrl,
        Description: description,
        Instructions: instructions,
        PreparationTimeMinutes: preparationTimeMinutes || null,
        CookingTimeMinutes: cookingTimeMinutes || null,
        Servings: servings || null,
        Ingredients: finalIngredients,
        is_public: isPublic
      };
    } else {
      if (!rawRecipeText.trim()) {
        setErrorModalTitle("Missing Information");
        setErrorModalMessage('Recipe text is required for raw input.');
        setIsErrorModalOpen(true);
        if (setIsLoading) setIsLoading(false);
        return;
      }
      try {
        const nlpResponse = await authenticatedFetch('/api/nlp/parse_recipe', {
          method: 'POST',
          body: JSON.stringify({ recipe_text: rawRecipeText, userid: userId })
        }, auth);
        const nlpData = await nlpResponse.json();
        if (!nlpResponse.ok) {
          setErrorModalTitle(nlpData.error === "not-a-recipe" ? "Recipe Parsing Failed" : "NLP Error");
          setErrorModalMessage(nlpData.error === "not-a-recipe" ? "The provided text could not be understood as a recipe." : `NLP parsing failed: ${nlpData.error || 'Unknown error.'}`);
          setIsErrorModalOpen(true);
          if (setIsLoading) setIsLoading(false);
          return;
        }
        payload = { ...nlpData, Title: recipeName, ImageURL: uploadedImageUrl, user_id: userId, is_public: isPublic };
      } catch (error) {
        setErrorModalTitle("Network Error");
        setErrorModalMessage(`Error during NLP processing: ${error.message}`);
        setIsErrorModalOpen(true);
        if (setIsLoading) setIsLoading(false);
        return;
      }
    }

    try {
      const response = await authenticatedFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      }, auth);
      const data = await response.json();
      if (response.ok) {
        setSuccessModalTitle("Success");
        setSuccessModalMessage(data.message || 'Recipe submitted successfully!');
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
    } catch {
      setImageUploadError('Network error during image upload.');
      setUploadedImageUrl('');
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <>
      <ResponsiveModal
        isOpen={open}
        onClose={onClose}
        title="Add New Recipe"
        maxWidth="max-w-2xl"
        dragToClose={true}
        desktopClassName="bg-gradient-to-r from-emerald-50 to-blue-50"
      >
        <div className="space-y-6">
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
                className="w-full px-4 py-3 bg-white border border-emerald-200 text-gray-900 placeholder-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 disabled:bg-gray-50 disabled:opacity-75 touch-manipulation"
                placeholder="Enter recipe name..."
              />
            </div>

            <div>
              <label htmlFor="recipeImageFile" className="block text-sm font-medium text-gray-700 mb-2">
                Recipe Image <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => document.getElementById('recipeImageFileInput').click()}
                disabled={isLoading || isUploadingImage}
                className="w-full px-4 py-3 bg-white border-2 border-dashed border-emerald-200 text-gray-900 rounded-lg shadow-sm hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 disabled:bg-gray-50 disabled:opacity-75"
              >
                {isUploadingImage ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
                    <span>Uploading...</span>
                  </div>
                ) : uploadedImageUrl ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Image uploaded successfully!</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Click to upload image</span>
                  </div>
                )}
              </button>
              <input
                id="recipeImageFileInput"
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
                disabled={isLoading || isUploadingImage}
              />
              {imageUploadError && (
                <p className="mt-2 text-sm text-red-600">{imageUploadError}</p>
              )}
              {imageUploadSuccessMsg && (
                <p className="mt-2 text-sm text-emerald-600">{imageUploadSuccessMsg}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipe Visibility
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={isPublic}
                    onChange={() => setIsPublic(true)}
                    disabled={isLoading || isUploadingImage}
                    className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Public</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!isPublic}
                    onChange={() => setIsPublic(false)}
                    disabled={isLoading || isUploadingImage}
                    className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Private</span>
                </label>
              </div>
            </div>
          </div>

          {/* Input Mode Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-700 border-b border-emerald-100 pb-2">Input Method</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Input Method
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="structured"
                    checked={mode === 'structured'}
                    onChange={handleModeChange}
                    disabled={isLoading || isUploadingImage}
                    className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Structured Input (Fill out form fields)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="raw"
                    checked={mode === 'raw'}
                    onChange={handleModeChange}
                    disabled={isLoading || isUploadingImage}
                    className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Raw Text Input (Paste recipe text)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Dynamic Content Based on Mode */}
          {mode === 'structured' ? (
            <div className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-emerald-700 border-b border-emerald-100 pb-2">Recipe Details</h3>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isLoading || isUploadingImage}
                    rows="3"
                    className="w-full px-4 py-3 bg-white border border-emerald-200 text-gray-900 placeholder-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 disabled:bg-gray-50 disabled:opacity-75 touch-manipulation"
                    placeholder="Enter recipe description..."
                  />
                </div>

                <div>
                  <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions
                  </label>
                  <textarea
                    id="instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    disabled={isLoading || isUploadingImage}
                    rows="4"
                    className="w-full px-4 py-3 bg-white border border-emerald-200 text-gray-900 placeholder-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 disabled:bg-gray-50 disabled:opacity-75 touch-manipulation"
                    placeholder="Enter cooking instructions..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="prepTime" className="block text-sm font-medium text-gray-700 mb-2">
                      Prep Time (minutes)
                    </label>
                    <input
                      type="number"
                      id="prepTime"
                      value={preparationTimeMinutes}
                      onChange={(e) => setPreparationTimeMinutes(e.target.value)}
                      disabled={isLoading || isUploadingImage}
                      min="0"
                      className="w-full px-4 py-3 bg-white border border-emerald-200 text-gray-900 placeholder-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 disabled:bg-gray-50 disabled:opacity-75 touch-manipulation"
                      placeholder="30"
                    />
                  </div>

                  <div>
                    <label htmlFor="cookTime" className="block text-sm font-medium text-gray-700 mb-2">
                      Cook Time (minutes)
                    </label>
                    <input
                      type="number"
                      id="cookTime"
                      value={cookingTimeMinutes}
                      onChange={(e) => setCookingTimeMinutes(e.target.value)}
                      disabled={isLoading || isUploadingImage}
                      min="0"
                      className="w-full px-4 py-3 bg-white border border-emerald-200 text-gray-900 placeholder-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 disabled:bg-gray-50 disabled:opacity-75 touch-manipulation"
                      placeholder="45"
                    />
                  </div>

                  <div>
                    <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-2">
                      Servings
                    </label>
                    <input
                      type="number"
                      id="servings"
                      value={servings}
                      onChange={(e) => setServings(e.target.value)}
                      disabled={isLoading || isUploadingImage}
                      min="1"
                      className="w-full px-4 py-3 bg-white border border-emerald-200 text-gray-900 placeholder-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 disabled:bg-gray-50 disabled:opacity-75 touch-manipulation"
                      placeholder="4"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-emerald-700 border-b border-emerald-100 pb-2">Ingredients</h3>

                <RecipeSubmissionViews 
                    ingredients={ingredients}
                    handleIngredientChange={handleIngredientChange}
                    handleRemoveIngredient={handleRemoveIngredient}
                    isLoading={isLoading}
                    isUploadingImage={isUploadingImage}
                />

                <button
                  type="button"
                  onClick={handleAddIngredient}
                  disabled={isLoading || isUploadingImage}
                  className="flex items-center space-x-2 px-4 py-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MdAddCircleOutline className="w-5 h-5" />
                  <span>Add Ingredient</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-emerald-700 border-b border-emerald-100 pb-2">Recipe Text</h3>

              <div>
                <label htmlFor="rawRecipeText" className="block text-sm font-medium text-gray-700 mb-2">
                  Paste Recipe Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="rawRecipeText"
                  value={rawRecipeText}
                  onChange={(e) => setRawRecipeText(e.target.value)}
                  disabled={isLoading || isUploadingImage}
                  rows="8"
                  className="w-full px-4 py-3 bg-white border border-emerald-200 text-gray-900 placeholder-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 disabled:bg-gray-50 disabled:opacity-75 touch-manipulation"
                  placeholder="Paste your recipe text here. The AI will automatically parse ingredients, instructions, and other details..."
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={isLoading || isUploadingImage}
              className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || isUploadingImage || !recipeName.trim() || !uploadedImageUrl}
              className="w-full sm:w-auto px-6 py-3 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                'Submit Recipe'
              )}
            </button>
          </div>
        </div>
      </ResponsiveModal>

      {/* Error Modal */}
      <InteractiveModal
        isOpen={isErrorModalOpen}
        onClose={handleCloseErrorModal}
        title={errorModalTitle}
        message={errorModalMessage}
        iconType="error"
      />

      {/* Success Modal */}
      <InteractiveModal
        isOpen={isSuccessModalOpen}
        onClose={handleCloseSuccessModal}
        title={successModalTitle}
        message={successModalMessage}
        iconType="success"
      />
    </>
  );
}

export default RecipeSubmissionModal;
