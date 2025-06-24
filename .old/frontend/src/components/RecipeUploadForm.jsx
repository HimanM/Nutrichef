import React, { useState } from 'react';
import {
    Box, TextField, Button, Typography, IconButton, Grid, Alert, CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const RecipeUploadForm = ({ onUploadSuccess }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [instructions, setInstructions] = useState('');
    const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '' }]);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (name === 'title') setTitle(value);
        else if (name === 'description') setDescription(value);
        else if (name === 'instructions') setInstructions(value);
    };

    const handleIngredientChange = (index, field, value) => {
        const newIngredients = ingredients.map((ing, i) => {
            if (i === index) {
                return { ...ing, [field]: value };
            }
            return ing;
        });
        setIngredients(newIngredients);
    };

    const handleAddIngredient = () => {
        setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
    };

    const handleRemoveIngredient = (index) => {
        const newIngredients = ingredients.filter((_, i) => i !== index);
        setIngredients(newIngredients);
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setInstructions('');
        setIngredients([{ name: '', quantity: '', unit: '' }]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setFeedbackMessage('');
        setIsError(false);

        // Filter out ingredients that don't have a name
        const finalIngredients = ingredients.filter(ing => ing.name.trim() !== '');
        if (finalIngredients.length === 0) {
            setFeedbackMessage('Please add at least one ingredient with a name.');
            setIsError(true);
            setIsLoading(false);
            return;
        }

        const recipeData = {
            title,
            description,
            instructions,
            ingredients: finalIngredients,
            // Optional fields like prepTime, cookTime, servings, imageURL can be added here if form includes them
        };

        try {
            const response = await fetch('/api/recipes/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(recipeData),
            });

            const responseData = await response.json();

            if (response.ok) {
                setFeedbackMessage(responseData.message || 'Recipe uploaded successfully!');
                setIsError(false);
                resetForm();
                if (onUploadSuccess) {
                    onUploadSuccess(responseData.recipe); // Pass new recipe data if needed
                }
            } else {
                setFeedbackMessage(responseData.error || `Upload failed: ${response.statusText}`);
                setIsError(true);
            }
        } catch (error) {
            setFeedbackMessage(`Network or system error: ${error.message}`);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }} className="fade-in">
            <Typography variant="h6" gutterBottom>
                Upload Your Recipe
            </Typography>
            <TextField
                label="Title"
                name="title"
                value={title}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                disabled={isLoading}
            />
            <TextField
                label="Description"
                name="description"
                value={description}
                onChange={handleInputChange}
                fullWidth
                required
                multiline
                rows={3}
                margin="normal"
                disabled={isLoading}
            />
            <TextField
                label="Instructions"
                name="instructions"
                value={instructions}
                onChange={handleInputChange}
                fullWidth
                required
                multiline
                rows={5}
                margin="normal"
                disabled={isLoading}
            />

            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Ingredients
            </Typography>
            {ingredients.map((ingredient, index) => (
                <Grid container spacing={1} key={index} alignItems="center" sx={{ mb: 1 }}>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="Ingredient Name"
                            value={ingredient.name}
                            onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                            fullWidth
                            size="small"
                            disabled={isLoading}
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            label="Quantity"
                            value={ingredient.quantity}
                            onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                            fullWidth
                            size="small"
                            disabled={isLoading}
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            label="Unit"
                            value={ingredient.unit}
                            onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                            fullWidth
                            size="small"
                            disabled={isLoading}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2} sx={{ textAlign: 'right' }}>
                        {ingredients.length > 1 && ( // Only show remove button if more than one ingredient
                            <IconButton onClick={() => handleRemoveIngredient(index)} color="error" disabled={isLoading}>
                                <DeleteIcon />
                            </IconButton>
                        )}
                    </Grid>
                </Grid>
            ))}
            <Button
                type="button"
                onClick={handleAddIngredient}
                variant="outlined"
                size="small"
                sx={{
                    mt: 1,
                    mb: 2,
                    transition: 'background-color 0.3s ease, transform 0.2s ease',
                    '&:hover': {
                        backgroundColor: 'action.hover', // Use theme's action hover color
                        transform: 'scale(1.02)'
                    }
                }}
                disabled={isLoading}
                startIcon={<AddIcon />}
            >
                Add Ingredient
            </Button>

            {feedbackMessage && (
                <Alert severity={isError ? "error" : "success"} sx={{ mt: 2, mb: 2, className: "fade-in" }}> {/* Also fade in alert */}
                    {feedbackMessage}
                </Alert>
            )}

            <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={isLoading}
                sx={{
                    mt: 2,
                    transition: 'background-color 0.3s ease, transform 0.2s ease',
                    '&:hover': {
                        transform: 'scale(1.01)', // Slight scale on hover
                        // backgroundColor: 'primary.dark' is handled by theme's MuiButton override
                    }
                }}
                startIcon={<CloudUploadIcon />}
            >
                {isLoading ? <CircularProgress size={24} /> : 'Upload Recipe'}
            </Button>
        </Box>
    );
};

export default RecipeUploadForm;
