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
            showModal({
                title: 'No Valid Ingredients',
                message: 'Please fill in at least one ingredient with both a name and a quantity.',
                iconType: 'error',
            });
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

    const commonInputClassName = "mt-1 block w-full px-3 py-2.5 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-600 disabled:opacity-75";
    const commonLabelClassName = "block text-sm font-medium text-gray-300";
    const commonButtonClassNameUnused = "px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 flex items-center justify-center";
    const smallButtonClassName = "p-1.5 rounded-md disabled:opacity-50";
    const secondaryButtonOutlineClassName = "py-2 px-4 text-sm font-medium text-blue-400 bg-transparent border border-blue-400 rounded-md hover:bg-blue-500/[0.1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center";


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
        <div className="page-container my-8">
            <h1 className="text-3xl sm:text-4xl text-center mb-8">
                My Pantry
            </h1>

            {error && (
              <div className="mb-4 p-3 bg-red-700 border border-red-500 text-red-200 rounded-md text-sm">
                {error}
              </div>
            )}

            {isIngredientFormOpen && (
                <div className="fixed inset-0 bg-gray-800/30 backdrop-blur-sm overflow-y-auto h-full w-full flex justify-center items-center z-40 px-4 py-6">
                    <div className=" bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-100">Add Ingredients to Pantry</h3>
                            <button
                                type="button"
                                onClick={() => { setIsIngredientFormOpen(false); setError(''); }}
                                className="text-gray-400 bg-transparent hover:bg-gray-700 hover:text-gray-200 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                            >
                                <CancelIcon /> <span className="sr-only">Close modal</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmitIngredients} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
                            {error && (
                                <div className="mb-4 p-3 bg-red-700 border border-red-500 text-red-200 rounded-md text-sm">
                                    {error} 
                                </div>
                            )}
                            {newIngredients.map((ingredient, index) => (
                                <div key={index} className="p-3 border border-gray-700 rounded-md space-y-3 relative bg-gray-800">
                                    {newIngredients.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveIngredientField(index)}
                                            className="absolute top-2 right-2 text-gray-500 hover:text-red-400 p-1 rounded-full hover:bg-gray-600 transition-colors"
                                            title="Remove Ingredient"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                                        </button>
                                    )}
                                    <div>
                                        <label htmlFor={`modalIngredientName-${index}`} className={commonLabelClassName}>Ingredient Name</label>
                                        <input
                                            type="text"
                                            id={`modalIngredientName-${index}`}
                                            value={ingredient.name}
                                            onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                                            required
                                            className={commonInputClassName}
                                            placeholder="e.g., Flour, Sugar"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor={`modalIngredientQuantity-${index}`} className={commonLabelClassName}>Quantity</label>
                                            <input
                                                type="text"
                                                id={`modalIngredientQuantity-${index}`}
                                                value={ingredient.quantity}
                                                onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                                                required
                                                className={commonInputClassName}
                                                placeholder="e.g., 500"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor={`modalIngredientUnit-${index}`} className={commonLabelClassName}>Unit <span className="text-xs text-gray-400">(e.g., g, ml, pcs)</span></label>
                                            <input
                                                type="text"
                                                id={`modalIngredientUnit-${index}`}
                                                value={ingredient.unit}
                                                onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                                                className={commonInputClassName}
                                                placeholder="e.g., grams, ml, pcs"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                             <button
                                type="button"
                                onClick={handleAddIngredientField}
                                className={`${secondaryButtonOutlineClassName} w-full justify-center mt-1`}
                                disabled={newIngredients.length > 0 && newIngredients[newIngredients.length - 1].name.trim() === ''}
                            >
                                Add Another Ingredient Field
                            </button>
                        </form>
                        
                        <div className="flex items-center justify-end p-4 sm:p-5 border-t border-gray-700 space-x-3">
                            <button
                                type="button"
                                onClick={() => { setIsIngredientFormOpen(false); setError(''); }}
                                className={`${secondaryButtonOutlineClassName} px-4 py-2 text-sm`}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit" 
                                onClick={handleSubmitIngredients}
                                disabled={formIsLoading || newIngredients.filter(ing => ing.name.trim() || ing.quantity.trim() || ing.unit.trim()).some(ing => !ing.name.trim() || !ing.quantity.trim())}
                                className="gradient-button disabled:opacity-75 flex items-center justify-center py-2.5 px-4 text-sm"
                            >
                                {formIsLoading ? <Spinner /> : null} {formIsLoading ? 'Adding...' : `Add ${newIngredients.filter(ing => ing.name.trim() && ing.quantity.trim()).length} Ingredient(s) to Pantry`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {listIsLoading ? (
                <div className="flex justify-center my-6"><PageLoaderSpinner /> <p className="ml-2 text-blue-400">Loading pantry items...</p></div>
            ) : pantryItems.length === 0 ? (
                <p className="text-center text-gray-400 mt-4">Your pantry is empty. Add some ingredients!</p>
            ) : (
                <div className="max-w-lg mx-auto mb-8 p-6 bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                <h3 className="text-2xl mb-4">Current Inventory</h3>
                    <ul className="divide-y divide-gray-700">
                        {pantryItems.map((item) => (
                            <li key={item.UserPantryIngredientID} className="px-4 py-3 sm:px-6 hover:bg-gray-700 transition ease-in-out duration-150">
                                {editingItemId === item.UserPantryIngredientID ? (
                                    <div className="space-y-3">
                                        <p className="text-lg font-medium text-blue-400">{item.IngredientName}</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                                            <div className="sm:col-span-4">
                                                <label htmlFor={`editQty-${item.UserPantryIngredientID}`} className="block text-xs font-medium text-gray-400">Quantity</label>
                                                <input type="text" id={`editQty-${item.UserPantryIngredientID}`} value={editQuantity} onChange={(e) => setEditQuantity(e.target.value)} className={commonInputClassName + " text-sm py-1.5"}/>
                                            </div>
                                            <div className="sm:col-span-4">
                                                <label htmlFor={`editUnit-${item.UserPantryIngredientID}`} className="block text-xs font-medium text-gray-400">Unit</label>
                                                <input type="text" id={`editUnit-${item.UserPantryIngredientID}`} value={editUnit} onChange={(e) => setEditUnit(e.target.value)} className={commonInputClassName + " text-sm py-1.5"} placeholder="e.g., grams"/>
                                            </div>
                                            <div className="sm:col-span-4 flex space-x-2 justify-end pt-3 sm:pt-0">
                                                <button onClick={() => handleUpdateItem(item.UserPantryIngredientID)} disabled={formIsLoading} className={`${smallButtonClassName} text-green-400 hover:text-green-300 hover:bg-green-700/[0.2]`}><SaveIcon /></button>
                                                <button onClick={cancelEdit} disabled={formIsLoading} className={`${smallButtonClassName} text-gray-400 hover:text-gray-200 hover:bg-gray-700/[0.5]`}><CancelIcon /></button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                        <div>
                                            <p className="text-md font-semibold text-gray-100">{item.IngredientName}</p>
                                            <p className="text-xs text-gray-400">
                                                Quantity: {item.Quantity} {item.Unit || ''} |
                                                Added: {new Date(item.CreatedAt).toLocaleDateString()}
                                                {item.UpdatedAt && new Date(item.UpdatedAt).getTime() !== new Date(item.CreatedAt).getTime() ? `, Updated: ${new Date(item.UpdatedAt).toLocaleDateString()}` : ''}
                                            </p>
                                        </div>
                                        <div className="mt-2 sm:mt-0 flex space-x-2 flex-shrink-0">
                                            <button onClick={() => startEditItem(item)} className={`${smallButtonClassName} text-gray-400 hover:text-gray-200 hover:bg-gray-700/[0.5]`} title="Edit"><EditIcon /></button>
                                            <button 
                                                onClick={() => handleDeleteItem(item.UserPantryIngredientID, item.IngredientName)} 
                                                disabled={formIsLoading && editingItemId === item.UserPantryIngredientID}
                                                className={`${smallButtonClassName} text-red-400 hover:text-red-300 hover:bg-red-700/[0.2]`} title="Delete">
                                                {formIsLoading && editingItemId === item.UserPantryIngredientID ? <Spinner /> : <DeleteIcon />}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {!isIngredientFormOpen && (
                 <button
                    onClick={() => { setIsIngredientFormOpen(true); setError(''); }}
                    className="fixed bottom-5 right-20 sm:right-24 bg-blue-600 hover:bg-blue-700 text-white font-bold p-4 rounded-full shadow-lg z-30 flex items-center justify-center transition-transform duration-150 ease-in-out hover:scale-105"
                    title="Add New Ingredients"
                >
                    <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4v16m8-8H4"></path></svg>
                    <span className="sr-only">Add New Ingredients</span>
                </button>
            )}


            <div className="mt-8 text-center">
                <RouterLink
                    to="/suggested-recipes"
                    className="max-w-lg mx-auto gradient-button px-4 py-2 text-sm font-medium flex items-center justify-center disabled:opacity-75 w-full sm:w-auto"
                >
                    Get Recipe Suggestions
                </RouterLink>
            </div>
        </div>
    );
}

export default PantryPage;
