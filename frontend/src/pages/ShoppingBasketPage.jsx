import React, { useEffect, useState, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useModal } from '../context/ModalContext.jsx';
import { consolidateBasketItems } from '../utils/basketUtils.js';
import jsPDF from 'jspdf';
import { HiDownload, HiTrash } from 'react-icons/hi';
import { MdDeleteSweep } from 'react-icons/md';
import { ImSpinner2 } from 'react-icons/im';

const SHOPPING_BASKET_KEY = 'shoppingBasketItems';

function ShoppingBasketPage() {
  const { showModal } = useModal();
  const [basketItems, setBasketItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true); setError(null);
    try {
      const storedBasket = localStorage.getItem(SHOPPING_BASKET_KEY);
      if (storedBasket) {
        const parsedItems = JSON.parse(storedBasket).map(item => ({
          ...item, 
          quantity: item.quantity !== undefined ? String(item.quantity) : '',
          // Ensure recipeSources exists for backward compatibility
          recipeSources: item.recipeSources || [item.recipeTitle]
        }));
        
        // Consolidate items in case there are duplicates from previous versions
        const consolidatedItems = consolidateBasketItems([], parsedItems);
        setBasketItems(consolidatedItems);
        
        // Update localStorage with consolidated items
        localStorage.setItem(SHOPPING_BASKET_KEY, JSON.stringify(consolidatedItems));
      } else {
        setBasketItems([]);
      }
    } catch (err) {
      setError("Could not load your shopping basket. Data might be corrupted.");
      setBasketItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRemoveItem = async (itemIdToRemove) => {
    const itemToRemove = basketItems.find(item => item.id === itemIdToRemove);
    if (!itemToRemove) { setError("Could not find item to remove."); return; }
    const userConfirmed = await showModal('confirm', 'Confirm Delete Item', `Remove "${itemToRemove.name}"?`);
    if (userConfirmed) {
      try {
        const updatedBasketItems = basketItems.filter(item => item.id !== itemIdToRemove);
        setBasketItems(updatedBasketItems);
        if (updatedBasketItems.length > 0) localStorage.setItem(SHOPPING_BASKET_KEY, JSON.stringify(updatedBasketItems));
        else localStorage.removeItem(SHOPPING_BASKET_KEY);
      } catch (e) { setError("Failed to update basket."); }
    }
  };

  const handleClearBasket = async () => {
    const userConfirmed = await showModal('confirm', 'Confirm Clear Basket', 'Clear all items?');
    if (userConfirmed) {
      try {
        setBasketItems([]); localStorage.removeItem(SHOPPING_BASKET_KEY);
        showModal('alert', 'Success', 'Shopping basket cleared.', {iconType: 'success'});
      } catch (e) { setError("Failed to clear basket."); }
    }
  };

  const handleQuantityChange = (itemIdToUpdate, newQuantityStr) => {
    if (newQuantityStr === '') {
        setBasketItems(prev => prev.map(item => item.id === itemIdToUpdate ? { ...item, quantity: '' } : item));
        return;
    }

    // Handle fractional values like "1/2", "1/4", "3/4", etc.
    const fractionPattern = /^(\d+)\/(\d+)$/;
    const fractionMatch = newQuantityStr.match(fractionPattern);
    
    if (fractionMatch) {
      const numerator = parseInt(fractionMatch[1], 10);
      const denominator = parseInt(fractionMatch[2], 10);
      
      if (denominator === 0) {
        showModal('alert', 'Invalid Fraction', 'Denominator cannot be zero.', {iconType: 'error'});
        return;
      }
      
      // Store the fraction as a string
      try {
        const updatedBasketItems = basketItems.map(item =>
          item.id === itemIdToUpdate ? { ...item, quantity: newQuantityStr } : item
        );
        setBasketItems(updatedBasketItems);
        localStorage.setItem(SHOPPING_BASKET_KEY, JSON.stringify(updatedBasketItems));
      } catch (e) { 
        setError("Failed to update quantity."); 
      }
      return;
    }

    // Handle regular numbers
    const newQuantity = parseFloat(newQuantityStr);
    if (isNaN(newQuantity) || newQuantity <= 0) {
        showModal('alert', 'Invalid Quantity', 'Please enter a valid number or fraction (e.g., 1, 1.5, 1/2, 1/4).', {iconType: 'error'});
        setBasketItems(prev => prev.map(item => item.id === itemIdToUpdate ? { ...item, quantity: '1' } : item));
        localStorage.setItem(SHOPPING_BASKET_KEY, JSON.stringify(basketItems.map(item => item.id === itemIdToUpdate ? { ...item, quantity: '1' } : item)));
        return;
    }
    
    try {
      const updatedBasketItems = basketItems.map(item =>
        item.id === itemIdToUpdate ? { ...item, quantity: newQuantity.toString() } : item
      );
      setBasketItems(updatedBasketItems);
      localStorage.setItem(SHOPPING_BASKET_KEY, JSON.stringify(updatedBasketItems));
    } catch (e) { 
      setError("Failed to update quantity."); 
    }
  };

  const handleDownloadTxt = () => {
    if (basketItems.length === 0) { showModal('alert', 'Empty Basket', 'Shopping basket is empty.', {iconType: 'info'}); return; }
    let content = "Your Shopping Basket:\n\n";
    basketItems.forEach(item => {
      let line = `- ${item.quantity || '1'} ${item.unit || ''} ${item.name}`.trim();
      if (item.originalName && item.originalName !== item.name) line += ` (substituted for ${item.originalName})`;
      const recipeSource = item.recipeSources && item.recipeSources.length > 1 
        ? item.recipeSources.join(', ') 
        : (item.recipeTitle || 'Unknown Recipe');
      line += ` (from: ${recipeSource})`;
      content += line + "\n";
    });
    content += "\nGenerated by NutriChef";
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = 'shopping-list.txt'; document.body.appendChild(a);
    a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    if (basketItems.length === 0) { showModal('alert', 'Empty Basket', 'Shopping basket is empty.', {iconType: 'info'}); return; }
    const doc = new jsPDF(); let yPosition = 15; const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.height; const margin = 10;
    const pageWidth = doc.internal.pageSize.width - margin * 2;
    doc.setFontSize(18); doc.text("Your Shopping Basket", margin, yPosition);
    yPosition += lineHeight * 2; doc.setFontSize(12);
    basketItems.forEach(item => {
      let itemText = `- ${item.quantity || '1'} ${item.unit || ''} ${item.name}`;
      if (item.originalName && item.originalName !== item.name) itemText += ` (for ${item.originalName})`;
      const recipeSource = item.recipeSources && item.recipeSources.length > 1 
        ? item.recipeSources.join(', ') 
        : (item.recipeTitle || 'Unknown Recipe');
      itemText += ` (from: ${recipeSource})`;
      const splitText = doc.splitTextToSize(itemText, pageWidth);
      if (yPosition + (splitText.length * lineHeight) > pageHeight - margin) {
        doc.addPage(); yPosition = margin; doc.setFontSize(12);
      }
      doc.text(splitText, margin, yPosition); yPosition += (splitText.length * lineHeight);
    });
    yPosition += lineHeight;
    if (yPosition > pageHeight - margin) { doc.addPage(); yPosition = margin; }
    doc.setFontSize(10); doc.text("Generated by NutriChef", margin, yPosition);
    doc.save('shopping-list.pdf');
  };

  const commonButtonClassNameBase = "px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50";

  if (loading) return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><ImSpinner2 className="animate-spin h-10 w-10 text-indigo-400" /></div>;
  if (error && basketItems.length === 0) return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="section-padding">
        <div className="container-modern">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Shopping Basket</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your personalized shopping list based on your meal plans and recipe selections
            </p>
          </div>
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
          <div className="bg-white/80 shadow-xl rounded-3xl p-8 border border-emerald-100 mb-8">
            {/* No basket items, so no list or actions */}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="section-padding">
        <div className="container-modern">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Shopping Basket</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your personalized shopping list based on your meal plans and recipe selections
            </p>
          </div>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
          )}
          <div className="bg-white/80 shadow-xl rounded-3xl p-8 border border-emerald-100 mb-8">
            {basketItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Your basket is empty</h3>
                <p className="text-gray-600 mb-4 max-w-md text-center">Go to the <RouterLink to="/recipes" className="text-emerald-600 hover:underline font-medium">Recipe Browser</RouterLink> and add food items to your basket to start building your shopping list.</p>
              </div>
            ) : (
              <>
                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 mb-6">
                  <button
                    onClick={handleClearBasket}
                    disabled={basketItems.length === 0}
                    className="btn-outline text-red-600 hover:bg-red-50 focus:ring-red-500 flex items-center transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <MdDeleteSweep className="h-5 w-5 mr-2" /> Clear All Items
                  </button>
                  <button
                    onClick={handleDownloadTxt}
                    disabled={basketItems.length === 0}
                    className="btn-primary transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <HiDownload className="h-5 w-5 mr-2" /> Download TXT
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    disabled={basketItems.length === 0}
                    className="btn-primary transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <HiDownload className="h-5 w-5 mr-2" /> Download PDF
                  </button>
                </div>
                {/* Basket List */}
                <ul className="divide-y divide-emerald-100">
                  {basketItems.map((item) => (
                    <li key={item.id} className="px-4 py-3 sm:px-6 hover:bg-emerald-50 transition ease-in-out duration-150">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                        <div className="flex items-center mb-2 sm:mb-0">
                          <input
                            type="text"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            className="w-16 px-2 py-1 bg-white border border-emerald-100 text-emerald-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 text-sm text-center transition-all duration-200"
                            placeholder="1"
                            aria-label={`Quantity for ${item.name}`}
                          />
                          <div className="ml-3 text-sm">
                            <p className="font-medium text-gray-800">
                              {item.unit || ''} {item.name}
                              {item.recipeSources && item.recipeSources.length > 1 && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                  Consolidated
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.originalName && item.originalName !== item.name && (
                                <span className="italic">(Substituted for: {item.originalName}) </span>
                              )}
                              From: {item.recipeSources && item.recipeSources.length > 1 
                                ? item.recipeSources.join(', ') 
                                : (item.recipeTitle || 'Unknown Recipe')}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 text-red-500 hover:text-white hover:bg-red-500 rounded-md self-start sm:self-center transition-all duration-200 hover:scale-110 active:scale-95"
                          aria-label={`Remove ${item.name}`}
                        >
                          <HiTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingBasketPage;
