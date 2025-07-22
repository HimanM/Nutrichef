import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AiOutlineLoading } from 'react-icons/ai';
import { MdClose, MdList } from 'react-icons/md';
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';

function RecipePalette({
  isPaletteVisible,
  setIsPaletteVisible,
  paletteRecipes,
  loadingPalette,
  paletteError,
  selectedRecipe,
  recipeSelectedForPlanning,
  handleRecipeSelect,
  setRecipeSelectedForPlanning,
  handleRemoveFromPalette,
  handleClearPalette,
  isMobile,
  paletteRef
}) {
  if (!isPaletteVisible) return null;

  const PaletteContent = () => (
    <div ref={paletteRef} className="bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl border border-emerald-200 overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b border-emerald-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
            <MdList className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-emerald-800">Recipe Palette</h3>
          <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded-full font-medium">
            {paletteRecipes.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {paletteRecipes.length > 0 && (
            <button
              onClick={handleClearPalette}
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-md transition-all duration-200 font-medium"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsPaletteVisible(false)}
            className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-200 p-1.5 rounded-md transition-all duration-200"
          >
            <MdClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-emerald-50" style={{ maxHeight: `${Math.min(600, Math.max(200, paletteRecipes.length * 80 + 100))}px` }}>
        {loadingPalette && (
          <div className="flex items-center justify-center py-8">
            <AiOutlineLoading className="animate-spin h-8 w-8 text-emerald-500" />
          </div>
        )}
        
        {paletteError && (
          <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-lg">{paletteError}</div>
        )}
        
        {!loadingPalette && paletteRecipes.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <HiOutlinePlus className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-gray-500 text-sm mb-3">No recipes in palette</p>
            <RouterLink to="/recipes" className="btn-primary text-sm px-4 py-2 inline-block">
              Browse Recipes
            </RouterLink>
          </div>
        )}
        
        {!loadingPalette && paletteRecipes.length > 0 && (
          <div className="space-y-2">
            {paletteRecipes.map((recipe) => (
              <div
                key={recipe.RecipeID}
                className={`relative border rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                  (selectedRecipe || recipeSelectedForPlanning)?.RecipeID === recipe.RecipeID
                    ? 'border-emerald-500 bg-emerald-50 shadow-md'
                    : 'border-gray-200 hover:border-emerald-300 hover:shadow-sm'
                }`}
                onClick={() => {
                  handleRecipeSelect(recipe);
                  setRecipeSelectedForPlanning(recipe);
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Recipe Thumbnail */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {recipe.ImageURL ? (
                      <img
                        src={recipe.ImageURL}
                        alt={recipe.Title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center ${recipe.ImageURL ? 'hidden' : 'flex'}`}>
                      <span className="text-gray-400 text-lg font-semibold">
                        {recipe.Title?.charAt(0)?.toUpperCase() || 'R'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Recipe Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-800 leading-tight mb-1" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {recipe.Title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {recipe.CookingTime ? `${recipe.CookingTime} min` : 'Quick recipe'} • {recipe.Servings || 1} servings
                    </p>
                    {recipe.Description && (
                      <p className="text-xs text-gray-400 mt-1" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {recipe.Description}
                      </p>
                    )}
                  </div>
                  
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromPalette(recipe.RecipeID);
                    }}
                    className="text-gray-400 hover:text-red-500 p-1 transition-colors flex-shrink-0 mt-1"
                    title="Remove from palette"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Selection Indicator */}
                {(selectedRecipe || recipeSelectedForPlanning)?.RecipeID === recipe.RecipeID && (
                  <div className="mt-2 pt-2 border-t border-emerald-200 text-xs text-emerald-600 font-medium">
                    ✓ Selected • Click on a day to add
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Mobile: Full screen overlay
  if (isMobile) {
    return (
      <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isPaletteVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className={`w-full max-w-md max-h-[80vh] overflow-hidden transition-all duration-500 transform ${
          isPaletteVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'
        }`}>
          <PaletteContent />
        </div>
      </div>
    );
  }

  // Desktop: Sidebar
  return (
    <div className={`fixed left-16 top-1/2 z-40 w-96 transition-all duration-500 ease-in-out ${
      isPaletteVisible 
        ? 'transform -translate-y-1/2 translate-x-0 opacity-100' 
        : 'transform -translate-y-1/2 -translate-x-full opacity-0'
    }`}>
      <PaletteContent />
    </div>
  );
}

export default RecipePalette;
