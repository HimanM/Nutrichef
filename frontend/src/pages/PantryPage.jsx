import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { authenticatedFetch } from '../utils/apiUtil.js';
import { ButtonSpinner, PageLoaderSpinner } from '../components/common/LoadingComponents.jsx';

const EditIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>;
const DeleteIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>;
const SaveIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>;
const CancelIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>;

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
            const response = await authenticatedFetch('/api/pantry/bulk', {
                method: 'POST',
                body: JSON.stringify(ingredientsToSubmit),
            }, auth);

            const result = await response.json();

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
                    <div className="text-center mb-6 animate-fade-in">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">
                            <span className="gradient-text">Your Pantry</span>
                        </h1>
                        <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                            Manage your ingredients and get recipe suggestions based on what you have
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-fade-in">{error}</div>
                    )}

                    {/* Main Pantry Section */}
                    <div className="bg-white/80 shadow-lg rounded-2xl p-4 border border-emerald-100 mb-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-emerald-700">Pantry Items</h2>
                                <p className="text-xs text-gray-600">
                                    {pantryItems.length} ingredient{pantryItems.length !== 1 ? 's' : ''} in your pantry
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsIngredientFormOpen(true)} 
                                className="btn-primary px-4 py-2 rounded-lg font-medium shadow-md text-sm flex items-center gap-2 hover:scale-105 transition-transform"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Ingredients
                            </button>
                        </div>

                        {listIsLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <PageLoaderSpinner />
                                <span className="ml-3 text-gray-600">Loading your pantry...</span>
                            </div>
                        ) : pantryItems.length === 0 ? (
                            /* Empty State */
                            <div className="text-center py-12">
                                <div className="w-20 h-20 mx-auto mb-4 bg-emerald-50 rounded-full flex items-center justify-center">
                                    <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Your pantry is empty</h3>
                                <p className="text-gray-600 max-w-md mx-auto mb-4">
                                    Start by adding ingredients to your pantry. Once you have ingredients, 
                                    you'll be able to get personalized recipe suggestions.
                                </p>
                                <button 
                                    onClick={() => setIsIngredientFormOpen(true)}
                                    className="btn-primary px-6 py-2 rounded-lg font-medium inline-flex items-center gap-2 hover:scale-105 transition-transform"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add Your First Ingredients
                                </button>
                            </div>
                        ) : (
                            /* Responsive Pantry Items */
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {/* Desktop Table View - Hidden on Mobile */}
                                <div className="hidden md:block">
                                    <div className="rounded-xl border border-emerald-100 overflow-hidden">
                                        <table className="min-w-full bg-white/70">
                                            <thead className="bg-emerald-50 border-b border-emerald-200">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-emerald-700 font-semibold text-sm">Ingredient</th>
                                                    <th className="px-4 py-3 text-left text-emerald-700 font-semibold text-sm">Quantity</th>
                                                    <th className="px-4 py-3 text-left text-emerald-700 font-semibold text-sm">Unit</th>
                                                    <th className="px-4 py-3 text-right text-emerald-700 font-semibold text-sm">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-emerald-100">
                                                {pantryItems.map((item) => (
                                                    <tr key={item.UserPantryIngredientID} className="hover:bg-emerald-50/50 transition-colors">
                                                        <td className="px-4 py-3 text-emerald-700 font-medium">{item.IngredientName}</td>
                                                        <td className="px-4 py-3 text-emerald-700">
                                                            {editingItemId === item.UserPantryIngredientID ? (
                                                                <input 
                                                                    type="text" 
                                                                    value={editQuantity} 
                                                                    onChange={(e) => setEditQuantity(e.target.value)} 
                                                                    className="w-20 px-2 py-1 border border-emerald-200 rounded-md bg-white text-emerald-700 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                                                                />
                                                            ) : (
                                                                item.Quantity
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-emerald-700">
                                                            {editingItemId === item.UserPantryIngredientID ? (
                                                                <input 
                                                                    type="text" 
                                                                    value={editUnit} 
                                                                    onChange={(e) => setEditUnit(e.target.value)} 
                                                                    className="w-20 px-2 py-1 border border-emerald-200 rounded-md bg-white text-emerald-700 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                                                                />
                                                            ) : (
                                                                item.Unit || '-'
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="inline-flex justify-end w-full gap-1">
                                                                {editingItemId === item.UserPantryIngredientID ? (
                                                                    <>
                                                                        <button 
                                                                            onClick={() => handleUpdateItem(item.UserPantryIngredientID)} 
                                                                            className="btn-primary px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 hover:scale-105 transition-transform"
                                                                            title="Save changes"
                                                                        >
                                                                            <SaveIcon />
                                                                        </button>
                                                                        <button 
                                                                            onClick={cancelEdit} 
                                                                            className="btn-outline px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 hover:scale-105 transition-transform"
                                                                            title="Cancel editing"
                                                                        >
                                                                            <CancelIcon />
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <button 
                                                                            onClick={() => startEditItem(item)} 
                                                                            className="btn-success px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 hover:scale-105 transition-transform"
                                                                            title="Edit item"
                                                                        >
                                                                            <EditIcon />
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => handleDeleteItem(item.UserPantryIngredientID, item.IngredientName)} 
                                                                            className="btn-danger px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 hover:scale-105 transition-transform"
                                                                            title="Delete item"
                                                                        >
                                                                            <DeleteIcon />
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
                                </div>

                                {/* Mobile Card View - Hidden on Desktop */}
                                <div className="md:hidden space-y-3">
                                    {pantryItems.map((item) => (
                                        <div key={item.UserPantryIngredientID} className="bg-white/80 rounded-xl border border-emerald-100 p-4 hover:bg-emerald-50/50 transition-colors">
                                            <div className="flex items-start justify-between gap-3">
                                                {/* Item Info */}
                                                <div className="flex-grow min-w-0">
                                                    <h4 className="font-medium text-emerald-700 text-base break-words">{item.IngredientName}</h4>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {editingItemId === item.UserPantryIngredientID ? (
                                                            <>
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-xs text-gray-500">Qty:</span>
                                                                    <input 
                                                                        type="text" 
                                                                        value={editQuantity} 
                                                                        onChange={(e) => setEditQuantity(e.target.value)} 
                                                                        className="w-16 px-2 py-1 border border-emerald-200 rounded-md bg-white text-emerald-700 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                                                                    />
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-xs text-gray-500">Unit:</span>
                                                                    <input 
                                                                        type="text" 
                                                                        value={editUnit} 
                                                                        onChange={(e) => setEditUnit(e.target.value)} 
                                                                        className="w-16 px-2 py-1 border border-emerald-200 rounded-md bg-white text-emerald-700 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                                                                        placeholder="unit"
                                                                    />
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="flex gap-4 text-sm text-gray-600">
                                                                <span><span className="font-medium">Quantity:</span> {item.Quantity}</span>
                                                                <span><span className="font-medium">Unit:</span> {item.Unit || 'N/A'}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {/* Action Buttons */}
                                                <div className="flex-shrink-0">
                                                    <div className="flex gap-2">
                                                        {editingItemId === item.UserPantryIngredientID ? (
                                                            <>
                                                                <button 
                                                                    onClick={() => handleUpdateItem(item.UserPantryIngredientID)} 
                                                                    className="btn-primary p-2 rounded-lg text-sm font-medium flex items-center hover:scale-105 transition-transform touch-manipulation"
                                                                    title="Save changes"
                                                                >
                                                                    <SaveIcon />
                                                                </button>
                                                                <button 
                                                                    onClick={cancelEdit} 
                                                                    className="btn-outline p-2 rounded-lg text-sm font-medium flex items-center hover:scale-105 transition-transform touch-manipulation"
                                                                    title="Cancel editing"
                                                                >
                                                                    <CancelIcon />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button 
                                                                    onClick={() => startEditItem(item)} 
                                                                    className="btn-success p-2 rounded-lg text-sm font-medium flex items-center hover:scale-105 transition-transform touch-manipulation"
                                                                    title="Edit item"
                                                                >
                                                                    <EditIcon />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteItem(item.UserPantryIngredientID, item.IngredientName)} 
                                                                    className="btn-danger p-2 rounded-lg text-sm font-medium flex items-center hover:scale-105 transition-transform touch-manipulation"
                                                                    title="Delete item"
                                                                >
                                                                    <DeleteIcon />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Recipe Suggestions Section */}
                    {pantryItems.length > 0 && (
                        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-6 border border-emerald-100">
                            <div className="text-center">
                                <div className="w-12 h-12 mx-auto mb-3 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Ready for Recipe Suggestions?</h3>
                                <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                                    Based on your {pantryItems.length} ingredient{pantryItems.length !== 1 ? 's' : ''}, 
                                    we can suggest recipes you can make right now.
                                </p>
                                <RouterLink
                                    to="/suggested-recipes"
                                    className="btn-primary px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 hover:scale-105 transition-transform shadow-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    Get Recipe Suggestions
                                </RouterLink>
                            </div>
                        </div>
                    )}
                    {isIngredientFormOpen && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-emerald-700">Add Ingredients to Pantry</h3>
                                    <button 
                                        onClick={() => setIsIngredientFormOpen(false)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                
                                <form onSubmit={handleSubmitIngredients} className="space-y-4">
                                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                        {newIngredients.map((ingredient, idx) => (
                                            <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                                                <div className="sm:col-span-6">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Ingredient name" 
                                                        value={ingredient.name} 
                                                        onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)} 
                                                        className="w-full px-3 py-2 border border-emerald-200 rounded-lg bg-white text-emerald-700 placeholder-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm" 
                                                    />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Qty" 
                                                        value={ingredient.quantity} 
                                                        onChange={(e) => handleIngredientChange(idx, 'quantity', e.target.value)} 
                                                        className="w-full px-3 py-2 border border-emerald-200 rounded-lg bg-white text-emerald-700 placeholder-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm" 
                                                    />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Unit" 
                                                        value={ingredient.unit} 
                                                        onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)} 
                                                        className="w-full px-3 py-2 border border-emerald-200 rounded-lg bg-white text-emerald-700 placeholder-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm" 
                                                    />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleRemoveIngredientField(idx)}
                                                        className="w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 text-sm"
                                                        disabled={newIngredients.length === 1}
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
                                            className="w-full sm:w-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 text-sm"
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
                                                className="w-full sm:w-auto px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 text-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                type="submit" 
                                                disabled={formIsLoading}
                                                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-60 disabled:transform-none flex items-center justify-center gap-2 text-sm"
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
                </div>
            </div>
        </div>
    );
}

export default PantryPage;
