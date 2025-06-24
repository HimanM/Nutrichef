import React from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';

const StarRating = ({ rating = 0, totalStars = 5, onRate, interactive = true, size = 'text-xl' }) => {
  return (
    <div className={`flex items-center ${interactive ? 'cursor-pointer' : ''} space-x-0.5`}>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <span
            key={starValue}
            onClick={() => interactive && onRate && onRate(starValue)}
            className={`${interactive ? 'hover:scale-110 transition-transform duration-200' : ''} ${size}`} 
            role={interactive ? "button" : "img"}
            aria-label={interactive ? `Rate ${starValue} stars` : `${starValue} out of ${totalStars} stars`}
            tabIndex={interactive ? 0 : -1}
            onKeyPress={(e) => interactive && onRate && e.key === 'Enter' && onRate(starValue)}
          >
            {starValue <= rating ? (
              <FaStar className="text-amber-400 drop-shadow-sm" />
            ) : (
              <FaRegStar className="text-gray-400 hover:text-amber-300 transition-colors duration-200" />
            )}
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;
