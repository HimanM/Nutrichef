import React, { useState, useEffect } from 'react';
import { HiOutlineArrowUp } from 'react-icons/hi';

const FloatingScroller = () => {
  const [showScrollButton, setShowScrollButton] = useState(false);

  const handleScroll = () => {
    if (window.scrollY > 100) {
      setShowScrollButton(true);
    } else {
      setShowScrollButton(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      title="Scroll to top"
      className={`fixed bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 transition-all duration-200 ease-in-out hover:scale-110 z-30 
        ${showScrollButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
        
        /* Mobile positioning - bottom right, above chatbot */
        bottom-20 right-4 p-3
        sm:bottom-22 sm:right-6 sm:p-4
        
        /* Touch-friendly mobile sizing */
        touch-manipulation
        min-h-[52px] min-w-[52px]
        sm:min-h-[56px] sm:min-w-[56px]
      `}
    >
      <HiOutlineArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
    </button>
  );
};

export default FloatingScroller;
