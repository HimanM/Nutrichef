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
      className={`fixed bottom-36 right-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 transition-all duration-200 ease-in-out hover:scale-110 z-30 ${
        showScrollButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <HiOutlineArrowUp className="w-5 h-5" />
    </button>
  );
};

export default FloatingScroller;
