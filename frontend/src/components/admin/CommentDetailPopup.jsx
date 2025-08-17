import React, { useState, useEffect } from 'react';
import { HiX, HiClock, HiUser, HiChat } from 'react-icons/hi';

const CommentDetailPopup = ({ comment, onClose }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (!comment) {
    return null;
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString() + ' ' +
      new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Mobile Modal Component
  const MobileModal = () => {
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const handleTouchStart = (e) => {
      setStartY(e.touches[0].clientY);
      setCurrentY(e.touches[0].clientY);
      setIsDragging(true);
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      setCurrentY(e.touches[0].clientY);
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;
      
      const deltaY = currentY - startY;
      
      // If dragged down more than 100px, close the modal
      if (deltaY > 100) {
        onClose();
      }
      
      setIsDragging(false);
      setStartY(0);
      setCurrentY(0);
    };

    const dragOffset = isDragging ? Math.max(0, currentY - startY) : 0;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
        <div 
          className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-hidden shadow-2xl"
          style={{ transform: `translateY(${dragOffset}px)` }}
        >
          {/* Drag Handle */}
          <div 
            className="flex justify-center py-3 bg-gray-50 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <HiChat className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">Comment Details</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <HiX className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
            <CommentContent comment={comment} />
          </div>
        </div>
      </div>
    );
  };

  // Desktop Modal Component  
  const DesktopModal = () => (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <HiChat className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-semibold text-gray-900">Comment Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <HiX className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <CommentContent comment={comment} />
        </div>
      </div>
    </div>
  );

  return isMobile ? <MobileModal /> : <DesktopModal />;
};

// Shared Content Component
const CommentContent = ({ comment }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString() + ' ' +
      new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Comment Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comment ID</label>
            <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">#{comment.CommentID}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md">
              <span className="inline-block w-6 h-6 bg-emerald-500 rounded-full text-white text-xs font-semibold leading-6 text-center">
                {comment.Username ? comment.Username[0].toUpperCase() : 'U'}
              </span>
              <span className="text-sm font-medium text-gray-900">{comment.Username}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipe</label>
            <p className="text-sm text-emerald-600 font-medium bg-gray-50 px-3 py-2 rounded-md">
              {comment.RecipeTitle}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <div className="bg-gray-50 px-3 py-2 rounded-md">
              {comment.IsEdited ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Edited
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Original
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comment Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
            {comment.Comment}
          </p>
        </div>
      </div>

      {/* Timestamps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Posted</label>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
            <HiClock className="w-4 h-4" />
            <span>{formatDate(comment.CreatedAt)}</span>
          </div>
        </div>

        {comment.IsEdited && comment.UpdatedAt && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Edited</label>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
              <HiClock className="w-4 h-4" />
              <span>{formatDate(comment.UpdatedAt)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentDetailPopup;
