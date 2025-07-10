import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { authenticatedFetch } from '../utils/apiUtil.js';

const EditIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>;
const DeleteIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>;
const SaveIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>;
const CancelIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>;
const Spinner = () => <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const PageLoaderSpinner = () => <svg className="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

function PantryPage() {
    const { showModal } = useModal();
    const [pantryItems, setPantryItems] = useState([]);
    const [listIsLoading, setListIsLoading] = useState(false);
    const [formIsLoading, setFormIsLoading] = useState(false);
    const [error, setError] = useState('');
    const auth = useAuth();
    const { isAuthenticated, loading: authLoading, token } = auth;

    const [newIngredients, setNewIngredients] = useState([{ name: '', quantity: '', unit: '' }]);
    const [isIngredientFormOpen, setIsIngredientFormOpen] = useState(false);

    const [editingItemId, setEditingItemId] = useState(null);
    const [editQuantity, setEditQuantity] = useState('');
    const [editUnit, setEditUnit] = useState('');

    const fetchPantryItems = useCallback(async () => {
        if (!isAuthenticated || !token) return;
        setListIsLoading(true); setError('');
        try {
            const response = await authenticatedFetch('/api/pantry', { method: 'GET' }, auth);
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
    }, [isAuthenticated, token, auth]);

    useEffect(() => {
        if (isAuthenticated && token) {
            fetchPantryItems();
        } else {
            setPantryItems([]);
        }
    }, [fetchPantryItems, isAuthenticated, token]);

    const handleIngredientChange = (index, field, value) => {
        const updatedIngredients = [...newIngredients];
        updatedIngredients[index][field] = value;
        setNewIngredients(updatedIngredients);
    };

    const handleAddIngredientField = () => {
        setNewIngredients([...newIngredients, { name: '', quantity: '', unit: '' }]);
    };

    const handleRemoveIngredientField = (index) => {
        if (newIngredients.length > 1) {
            const updatedIngredients = newIngredients.filter((_, i) => i !== index);
            setNewIngredients(updatedIngredients);
        }
    };

    const handleSubmitIngredients = async (e) => {
        if (e) e.preventDefault();

        const validIngredients = newIngredients.filter(ing => ing.name.trim() && ing.quantity.trim());

        if (validIngredients.length === 0) {
            showModal('alert', 'No Valid Ingredients', 'Please fill in at least one ingredient with both a name and a quantity.', { iconType: 'error' });
            return;
        }

        setError('');
        setFormIsLoading(true);

        const ingredientsToSubmit = validIngredients.map(ingredient => ({
            ingredient_name: ingredient.name.trim(),
            quantity: ingredient.quantity.trim(),
            unit: ingredient.unit.trim(),
        }));

        try {
            console.log("Attempting to add ingredients via /api/pantry/bulk:", ingredientsToSubmit);
            const response = await authenticatedFetch('/api/pantry/bulk', {
                method: 'POST',
                body: JSON.stringify(ingredientsToSubmit),
            }, auth);

            const result = await response.json();
            console.log('Bulk API Response:', result);

            setFormIsLoading(false);
            setNewIngredients([{ name: '', quantity: '', unit: '' }]);
            setIsIngredientFormOpen(false);
            fetchPantryItems();

            let title, message, iconType;

            if (response.status === 201) {
                title = "Ingredients Added";
                message = `Successfully added ${result.successful_items?.length || 0} ingredient(s) to your pantry.`;
                iconType = 'success';
            } else if (response.status === 207) {
                title = "Submission Status";
                const failedItemsDetails = result.failed_items?.map(f => 
                    `"${f.item_provided?.ingredient_name || 'Unknown item'}" (${f.error || 'Unknown error'})`
                ).join('; ');
                message = `Added ${result.successful_items?.length || 0} ingredient(s). ${result.failed_items?.length || 0} ingredient(s) failed. Failures: ${failedItemsDetails || 'N/A'}.`;
                iconType = 'info';
            } else if (response.status === 400 || !response.ok) {
                title = "Error Adding Ingredients";
                let errorDetails = result.message || (result.error ? result.error : `An error occurred (Status: ${response.status}).`);
                if (result.failed_items && result.failed_items.length > 0) {
                    const failedItemsDetails = result.failed_items?.map(f => 
                        `"${f.item_provided?.ingredient_name || 'Unknown item'}" (${f.error || 'Unknown error'})`
                    ).join('; ');
                    errorDetails += ` Details: ${failedItemsDetails}`;
                }
                message = `Could not add ingredients. ${errorDetails}`;
                iconType = 'error';
            } else {
                title = "Notice";
                message = result.message || "The operation completed.";
                iconType = 'info';
            }
            showModal('alert', title, message, { iconType: iconType, confirmText: 'OK' });

        } catch (error) {
            console.error('Error submitting bulk ingredients:', error);
            setFormIsLoading(false);
            showModal('alert', "Network Error", `A network error occurred, or the server responded unexpectedly. Please try again. Details: ${error.message}`, { iconType: 'error', confirmText: 'OK' });
        }
    };

    const handleDeleteItem = async (itemId, itemName) => {
        setError('');
        const userConfirmed = await showModal(
            'confirm', 'Confirm Deletion',
            `Are you sure you want to remove "${itemName || 'this item'}" from your pantry?`
        );
        if (userConfirmed) {
            setFormIsLoading(true);
            try {
                const response = await authenticatedFetch(`/api/pantry/${itemId}`, {
                    method: 'DELETE'
                }, auth);
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
                    throw new Error(errorData.message || `Failed to delete item`);
                }
                fetchPantryItems();
            } catch (err) {
                setError(err.message || 'Failed to delete item.');
            } finally {
                setFormIsLoading(false);
            }
        }
    };

    const startEditItem = (item) => {
        setEditingItemId(item.UserPantryIngredientID);
        setEditQuantity(item.Quantity);
        setEditUnit(item.Unit || '');
        setError('');
    };
    const cancelEdit = () => { setEditingItemId(null); setError(''); };

    const handleUpdateItem = async (itemId) => {
        if (!editQuantity.trim()) { setError('Quantity cannot be empty for update.'); return; }
        setError(''); setFormIsLoading(true);
        try {
            const payload = { quantity: editQuantity.trim(), unit: editUnit.trim() };
            const response = await authenticatedFetch(`/api/pantry/${itemId}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            }, auth);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
                throw new Error(errorData.message || `Failed to update item`);
            }
            setEditingItemId(null); fetchPantryItems();
        } catch (err) {
            setError(err.message || 'Failed to update item.');
        } finally {
            setFormIsLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="page-container my-8 text-center">
                <PageLoaderSpinner /> <p className="mt-2 text-blue-400">Loading authentication...</p>
            </div>
        );
    }
    if (!isAuthenticated) {
        return (
            <div className="page-container my-8">
                <div className="p-4 bg-yellow-700/[0.5] border-l-4 border-yellow-500 text-yellow-200">
                    <p>Please log in to view your pantry.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
            <div className="section-padding">
                <div className="container-modern">
                    {/* Header */}
                    <div className="text-center mb-12 animate-fade-in">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            <span className="gradient-text">Your Pantry</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Manage your ingredients and get recipe suggestions based on what you have
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>
                    )}
                    <div className="bg-white/80 shadow-xl rounded-3xl p-8 border border-emerald-100 mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-emerald-700">Pantry Items</h2>
                            <button onClick={() => setIsIngredientFormOpen(true)} className="btn-primary px-4 py-2 rounded-lg font-semibold shadow-md">Add Ingredients</button>
                        </div>
                        {listIsLoading ? (
                            <div className="flex justify-center items-center py-8"><PageLoaderSpinner /></div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white/70 rounded-xl border border-emerald-100">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-left text-emerald-700 font-semibold">Ingredient</th>
                                            <th className="px-4 py-2 text-left text-emerald-700 font-semibold">Quantity</th>
                                            <th className="px-4 py-2 text-left text-emerald-700 font-semibold">Unit</th>
                                            <th className="px-4 py-2 text-right text-emerald-700 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pantryItems.map((item) => (
                                            <tr key={item.UserPantryIngredientID} className="border-b border-emerald-100 last:border-b-0">
                                                <td className="px-4 py-2 text-emerald-700">{item.IngredientName}</td>
                                                <td className="px-4 py-2 text-emerald-700">
                                                    {editingItemId === item.UserPantryIngredientID ? (
                                                        <input type="text" value={editQuantity} onChange={(e) => setEditQuantity(e.target.value)} className="w-20 px-2 py-1 border border-emerald-100 rounded-md bg-white text-emerald-700" />
                                                    ) : (
                                                        item.Quantity
                                                    )}
                                                </td>
                                                <td className="px-4 py-2 text-emerald-700">
                                                    {editingItemId === item.UserPantryIngredientID ? (
                                                        <input type="text" value={editUnit} onChange={(e) => setEditUnit(e.target.value)} className="w-20 px-2 py-1 border border-emerald-100 rounded-md bg-white text-emerald-700" />
                                                    ) : (
                                                        item.Unit
                                                    )}
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    <div className="inline-flex justify-end w-full gap-2">
                                                        {editingItemId === item.UserPantryIngredientID ? (
                                                            <>
                                                                <button onClick={() => handleUpdateItem(item.UserPantryIngredientID)} className="btn-primary px-3 py-1 rounded-lg font-semibold mr-2 flex items-center gap-1">
                                                                    <SaveIcon /> Save
                                                                </button>
                                                                <button onClick={cancelEdit} className="btn-outline px-3 py-1 rounded-lg font-semibold flex items-center gap-1">
                                                                    <CancelIcon /> Cancel
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button onClick={() => startEditItem(item)} className="btn-success px-3 py-1 rounded-lg font-semibold mr-2 flex items-center gap-1">
                                                                    <EditIcon /> Edit
                                                                </button>
                                                                <button onClick={() => handleDeleteItem(item.UserPantryIngredientID, item.IngredientName)} className="btn-danger px-3 py-1 rounded-lg font-semibold flex items-center gap-1">
                                                                    <DeleteIcon /> Delete
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    {isIngredientFormOpen && (
                        <div className="fixed inset-0 bg-white/60 backdrop-blur-md flex justify-center items-center z-50 p-4">
                            <div className="bg-white/90 rounded-3xl shadow-2xl p-6 w-full max-w-2xl border border-emerald-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-semibold text-emerald-700">Add Ingredients</h3>
                                    <button 
                                        onClick={() => setIsIngredientFormOpen(false)}
                                        className="text-emerald-500 hover:text-emerald-700 transition-colors p-1"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                
                                <form onSubmit={handleSubmitIngredients} className="space-y-4">
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {newIngredients.map((ingredient, idx) => (
                                            <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                                <div className="sm:col-span-6">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Ingredient name" 
                                                        value={ingredient.name} 
                                                        onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)} 
                                                        className="w-full px-3 py-2 border border-emerald-200 rounded-lg bg-white text-emerald-700 placeholder-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" 
                                                    />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Qty" 
                                                        value={ingredient.quantity} 
                                                        onChange={(e) => handleIngredientChange(idx, 'quantity', e.target.value)} 
                                                        className="w-full px-3 py-2 border border-emerald-200 rounded-lg bg-white text-emerald-700 placeholder-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" 
                                                    />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Unit" 
                                                        value={ingredient.unit} 
                                                        onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)} 
                                                        className="w-full px-3 py-2 border border-emerald-200 rounded-lg bg-white text-emerald-700 placeholder-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" 
                                                    />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleRemoveIngredientField(idx)}
                                                        className="w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-emerald-100">
                                        <button 
                                            type="button" 
                                            onClick={handleAddIngredientField}
                                            className="w-full sm:w-auto px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Add Another
                                        </button>
                                        
                                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                            <button 
                                                type="button" 
                                                onClick={() => setIsIngredientFormOpen(false)}
                                                className="w-full sm:w-auto px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                type="submit" 
                                                disabled={formIsLoading}
                                                className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-60 disabled:transform-none flex items-center justify-center gap-2"
                                            >
                                                {formIsLoading ? (
                                                    <>
                                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Adding...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        </svg>
                                                        Add Ingredients
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                    <div className="mt-8 text-center">
                        <RouterLink
                            to="/suggested-recipes"
                            className="max-w-lg mx-auto btn-primary px-4 py-2 text-sm font-medium flex items-center justify-center disabled:opacity-75 w-full sm:w-auto"
                        >
                            Get Recipe Suggestions
                        </RouterLink>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PantryPage;
