import React from 'react';
import { HiOutlineCheckCircle, HiOutlineExclamation, HiOutlineX, HiOutlineRefresh } from 'react-icons/hi';
import ResponsiveModal from './ResponsiveModal';

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
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showCloseButton={showCloseButton}
      maxWidth="max-w-md"
      dragToClose={true}
    >
      <div className="space-y-6">
        {/* Icon and Message Section */}
        <div className="flex items-start">
          {displayIcon}
          <div className="flex-1">
            {message && <div className="text-gray-600 leading-relaxed">{message}</div>}
            {children}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end items-center space-x-3 pt-4 border-t border-gray-200">
          {isConfirmDialog ? (
            <>
              {onCancel && showCancelButton && (
                 <button
                    onClick={handleCancel}
                    className="btn-outline text-sm touch-manipulation"
                    disabled={isLoading}
                >
                    {cancelText}
                </button>
              )}
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="btn-primary text-sm disabled:opacity-75 disabled:cursor-not-allowed touch-manipulation"
              >
                {isLoading && <HiOutlineRefresh className="animate-spin h-4 w-4 mr-2" />}
                {isLoading ? 'Processing...' : confirmText}
              </button>
            </>
          ) : (
             <button
                onClick={handlePrimaryAction}
                className="btn-primary text-sm touch-manipulation"
                disabled={isLoading}
            >
                {actualPrimaryActionText}
            </button>
          )}
        </div>
      </div>
    </ResponsiveModal>
  );
};

export default InteractiveModal;
