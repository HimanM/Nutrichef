import React from 'react';
import { HiOutlineCamera, HiOutlineX, HiOutlineSwitchHorizontal } from 'react-icons/hi';

/**
 * Camera Modal Component
 * Provides a full-screen camera interface for photo capture
 */
const CameraModal = ({ 
    isOpen, 
    onClose, 
    onCapture,
    videoRef,
    canvasRef,
    isCameraLoading,
    cameraError,
    availableCameras = [],
    currentCameraId,
    onSwitchCamera,
    hasMultiple = false
}) => {
    if (!isOpen) return null;

    const handleCapture = async () => {
        try {
            await onCapture();
        } catch (error) {
            console.error('Capture failed:', error);
        }
    };

    const handleSwitchCamera = () => {
        if (availableCameras.length > 1) {
            const currentIndex = availableCameras.findIndex(cam => cam.deviceId === currentCameraId);
            const nextIndex = (currentIndex + 1) % availableCameras.length;
            const nextCamera = availableCameras[nextIndex];
            onSwitchCamera(nextCamera.deviceId);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
            <div className="relative w-full h-full max-w-4xl max-h-screen flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 bg-black bg-opacity-50 text-white">
                    <h3 className="text-lg sm:text-xl font-semibold">Take a Photo</h3>
                    <div className="flex items-center space-x-2">
                        {/* Camera Switch Button */}
                        {hasMultiple && (
                            <button
                                onClick={handleSwitchCamera}
                                disabled={isCameraLoading}
                                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors disabled:opacity-50 touch-manipulation"
                                title="Switch Camera"
                            >
                                <HiOutlineSwitchHorizontal className="w-6 h-6" />
                            </button>
                        )}
                        
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors touch-manipulation"
                            title="Close Camera"
                        >
                            <HiOutlineX className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                
                {/* Camera Error */}
                {cameraError && (
                    <div className="absolute top-20 left-4 right-4 bg-red-600 text-white p-3 rounded-lg z-10">
                        <p className="text-sm text-center">{cameraError}</p>
                    </div>
                )}
                
                {/* Video Container */}
                <div className="flex-1 flex items-center justify-center bg-black">
                    {isCameraLoading ? (
                        <div className="text-white text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                            <p>Starting camera...</p>
                        </div>
                    ) : (
                        <div className="relative w-full h-full flex items-center justify-center">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="max-w-full max-h-full object-contain"
                                style={{ 
                                    transform: currentCameraId && availableCameras.find(cam => 
                                        cam.deviceId === currentCameraId && cam.label.toLowerCase().includes('front')
                                    ) ? 'scaleX(-1)' : 'none' // Mirror front camera
                                }}
                            />
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                            
                            {/* Camera Overlay/Guide */}
                            <div className="absolute inset-0 pointer-events-none">
                                {/* Corner guides */}
                                <div className="absolute top-8 left-8 w-8 h-8 border-l-2 border-t-2 border-white opacity-50"></div>
                                <div className="absolute top-8 right-8 w-8 h-8 border-r-2 border-t-2 border-white opacity-50"></div>
                                <div className="absolute bottom-8 left-8 w-8 h-8 border-l-2 border-b-2 border-white opacity-50"></div>
                                <div className="absolute bottom-8 right-8 w-8 h-8 border-r-2 border-b-2 border-white opacity-50"></div>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Bottom Controls */}
                <div className="flex justify-center items-center p-6 bg-black bg-opacity-50">
                    <div className="flex items-center space-x-8">
                        {/* Cancel Button */}
                        <button
                            onClick={onClose}
                            disabled={isCameraLoading}
                            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                        >
                            Cancel
                        </button>
                        
                        {/* Capture Button */}
                        <button
                            onClick={handleCapture}
                            disabled={isCameraLoading || !!cameraError}
                            className="relative px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px] touch-manipulation"
                        >
                            <HiOutlineCamera className="w-6 h-6 mr-2" />
                            Capture
                        </button>
                        
                        {/* Placeholder for symmetry */}
                        <div className="w-[88px]"></div>
                    </div>
                </div>
                
                {/* Camera Info */}
                {availableCameras.length > 1 && currentCameraId && (
                    <div className="absolute bottom-20 left-4 bg-black bg-opacity-50 text-white p-2 rounded text-xs">
                        {availableCameras.find(cam => cam.deviceId === currentCameraId)?.label || 'Camera'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CameraModal;
