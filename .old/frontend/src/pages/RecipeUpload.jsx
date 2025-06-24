import React, { useState } from 'react';
import {
    Container, Paper, Typography, TextField, Button, Box, Checkbox, FormControlLabel, CircularProgress
} from '@mui/material'; // Removed Alert
import CloudUploadIcon from '@mui/icons-material/CloudUpload'; // For image upload button
import InteractiveModal from '../components/InteractiveModal.jsx'; // Import InteractiveModal
import { useModal } from '../context/ModalContext.jsx'; // Import useModal

const RecipeUpload = () => {
    const { openModal } = useModal(); // Get openModal from context
    const [recipeName, setRecipeName] = useState('');
    const [recipeDetails, setRecipeDetails] = useState('');
    const [recipeImageFile, setRecipeImageFile] = useState(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState('');
    const [fileName, setFileName] = useState('No file selected.');
    const [isPublic, setIsPublic] = useState(true);

    const [isUploadingImage, setIsUploadingImage] = useState(false);
    // imageUploadError and imageUploadSuccess states will be removed or managed by modal

    const clearImageStates = () => {
        setUploadedImageUrl('');
        // setImageUploadError(''); // Handled by modal
        // setImageUploadSuccess(''); // Handled by modal
        setFileName('No file selected.');
    };

    const uploadImage = async (fileToUpload) => {
        if (!fileToUpload) return;

        setIsUploadingImage(true);
        clearImageStates();
        setFileName(fileToUpload.name);

        const formData = new FormData();
        formData.append('file', fileToUpload);

        try {
            const response = await fetch('/api/recipes/upload_image', { // Ensure this endpoint exists and is configured
                method: 'POST',
                body: formData,
                // Add headers if your backend requires them (e.g., Authorization for protected routes)
            });
            const data = await response.json();
            if (response.ok) {
                setUploadedImageUrl(data.imageUrl);
                openModal('Success', 'Image uploaded successfully!', 'success');
            } else {
                openModal('Error', data.error || 'Image upload failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            openModal('Error', 'Network error or server issue during image upload.', 'error');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleImageChange = (e) => {
        clearImageStates();
        setRecipeImageFile(null);

        const file = e.target.files[0];
        if (file) {
            setRecipeImageFile(file);
            uploadImage(file); // Upload immediately
        } else {
            if (document.getElementById('recipeImageUploadInput')) {
                document.getElementById('recipeImageUploadInput').value = "";
            }
        }
    };

    const clearForm = () => {
        setRecipeName('');
        setRecipeDetails('');
        setRecipeImageFile(null);
        clearImageStates();
        setIsPublic(true);
        if (document.getElementById('recipeImageUploadInput')) {
            document.getElementById('recipeImageUploadInput').value = "";
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (isUploadingImage) {
            openModal('Info', 'Image is currently uploading. Please wait.', 'info');
            return;
        }

        // Check if an image was selected but failed to upload.
        // The previous logic for imageUploadError state is removed,
        // so we rely on uploadedImageUrl not being set if an error occurred.
        if (recipeImageFile && !uploadedImageUrl) {
            openModal('Error', 'There was an error with the image upload. Please try selecting the image again or ensure it uploaded successfully before submitting.', 'error');
            return;
        }

        const recipeData = {
            recipeName,
            recipeDetails,
            ImageURL: uploadedImageUrl,
            isPublic,
        };
        console.log('Recipe Data to be submitted:', recipeData);
        // Simulate submission success
        openModal('Success', 'Recipe data prepared! (Submission to backend not implemented in this UI component).', 'success');

        // clearForm(); // Keep form data for review or clear as preferred
    };

    return (
        <Container maxWidth="md" sx={{ my: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom textAlign="center" sx={{ mb: 3 }}>
                    Upload Your Recipe
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <TextField
                        label="Recipe Name"
                        variant="outlined"
                        fullWidth
                        required
                        value={recipeName}
                        onChange={(e) => setRecipeName(e.target.value)}
                        disabled={isUploadingImage}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Recipe Details (Ingredients & Instructions)"
                        variant="outlined"
                        fullWidth
                        required
                        multiline
                        rows={6}
                        value={recipeDetails}
                        onChange={(e) => setRecipeDetails(e.target.value)}
                        disabled={isUploadingImage}
                        sx={{ mb: 2 }}
                    />

                    <Box sx={{ mb: 2, p: 2, border: '1px dashed grey', borderRadius: 1 }}>
                        <Button
                            component="label"
                            variant="outlined"
                            startIcon={<CloudUploadIcon />}
                            disabled={isUploadingImage}
                            fullWidth
                        >
                            Upload Recipe Image
                            <input
                                type="file"
                                id="recipeImageUploadInput"
                                hidden
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </Button>
                        <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>{fileName}</Typography>
                        {isUploadingImage && (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                <Typography variant="body2" color="textSecondary">Uploading...</Typography>
                            </Box>
                        )}
                        {/* Removed Alert components for imageUploadError and imageUploadSuccess */}

                        {uploadedImageUrl && !isUploadingImage && (
                            <Box sx={{ mt: 2, textAlign: 'center' }}>
                                {/* Typography for "Image Uploaded Successfully!" is now handled by the modal */}
                                <img
                                    src={uploadedImageUrl}
                                    alt="Recipe Preview"
                                    style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </Box>
                        )}
                    </Box>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                disabled={isUploadingImage}
                                color="primary"
                            />
                        }
                        label="Share as Public Recipe"
                        sx={{ mb: 2, display: 'block' }}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={isUploadingImage}
                        size="large"
                        sx={{ py: 1.5 }}
                    >
                        {isUploadingImage ? <CircularProgress size={24} color="inherit" /> : 'Upload Recipe'}
                    </Button>

                    {/* Feedback for overall form submission is now handled by the modal in handleSubmit */}
                </Box>
            </Paper>
            {/* InteractiveModal is rendered globally by ModalProvider, so no need to render it here */}
        </Container>
    );
};

export default RecipeUpload;
