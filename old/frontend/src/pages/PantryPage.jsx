import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Container, Box, Typography, TextField, Button, Paper, List, ListItem,
    ListItemText, ListItemSecondaryAction, IconButton, CircularProgress, Alert, Divider, Grid
} from '@mui/material';
import { useModal } from '../context/ModalContext'; // Import useModal
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

function PantryPage() {
    const { showModal } = useModal(); // Initialize useModal
    const [pantryItems, setPantryItems] = useState([]);
    const [listIsLoading, setListIsLoading] = useState(false); // For loading the pantry list
    const [formIsLoading, setFormIsLoading] = useState(false); // For add/update/delete operations
    const [error, setError] = useState('');
    const { isAuthenticated, loading: authLoading, token, showExpiryMessageAndLogout } = useAuth();

    const [newItemName, setNewItemName] = useState('');
    const [newItemQuantity, setNewItemQuantity] = useState('');
    const [newItemUnit, setNewItemUnit] = useState('');

    const [editingItemId, setEditingItemId] = useState(null);
    const [editQuantity, setEditQuantity] = useState('');
    const [editUnit, setEditUnit] = useState('');

    const fetchPantryItems = useCallback(async () => {
        if (!isAuthenticated || !token) return;
        setListIsLoading(true);
        setError('');
        try {
            const response = await fetch('/api/pantry', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 401) {
                showExpiryMessageAndLogout("Your session has expired. Please log in again.");
                setPantryItems([]);
                return;
            }
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
                throw new Error(errorData.message || `Failed to fetch pantry items`);
            }
            const items = await response.json();
            setPantryItems(items || []);
        } catch (err) {
            setError(err.message || 'Failed to fetch pantry items.');
            setPantryItems([]);
        } finally {
            setListIsLoading(false);
        }
    }, [isAuthenticated, token, showExpiryMessageAndLogout]);

    useEffect(() => {
        if (isAuthenticated && token) {
            fetchPantryItems();
        }
    }, [fetchPantryItems, isAuthenticated, token]);

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItemName.trim() || !newItemQuantity.trim()) {
            setError('Ingredient name and quantity are required.');
            return;
        }
        setError('');
        setFormIsLoading(true);
        if (!token) {
            setError("Authentication token not found.");
            setFormIsLoading(false);
            return;
        }
        try {
            const payload = {
                ingredient_name: newItemName.trim(),
                quantity: newItemQuantity.trim(),
                unit: newItemUnit.trim()
            };
            const response = await fetch('/api/pantry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (response.status === 401) {
                showExpiryMessageAndLogout("Your session has expired. Please log in again.");
                return;
            }
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
                throw new Error(errorData.message || `Failed to add item`);
            }
            setNewItemName('');
            setNewItemQuantity('');
            setNewItemUnit('');
            fetchPantryItems(); // Refresh list
        } catch (err) {
            setError(err.message || 'Failed to add item.');
        } finally {
            setFormIsLoading(false);
        }
    };

    const handleDeleteItem = async (itemId, itemName) => { // Added itemName
        setError('');
        // Do not setFormIsLoading(true) here, wait for confirmation

        const userConfirmed = await showModal(
            'confirm',
            'Confirm Deletion',
            `Are you sure you want to remove "${itemName || 'this item'}" from your pantry?`
        );

        if (userConfirmed) {
            setFormIsLoading(true); // Set loading state after confirmation, before API call
            if (!token) {
                setError("Authentication token not found.");
                setFormIsLoading(false);
                return;
            }
            try {
                const response = await fetch(`/api/pantry/${itemId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.status === 401) {
                    showExpiryMessageAndLogout("Your session has expired. Please log in again.");
                    return; // Still need to set loading false in finally
                }
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
                    throw new Error(errorData.message || `Failed to delete item`);
                }
                fetchPantryItems(); // Refresh list
            } catch (err) {
                setError(err.message || 'Failed to delete item.');
            } finally {
                setFormIsLoading(false);
            }
        }
        // If user cancels, do nothing, formIsLoading remains false (or its previous state)
    };

    const startEditItem = (item) => {
        setEditingItemId(item.UserPantryIngredientID);
        setEditQuantity(item.Quantity);
        setEditUnit(item.Unit || '');
        setError('');
    };

    const cancelEdit = () => {
        setEditingItemId(null);
        setError('');
    };

    const handleUpdateItem = async (itemId) => {
        if (!editQuantity.trim()) {
            setError('Quantity cannot be empty for update.');
            return;
        }
        setError('');
        setFormIsLoading(true);
        if (!token) { setError("Authentication token not found."); setFormIsLoading(false); return; }
        try {
            const payload = { quantity: editQuantity.trim(), unit: editUnit.trim() };
            const response = await fetch(`/api/pantry/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (response.status === 401) {
                showExpiryMessageAndLogout("Your session has expired. Please log in again.");
                return;
            }
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
                throw new Error(errorData.message || `Failed to update item`);
            }
            setEditingItemId(null);
            fetchPantryItems(); // Refresh list
        } catch (err) {
            setError(err.message || 'Failed to update item.');
        } finally {
            setFormIsLoading(false);
        }
    };

    if (authLoading) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 1 }}>Loading authentication...</Typography>
            </Container>
        );
    }

    if (!isAuthenticated) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="warning">Please log in to view your pantry.</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
                My Pantry
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 2 }, mb: 4 }}> {/* Reduced padding */}
                <Typography variant="h5" component="h2" gutterBottom>
                    Add New Ingredient
                </Typography>
                <Box component="form" onSubmit={handleAddItem} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}> {/* Reduced gap */}
                    <TextField
                        label="Ingredient Name"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        required
                        fullWidth
                        variant="outlined"
                        size="small" // Added for consistency and compactness
                    />
                    <Grid container spacing={1.5}> {/* Reduced spacing */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Quantity"
                                value={newItemQuantity}
                                onChange={(e) => setNewItemQuantity(e.target.value)}
                                required
                                fullWidth
                                variant="outlined"
                                size="small" // Added for consistency and compactness
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Unit"
                                value={newItemUnit}
                                onChange={(e) => setNewItemUnit(e.target.value)}
                                fullWidth
                                variant="outlined"
                                placeholder="e.g., grams, ml, pcs"
                                size="small" // Added for consistency and compactness
                            />
                        </Grid>
                    </Grid>
                    <Button type="submit" variant="contained" disabled={formIsLoading} sx={{ mt: 1, alignSelf: 'flex-start' }}>
                        {formIsLoading ? <CircularProgress size={24} color="inherit" /> : 'Add to Pantry'}
                    </Button>
                </Box>
            </Paper>

            <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
                Current Inventory
            </Typography>
            {listIsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                </Box>
            ) : pantryItems.length === 0 ? (
                <Typography sx={{ textAlign: 'center', color: 'text.secondary', mt: 2 }}>
                    Your pantry is empty. Add some ingredients!
                </Typography>
            ) : (
                <Box sx={{ maxHeight: '50vh', overflowY: 'auto', pr: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}> {/* Added Box for scroll + border */}
                  <List sx={{pt:0, pb:0}}> {/* Adjust List padding if needed due to Box wrapper */}
                      {pantryItems.map((item, index) => (
                          <React.Fragment key={item.UserPantryIngredientID}>
                              <ListItem sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'flex-start', py: 2 }}>
                                  {editingItemId === item.UserPantryIngredientID ? (
                                    <Box sx={{ width: '100%', display: 'flex', flexDirection: {xs: 'column', sm: 'row'}, alignItems: 'center', gap: 1 }}>
                                        <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'medium', flexBasis: {sm: '30%'}, mb: {xs: 1, sm: 0} }}>
                                            {item.IngredientName}
                                        </Typography>
                                        <TextField size="small" value={editQuantity} onChange={(e) => setEditQuantity(e.target.value)} sx={{ width: {xs: '100%', sm: '100px'} }} variant="outlined" label="Qty"/>
                                        <TextField size="small" value={editUnit} onChange={(e) => setEditUnit(e.target.value)} placeholder="Unit" sx={{ width: {xs: '100%', sm: '100px'} }} variant="outlined" label="Unit"/>
                                        <Box sx={{ display: 'flex', gap: 1, mt: {xs: 1, sm: 0}, ml: {sm: 'auto'} }}>
                                            <IconButton onClick={() => handleUpdateItem(item.UserPantryIngredientID)} disabled={formIsLoading} color="primary" size="small"><SaveIcon /></IconButton>
                                            <IconButton onClick={cancelEdit} disabled={formIsLoading} size="small"><CancelIcon /></IconButton>
                                        </Box>
                                    </Box>
                                ) : (
                                    <>
                                        <ListItemText
                                            primary={item.IngredientName}
                                            secondary={`Quantity: ${item.Quantity} ${item.Unit || ''} | Added: ${new Date(item.CreatedAt).toLocaleDateString()}${item.UpdatedAt && new Date(item.UpdatedAt).getTime() !== new Date(item.CreatedAt).getTime() ? `, Updated: ${new Date(item.UpdatedAt).toLocaleDateString()}` : ''}`}
                                            primaryTypographyProps={{ fontWeight: 'medium' }}
                                            sx={{ mb: { xs: 1, sm: 0 }, flexBasis: {sm: '70%'} }}
                                        />
                                        <ListItemSecondaryAction sx={{ position: 'relative', transform: 'none', top: 'auto', right: 'auto', width: {xs: '100%', sm: 'auto'}, display: 'flex', justifyContent: {xs: 'flex-start', sm: 'flex-end'}, mt: {xs:1, sm:0} }}>
                                            <IconButton edge="end" onClick={() => startEditItem(item)} sx={{ mr: 0.5 }} size="small"><EditIcon /></IconButton>
                                            <IconButton edge="end" onClick={() => handleDeleteItem(item.UserPantryIngredientID, item.IngredientName)} color="error" size="small" disabled={formIsLoading}>
                                                {/* The disabled={formIsLoading} will now correctly reflect loading state for THIS item's potential deletion or any other form op */}
                                                {formIsLoading && editingItemId !== item.UserPantryIngredientID ? <CircularProgress size={20} color="inherit"/> : <DeleteIcon />}
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </>
                                )}
                              </ListItem>
                              {index < pantryItems.length - 1 && <Divider component="li" sx={{ml:0}} />} {/* Ensure divider is full width if List has no padding */}
                          </React.Fragment>
                      ))}
                  </List>
                </Box>
            )}

            <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Button component={RouterLink} to="/suggested-recipes" variant="contained" color="secondary">
                    Get Recipe Suggestions
                </Button>
            </Box>
        </Container>
    );
}

export default PantryPage;
