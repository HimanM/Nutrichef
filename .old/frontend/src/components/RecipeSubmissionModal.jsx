import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Tabs,
  Tab,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  FormControl,
  FormLabel,
  Grid, // Added
  IconButton // Added
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'; // Added
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload'; // For image upload
import SendIcon from '@mui/icons-material/Send'; // For final submission
import InteractiveModal from './InteractiveModal'; // Added

const initialIngredient = { name: '', quantity: '', unit: '' };

// Changed props to include isLoading and setIsLoading
function RecipeSubmissionModal({ open, onClose, userId, isLoading, setIsLoading }) {
  const [mode, setMode] = useState('structured'); // 'structured' or 'raw'
  const [recipeName, setRecipeName] = useState('');
  // const [recipeImageUrl, setRecipeImageUrl] = useState(''); // Replaced by uploadedImageUrl

  // New states for direct image file upload
  const [recipeImageFile, setRecipeImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(''); // URL from backend
  const [isUploadingImage, setIsUploadingImage] = useState(false); // Specific to image upload step
  const [imageUploadError, setImageUploadError] = useState('');
  const [imageUploadSuccessMsg, setImageUploadSuccessMsg] = useState('');

  // State for structured form
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [ingredients, setIngredients] = useState([{ ...initialIngredient }]); // Initialized with one empty ingredient
  const [preparationTimeMinutes, setPreparationTimeMinutes] = useState('');
  const [cookingTimeMinutes, setCookingTimeMinutes] = useState('');
  const [servings, setServings] = useState('');

  // State for raw text input
  const [rawRecipeText, setRawRecipeText] = useState('');

  // State for error modal
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorModalTitle, setErrorModalTitle] = useState('');
  const [errorModalMessage, setErrorModalMessage] = useState('');

  // State for success modal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState('');
  const [successModalMessage, setSuccessModalMessage] = useState('');

  const handleCloseErrorModal = () => {
    setIsErrorModalOpen(false);
  };

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
    // If the success was a final submission, close the main modal as well.
    if (successModalTitle === "Success") {
      onClose(); // This is the onClose prop for RecipeSubmissionModal itself
    }
  };

  // Reset form fields when modal opens
  useEffect(() => {
    if (open) {
      setRecipeName('');
      // setRecipeImageUrl(''); // Old state
      // Reset new image states
      setRecipeImageFile(null);
      setUploadedImageUrl('');
      setIsUploadingImage(false);
      setImageUploadError('');
      setImageUploadSuccessMsg('');
      // Reset structured form fields
      setDescription('');
      setInstructions('');
      setIngredients([{ ...initialIngredient }]);
      setPreparationTimeMinutes('');
      setCookingTimeMinutes('');
      setServings('');
      // Reset raw text form field
      setRawRecipeText('');
      if (setIsLoading) setIsLoading(false); // Reset global loading state when modal opens/resets
      // setMode('structured'); // Optionally reset mode, or let it persist
    }
  }, [open, setIsLoading]); // Added setIsLoading to dependency array

  const handleModeChange = (event, newMode) => {
    if (newMode) {
      setMode(newMode);
    }
  };

  const handleRadioModeChange = (event) => {
    setMode(event.target.value);
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { ...initialIngredient }]);
  };

  const handleRemoveIngredient = (index) => {
    if (ingredients.length > 1) { // Ensure at least one ingredient row remains
      const newIngredients = ingredients.filter((_, i) => i !== index);
      setIngredients(newIngredients);
    }
  };

  const handleSubmit = async () => { // Made handleSubmit async
    // Set global loading state at the beginning of submission attempt
    if (setIsLoading) setIsLoading(true);

    // Mandatory fields check for main form submission
    if (!recipeName.trim() || !uploadedImageUrl.trim()) {
      setErrorModalTitle("Missing Information");
      setErrorModalMessage('Recipe Name and a successfully uploaded Recipe Image are required to submit.');
      setIsErrorModalOpen(true);
      if (setIsLoading) setIsLoading(false); // Reset global loading state
      return;
    }

    // Payload construction will now be more specific to the mode's needs

    if (mode === 'structured') {
      // Filter out incomplete ingredients before submission
      const finalIngredients = ingredients.filter(
        (ing) => ing.name.trim() !== '' || ing.quantity.trim() !== '' || ing.unit.trim() !== ''
      ).map(ing => ({
        Ingredient: ing.name,
        Quantity: ing.quantity,
        Unit: ing.unit
      }));

      if (finalIngredients.length === 0) {
        setErrorModalTitle("Missing Information");
        setErrorModalMessage('At least one complete ingredient is required for a structured recipe.');
        setIsErrorModalOpen(true);
        if (setIsLoading) setIsLoading(false);
        return;
      }

      const structuredPayload = {
        user_id: userId,
        Title: recipeName,
        ImageURL: uploadedImageUrl, // Use the URL from successful image upload
        Description: description,
        Instructions: instructions,
        PreparationTimeMinutes: preparationTimeMinutes || null,
        CookingTimeMinutes: cookingTimeMinutes || null,
        Servings: servings || null,
        Ingredients: finalIngredients,
      };
      console.log('Submitting structured recipe (to /api/recipes/process_submission):', structuredPayload);

      try {
        const response = await fetch('/api/recipes/process_submission', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(structuredPayload)
        });
        const data = await response.json();
        if (response.ok) {
            setSuccessModalTitle("Success");
            setSuccessModalMessage('Recipe submitted successfully!');
            setIsSuccessModalOpen(true);
            // onClose(); // Main modal closing is now handled by handleCloseSuccessModal
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
          if (setIsLoading) setIsLoading(false); // Reset global loading state
      }

    } else { // mode === 'raw'
      // recipeName and uploadedImageUrl are already validated at the start of handleSubmit
      if (!rawRecipeText.trim()) {
        setErrorModalTitle("Missing Information");
        setErrorModalMessage('Recipe text is required for raw input.');
        setIsErrorModalOpen(true);
        if (setIsLoading) setIsLoading(false); // Reset global loading state
        return;
      }

      const nlpPayload = {
          recipe_text: rawRecipeText,
          userid: userId
      };

      console.log('Sending to NLP service (/api/nlp/parse_recipe):', nlpPayload);
      // Note: recipeName and recipeImageUrl are captured from modal state at the top level.

      // isLoading is already true from the start of handleSubmit
      try {
        const nlpResponse = await fetch('/api/nlp/parse_recipe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nlpPayload)
        });
        const nlpData = await nlpResponse.json();

        if (!nlpResponse.ok) {
            // Handle specific "not-a-recipe" error from NLP
            if (nlpData.error && nlpData.error === "not-a-recipe") {
                setErrorModalTitle("Recipe Parsing Failed");
                setErrorModalMessage("The provided text could not be understood as a recipe.");
                setIsErrorModalOpen(true);
            } else {
                // Handle other NLP errors
                console.error('NLP parsing failed:', nlpData);
                setErrorModalTitle("NLP Error");
                setErrorModalMessage(`NLP parsing failed: ${nlpData.error || 'Unknown error during NLP parsing.'}`);
                setIsErrorModalOpen(true);
            }
            if (setIsLoading) setIsLoading(false); // Stop loading and return
            return;
        }

        console.log('NLP parsing successful:', nlpData);

        // Prepare data for final submission to /api/recipes/process_submission
        const finalPayload = {
            ...nlpData, // Spread the data from NLP (contains parsed ingredients, instructions etc.)
            Title: recipeName, // Prioritize user-entered name
            ImageURL: uploadedImageUrl, // Use the URL from successful image upload
            user_id: userId // Ensure userId is included
        };

        console.log('Submitting NLP-processed data to /api/recipes/process_submission:', finalPayload);

        const processResponse = await fetch('/api/recipes/process_submission', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalPayload)
        });
        const processData = await processResponse.json();

        if (processResponse.ok) {
            setSuccessModalTitle("Success");
            setSuccessModalMessage("Recipe submitted successfully via raw text processing!");
            setIsSuccessModalOpen(true);
            // onClose(); // Main modal closing is now handled by handleCloseSuccessModal
        } else {
            setErrorModalTitle("Submission Failed");
            setErrorModalMessage(`Recipe submission failed after NLP processing: ${processData.error || 'Unknown error'}`);
            setIsErrorModalOpen(true);
        }

      } catch (error) { // Catches network errors for both fetch calls if one fails before the other
          console.error('Network or system error during raw submission process:', error);
          setErrorModalTitle("Network Error");
          setErrorModalMessage(`Network error during raw submission: ${error.message}`);
          setIsErrorModalOpen(true);
      } finally {
          if (setIsLoading) setIsLoading(false); // Reset global loading state in all cases for raw mode
      }
    }
  };

  const handleImageFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setRecipeImageFile(file);
      setImageUploadError('');
      setImageUploadSuccessMsg('');
      setUploadedImageUrl(''); // Clear previous URL if new file is selected
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
      const response = await fetch('/api/recipes/upload_image', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setUploadedImageUrl(data.imageUrl);
        setImageUploadSuccessMsg('Image uploaded successfully!');
      } else {
        setImageUploadError(data.error || 'Image upload failed.');
        setUploadedImageUrl(''); // Clear URL on error
      }
    } catch (error) {
      console.error('Image upload error:', error);
      setImageUploadError('Network error or server issue during image upload.');
      setUploadedImageUrl('');
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    // Ensure onClose also resets global loading state if modal is dismissed manually while loading
    <Dialog
        open={open}
        onClose={() => {
            if ((isLoading || isUploadingImage) && setIsLoading) { // If any loading and closing modal manually
                setIsLoading(false); // Turn off global loader
            }
            if(isUploadingImage) setIsUploadingImage(false); // Also turn off local image loader
            onClose(); // Call original onClose
        }}
        maxWidth="md"
        fullWidth
    >
      <DialogTitle>Add New Recipe</DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        <TextField
            autoFocus
            required
            margin="dense"
            id="recipeName"
            label="Recipe Name"
            type="text"
            fullWidth
            variant="outlined"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            disabled={isLoading || isUploadingImage}
            sx={{ mb: 2 }}
        />

        {/* Image Upload Section */}
        <Box sx={{ mb: 2, mt:1 }}>
            <Button
                variant="outlined"
                component="label"
                fullWidth
                disabled={isLoading || isUploadingImage}
                sx={{ textTransform: 'none' }} // Prevent uppercase text
                startIcon={<CloudUploadIcon />}
            >
                {recipeImageFile ? `Change Image: ${recipeImageFile.name}` : "Upload Recipe Image *"}
                <input type="file" hidden accept="image/*" onChange={handleImageFileChange} />
            </Button>
            {isUploadingImage && <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>Uploading image...</Typography>}
            {imageUploadError && <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>{imageUploadError}</Typography>}
            {imageUploadSuccessMsg && <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>{imageUploadSuccessMsg}</Typography>}
            {uploadedImageUrl && !isUploadingImage && (
                <Box sx={{ mt: 1, textAlign: 'center' }}>
                    <img src={uploadedImageUrl} alt="Recipe Preview" style={{ maxHeight: '150px', maxWidth: '100%', borderRadius: '4px', border: '1px solid #ddd' }} />
                </Box>
            )}
        </Box>

        <FormControl component="fieldset" sx={{ mb: 2 }} disabled={isLoading || isUploadingImage}> {/* Mode Selection */}
          <FormLabel component="legend">Input Mode</FormLabel>
          <RadioGroup row aria-label="input-mode" name="input-mode" value={mode} onChange={handleRadioModeChange}>
            <FormControlLabel value="structured" control={<Radio />} label="Structured Input" />
            <FormControlLabel value="raw" control={<Radio />} label="Raw Text Input" />
          </RadioGroup>
        </FormControl>

        {/* Alternative using Tabs:
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={mode} onChange={handleModeChange} aria-label="input mode tabs">
            <Tab label="Structured Input" value="structured" />
            <Tab label="Raw Text Input" value="raw" />
          </Tabs>
        </Box>
        */}

        {mode === 'structured' && (
          <Box id="structured-input-section" sx={{ pt: 1 }}> {/* Adjusted padding */}
            <TextField
              label="Description"
              multiline
              rows={3}
              fullWidth
              variant="outlined"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Instructions"
              multiline
              rows={5}
              fullWidth
              variant="outlined"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'medium' }}>Ingredients</Typography> {/* Changed to subtitle1 and bold */}
            {ingredients.map((ingredient, index) => (
              <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 1.5 }}> {/* Increased bottom margin */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Name"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                  />
                </Grid>
                <Grid item xs={5} sm={3}> {/* Adjusted xs for quantity */}
                  <TextField
                    label="Quantity"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={ingredient.quantity}
                    onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                  />
                </Grid>
                <Grid item xs={5} sm={3}> {/* Adjusted xs for unit */}
                  <TextField
                    label="Unit"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                  />
                </Grid>
                <Grid item xs={2} sm={2} sx={{ textAlign: 'right' }}> {/* Adjusted alignment for remove button */}
                  {ingredients.length > 1 && (
                    <IconButton onClick={() => handleRemoveIngredient(index)} aria-label="delete ingredient" size="small">
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Grid>
              </Grid>
            ))}
            <Button
              variant="outlined"
              size="small"
              onClick={handleAddIngredient}
              sx={{ mt: 0.5, mb: 2.5 }} // Adjusted margins
              startIcon={<AddIcon />}
            >
              Add Ingredient
            </Button>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Prep Time (mins)"
                  type="number" // Use number type for numeric inputs
                  fullWidth
                  variant="outlined"
                  value={preparationTimeMinutes}
                  onChange={(e) => setPreparationTimeMinutes(e.target.value)}
                  InputProps={{ inputProps: { min: 0 } }} // Basic validation
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Cook Time (mins)"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={cookingTimeMinutes}
                  onChange={(e) => setCookingTimeMinutes(e.target.value)}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Servings"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  InputProps={{ inputProps: { min: 1 } }} // Servings usually start from 1
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {mode === 'raw' && (
          <Box id="raw-input-section" sx={{ pt: 1 }}> {/* Adjusted padding */}
            <TextField
              label="Paste your full recipe text here"
              multiline
              rows={15}
              fullWidth
              variant="outlined"
              value={rawRecipeText}
              onChange={(e) => setRawRecipeText(e.target.value)}
              placeholder="e.g., Recipe Title: My Awesome Cake&#10;Description: A delicious cake...&#10;Ingredients:&#10;- 2 eggs&#10;- 1 cup flour&#10;...&#10;Instructions:&#10;1. Mix eggs and flour.&#10;2. Bake at 350F."
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}> {/* Standard MUI Dialog padding */}
        <Button onClick={onClose} disabled={isLoading || isUploadingImage}>Cancel</Button>
        <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary" // Ensure primary color is used
            disabled={isLoading || isUploadingImage || !recipeName.trim() || !uploadedImageUrl.trim()} // Also disable if required fields for submission are missing
            startIcon={<SendIcon />}
        >
          {(isLoading || isUploadingImage) ? 'Processing...' : 'Submit Recipe'}
        </Button>
      </DialogActions>

      <InteractiveModal
        open={isErrorModalOpen}
        onClose={handleCloseErrorModal}
        title={errorModalTitle}
        message={errorModalMessage}
        modalType="alert"
        iconType="error"
      />

      <InteractiveModal
        open={isSuccessModalOpen}
        onClose={handleCloseSuccessModal}
        title={successModalTitle}
        message={successModalMessage}
        modalType="alert"
        iconType="success"
      />
    </Dialog>
  );
}

export default RecipeSubmissionModal;
