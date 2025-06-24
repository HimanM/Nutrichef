import React from 'react';
import { MdCheckCircleOutline, MdErrorOutline, MdClose } from 'react-icons/md';
import { AiOutlineLoading } from 'react-icons/ai';

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
  if (iconType === 'success') displayIcon = <MdCheckCircleOutline className="h-6 w-6 text-green-400 mr-2" />;
  if (iconType === 'error') displayIcon = <MdErrorOutline className="h-6 w-6 text-red-400 mr-2" />;

  const isConfirmDialog = typeof onConfirm === 'function';
  const actualPrimaryActionText = primaryActionText || 'OK';


  return (
    <div
      className="fixed inset-0 bg-gray-800/30 backdrop-blur-sm overflow-y-auto h-full w-full flex justify-center items-center z-40 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="relative bg-gray-800 rounded-lg shadow-xl p-5 sm:p-6 max-w-md w-full mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            {displayIcon}
            {title && <h3 className="text-xl font-semibold text-gray-100">{title}</h3>}
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-gray-400 bg-transparent hover:bg-gray-700 hover:text-gray-100 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
              aria-label="Close modal"
            >
              <MdClose className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="mb-5 text-gray-300 text-sm">
          {message && <p>{message}</p>}
          {children}
        </div>

        <div className="flex justify-end items-center space-x-3 pt-4 border-t border-gray-700">
          {isConfirmDialog ? (
            <>
              {onCancel && (
                 <button
                    onClick={handleCancel}
                    className="py-2 px-4 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg focus:ring-4 focus:outline-none focus:ring-gray-600"
                >
                    {cancelText}
                </button>
              )}
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="gradient-button-no-format text-sm font-medium px-4 py-2 flex items-center disabled:opacity-75"
              >
                {isLoading && <AiOutlineLoading className="animate-spin h-5 w-5 text-white mr-2" />}
                {isLoading ? 'Processing...' : confirmText}
              </button>
            </>
          ) : (
             <button
                onClick={handlePrimaryAction}
                className="gradient-button-no-format text-sm font-medium px-4 py-2 flex items-center disabled:opacity-75"
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
