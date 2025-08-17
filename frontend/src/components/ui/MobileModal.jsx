import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HiOutlineX } from 'react-icons/hi';

const MobileModal = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  className = '',
  dragToClose = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [_dragY, setDragY] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [_isAnimating, setIsAnimating] = useState(false);
  const modalRef = useRef(null);
  const dragHandleRef = useRef(null);

  const DRAG_THRESHOLD = 100; // Minimum drag distance to close
  const VELOCITY_THRESHOLD = 0.5; // Minimum velocity to close

  // Handle close with animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    if (modalRef.current) {
      modalRef.current.style.transition = 'transform 300ms ease-in, opacity 300ms ease-in';
      modalRef.current.style.transform = 'translateY(100%)';
      modalRef.current.style.opacity = '0';
    }
    
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setDragY(0);
      if (modalRef.current) {
        modalRef.current.style.transition = '';
        modalRef.current.style.transform = '';
        modalRef.current.style.opacity = '';
      }
    }, 300);
  }, [onClose]);

  // Handle touch start - only from drag handle
  const handleTouchStart = useCallback((e) => {
    if (!dragToClose) return;
    
    // Only allow dragging from the drag handle area
    if (!dragHandleRef.current?.contains(e.target)) return;
    
    const touch = e.touches[0];
    setStartY(touch.clientY);
    setIsDragging(true);
    setDragY(0);
  }, [dragToClose]);

  // Handle touch move
  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !dragToClose) return;
    
    const touch = e.touches[0];
    const currentY = touch.clientY;
    const deltaY = Math.max(0, currentY - startY); // Only allow downward drag
    
    setDragY(deltaY);
    
    // Add resistance effect when dragging
    if (modalRef.current) {
      const resistance = Math.min(deltaY / 3, 150); // Max 150px drag with resistance
      modalRef.current.style.transition = 'none'; // Disable transition during drag
      modalRef.current.style.transform = `translateY(${resistance}px)`;
      modalRef.current.style.opacity = Math.max(0.3, 1 - (deltaY / 300));
    }
  }, [isDragging, startY, dragToClose]);

  // Handle touch end
  const handleTouchEnd = useCallback((e) => {
    if (!isDragging || !dragToClose) return;
    
    const touch = e.changedTouches[0];
    const endY = touch.clientY;
    const deltaY = endY - startY;
    const velocity = Math.abs(deltaY) / 100; // Simple velocity calculation
    
    setIsDragging(false);
    
    // Determine if should close based on drag distance or velocity
    const shouldClose = deltaY > DRAG_THRESHOLD || velocity > VELOCITY_THRESHOLD;
    
    if (shouldClose && deltaY > 0) {
      handleClose();
    } else {
      // Reset position with smooth animation
      if (modalRef.current) {
        modalRef.current.style.transition = 'transform 300ms ease-out, opacity 300ms ease-out';
        modalRef.current.style.transform = 'translateY(0)';
        modalRef.current.style.opacity = '1';
      }
      setDragY(0);
    }
  }, [isDragging, startY, dragToClose, handleClose, DRAG_THRESHOLD, VELOCITY_THRESHOLD]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  // Handle opening animation
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Start from bottom (translated down)
      if (modalRef.current) {
        modalRef.current.style.transform = 'translateY(100%)';
        modalRef.current.style.opacity = '0';
        
        // Trigger slide up animation
        requestAnimationFrame(() => {
          if (modalRef.current) {
            modalRef.current.style.transition = 'transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 400ms ease-out';
            modalRef.current.style.transform = 'translateY(0)';
            modalRef.current.style.opacity = '1';
          }
        });
      }
      
      setTimeout(() => setIsAnimating(false), 400);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('mobile-modal-open');
    } else {
      document.body.classList.remove('mobile-modal-open');
      setIsAnimating(false);
    }

    return () => {
      document.body.classList.remove('mobile-modal-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 md:hidden"
      onClick={handleBackdropClick}
    >
      {/* Backdrop with fade-in animation */}
      <div className={`absolute inset-0 bg-black/50 mobile-modal-backdrop transition-opacity duration-300 ${
        isOpen && !isClosing ? 'opacity-100' : 'opacity-0'
      }`} />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className={`
          absolute bottom-0 left-0 right-0 
          bg-white rounded-t-3xl shadow-2xl
          max-h-[90vh] flex flex-col
          ${className}
        `}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          touchAction: dragToClose ? 'none' : 'auto',
          transform: 'translateY(100%)', // Start from bottom
          opacity: '0',
        }}
      >
        {/* Drag Handle */}
        {dragToClose && (
          <div 
            ref={dragHandleRef}
            className="mobile-modal-drag-handle"
          >
            <div className="mobile-modal-drag-indicator" />
          </div>
        )}
        
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            {title && (
              <h2 className="text-xl font-semibold text-gray-900 truncate">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
                aria-label="Close modal"
              >
                <HiOutlineX className="w-6 h-6" />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 mobile-scroll mobile-modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MobileModal;