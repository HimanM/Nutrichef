import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocation } from 'react-router-dom';
import RequireLoginModal from '../components/auth/RequireLoginModal';
import { authenticatedFetch } from '../utils/apiUtil.js';
import { HiOutlineCloudUpload, HiOutlineRefresh, HiOutlineCamera, HiOutlineCheckCircle, HiOutlineExclamation } from 'react-icons/hi';

const IngredientClassifier = () => {
    const [classificationMode, setClassificationMode] = useState('ingredient');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [classificationResult, setClassificationResult] = useState(null);
    const [error, setError] = useState(null);
    const [fileName, setFileName] = useState("No file selected.");
    const [showLoginModal, setShowLoginModal] = useState(false);

    const auth = useAuth();
    const { isAuthenticated, currentUser } = auth;
    const location = useLocation();
    const fileInputRef = useRef(null);
    const appName = "NutriChef";

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
            setSelectedImage(null); 
            setFileName("No file selected.");
            if (imagePreviewUrl) { 
                URL.revokeObjectURL(imagePreviewUrl); 
                setImagePreviewUrl(null); 
            }
        }
    };

    const handleClassify = async () => {
        if (!isAuthenticated) { 
            setShowLoginModal(true); 
            return; 
        }
        if (!selectedImage) { 
            setError("Please upload an image for classification."); 
            return; 
        }

        setIsLoading(true); 
        setClassificationResult(null); 
        setError(null);

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
                if (data && (data.classification || data.nutrition)) setClassificationResult(data); 
                else setClassificationResult(null);
            }
        } catch (err) {
            console.error("Classification API error:", err);
            setError('An error occurred. Please try again.');
            setClassificationResult(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
            <div className="section-padding">
                <div className="container-modern">
                    {/* Header */}
                    <div className="text-center mb-12 animate-fade-in">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            <span className="gradient-text">Ingredient Classifier</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Upload an image to classify it as an ingredient or food item and get nutritional information
                        </p>
                    </div>

                    {/* Main Form */}
                    <div className="card-glass p-8 mb-8 animate-fade-in">
                        <div className="space-y-8">
                            {/* Classification Type Selection */}
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Classification Type</h3>
                                <div className="flex justify-center space-x-6">
                                    <label className="inline-flex items-center">
                                        <input 
                                            type="radio" 
                                            className="form-radio text-emerald-500 h-4 w-4 focus:ring-emerald-500" 
                                            name="classificationMode" 
                                            value="ingredient" 
                                            checked={classificationMode === 'ingredient'} 
                                            onChange={(e) => setClassificationMode(e.target.value)} 
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Ingredient</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input 
                                            type="radio" 
                                            className="form-radio text-emerald-500 h-4 w-4 focus:ring-emerald-500" 
                                            name="classificationMode" 
                                            value="food" 
                                            checked={classificationMode === 'food'} 
                                            onChange={(e) => setClassificationMode(e.target.value)} 
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Food Item</span>
                                    </label>
                                </div>
                            </div>

                            {/* File Upload */}
                            <div className="text-center">
                                <input 
                                    type="file" 
                                    hidden 
                                    accept="image/*" 
                                    onChange={handleImageChange} 
                                    ref={fileInputRef} 
                                    id="imageUploadInput"
                                />
                                <label 
                                    htmlFor="imageUploadInput" 
                                    className="cursor-pointer inline-flex items-center px-6 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 bg-white hover:border-emerald-400 hover:text-emerald-600 transition-all duration-200"
                                >
                                    <HiOutlineCloudUpload className="h-6 w-6 mr-2" /> 
                                    Upload Image
                                </label>
                                <p className="text-sm text-gray-500 mt-2">{fileName}</p>
                            </div>

                            {/* Classify Button */}
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleClassify}
                                    disabled={!selectedImage || isLoading}
                                    className="btn-primary disabled:opacity-75 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <HiOutlineRefresh className="animate-spin h-5 w-5 mr-2" />
                                            Classifying...
                                        </>
                                    ) : (
                                        <>
                                            <HiOutlineCamera className="h-5 w-5 mr-2" />
                                            Classify
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center my-8">
                            <HiOutlineRefresh className="animate-spin h-12 w-12 text-emerald-500 mb-4" />
                            <p className="text-gray-600">Processing your image...</p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="card p-6 border-red-200 bg-red-50 mb-8 animate-fade-in">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                        <HiOutlineExclamation className="w-5 h-5 text-red-600" />
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Classification Error</h3>
                                    <p className="text-sm text-red-700 mt-1">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Image Preview */}
                    {imagePreviewUrl && !isLoading && !error && (
                        <div className="card-glass p-8 mb-8 animate-fade-in">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Image Preview</h3>
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-white">
                                    <img 
                                        src={imagePreviewUrl} 
                                        alt="Selected preview" 
                                        className="max-w-full max-h-80 mx-auto rounded-lg shadow-sm" 
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Classification Results */}
                    {classificationResult && !isLoading && (
                        <div className="card-glass p-8 animate-fade-in">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Classification & Nutrition Results</h2>

                            {/* Classification Results */}
                            {classificationResult.classification?.allPredictions && classificationResult.classification.allPredictions.length > 0 ? (
                                <div className="mb-6">
                                    <div className="flex items-center mb-2">
                                        <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500 mr-2" />
                                        <p className="text-lg font-semibold text-emerald-700">
                                            Food Identified: {classificationResult.classification.allPredictions[0].name}
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Confidence: {(classificationResult.classification.allPredictions[0].confidence * 100).toFixed(2)}%
                                    </p>
                                </div>
                            ) : (
                                <div className="mb-6">
                                    <p className="text-lg font-semibold text-emerald-700">
                                        Food Identified: {classificationResult.classification?.finalFoodNameUsed || classificationResult.classification?.imagePredictedFoodName || "N/A"}
                                    </p>
                                </div>
                            )}

                            {/* Other Possible Matches */}
                            {classificationResult.classification?.allPredictions && classificationResult.classification.allPredictions.length > 1 && (
                                <div className="mb-6">
                                    <h3 className="text-md font-semibold text-gray-800 mb-2">Other Possible Matches:</h3>
                                    <div className="space-y-1">
                                        {classificationResult.classification.allPredictions.slice(1, 3).map((prediction, index) => (
                                            <p key={index} className="text-sm text-gray-600">
                                                {prediction.name} - Confidence: {(prediction.confidence * 100).toFixed(2)}%
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Nutrition Results */}
                            {classificationResult.nutrition && (
                                <div className="mt-6">
                                    {classificationResult.nutrition.success && classificationResult.nutrition.matched_item?.description &&
                                     classificationResult.classification?.finalFoodNameUsed?.toLowerCase() !== classificationResult.nutrition.matched_item.description.toLowerCase() && (
                                        <p className="text-sm text-gray-600 italic mb-4">
                                            Nutrition data for: <strong>{classificationResult.nutrition.matched_item.description}</strong> 
                                            (Matched at {classificationResult.nutrition.matched_item.match_score?.toFixed(0)}%)
                                        </p>
                                    )}

                                    {!classificationResult.nutrition.success && (
                                        <div className="card p-4 border-red-200 bg-red-50 mb-4">
                                            <p className="text-sm text-red-700">
                                                {classificationResult.nutrition.error || "Could not retrieve nutrition information."}
                                            </p>
                                        </div>
                                    )}

                                    {classificationResult.nutrition.success && classificationResult.nutrition.warning && (
                                        <div className="card p-4 border-amber-200 bg-amber-50 mb-4">
                                            <p className="text-sm text-amber-700">
                                                {classificationResult.nutrition.warning}
                                            </p>
                                        </div>
                                    )}

                                    {classificationResult.nutrition.success && Object.keys(classificationResult.nutrition.nutrition || {}).length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                                Nutritional Information (per 100g/100ml approx.)
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {Object.entries(classificationResult.nutrition.nutrition).map(([name, details]) => (
                                                    <div key={name} className="bg-white border border-gray-200 rounded-lg p-4">
                                                        <h4 className="font-semibold text-gray-800 text-sm">{name}</h4>
                                                        <p className="text-emerald-600 font-medium">
                                                            {details.amount} {details.unit}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <RequireLoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                title="Login Required"
                message="You need to be logged in to use the ingredient classifier."
                redirectState={{ from: location }}
            />
        </div>
    );
};

export default IngredientClassifier;
