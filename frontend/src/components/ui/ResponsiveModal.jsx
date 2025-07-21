import React from 'react';
import MobileModal from './MobileModal';

const ResponsiveModal = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  className = '',
  dragToClose = true,
  // Desktop modal props
  desktopClassName = '',
  maxWidth = 'max-w-2xl',
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Modal - Full screen with drag to close */}
      <MobileModal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        showCloseButton={showCloseButton}
        className={className}
        dragToClose={dragToClose}
      >
        {children}
      </MobileModal>

      {/* Desktop Modal - Traditional centered modal */}
      <div className="fixed inset-0 z-50 hidden md:flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div
          className={`
            relative bg-white rounded-2xl shadow-2xl
            w-full ${maxWidth} max-h-[90vh] flex flex-col
            animate-fade-in border border-gray-100
            ${desktopClassName}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              {title && (
                <h2 className="text-xl font-semibold text-gray-900">
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default ResponsiveModal;