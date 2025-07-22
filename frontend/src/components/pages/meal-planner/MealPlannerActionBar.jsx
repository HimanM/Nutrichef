import React from 'react';
import { AiOutlineLoading } from 'react-icons/ai';
import { 
  MdList, MdViewWeek, MdViewDay, MdSettings, MdAddShoppingCart, MdDownload
} from 'react-icons/md';
import { 
  HiOutlineCloudUpload, HiOutlineCalendar, HiOutlineDocumentDownload
} from 'react-icons/hi';

function MealPlannerActionBar({
  isPaletteVisible,
  togglePaletteVisibility,
  viewMode,
  setViewMode,
  setIsNutritionalTargetsModalOpen,
  handleAddAllToBasket,
  isAddingToBasket,
  plannedMeals,
  handleSaveToCloud,
  isSavingToCloud,
  handleLoadFromCloudConfirmation,
  isLoadingFromCloud,
  handleDownloadTXT,
  handleDownloadPDF,
  basketMessage
}) {
  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-4 mb-8 border border-emerald-100">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        {/* Left side - View controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={togglePaletteVisibility}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm"
            data-palette-toggle
          >
            <MdList className="w-4 h-4" />
            {isPaletteVisible ? 'Hide' : 'Show'} Recipes
          </button>
          
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                viewMode === 'week' 
                  ? 'bg-white text-emerald-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <MdViewWeek className="w-4 h-4 inline mr-1 sm:mr-2" />
              <span className="hidden xs:inline sm:hidden md:inline">Week View</span>
              <span className="inline xs:hidden sm:inline md:hidden">Week</span>
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                viewMode === 'day' 
                  ? 'bg-white text-emerald-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <MdViewDay className="w-4 h-4 inline mr-1 sm:mr-2" />
              <span className="hidden xs:inline sm:hidden md:inline">2 Week View</span>
              <span className="inline xs:hidden sm:inline md:hidden">2 Week</span>
            </button>
          </div>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsNutritionalTargetsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            title="Set nutritional targets"
          >
            <MdSettings className="w-4 h-4" />
            <span>Nutrition</span>
          </button>
          
          <button
            onClick={handleAddAllToBasket}
            disabled={isAddingToBasket || Object.keys(plannedMeals).length === 0}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isAddingToBasket ? (
              <AiOutlineLoading className="animate-spin w-4 h-4" />
            ) : (
              <MdAddShoppingCart className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Add to Basket</span>
          </button>
          
          <div className="flex items-center bg-gray-100 rounded-lg">
            <button
              onClick={handleSaveToCloud}
              disabled={isSavingToCloud}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-200 rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSavingToCloud ? (
                <AiOutlineLoading className="animate-spin w-4 h-4" />
              ) : (
                <HiOutlineCloudUpload className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Save</span>
            </button>
            
            <button
              onClick={handleLoadFromCloudConfirmation}
              disabled={isLoadingFromCloud}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-200 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium border-l border-gray-200"
            >
              {isLoadingFromCloud ? (
                <AiOutlineLoading className="animate-spin w-4 h-4" />
              ) : (
                <HiOutlineCalendar className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Load</span>
            </button>
          </div>
          
          <div className="flex items-center bg-gray-100 rounded-lg">
            <button
              onClick={handleDownloadTXT}
              className="flex items-center justify-center p-2 text-gray-600 hover:bg-gray-200 rounded-l-lg transition-colors"
              title="Download as TXT"
            >
              <HiOutlineDocumentDownload className="w-5 h-5" />
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center justify-center p-2 text-gray-600 hover:bg-gray-200 rounded-r-lg transition-colors border-l border-gray-200"
              title="Download as PDF"
            >
              <MdDownload className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Basket success message */}
      {basketMessage && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-medium">{basketMessage}</p>
        </div>
      )}
    </div>
  );
}

export default MealPlannerActionBar;
