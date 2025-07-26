import React from 'react';
import { HiExclamationTriangle, HiXCircle, HiInformationCircle } from 'react-icons/hi2';

// Minimalist error display for admin pages
export const AdminErrorDisplay = ({
  error,
  type = 'error',
  className = '',
  onRetry = null,
  retryText = 'Retry'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <HiExclamationTriangle className="w-4 h-4" />;
      case 'info':
        return <HiInformationCircle className="w-4 h-4" />;
      default:
        return <HiXCircle className="w-4 h-4" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-red-50 border-red-200 text-red-700';
    }
  };

  return (
    <div className={`p-3 border rounded-md text-sm flex items-start gap-2 ${getStyles()} ${className}`}>
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1">
        <p>{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-xs underline hover:no-underline focus:outline-none"
          >
            {retryText}
          </button>
        )}
      </div>
    </div>
  );
};

// Full page error display for admin pages
export const AdminFullPageError = ({
  error,
  title = "Error",
  onRetry = null,
  retryText = 'Retry'
}) => {
  return (
    <div className="section-padding">
      <div className="container-modern">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">{title}</h1>
        </div>
        <div className="max-w-md mx-auto">
          <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-lg text-center">
            <HiXCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
            <p className="text-sm mb-4">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
              >
                {retryText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Fixed position toast-like error for mobile-friendly display
export const ToastError = ({
  error,
  type = 'error',
  onClose = null,
  autoClose = true,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoClose && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  if (!isVisible) return null;

  const getStyles = () => {
    switch (type) {
      case 'warning':
        return 'bg-amber-500 text-white';
      case 'info':
        return 'bg-blue-500 text-white';
      case 'success':
        return 'bg-emerald-500 text-white';
      default:
        return 'bg-red-500 text-white';
    }
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-slide-in md:left-auto md:right-4 md:max-w-sm">
      <div className={`p-4 rounded-lg shadow-lg ${getStyles()}`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {type === 'warning' && <HiExclamationTriangle className="w-5 h-5" />}
            {type === 'info' && <HiInformationCircle className="w-5 h-5" />}
            {type === 'error' && <HiXCircle className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{error}</p>
          </div>
          {onClose && (
            <button
              onClick={() => {
                setIsVisible(false);
                onClose();
              }}
              className="flex-shrink-0 text-white/80 hover:text-white"
            >
              <HiXCircle className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};