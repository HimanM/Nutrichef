import React, { useRef, useState, useEffect } from 'react';
import { MdDeleteOutline, MdDragIndicator, MdAccessTime, MdPeople } from 'react-icons/md';
import { HiOutlineClock, HiOutlineUserGroup } from 'react-icons/hi';

const MealItemCard = ({ 
  recipe, 
  onClick, 
  onRemove, 
  isInPalette = false,
  onDragStart,
  onDragEnd,
  onAssignToDay,
  isDragging = false,
  isCompact = false
}) => {
  if (!recipe) return null;

  const titleRef = useRef(null);
  const [shouldMarquee, setShouldMarquee] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (titleRef.current && titleRef.current.scrollWidth > titleRef.current.clientWidth) {
        setShouldMarquee(true);
      } else {
        setShouldMarquee(false);
      }
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [recipe.Title]);

  const handleDragStart = (e) => {
    if (onDragStart) {
      onDragStart(recipe);
    }
    e.dataTransfer.setData('text/plain', JSON.stringify(recipe));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = (e) => {
    if (onDragEnd) {
      onDragEnd();
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(recipe);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(recipe.RecipeID || recipe.planInstanceId);
    }
  };

  const getTotalTime = () => {
    const prepTime = recipe.PreparationTimeMinutes || 0;
    const cookTime = recipe.CookingTimeMinutes || 0;
    return prepTime + cookTime;
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Compact mode for multiple items in a day
  if (isCompact) {
    return (
      <div
        draggable={isInPalette}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        className={`
          group relative bg-white border border-gray-200 rounded-lg overflow-hidden
          transition-all duration-200 ease-in-out transform
          ${isDragging ? 'opacity-50 scale-95' : ''}
          ${isInPalette ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
          ${onClick || isInPalette ? 'hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-300' : ''}
          ${isInPalette ? 'hover:bg-emerald-50' : 'hover:bg-gray-50'}
        `}
      >
        <div className="flex items-center p-3">
          {/* Recipe Image or Placeholder */}
          <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-lg flex-shrink-0 mr-3">
            {recipe.ImageURL ? (
              <img 
                src={recipe.ImageURL} 
                alt={recipe.Title}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="absolute inset-0 flex items-center justify-center text-emerald-600 opacity-60 rounded-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="flex-grow min-w-0">
            <h4
              ref={titleRef}
              title={recipe.Title || 'Untitled Recipe'}
              className={`font-medium text-gray-800 text-sm leading-tight ${
                shouldMarquee ? 'animate-marquee' : 'overflow-hidden text-ellipsis'
              }`}
              style={{ maxWidth: '100%' }}
            >
              {recipe.Title || 'Untitled Recipe'}
            </h4>
            
            {/* Recipe Details */}
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
              {getTotalTime() > 0 && (
                <div className="flex items-center gap-1">
                  <HiOutlineClock className="w-3 h-3" />
                  <span>{formatTime(getTotalTime())}</span>
                </div>
              )}
              
              {recipe.Servings && (
                <div className="flex items-center gap-1">
                  <HiOutlineUserGroup className="w-3 h-3" />
                  <span>{recipe.Servings}</span>
                </div>
              )}
            </div>
          </div>

          {/* Remove Button */}
          {onRemove && (
            <button
              onClick={handleRemove}
              className="p-1.5 bg-white/90 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 opacity-0 group-hover:opacity-100 flex-shrink-0"
              title="Remove"
            >
              <MdDeleteOutline className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
      </div>
    );
  }

  // Full mode (original design)
  return (
    <div
      draggable={isInPalette}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      className={`
        group relative bg-white border border-gray-200 rounded-xl overflow-hidden
        transition-all duration-300 ease-in-out transform
        ${isDragging ? 'opacity-50 scale-95 rotate-2' : ''}
        ${isInPalette ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
        ${onClick || isInPalette ? 'hover:shadow-lg hover:-translate-y-1 hover:border-emerald-300' : ''}
        ${isInPalette ? 'hover:bg-emerald-50' : 'hover:bg-gray-50'}
      `}
    >
      {/* Recipe Image or Placeholder */}
      <div className="relative h-24 bg-gradient-to-br from-emerald-100 to-blue-100">
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
        
        
        {/* Drag Handle for Palette Items */}
        {isInPalette && (
          <div className="absolute top-2 left-2 p-1 bg-white/80 rounded-md text-gray-500 hover:text-gray-700 transition-colors">
            <MdDragIndicator className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Title */}
        <div className="mb-2">
          <h3
            ref={titleRef}
            title={recipe.Title || 'Untitled Recipe'}
            className={`font-semibold text-gray-800 text-sm leading-tight ${
              shouldMarquee ? 'animate-marquee' : 'overflow-hidden text-ellipsis'
            }`}
            style={{ maxWidth: '100%' }}
          >
            {recipe.Title || 'Untitled Recipe'}
          </h3>
        </div>
        
        {/* Recipe Details */}
        <div className="flex items-center justify-between text-xs text-gray-500 space-x-2">
          {/* Time */}
          {getTotalTime() > 0 && (
            <div className="flex items-center gap-1">
              <HiOutlineClock className="w-3 h-3" />
              <span>{formatTime(getTotalTime())}</span>
            </div>
          )}
          
          {/* Servings */}
          {recipe.Servings && (
            <div className="flex items-center gap-1">
              <HiOutlineUserGroup className="w-3 h-3" />
              <span>{recipe.Servings}</span>
            </div>
          )}
        </div>

        {/* Description (if available) */}
        {recipe.Description && (
          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
            {recipe.Description}
          </p>
        )}
      </div>

      {/* Remove Button */}
      {onRemove && (
        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 opacity-0 group-hover:opacity-100"
          title="Remove"
        >
          <MdDeleteOutline className="w-4 h-4" />
        </button>
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
    </div>
  );
};

export default MealItemCard;
