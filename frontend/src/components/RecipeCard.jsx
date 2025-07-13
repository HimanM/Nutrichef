import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { HiOutlineClock, HiOutlineUserGroup } from 'react-icons/hi';

// Portal-based Tooltip Component
const PortalTooltip = ({ anchorRef, content, isVisible }) => {
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (isVisible && anchorRef.current) {
      setVisible(false); // Hide initially
      // Render off-screen to measure
      setCoords({ top: -9999, left: -9999 });
      setTimeout(() => {
        const anchorRect = anchorRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current?.getBoundingClientRect();
        let top = anchorRect.top + window.scrollY - 12;
        let left = anchorRect.left + window.scrollX + anchorRect.width / 2;
        // If tooltip is wider than anchor, adjust to keep centered
        if (tooltipRect) {
          left = anchorRect.left + window.scrollX + anchorRect.width / 2;
        }
        setCoords({ top, left });
        setVisible(true);
      }, 0);
    } else {
      setVisible(false);
    }
  }, [isVisible, anchorRef]);

  if (!isVisible) return null;
  return createPortal(
    <div
      ref={tooltipRef}
      style={{
        position: 'absolute',
        top: coords.top,
        left: coords.left,
        transform: 'translate(-50%, -100%)',
        zIndex: 9999,
        pointerEvents: 'none',
        visibility: visible ? 'visible' : 'hidden',
        transition: 'visibility 0s linear 0s',
      }}
      className="bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-2xl max-w-sm whitespace-normal break-words animate-fade-in"
    >
      {content}
      <div className="absolute left-1/2 top-full -translate-x-1/2 w-3 h-3 bg-gray-900 transform rotate-45 -mt-1.5"></div>
    </div>,
    document.body
  );
};

// Truncated Text Component with Portal Tooltip
const TruncatedText = ({ text, maxLength = 50, className = '' }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const anchorRef = useRef(null);

  if (!text) return <span className={className}>No text available</span>;

  const isTruncated = text.length > maxLength;
  const displayText = isTruncated ? text.substring(0, maxLength) + '...' : text;

  return (
    <>
      <span
        ref={anchorRef}
        className={`${className} ${isTruncated ? 'cursor-help' : ''}`}
        onMouseEnter={() => isTruncated && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {displayText}
      </span>
      <PortalTooltip anchorRef={anchorRef} content={text} isVisible={showTooltip && isTruncated} />
    </>
  );
};

const defaultRecipe = {
  RecipeID: 'sample-123',
  ImageURL: 'https://via.placeholder.com/300x200?text=Recipe+Image',
  Title: 'Delicious Sample Recipe Title that Might Be Quite Long',
  Description: 'This is a wonderfully tasty sample recipe description that provides a bit more detail about what to expect. It could also be very long and require truncation. In fact, this could even span multiple lines and you might want to read all of it!',
  match_percentage: 85,
  available_ingredients_count: 5,
  required_ingredients_count: 6,
  Servings: 4,
  PreparationTimeMinutes: 15,
  CookingTimeMinutes: 30,
};

const RecipeCard = ({ recipe = defaultRecipe, renderActions, onCardClick }) => {
  if (!recipe || typeof recipe.RecipeID === 'undefined') return null;

  const {
    RecipeID,
    ImageURL,
    Title,
    Description,
    match_percentage,
    available_ingredients_count,
    required_ingredients_count,
    Servings,
    PreparationTimeMinutes,
    CookingTimeMinutes,
  } = recipe;

  // Calculate total time
  const totalTimeMinutes = (PreparationTimeMinutes || 0) + (CookingTimeMinutes || 0);
  const totalTimeHours = Math.floor(totalTimeMinutes / 60);
  const totalTimeRemainingMinutes = totalTimeMinutes % 60;

  const timeDisplay = totalTimeHours > 0
    ? `${totalTimeHours}h ${totalTimeRemainingMinutes > 0 ? `${totalTimeRemainingMinutes}m` : ''}`
    : `${totalTimeMinutes}m`;

  const cardContent = (
    <>
      <div className="relative overflow-hidden rounded-t-2xl">
        <img
          src={ImageURL || '/placeholder-image.jpg'}
          alt={Title || 'Recipe image'}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        {/* Match percentage badge */}
        {typeof match_percentage === 'number' && (
          <div className="absolute top-3 right-3">
            <div className="bg-emerald-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg">
              {match_percentage}% match
            </div>
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow overflow-hidden w-full text-left min-h-0">
        <div className="flex-1 min-h-0">
          <TruncatedText
            text={Title || 'Untitled Recipe'}
            maxLength={40}
            className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors duration-200 block"
          />
          <TruncatedText
            text={Description || 'No description available.'}
            maxLength={60}
            className="text-sm text-gray-600 mb-3 leading-relaxed block"
          />
          
          {/* Recipe Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {recipe.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.TagID}
                  className="px-2 py-1 text-xs font-medium text-white rounded-full"
                  style={{ backgroundColor: tag.TagColor || '#6B7280' }}
                >
                  {tag.TagName}
                </span>
              ))}
              {recipe.tags.length > 3 && (
                <span className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded-full">
                  +{recipe.tags.length - 3} more
                </span>
              )}
            </div>
          )}
          
          {/* Rating Section */}
          {typeof recipe.average_rating === 'number' && recipe.average_rating > 0 ? (
            <div className="mb-3 flex items-center text-sm">
              <StarRating rating={recipe.average_rating} interactive={false} size="text-sm" />
              <span className="ml-2 text-gray-600 font-medium">({recipe.average_rating.toFixed(1)})</span>
            </div>
          ) : (
            <div className="mb-3 text-sm text-gray-500">Not rated yet</div>
          )}
          {/* Ingredients Match */}
          {typeof match_percentage === 'number' &&
            typeof available_ingredients_count === 'number' &&
            typeof required_ingredients_count === 'number' && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Ingredients available:</span>
                  <span className="font-medium">{available_ingredients_count}/{required_ingredients_count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(available_ingredients_count / required_ingredients_count) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
        </div>
        {/* Metadata row pinned to bottom */}
        <div className="mt-auto flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-emerald-50">
          <div className="flex items-center">
            <HiOutlineClock className="w-4 h-4 mr-1" />
            <span>{timeDisplay}</span>
          </div>
          <div className="flex items-center">
            <HiOutlineUserGroup className="w-4 h-4 mr-1" />
            <span>{Servings || 'Unknown'} {Servings === 1 ? 'serving' : 'servings'}</span>
          </div>
        </div>
      </div>
      {renderActions && typeof renderActions === 'function' && (
        <div className="px-6 pb-4 pt-0">{renderActions(recipe)}</div>
      )}
    </>
  );

  const cardClasses =
    'card group hover-lift w-full max-w-sm min-h-[520px] flex flex-col overflow-hidden animate-fade-in border border-gray-100';

  if (typeof onCardClick === 'function') {
    return (
      <div
        className={cardClasses + ' cursor-pointer'}
        onClick={() => onCardClick(recipe)}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && onCardClick(recipe)}
      >
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      to={`/recipe/${RecipeID}`}
      className={cardClasses + ' text-inherit no-underline'}
    >
      {cardContent}
    </Link>
  );
};

export default RecipeCard; 