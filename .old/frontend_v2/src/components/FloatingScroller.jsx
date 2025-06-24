import React, { useState, useEffect } from 'react';

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
      style={{ display: showScrollButton ? 'block' : 'none' }}
      className="fixed bottom-25 right-8 gradient-box text-white font-bold py-2 px-4 rounded-full shadow-lg transition-opacity duration-300 opacity-75 hover:opacity-100"
    >
      &uarr;
    </button>
  );
};

export default FloatingScroller;
