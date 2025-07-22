import React from 'react';

const EditIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>;
const DeleteIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>;
const SaveIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>;
const CancelIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>;

const PantryMobileView = ({ 
    pantryItems, 
    editingItemId, 
    editQuantity, 
    setEditQuantity, 
    editUnit, 
    setEditUnit, 
    handleUpdateItem, 
    cancelEdit, 
    startEditItem, 
    handleDeleteItem 
}) => {
    return (
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
    );
};

export default PantryMobileView;
