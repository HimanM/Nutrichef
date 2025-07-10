import React from 'react';
import { HiOutlineCheckCircle, HiOutlineExclamation, HiOutlineX, HiOutlineRefresh } from 'react-icons/hi';

const InteractiveModal = ({
  isOpen,
  onClose,
  title,
  message,
  children,
  onConfirm,
  confirmText = 'Confirm',
  onCancel,
  cancelText = 'Cancel',
  isLoading = false,
  iconType = null,
  showCloseButton = true,
  primaryActionText,
  showCancelButton = true,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm && !isLoading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const handlePrimaryAction = () => {
    if (onClose && !onConfirm) {
        onClose();
    }
  };

  let displayIcon = null;
  if (iconType === 'success') {
    displayIcon = (
      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
        <HiOutlineCheckCircle className="h-6 w-6 text-emerald-600" />
      </div>
    );
  }
  if (iconType === 'error') {
    displayIcon = (
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
        <HiOutlineExclamation className="h-6 w-6 text-red-600" />
      </div>
    );
  }

  const isConfirmDialog = typeof onConfirm === 'function';
  const actualPrimaryActionText = primaryActionText || 'OK';

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm overflow-y-auto h-full w-full flex justify-center items-center z-[9999] px-4 py-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative card-glass p-6 max-w-md w-full mx-auto animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center">
            {displayIcon}
            {title && <h3 className="text-xl font-semibold text-gray-800">{title}</h3>}
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              aria-label="Close modal"
            >
              <HiOutlineX className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="mb-6 text-gray-600">
          {message && <p className="leading-relaxed">{message}</p>}
          {children}
        </div>

        <div className="flex justify-end items-center space-x-3 pt-4 border-t border-gray-200">
          {isConfirmDialog ? (
            <>
              {onCancel && showCancelButton && (
                 <button
                    onClick={handleCancel}
                    className="btn-outline text-sm"
                >
                    {cancelText}
                </button>
              )}
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="btn-primary text-sm disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isLoading && <HiOutlineRefresh className="animate-spin h-4 w-4 mr-2" />}
                {isLoading ? 'Processing...' : confirmText}
              </button>
            </>
          ) : (
             <button
                onClick={handlePrimaryAction}
                className="btn-primary text-sm"
            >
                {actualPrimaryActionText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveModal;
