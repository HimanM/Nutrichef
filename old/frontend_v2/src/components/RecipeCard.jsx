import React from 'react';
import { Link } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import StarRating from './StarRating';

const defaultRecipe = {
  RecipeID: 'sample-123',
  ImageURL: 'https://via.placeholder.com/300x200?text=Recipe+Image',
  Title: 'Delicious Sample Recipe Title that Might Be Quite Long',
  Description: 'This is a wonderfully tasty sample recipe description that provides a bit more detail about what to expect. It could also be very long and require truncation. In fact, this could even span multiple lines and you might want to read all of it!',
  match_percentage: 85,
  available_ingredients_count: 5,
  required_ingredients_count: 6,
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
  } = recipe;

  const cardContent = (
    <>
      <img
        src={ImageURL || '/placeholder-image.jpg'}
        alt={Title || 'Recipe image'}
        className="w-full h-40 object-cover bg-gray-700"
      />

      <div className="p-4 flex flex-col flex-grow overflow-hidden w-full text-left">
        <Tooltip title={Title || 'Untitled Recipe'}>
          <h3
            className="text-lg font-semibold text-white mb-1 truncate w-full"
          >
            {Title || 'Untitled Recipe'}
          </h3>
        </Tooltip>

        <p
          className="text-sm text-gray-300 mb-2 overflow-hidden"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {Description || 'No description available.'}
        </p>

        {typeof recipe.average_rating === 'number' && recipe.average_rating > 0 ? (
          <div className="mt-1 mb-2 flex items-center text-xs text-gray-400">
            <span className="mr-1">Rating:</span>
            <StarRating rating={recipe.average_rating} interactive={false} size="text-sm" />
            <span className="ml-1">({recipe.average_rating.toFixed(1)})</span>
          </div>
        ) : (
          <p className="text-xs text-gray-500 mt-1 mb-2">Not rated yet</p>
        )}

        {typeof match_percentage === 'number' && (
          <p className="text-xs text-gray-400 mt-auto">
            Match: <strong className="font-medium">{match_percentage}%</strong>
            {typeof available_ingredients_count === 'number' &&
             typeof required_ingredients_count === 'number' && (
              ` (${available_ingredients_count} of ${required_ingredients_count} ingredients)`
            )}
          </p>
        )}
      </div>

      {renderActions && typeof renderActions === 'function' && (
        <div className="p-2 pt-0 mt-auto border-t border-gray-700">
          {renderActions(recipe)}
        </div>
      )}
    </>
  );

  const cardClasses =
    'w-[250px] h-[400px] bg-gray-800 rounded-xl shadow-lg hover:shadow-blue-500/30 hover:bg-gray-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col items-center text-center overflow-hidden m-2';

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
