import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { authenticatedFetch } from '../utils/apiUtil.js';
import InteractiveModal from './InteractiveModal';
import { MdDelete, MdAddCircleOutline, MdCloudUpload, MdSend } from 'react-icons/md';

const initialIngredient = { name: '', quantity: '', unit: '' };

function RecipeSubmissionModal({ open, onClose, userId, isLoading, setIsLoading }) {
  const auth = useAuth();
  const [mode, setMode] = useState('structured');
  const [recipeName, setRecipeName] = useState('');
  const [recipeImageFile, setRecipeImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [imageUploadSuccessMsg, setImageUploadSuccessMsg] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [ingredients, setIngredients] = useState([{ ...initialIngredient }]);
  const [preparationTimeMinutes, setPreparationTimeMinutes] = useState('');
  const [cookingTimeMinutes, setCookingTimeMinutes] = useState('');
  const [servings, setServings] = useState('');
  const [rawRecipeText, setRawRecipeText] = useState('');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorModalTitle, setErrorModalTitle] = useState('');
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState('');
  const [successModalMessage, setSuccessModalMessage] = useState('');
  const [isPublic, setIsPublic] = useState(false);

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
    if (ingredients.length > 1) setIngredients(ingredients.filter((_, i) => i !== index));
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
        user_id: userId, Title: recipeName, ImageURL: uploadedImageUrl, Description: description,
        Instructions: instructions, PreparationTimeMinutes: preparationTimeMinutes || null,
        CookingTimeMinutes: cookingTimeMinutes || null, Servings: servings || null, Ingredients: finalIngredients,
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
        method: 'POST', body: JSON.stringify(payload)
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
      setRecipeImageFile(file); setImageUploadError(''); setImageUploadSuccessMsg(''); setUploadedImageUrl('');
      uploadRecipeImage(file);
    }
  };

  const uploadRecipeImage = async (fileToUpload) => {
    setIsUploadingImage(true); setImageUploadError(''); setImageUploadSuccessMsg('');
    const formData = new FormData(); formData.append('file', fileToUpload);
    try {
      const response = await authenticatedFetch('/api/recipes/upload_image', { method: 'POST', body: formData }, auth);
      const data = await response.json();
      if (response.ok) {
        setUploadedImageUrl(data.imageUrl); setImageUploadSuccessMsg('Image uploaded successfully!');
      } else {
        setImageUploadError(data.error || 'Image upload failed.'); setUploadedImageUrl('');
      }
    } catch (error) {
      setImageUploadError('Network error during image upload.'); setUploadedImageUrl('');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const commonInputClassName = "mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-600 disabled:opacity-75";
  const commonLabelClassName = "block text-sm font-medium text-gray-300 mb-0.5";

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-800/30 backdrop-blur-sm overflow-y-auto h-full w-full flex justify-center items-center z-40 px-4 py-6">
      <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 bg-gradient-to-r from-blue-500 to-teal-400">
          <h2 className="text-xl font-semibold text-white">Add New Recipe</h2>
        </div>

        <div className="px-6 py-4 overflow-y-auto space-y-4 flex-grow">
          <div>
            <label htmlFor="recipeName" className={commonLabelClassName}>Recipe Name *</label>
            <input type="text" id="recipeName" value={recipeName} onChange={(e) => setRecipeName(e.target.value)} disabled={isLoading || isUploadingImage} className={commonInputClassName} />
          </div>

          <div>
            <label htmlFor="recipeImageFile" className={`${commonLabelClassName} mb-1`}>Recipe Image *</label>
            <button type="button" onClick={() => document.getElementById('recipeImageFileInput').click()}
              disabled={isLoading || isUploadingImage}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-500 disabled:text-gray-400"
            >
              <MdCloudUpload className="w-5 h-5 mr-2" /> {recipeImageFile ? `Change: ${recipeImageFile.name}` : "Upload Image"}
            </button>
            <input type="file" id="recipeImageFileInput" hidden accept="image/*" onChange={handleImageFileChange} />
            {isUploadingImage && <p className="text-xs text-center mt-1 text-gray-400">Uploading image...</p>}
            {imageUploadError && <p className="text-xs text-red-400 mt-1">{imageUploadError}</p>}
            {imageUploadSuccessMsg && <p className="text-xs text-green-400 mt-1">{imageUploadSuccessMsg}</p>}
            {uploadedImageUrl && !isUploadingImage && (
              <div className="mt-2 text-center">
                <img src={uploadedImageUrl} alt="Recipe Preview" className="max-h-40 max-w-full inline-block rounded border border-gray-700" />
              </div>
            )}
          </div>

          <div>
            <span className={commonLabelClassName}>Input Mode</span>
            <div className="mt-2 flex space-x-2">
              <label className="flex-1">
                <input
                  type="radio"
                  className="sr-only"
                  name="mode"
                  value="structured"
                  checked={mode === 'structured'}
                  onChange={handleModeChange}
                  disabled={isLoading || isUploadingImage}
                />
                <span
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors
                    ${mode === 'structured'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }
                    ${(isLoading || isUploadingImage) ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  Structured Input
                </span>
              </label>
              <label className="flex-1">
                <input
                  type="radio"
                  className="sr-only"
                  name="mode"
                  value="raw"
                  checked={mode === 'raw'}
                  onChange={handleModeChange}
                  disabled={isLoading || isUploadingImage}
                />
                <span
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors
                    ${mode === 'raw'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }
                    ${(isLoading || isUploadingImage) ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  Raw Text Input
                </span>
              </label>
            </div>
          </div>

          <div className="my-3">
            <label htmlFor="isPublicCheckbox" className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="isPublicCheckbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                disabled={isLoading || isUploadingImage}
                className="form-checkbox h-6 w-6 text-blue-500 transition duration-150 ease-in-out rounded border-gray-500 bg-gray-700 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50"
              />
              <span className="ml-3 text-sm text-gray-300">Make this recipe public? (Visible to everyone)</span>
            </label>
          </div>

          {mode === 'structured' && (
            <div className="space-y-3 pt-2 border-t border-gray-700 mt-3">
              <h3 className="text-md font-semibold text-gray-200 col-span-full">Structured Details</h3>
              <div>
                <label htmlFor="description" className={commonLabelClassName}>Description</label>
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={commonInputClassName} />
              </div>
              <div>
                 <label className={commonLabelClassName}>Ingredients</label>
                 {ingredients.map((ing, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center mb-2">
                        <div className="col-span-4"><input type="text" placeholder="Name" value={ing.name} onChange={e => handleIngredientChange(index, 'name', e.target.value)} className={commonInputClassName + " text-sm"} /></div>
                        <div className="col-span-3"><input type="text" placeholder="Quantity" value={ing.quantity} onChange={e => handleIngredientChange(index, 'quantity', e.target.value)} className={commonInputClassName + " text-sm"} /></div>
                        <div className="col-span-3"><input type="text" placeholder="Unit" value={ing.unit} onChange={e => handleIngredientChange(index, 'unit', e.target.value)} className={commonInputClassName + " text-sm"} /></div>
                        <div className="col-span-2 flex justify-end">
                            {ingredients.length > 1 && <button type="button" onClick={() => handleRemoveIngredient(index)} className="p-1 text-red-400 hover:text-red-500"><MdDelete className="w-5 h-5" /></button>}
                        </div>
                    </div>
                 ))}
                 <button type="button" onClick={handleAddIngredient} className="mt-1 px-2 py-1 text-xs border border-blue-500 text-blue-400 hover:bg-blue-700 hover:text-blue-300 rounded flex items-center"><MdAddCircleOutline className="w-5 h-5 mr-1" />Add Ingredient</button>
              </div>
            </div>
          )}

          {mode === 'raw' && (
            <div className="pt-2 border-t border-gray-700 mt-3">
              <h3 className="text-md font-semibold text-gray-200 col-span-full">Raw Text Input</h3>
              <div>
                <label htmlFor="rawRecipeText" className={commonLabelClassName}>Paste your full recipe text here</label>
                <textarea id="rawRecipeText" value={rawRecipeText} onChange={(e) => setRawRecipeText(e.target.value)} rows={10} className={commonInputClassName} placeholder="e.g., Recipe Title: My Awesome Cake&#10;Description: A delicious cake...&#10;Ingredients:&#10;- 2 eggs&#10;...&#10;Instructions:&#10;1. Mix eggs and flour.&#10;..." />
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-gray-800/50 flex justify-end space-x-3">
          <button type="button" onClick={() => { if (!isLoading && !isUploadingImage) onClose();}} disabled={isLoading || isUploadingImage} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-500 border border-gray-500 rounded-md shadow-sm">Cancel</button>
          <button type="button" onClick={handleSubmit}
            disabled={isLoading || isUploadingImage || !recipeName.trim() || !uploadedImageUrl.trim()}
            className="gradient-button px-4 py-2 text-sm font-medium flex items-center disabled:opacity-75"
          >
            <MdSend className="w-5 h-5 mr-2" /> {(isLoading || isUploadingImage) ? 'Processing...' : 'Submit Recipe'}
          </button>
        </div>
      </div>

      <InteractiveModal
        isOpen={isErrorModalOpen}
        onClose={handleCloseErrorModal}
        title={errorModalTitle}
        message={errorModalMessage}
        confirmText="OK"
        onConfirm={handleCloseErrorModal}
        iconType="error"
      />
      <InteractiveModal
        isOpen={isSuccessModalOpen}
        onClose={handleCloseSuccessModal}
        title={successModalTitle}
        message={successModalMessage}
        confirmText="OK"
        onConfirm={handleCloseSuccessModal}
        iconType="success"
      />
    </div>
  );
}

export default RecipeSubmissionModal;
