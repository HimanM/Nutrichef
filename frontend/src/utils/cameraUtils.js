/**
 * Camera utility functions for capturing images
 * Handles camera access, permissions, and photo capture
 */

/**
 * Check if camera is available on the device
 * @returns {boolean} - Whether camera is available
 */
export const isCameraAvailable = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

/**
 * Get camera constraints based on device type
 * @returns {object} - Camera constraints object
 */
export const getCameraConstraints = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    return {
        video: {
            width: { 
                ideal: isMobile ? 720 : 1280,
                max: isMobile ? 1280 : 1920
            },
            height: { 
                ideal: isMobile ? 1280 : 720,
                max: isMobile ? 1920 : 1080
            },
            // On mobile devices, prefer environment (back) camera
            facingMode: isMobile ? { ideal: 'environment' } : 'user',
            // Additional mobile-specific constraints
            ...(isMobile && {
                aspectRatio: { ideal: 1.0 }, // Square aspect ratio for better mobile experience
                frameRate: { ideal: 15, max: 30 }, // Lower frame rate for better performance
            })
        },
        audio: false // We only need video for image capture
    };
};

/**
 * Start camera stream with proper error handling
 * @returns {Promise<MediaStream>} - Camera stream
 */
export const startCameraStream = async () => {
    if (!isCameraAvailable()) {
        throw new Error('Camera is not available on this device');
    }

    try {
        // First try with ideal constraints
        const constraints = getCameraConstraints();
        return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (initialError) {
        console.warn('Initial camera access failed, trying fallback constraints:', initialError);
        
        // Fallback constraints for devices with limited camera support
        try {
            const fallbackConstraints = {
                video: {
                    width: { min: 320, ideal: 640, max: 1280 },
                    height: { min: 240, ideal: 480, max: 720 },
                    facingMode: 'environment' // Still prefer back camera
                },
                audio: false
            };
            return await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        } catch (fallbackError) {
            console.warn('Fallback camera access failed, trying basic constraints:', fallbackError);
            
            // Most basic constraints as last resort
            try {
                const basicConstraints = {
                    video: true,
                    audio: false
                };
                return await navigator.mediaDevices.getUserMedia(basicConstraints);
            } catch (basicError) {
                console.error('All camera access attempts failed:', basicError);
                
                // Provide more specific error messages based on the error type
                if (basicError.name === 'NotAllowedError' || basicError.name === 'PermissionDeniedError') {
                    throw new Error('Camera permission denied. Please allow camera access and try again.');
                } else if (basicError.name === 'NotFoundError' || basicError.name === 'DevicesNotFoundError') {
                    throw new Error('No camera found on this device.');
                } else if (basicError.name === 'NotReadableError' || basicError.name === 'TrackStartError') {
                    throw new Error('Camera is being used by another application. Please close other camera apps and try again.');
                } else if (basicError.name === 'OverconstrainedError' || basicError.name === 'ConstraintNotSatisfiedError') {
                    throw new Error('Camera does not support the required settings.');
                } else if (basicError.name === 'NotSupportedError') {
                    throw new Error('Camera is not supported on this device or browser.');
                } else if (basicError.name === 'AbortError') {
                    throw new Error('Camera access was aborted.');
                } else {
                    throw new Error(`Camera access failed: ${basicError.message || 'Unknown error'}`);
                }
            }
        }
    }
};

/**
 * Stop camera stream and clean up resources
 * @param {MediaStream} stream - The camera stream to stop
 */
export const stopCameraStream = (stream) => {
    if (stream) {
        stream.getTracks().forEach(track => {
            track.stop();
        });
    }
};

/**
 * Capture photo from video element
 * @param {HTMLVideoElement} videoElement - Video element displaying camera feed
 * @param {HTMLCanvasElement} canvasElement - Canvas element for image processing
 * @param {number} quality - JPEG quality (0-1), default 0.8
 * @returns {Promise<File>} - Captured image as File object
 */
export const capturePhotoFromVideo = (videoElement, canvasElement, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        try {
            if (!videoElement || !canvasElement) {
                reject(new Error('Video or canvas element not available'));
                return;
            }

            if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
                reject(new Error('Video not ready for capture'));
                return;
            }

            const context = canvasElement.getContext('2d');
            if (!context) {
                reject(new Error('Unable to get canvas context'));
                return;
            }

            // Set canvas dimensions to match video
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;

            // Draw video frame to canvas
            context.drawImage(videoElement, 0, 0);

            // Convert canvas to blob
            canvasElement.toBlob((blob) => {
                if (blob) {
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const file = new File([blob], `camera-capture-${timestamp}.jpg`, { 
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });
                    resolve(file);
                } else {
                    reject(new Error('Failed to create image from canvas'));
                }
            }, 'image/jpeg', quality);
        } catch (error) {
            reject(new Error(`Photo capture failed: ${error.message}`));
        }
    });
};

/**
 * Get list of available cameras
 * @returns {Promise<Array>} - Array of camera devices
 */
export const getAvailableCameras = async () => {
    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            return [];
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter(device => device.kind === 'videoinput');
    } catch (error) {
        console.warn('Failed to enumerate cameras:', error);
        return [];
    }
};

/**
 * Switch to a specific camera
 * @param {string} deviceId - Camera device ID
 * @returns {Promise<MediaStream>} - Camera stream
 */
export const switchCamera = async (deviceId) => {
    const constraints = {
        video: {
            deviceId: { exact: deviceId },
            width: { ideal: 1280 },
            height: { ideal: 720 }
        },
        audio: false
    };

    return await navigator.mediaDevices.getUserMedia(constraints);
};

/**
 * Check if device has multiple cameras
 * @returns {Promise<boolean>} - Whether device has multiple cameras
 */
export const hasMultipleCameras = async () => {
    const cameras = await getAvailableCameras();
    return cameras.length > 1;
};
