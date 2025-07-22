import React from 'react';

const EditIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>;
const DeleteIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>;
const SaveIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>;
const CancelIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>;

const PantryDesktopView = ({ 
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
    );
};

export default PantryDesktopView;
