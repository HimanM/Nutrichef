import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Paper, Button, Box, CircularProgress,
    Alert, Card, CardContent, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel
} from '@mui/material'; // Removed TextField, CardMedia; Added Radio components
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
// import '../styles/IngredientClassifier.css'; // CSS Import Removed
import { useAuth } from '../context/AuthContext';
// import { useModal } from '../context/ModalContext'; // Removed
import { useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import RequireLoginModal from '../components/auth/RequireLoginModal'; // Added

const IngredientClassifier = () => {
    const [classificationMode, setClassificationMode] = useState('ingredient'); // Added
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [classificationResult, setClassificationResult] = useState(null);
    const [error, setError] = useState(null);
    const [fileName, setFileName] = useState("No file selected.");
    const [showLoginModal, setShowLoginModal] = useState(false); // Added

    const { isAuthenticated, currentUser } = useAuth();
    // const { showModal } = useModal(); // Removed
    const navigate = useNavigate(); // Still here, might be used elsewhere or for future
    const location = useLocation(); // Added

    useEffect(() => {
        // Clean up the object URL on component unmount or when imagePreviewUrl changes
        return () => {
            if (imagePreviewUrl) {
                URL.revokeObjectURL(imagePreviewUrl);
            }
        };
    }, [imagePreviewUrl]);

    // Removed handleNameChange

    const handleImageChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setSelectedImage(file);
            setFileName(file.name);
            if (imagePreviewUrl) {
                URL.revokeObjectURL(imagePreviewUrl); // Clean up previous preview
            }
            setImagePreviewUrl(URL.createObjectURL(file));
            setClassificationResult(null); // Clear previous results
            setError(null); // Clear previous errors
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

        if (currentUser && currentUser.UserID) { 
            formData.append('user_id', currentUser.UserID);
        } else {
            // This case should ideally not be reached if isAuthenticated is true
            // and currentUser is expected to be populated.
            console.warn('UserID not found in currentUser data for an authenticated user.');
            // Optionally, you might want to prevent classification if UserID is crucial
            // setError("Your user data is incomplete. Please try logging out and back in.");
            // return;
        }

        try {
            const response = await fetch('/api/classify', {
                method: 'POST',
                body: formData, // FormData is correctly used here
            });

            const data = await response.json();

            if (response.ok) {
                // The backend now returns a structured object with 'classification' and 'nutrition' keys.
                // data already contains the parsed JSON object.
                setClassificationResult(data);
                // console.log("Full API Response:", data); // For debugging
            } else {
                // If response is not OK, data might contain an error structure from the backend
                // e.g. { "error": "message" } or the new structure with nutrition.success = false
                const errorMsg = data?.nutrition?.error || data?.error || data?.message || 'Classification failed. Please check the image or try a different one.';
                setError(errorMsg);
                // Set classificationResult to the error structure as well if the backend provides it
                // This helps in displaying specific errors from the nutrition service if applicable
                if (data && (data.classification || data.nutrition)) {
                    setClassificationResult(data);
                } else {
                    setClassificationResult(null);
                }
            }
        } catch (err) {
            console.error("Classification API error:", err);
            setError('An error occurred while classifying the image. Please try again.');
            setClassificationResult(null); // Clear result on generic catch
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 3, mb: 3 }}>
            {/* Paper 1: Title, Intro, and Form */}
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 1.5 }}>
                    Ingredient Classifier & Nutrition Lookup
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 3, maxWidth: '600px', mx: 'auto' }}>
                    Upload an image to classify it as an ingredient or a food item and get its nutritional information.
                </Typography>

                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 /* Removed mb: 3 here as Paper has it */ }}>
                    <FormControl component="fieldset" sx={{ mb: 0, width: '100%', alignItems: 'center' }}>
                        <FormLabel component="legend">Select Classification Type</FormLabel>
                        <RadioGroup
                            row
                            aria-label="classification mode"
                            name="classification-mode"
                            value={classificationMode}
                            onChange={(event) => setClassificationMode(event.target.value)}
                        >
                            <FormControlLabel value="ingredient" control={<Radio />} label="Ingredient" />
                            <FormControlLabel value="food" control={<Radio />} label="Food Item" />
                        </RadioGroup>
                    </FormControl>
                    <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} sx={{ alignSelf: 'flex-start' }}>
                        Upload Image
                        <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{alignSelf: 'center', mt: -1.5}}>{fileName}</Typography> {/* Adjusted margin for closer spacing */}
                    
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleClassify}
                        disabled={!selectedImage || isLoading}
                        sx={{ alignSelf: 'center', minWidth: 180, py: 1.25, px: 2.5 }}
                    >
                        {isLoading ? 'Classifying...' : 'Classify'}
                        {isLoading && <CircularProgress size={20} sx={{ color: 'white', ml: 1 }} />}
                    </Button>
                </Box>
            </Paper> {/* End Paper 1 */}

            {/* Loading and Error moved here, outside specific papers but within Container */}
            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 3 }}>
                    <CircularProgress />
                    <Typography sx={{ml:1}}>Processing...</Typography>
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ my: 2.5, display: 'flex', alignItems: 'center', mb:3 }}>{error}</Alert>
            )}

            {/* Paper 2: Image Preview */}
            {imagePreviewUrl && !isLoading && !error && ( // Only show if no loading/error and preview exists
                <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
                    <Box sx={{ textAlign: 'center', /* Removed mt, mb as Paper handles it */ p: 1, border: '1px dashed', borderColor: 'divider', borderRadius: 2, backgroundColor: 'background.default' }}>
                        <Typography variant="subtitle1" gutterBottom>Image Preview:</Typography>
                        <img src={imagePreviewUrl} alt="Selected preview" style={{ maxWidth: '100%', maxHeight: '350px', marginTop: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
                    </Box>
                </Paper>
            )}

            {/* Paper 3: Classification Result */}
            {classificationResult && !isLoading && (
                <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
                    <Card sx={{ border: 1, borderColor: 'divider', boxShadow: (theme) => theme.shadows[2] /* Card specific styling, mt removed as Paper handles it */ }}>
                        <CardContent sx={{ pt: 2.5, pb: '20px !important' }}>
                            <Typography variant="h6" gutterBottom>Classification & Nutrition</Typography>

                            {/* Classification Details */}
                            <Typography variant="h5" component="div" color="primary.main" sx={{mb:1}}>
                                Food Identified: {classificationResult.classification?.finalFoodNameUsed || classificationResult.classification?.imagePredictedFoodName || "N/A"}
                            </Typography>
                            {classificationResult.classification?.providedFoodName && classificationResult.classification?.providedFoodName !== classificationResult.classification?.finalFoodNameUsed &&
                                <Typography variant="body2" color="text.secondary" sx={{fontStyle: 'italic'}}>
                                    You entered: "{classificationResult.classification.providedFoodName}"
                                </Typography>
                            }
                            {classificationResult.classification?.imagePredictedFoodName && classificationResult.classification?.imagePredictedFoodName !== classificationResult.classification?.finalFoodNameUsed &&
                                <Typography variant="body2" color="text.secondary">
                                    Image classified as: {classificationResult.classification.imagePredictedFoodName}
                                </Typography>
                            }
                            {/* Optional: Display all predictions
                            {classificationResult.classification?.allPredictions && classificationResult.classification.allPredictions.length > 0 && (
                                <Box sx={{mt: 1}}>
                                    <Typography variant="caption" color="text.secondary">Model's top predictions:</Typography>
                                    <Box component="ul" sx={{pl: 2, listStyleType: 'circle', fontSize: '0.8rem'}}>
                                        {classificationResult.classification.allPredictions.map((pred, index) => (
                                            <Typography component="li" variant="caption" key={index}>
                                                {pred.name}: {(pred.confidence * 100).toFixed(1)}%
                                            </Typography>
                                        ))}
                                    </Box>
                                </Box>
                            )} */}

                            {/* Nutrition Information */}
                            {classificationResult.nutrition && (
                                <>
                                    {/* Display nutrition match details if different from finalFoodNameUsed and successful match */}
                                    {classificationResult.nutrition.success && classificationResult.nutrition.matched_item?.description &&
                                     classificationResult.classification?.finalFoodNameUsed?.toLowerCase() !== classificationResult.nutrition.matched_item.description.toLowerCase() &&
                                        <Typography variant="body2" color="text.secondary" sx={{mt:1}}>
                                            Nutrition data for: <strong>{classificationResult.nutrition.matched_item.description}</strong> (Matched at {classificationResult.nutrition.matched_item.match_score?.toFixed(0)}%)
                                        </Typography>
                                    }

                                    {!classificationResult.nutrition.success && (
                                        <Alert severity="error" sx={{mt: 2}}>{classificationResult.nutrition.error || "Could not retrieve nutrition information."}</Alert>
                                    )}
                                    {classificationResult.nutrition.success && classificationResult.nutrition.warning && (
                                        <Alert severity="warning" sx={{mt: 2}}>{classificationResult.nutrition.warning}</Alert>
                                    )}
                                    {classificationResult.nutrition.success && Object.keys(classificationResult.nutrition.nutrition || {}).length > 0 && (
                                        <Box sx={{mt: 2}}>
                                            <Typography variant="body1" color="text.secondary" sx={{fontWeight: 'bold'}}>
                                                Nutritional Information (per 100g/100ml approx.):
                                            </Typography>
                                            <Box component="ul" sx={{ pl: 2.5, mt: 1, listStyleType: 'disc', maxHeight: '200px', overflowY: 'auto' }}>
                                                {Object.entries(classificationResult.nutrition.nutrition).map(([name, details]) => (
                                                   <Typography component="li" variant="body2" key={name} sx={{ pb: 0.5 }}>
                                                       <strong>{name}:</strong> {details.amount} {details.unit}
                                                   </Typography>
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                    {/* Message if nutrition was successful but no detailed data and no specific warning */}
                                    {classificationResult.nutrition.success && Object.keys(classificationResult.nutrition.nutrition || {}).length === 0 && !classificationResult.nutrition.warning && (
                                         <Alert severity="info" sx={{mt: 2}}>No detailed nutrition data available for this item, but it was successfully identified.</Alert>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Paper>
            )}
                <RequireLoginModal
                  isOpen={showLoginModal}
                  onClose={() => setShowLoginModal(false)}
                  title="Login Required for Classification"
                  redirectState={{ from: location }}
                />
            {/* </Paper> This was the end of the original single Paper, now handled by individual Papers */}
        </Container>
    );
};

export default IngredientClassifier;
