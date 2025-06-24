import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocation } from 'react-router-dom';
import RequireLoginModal from '../components/auth/RequireLoginModal'; // Tailwind version
import { authenticatedFetch } from '../utils/apiUtil.js';
import { HiOutlineCloudUpload, HiOutlineRefresh } from 'react-icons/hi';

const IngredientClassifier = () => {
    const [classificationMode, setClassificationMode] = useState('ingredient');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [classificationResult, setClassificationResult] = useState(null);
    const [error, setError] = useState(null);
    const [fileName, setFileName] = useState("No file selected.");
    const [showLoginModal, setShowLoginModal] = useState(false);

    const auth = useAuth(); // Get the full auth context
    const { isAuthenticated, currentUser } = auth; // Destructure for convenience
    const location = useLocation();
    const fileInputRef = useRef(null);
    const appName = "NutriChef"; // Placeholder

    useEffect(() => {
        return () => {
            if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
        };
    }, [imagePreviewUrl]);

    const handleImageChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setSelectedImage(file);
            setFileName(file.name);
            if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
            setImagePreviewUrl(URL.createObjectURL(file));
            setClassificationResult(null);
            setError(null);
        } else {
            setSelectedImage(null); setFileName("No file selected.");
            if (imagePreviewUrl) { URL.revokeObjectURL(imagePreviewUrl); setImagePreviewUrl(null); }
        }
    };

    const handleClassify = async () => {
        if (!isAuthenticated) { setShowLoginModal(true); return; }
        if (!selectedImage) { setError("Please upload an image for classification."); return; }

        setIsLoading(true); setClassificationResult(null); setError(null);

        const formData = new FormData();
        formData.append('image', selectedImage);
        formData.append('classification_mode', classificationMode);
        if (currentUser && currentUser.UserID) formData.append('user_id', currentUser.UserID);

        try {
            const response = await authenticatedFetch('/api/classify', { method: 'POST', body: formData }, auth);
            const data = await response.json();

            if (response.ok) {
                setClassificationResult(data);
            } else {
                const errorMsg = data?.nutrition?.error || data?.error || data?.message || 'Classification failed.';
                setError(errorMsg);
                if (data && (data.classification || data.nutrition)) setClassificationResult(data); else setClassificationResult(null);
            }
        } catch (err) {
            console.error("Classification API error:", err);
            setError('An error occurred. Please try again.');
            setClassificationResult(null);
        } finally {
            setIsLoading(false);
        }
    };

    const commonLabelClassName = "block text-sm font-medium text-gray-300 mb-1";

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl text-center mb-3">
                    Ingredient Classifier & Nutrition Lookup
            </h1>
            <p className="text-center text-gray-400 mb-6 max-w-xl mx-auto">
                Upload an image to classify it as an ingredient or a food item and get its nutritional information.
            </p>
            <div className="max-w-3xl mx-auto mb-8 bg-gray-800 p-6 shadow-lg rounded-lg">       
                <div className="space-y-6"> 
                    <fieldset>
                        <legend className={`${commonLabelClassName} text-center`}>Select Classification Type</legend>
                        <div className="mt-2 flex justify-center space-x-4 sm:space-x-6">
                            <label className="inline-flex items-center">
                                <input type="radio" className="form-radio text-blue-400 h-4 w-4 focus:ring-blue-500" name="classificationMode" value="ingredient" checked={classificationMode === 'ingredient'} onChange={(e) => setClassificationMode(e.target.value)} />
                                <span className="ml-2 text-sm text-gray-300">Ingredient</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input type="radio" className="form-radio text-blue-400 h-4 w-4 focus:ring-blue-500" name="classificationMode" value="food" checked={classificationMode === 'food'} onChange={(e) => setClassificationMode(e.target.value)} />
                                <span className="ml-2 text-sm text-gray-300">Food Item</span>
                            </label>
                        </div>
                    </fieldset>

                    <div className="text-center">
                        <input type="file" hidden accept="image/*" onChange={handleImageChange} ref={fileInputRef} id="imageUploadInput"/>
                        <label htmlFor="imageUploadInput" className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <HiOutlineCloudUpload className="h-5 w-5 mr-2" /> Upload Image
                        </label>
                        <p className="text-xs text-gray-400 mt-1">{fileName}</p>
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={handleClassify}
                            disabled={!selectedImage || isLoading}
                            className="gradient-button w-full sm:w-auto inline-flex items-center justify-center disabled:opacity-75"
                        >
                            {isLoading ? <HiOutlineRefresh className="animate-spin h-5 w-5 text-white" /> : null}
                            {isLoading ? 'Classifying...' : 'Classify'}
                        </button>
                    </div>
                </div>
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center my-6 p-4">
                    <HiOutlineRefresh className="animate-spin h-8 w-8 text-blue-400" />
                    <p className="mt-2 text-gray-400">Processing...</p>
                </div>
            )}

            {error && (
                <div className="my-4 p-3 bg-red-700 border border-red-500 text-red-200 rounded-md text-sm">
                    {error}
                </div>
            )}

            {imagePreviewUrl && !isLoading && !error && (
                <div className="max-w-3xl mx-auto mb-8 bg-gray-800 p-6 shadow-lg rounded-lg">
                    <div className="text-center p-2 border-2 border-dashed border-gray-600 rounded-md bg-gray-700">
                        <p className="text-sm font-medium text-gray-300 mb-2">Image Preview:</p>
                        <img src={imagePreviewUrl} alt="Selected preview" className="max-w-full max-h-80 inline-block rounded border border-gray-600" />
                    </div>
                </div>
            )}

            {classificationResult && !isLoading && (
                <div className="max-w-3xl mx-auto mb-8 bg-gray-800 p-6 shadow-lg rounded-lg">
                    <div className="border border-gray-700 rounded-md p-4">
                        <h2 className="text-xl mb-3">Classification & Nutrition</h2>

                        {classificationResult.classification?.allPredictions && classificationResult.classification.allPredictions.length > 0 ? (
                            <p className="text-lg font-medium text-blue-300 mb-1">
                                Food Identified: {classificationResult.classification.allPredictions[0].name} - Confidence: {(classificationResult.classification.allPredictions[0].confidence * 100).toFixed(2)}%
                            </p>
                        ) : (
                            <p className="text-lg font-medium text-blue-300 mb-1">
                                Food Identified: {classificationResult.classification?.finalFoodNameUsed || classificationResult.classification?.imagePredictedFoodName || "N/A"}
                            </p>
                        )}

                        {classificationResult.classification?.allPredictions && classificationResult.classification.allPredictions.length > 1 && (
                            <div className="mt-2">
                                <h3 className="text-md font-medium text-gray-300 mb-1">Other Possible Matches:</h3>
                                {classificationResult.classification.allPredictions.slice(1, 3).map((prediction, index) => (
                                    <p key={index} className="text-sm text-gray-400 mb-0.5">
                                        {prediction.name} - Confidence: {(prediction.confidence * 100).toFixed(2)}%
                                    </p>
                                ))}
                            </div>
                        )}

                        {classificationResult.nutrition && (
                            <div className="mt-4">
                                {classificationResult.nutrition.success && classificationResult.nutrition.matched_item?.description &&
                                 classificationResult.classification?.finalFoodNameUsed?.toLowerCase() !== classificationResult.nutrition.matched_item.description.toLowerCase() &&
                                    <p className="text-sm text-gray-400 italic mb-2">
                                        Nutrition data for: <strong>{classificationResult.nutrition.matched_item.description}</strong> (Matched at {classificationResult.nutrition.matched_item.match_score?.toFixed(0)}%)
                                    </p>
                                }

                                {!classificationResult.nutrition.success && (
                                    <div className="my-2 p-3 bg-red-700 border border-red-500 text-red-200 rounded-md text-sm">
                                        {classificationResult.nutrition.error || "Could not retrieve nutrition information."}
                                    </div>
                                )}
                                {classificationResult.nutrition.success && classificationResult.nutrition.warning && (
                                    <div className="my-2 p-3 bg-yellow-600 border border-yellow-500 text-yellow-100 rounded-md text-sm">
                                        {classificationResult.nutrition.warning}
                                    </div>
                                )}
                                {classificationResult.nutrition.success && Object.keys(classificationResult.nutrition.nutrition || {}).length > 0 && (
                                    <div>
                                        <h3 className="text-md mt-3 mb-1">
                                            Nutritional Information (per 100g/100ml approx.):
                                        </h3>
                                        <ul className="list-disc pl-5 space-y-0.5 text-sm text-gray-300 max-h-48 overflow-y-auto">
                                            {Object.entries(classificationResult.nutrition.nutrition).map(([name, details]) => (
                                               <li key={name}>
                                                   <strong>{name}:</strong> {details.amount} {details.unit}
                                               </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {classificationResult.nutrition.success && Object.keys(classificationResult.nutrition.nutrition || {}).length === 0 && !classificationResult.nutrition.warning && (
                                     <div className="my-2 p-3 bg-blue-700 border border-blue-500 text-blue-200 rounded-md text-sm">
                                        No detailed nutrition data available for this item, but it was successfully identified.
                                     </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
            <RequireLoginModal
              isOpen={showLoginModal}
              onClose={() => setShowLoginModal(false)}
              title="Login Required for Classification"
              redirectState={{ from: location }}
            />
        </div>
    );
};

export default IngredientClassifier;
