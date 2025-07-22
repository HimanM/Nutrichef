import { useState, useRef, useEffect } from 'react';
import { 
    startCameraStream, 
    stopCameraStream, 
    capturePhotoFromVideo, 
    isCameraAvailable,
    getAvailableCameras,
    hasMultipleCameras,
    switchCamera
} from '../utils/cameraUtils';

/**
 * Custom hook for camera functionality
 * Manages camera state, stream, and photo capture
 */
export const useCamera = () => {
    const [showCamera, setShowCamera] = useState(false);
    const [stream, setStream] = useState(null);
    const [isCameraLoading, setIsCameraLoading] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [availableCameras, setAvailableCameras] = useState([]);
    const [currentCameraId, setCurrentCameraId] = useState(null);
    const [hasMultiple, setHasMultiple] = useState(false);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Check for available cameras on mount
    useEffect(() => {
        const checkCameras = async () => {
            try {
                const cameras = await getAvailableCameras();
                setAvailableCameras(cameras);
                
                const multiple = await hasMultipleCameras();
                setHasMultiple(multiple);
            } catch (error) {
                console.warn('Error checking cameras:', error);
            }
        };

        if (isCameraAvailable()) {
            checkCameras();
        }
    }, []);

    // Clean up camera stream on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stopCameraStream(stream);
            }
        };
    }, [stream]);

    /**
     * Start camera with error handling
     */
    const startCamera = async () => {
        if (!isCameraAvailable()) {
            setCameraError('Camera is not available on this device or browser.');
            return;
        }

        setIsCameraLoading(true);
        setCameraError(null);
        
        try {
            const mediaStream = await startCameraStream();
            setStream(mediaStream);
            setShowCamera(true);
            
            // Set video source after a short delay to ensure the video element is rendered
            setTimeout(() => {
                if (videoRef.current && mediaStream) {
                    videoRef.current.srcObject = mediaStream;
                }
            }, 100);
        } catch (err) {
            console.error('Error starting camera:', err);
            setCameraError(err.message);
        } finally {
            setIsCameraLoading(false);
        }
    };

    /**
     * Stop camera and clean up
     */
    const stopCamera = () => {
        if (stream) {
            stopCameraStream(stream);
            setStream(null);
        }
        setShowCamera(false);
        setCameraError(null);
        setCurrentCameraId(null);
    };

    /**
     * Capture photo from video stream
     * @returns {Promise<File>} - Captured image file
     */
    const capturePhoto = async () => {
        try {
            if (!videoRef.current || !canvasRef.current) {
                throw new Error('Camera not ready for capture');
            }

            const file = await capturePhotoFromVideo(videoRef.current, canvasRef.current);
            return file;
        } catch (error) {
            setCameraError(error.message);
            throw error;
        }
    };

    /**
     * Switch to a different camera
     * @param {string} deviceId - Camera device ID
     */
    const switchToCamera = async (deviceId) => {
        if (!deviceId || deviceId === currentCameraId) return;

        setIsCameraLoading(true);
        setCameraError(null);

        try {
            // Stop current stream
            if (stream) {
                stopCameraStream(stream);
            }

            // Start new stream with selected camera
            const newStream = await switchCamera(deviceId);
            setStream(newStream);
            setCurrentCameraId(deviceId);

            // Update video element
            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
            }
        } catch (error) {
            console.error('Error switching camera:', error);
            setCameraError(`Failed to switch camera: ${error.message}`);
            
            // Try to restart with default camera if switch fails
            try {
                const fallbackStream = await startCameraStream();
                setStream(fallbackStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = fallbackStream;
                }
            } catch (fallbackError) {
                console.error('Fallback camera start failed:', fallbackError);
                stopCamera();
            }
        } finally {
            setIsCameraLoading(false);
        }
    };

    return {
        // State
        showCamera,
        stream,
        isCameraLoading,
        cameraError,
        availableCameras,
        currentCameraId,
        hasMultiple,
        
        // Refs
        videoRef,
        canvasRef,
        
        // Methods
        startCamera,
        stopCamera,
        capturePhoto,
        switchToCamera,
        
        // Utilities
        isCameraAvailable: isCameraAvailable()
    };
};
