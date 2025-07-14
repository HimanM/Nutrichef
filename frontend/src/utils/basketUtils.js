/**
 * Utility functions for shopping basket operations
 */

/**
 * Consolidates ingredients with the same name and unit, combining quantities
 * and tracking which recipes they come from
 * @param {Array} existingBasket - Current basket items
 * @param {Array} newItems - New items to add
 * @returns {Array} Consolidated basket items
 */
export const consolidateBasketItems = (existingBasket, newItems) => {
  // Create a map to track consolidated items by name and unit
  const consolidatedMap = new Map();
  
  // Process existing basket items first
  existingBasket.forEach(item => {
    const key = `${item.name.toLowerCase()}_${(item.unit || '').toLowerCase()}`;
    if (consolidatedMap.has(key)) {
      const existing = consolidatedMap.get(key);
      // Combine quantities
      const existingQty = parseQuantity(existing.quantity);
      const newQty = parseQuantity(item.quantity);
      existing.quantity = formatQuantity(existingQty + newQty);
      
      // Add recipe to the list of sources
      const recipeSources = existing.recipeSources || [existing.recipeTitle];
      if (!recipeSources.includes(item.recipeTitle)) {
        recipeSources.push(item.recipeTitle);
      }
      existing.recipeSources = recipeSources;
      existing.recipeTitle = recipeSources.join(', ');
    } else {
      consolidatedMap.set(key, {
        ...item,
        recipeSources: [item.recipeTitle]
      });
    }
  });
  
  // Process new items
  newItems.forEach(item => {
    const key = `${item.name.toLowerCase()}_${(item.unit || '').toLowerCase()}`;
    if (consolidatedMap.has(key)) {
      const existing = consolidatedMap.get(key);
      // Combine quantities
      const existingQty = parseQuantity(existing.quantity);
      const newQty = parseQuantity(item.quantity);
      existing.quantity = formatQuantity(existingQty + newQty);
      
      // Add recipe to the list of sources
      const recipeSources = existing.recipeSources || [existing.recipeTitle];
      if (!recipeSources.includes(item.recipeTitle)) {
        recipeSources.push(item.recipeTitle);
      }
      existing.recipeSources = recipeSources;
      existing.recipeTitle = recipeSources.join(', ');
    } else {
      consolidatedMap.set(key, {
        ...item,
        id: generateUniqueId(),
        recipeSources: [item.recipeTitle]
      });
    }
  });
  
  return Array.from(consolidatedMap.values());
};

/**
 * Parse quantity string to number, handling fractions
 * @param {string} quantityStr - Quantity as string
 * @returns {number} Parsed quantity
 */
const parseQuantity = (quantityStr) => {
  if (!quantityStr || quantityStr === '') return 1;
  
  // Handle fractions like "1/2", "1/4", "3/4"
  const fractionPattern = /^(\d+)\/(\d+)$/;
  const fractionMatch = quantityStr.match(fractionPattern);
  
  if (fractionMatch) {
    const numerator = parseInt(fractionMatch[1], 10);
    const denominator = parseInt(fractionMatch[2], 10);
    return numerator / denominator;
  }
  
  // Handle mixed numbers like "1 1/2"
  const mixedPattern = /^(\d+)\s+(\d+)\/(\d+)$/;
  const mixedMatch = quantityStr.match(mixedPattern);
  
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10);
    const numerator = parseInt(mixedMatch[2], 10);
    const denominator = parseInt(mixedMatch[3], 10);
    return whole + (numerator / denominator);
  }
  
  // Handle regular numbers
  const parsed = parseFloat(quantityStr);
  return isNaN(parsed) ? 1 : parsed;
};

/**
 * Format quantity number back to string, preferring fractions for common values
 * @param {number} quantity - Quantity as number
 * @returns {string} Formatted quantity
 */
const formatQuantity = (quantity) => {
  // Handle common fractions
  const commonFractions = {
    0.25: '1/4',
    0.5: '1/2',
    0.75: '3/4',
    0.33: '1/3',
    0.67: '2/3',
    1.25: '1 1/4',
    1.5: '1 1/2',
    1.75: '1 3/4',
    2.25: '2 1/4',
    2.5: '2 1/2',
    2.75: '2 3/4'
  };
  
  // Round to handle floating point precision issues
  const rounded = Math.round(quantity * 100) / 100;
  
  if (commonFractions[rounded]) {
    return commonFractions[rounded];
  }
  
  // For other values, check if it's close to a simple fraction
  for (const [decimal, fraction] of Object.entries(commonFractions)) {
    if (Math.abs(rounded - parseFloat(decimal)) < 0.01) {
      return fraction;
    }
  }
  
  // If it's a whole number, return as integer
  if (rounded === Math.floor(rounded)) {
    return rounded.toString();
  }
  
  // Otherwise return as decimal
  return rounded.toString();
};

/**
 * Generate a unique ID for basket items
 * @returns {string} Unique ID
 */
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
