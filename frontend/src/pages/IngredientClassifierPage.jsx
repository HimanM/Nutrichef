import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocation } from 'react-router-dom';
import { useConditionalAuth } from '../components/auth/AuthGuard.jsx';
import RequireLoginModal from '../components/auth/RequireLoginModal';
import { authenticatedFetch } from '../utils/apiUtil.js';
import { HiOutlineCloudUpload, HiOutlineCamera, HiOutlineCheckCircle, HiOutlineExclamation } from 'react-icons/hi';
import { SpinnerIcon } from '../components/common/LoadingComponents.jsx';
import { useCamera } from '../hooks/useCamera.js';
import CameraModal from '../components/camera/CameraModal.jsx';

const IngredientClassifierPage = () => {
    const [classificationMode, setClassificationMode] = useState('ingredient');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [classificationResult, setClassificationResult] = useState(null);
    const [error, setError] = useState(null);
    const [fileName, setFileName] = useState("No file selected.");
    const [showLoginModal, setShowLoginModal] = useState(false);

    const auth = useAuth();
    const { currentUser } = auth;
    const { attemptAuthAction, isSessionExpired } = useConditionalAuth();
    const location = useLocation();
    const fileInputRef = useRef(null);

    // Camera functionality
    const {
        showCamera,
        isCameraLoading,
        cameraError,
        availableCameras,
        currentCameraId,
        hasMultiple,
        videoRef,
        canvasRef,
        startCamera,
        stopCamera,
        capturePhoto,
        switchToCamera,
        isCameraAvailable
    } = useCamera();

    // Clean up image preview URL on unmount
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

    // Handle camera photo capture
    const handleCameraCapture = async () => {
        try {
            const file = await capturePhoto();
            setSelectedImage(file);
            setFileName(file.name);
            if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
            setImagePreviewUrl(URL.createObjectURL(file));
            setClassificationResult(null);
            setError(null);
            stopCamera();
        } catch (error) {
            console.error('Camera capture failed:', error);
        }
    };

    const handleClassify = async () => {
        return attemptAuthAction(async () => {
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
        }, () => {
            // Fallback when not authenticated and session hasn't expired
            if (!isSessionExpired) {
                setShowLoginModal(true);
            }
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
            <div className="section-padding">
                <div className="container-modern">
                    {/* Header */}
                    <div className="text-center mb-8 sm:mb-12 animate-fade-in">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 px-4">
                            <span className="gradient-text">Ingredient / Food Classifier</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                            Upload an image to classify it as an ingredient or food item and get nutritional information
                        </p>
                    </div>

                    {/* Main Form */}
                    <div className="card-glass p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 animate-fade-in">
                        <div className="space-y-6 sm:space-y-8">
                            {/* Classification Type Selection */}
                            <div className="text-center">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Select Classification Type</h3>
                                <div className="flex justify-center">
                                    <div className="relative inline-flex items-center bg-gray-100 rounded-full p-1 w-64 sm:w-72">
                                        {/* Background slider */}
                                        <div 
                                            className={`absolute top-1 bottom-1 w-1/2 bg-emerald-500 rounded-full transition-all duration-300 ease-in-out ${
                                                classificationMode === 'ingredient' ? 'left-1' : 'left-1/2'
                                            }`}
                                        />
                                        
                                        {/* Ingredient option */}
                                        <button
                                            type="button"
                                            onClick={() => setClassificationMode('ingredient')}
                                            className={`relative z-10 flex-1 py-2 px-4 text-sm sm:text-base font-medium rounded-full transition-all duration-300 ${
                                                classificationMode === 'ingredient' 
                                                    ? 'text-white' 
                                                    : 'text-gray-600 hover:text-gray-800'
                                            }`}
                                        >
                                            Ingredient
                                        </button>
                                        
                                        {/* Food Item option */}
                                        <button
                                            type="button"
                                            onClick={() => setClassificationMode('food')}
                                            className={`relative z-10 flex-1 py-2 px-4 text-sm sm:text-base font-medium rounded-full transition-all duration-300 ${
                                                classificationMode === 'food' 
                                                    ? 'text-white' 
                                                    : 'text-gray-600 hover:text-gray-800'
                                            }`}
                                        >
                                            Food Item
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* File Upload and Camera */}
                            <div className="text-center space-y-4">
                                <div className={`flex ${isCameraAvailable ? 'flex-col sm:flex-row' : 'justify-center'} gap-4 justify-center items-center`}>
                                    {/* File Upload Button */}
                                    <div>
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
                                            className="cursor-pointer inline-flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 bg-white hover:border-emerald-400 hover:text-emerald-600 transition-all duration-200 w-full sm:w-auto min-h-[44px] touch-manipulation"
                                        >
                                            <HiOutlineCloudUpload className="h-5 w-5 sm:h-6 sm:w-6 mr-2" /> 
                                            Upload Image
                                        </label>
                                    </div>

                                    {/* Camera Button - Only show if camera is available */}
                                    {isCameraAvailable && (
                                        <>
                                            {/* Or Divider */}
                                            <div className="text-gray-400 text-sm font-medium">OR</div>

                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={startCamera}
                                                    disabled={isCameraLoading || showCamera}
                                                    className="cursor-pointer inline-flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 bg-white hover:border-blue-400 hover:text-blue-700 transition-all duration-200 w-full sm:w-auto min-h-[44px] touch-manipulation disabled:opacity-75 disabled:cursor-not-allowed"
                                                >
                                                    {isCameraLoading ? (
                                                        <>
                                                            <SpinnerIcon size="h-5 w-5 sm:h-6 sm:w-6" color="text-white" className="mr-2" />
                                                            Starting Camera...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <HiOutlineCamera className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                                                            Use Camera
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                                
                                {/* Camera Error */}
                                {cameraError && (
                                    <div className="text-red-600 text-sm mt-2">{cameraError}</div>
                                )}
                                
                                {/* Camera Not Available Message */}
                                {!isCameraAvailable && (
                                    <div className="text-gray-500 text-sm mt-2">
                                        Camera not available on this device or browser
                                    </div>
                                )}
                                
                                {/* File Name Display */}
                                <p className="text-xs sm:text-sm text-gray-500 px-4 break-all">{fileName}</p>
                            </div>

                            {/* Classify Button */}
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleClassify}
                                    disabled={!selectedImage || isLoading}
                                    className="btn-primary w-full sm:w-auto min-h-[44px] touch-manipulation disabled:opacity-75 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <SpinnerIcon size="h-5 w-5" color="text-white" className="mr-2" />
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
                            <SpinnerIcon size="h-12 w-12" className="mb-4" />
                            <p className="text-gray-600">Processing your image...</p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="card p-4 sm:p-6 border-red-200 bg-red-50 mb-6 sm:mb-8 animate-fade-in">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center">
                                        <HiOutlineExclamation className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Classification Error</h3>
                                    <p className="text-sm text-red-700 mt-1 break-words">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Image Preview */}
                    {imagePreviewUrl && !isLoading && !error && (
                        <div className="card-glass p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 animate-fade-in">
                            <div className="text-center">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Image Preview</h3>
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-white">
                                    <img 
                                        src={imagePreviewUrl} 
                                        alt="Selected preview" 
                                        className="max-w-full max-h-60 sm:max-h-80 mx-auto rounded-lg shadow-sm" 
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Classification Results */}
                    {classificationResult && !isLoading && (
                        <div className="card-glass p-4 sm:p-6 lg:p-8 animate-fade-in">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Classification & Nutrition Results</h2>

                            {/* Classification Results */}
                            {classificationResult.classification?.allPredictions && classificationResult.classification.allPredictions.length > 0 ? (
                                <div className="mb-4 sm:mb-6">
                                    <div className="flex items-center mb-2">
                                        <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" />
                                        <p className="text-base sm:text-lg font-semibold text-emerald-700 break-words">
                                            Food Identified: {classificationResult.classification.allPredictions[0].name}
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-600 ml-7">
                                        Confidence: {(classificationResult.classification.allPredictions[0].confidence * 100).toFixed(2)}%
                                    </p>
                                </div>
                            ) : (
                                <div className="mb-4 sm:mb-6">
                                    <p className="text-base sm:text-lg font-semibold text-emerald-700 break-words">
                                        Food Identified: {classificationResult.classification?.finalFoodNameUsed || classificationResult.classification?.imagePredictedFoodName || "N/A"}
                                    </p>
                                </div>
                            )}

                            {/* Other Possible Matches */}
                            {classificationResult.classification?.allPredictions && classificationResult.classification.allPredictions.length > 1 && (
                                <div className="mb-4 sm:mb-6">
                                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2">Other Possible Matches:</h3>
                                    <div className="space-y-1">
                                        {classificationResult.classification.allPredictions.slice(1, 3).map((prediction, index) => (
                                            <p key={index} className="text-sm text-gray-600 break-words">
                                                {prediction.name} - Confidence: {(prediction.confidence * 100).toFixed(2)}%
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Nutrition Results */}
                            {classificationResult.nutrition && (
                                <div className="mt-4 sm:mt-6">
                                    {classificationResult.nutrition.success && classificationResult.nutrition.matched_item?.description &&
                                     classificationResult.classification?.finalFoodNameUsed?.toLowerCase() !== classificationResult.nutrition.matched_item.description.toLowerCase() && (
                                        <p className="text-sm text-gray-600 italic mb-4 break-words">
                                            Nutrition data for: <strong>{classificationResult.nutrition.matched_item.description}</strong> 
                                            (Matched at {classificationResult.nutrition.matched_item.match_score?.toFixed(0)}%)
                                        </p>
                                    )}

                                    {!classificationResult.nutrition.success && (
                                        <div className="card p-3 sm:p-4 border-red-200 bg-red-50 mb-4">
                                            <p className="text-sm text-red-700 break-words">
                                                {classificationResult.nutrition.error || "Could not retrieve nutrition information."}
                                            </p>
                                        </div>
                                    )}

                                    {classificationResult.nutrition.success && classificationResult.nutrition.warning && (
                                        <div className="card p-3 sm:p-4 border-amber-200 bg-amber-50 mb-4">
                                            <p className="text-sm text-amber-700 break-words">
                                                {classificationResult.nutrition.warning}
                                            </p>
                                        </div>
                                    )}

                                    {classificationResult.nutrition.success && Object.keys(classificationResult.nutrition.nutrition || {}).length > 0 && (
                                        <div>
                                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                                                Nutritional Information (per 100g/100ml approx.)
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                                {Object.entries(classificationResult.nutrition.nutrition).map(([name, details]) => (
                                                    <div key={name} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                                                        <h4 className="font-semibold text-gray-800 text-sm break-words">{name}</h4>
                                                        <p className="text-emerald-600 font-medium text-sm sm:text-base">
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

            {/* Camera Modal */}
            <CameraModal
                isOpen={showCamera}
                onClose={stopCamera}
                onCapture={handleCameraCapture}
                videoRef={videoRef}
                canvasRef={canvasRef}
                isCameraLoading={isCameraLoading}
                cameraError={cameraError}
                availableCameras={availableCameras}
                currentCameraId={currentCameraId}
                onSwitchCamera={switchToCamera}
                hasMultiple={hasMultiple}
            />

            {/* Only show login modal if session hasn't expired (global modal handles expiry) */}
            {!isSessionExpired && (
                <RequireLoginModal
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    title="Login Required"
                    message="You need to be logged in to use the ingredient classifier."
                    redirectState={{ from: location }}
                />
            )}
        </div>
    );
};

export default IngredientClassifierPage;
