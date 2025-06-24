import React, { useRef, useState, useEffect } from 'react';


const MealItemCard = ({ recipe, onClick, renderActions }) => {
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

  const cardHeight = 'h-auto';

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center p-1 ${cardHeight} w-full max-w-[220px] 
        bg-blue-50 shadow-md rounded-lg overflow-hidden
        transition-all duration-300 ease-in-out
        ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : ''}
      `}
    >
      <div className="flex-grow overflow-hidden flex flex-col justify-center">
        <div
          title={recipe.Title || 'Untitled Recipe'}
          className="relative overflow-hidden"
        >
          <p
            ref={titleRef}
            className={`text-sm font-medium text-gray-800 whitespace-nowrap ${
              shouldMarquee ? 'animate-marquee' : 'overflow-hidden text-ellipsis'
            }`}
            style={{ maxWidth: '100%' }}
          >
            {recipe.Title || 'Untitled Recipe'}
          </p>
        </div>
      </div>

      {renderActions && typeof renderActions === 'function' && (
        <div className="ml-2 flex items-center flex-shrink-0">
          {renderActions(recipe)}
        </div>
      )}
    </div>
  );
};

export default MealItemCard;
