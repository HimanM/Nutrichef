/**
 * Common styles and CSS classes used throughout the application
 */

// Button styles
export const BUTTON_STYLES = {
  primary: 'btn-primary px-6 py-2 rounded-lg font-medium shadow-md flex items-center gap-2 hover:scale-105 transition-transform',
  secondary: 'px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200',
  success: 'px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-all duration-200',
  danger: 'px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200',
  warning: 'px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-all duration-200',
  info: 'px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200',
  disabled: 'opacity-60 cursor-not-allowed'
};

// Input styles
export const INPUT_STYLES = {
  base: 'w-full px-3 py-2 border border-emerald-200 rounded-lg bg-white text-emerald-700 placeholder-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all',
  small: 'w-full px-3 py-2 border border-emerald-200 rounded-lg bg-white text-emerald-700 placeholder-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm',
  error: 'border-red-300 focus:ring-red-500 focus:border-red-500',
  disabled: 'bg-emerald-50 opacity-75 cursor-not-allowed'
};

// Message styles
export const MESSAGE_STYLES = {
  success: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  error: 'bg-red-100 text-red-700 border border-red-200',
  warning: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  info: 'bg-blue-100 text-blue-700 border border-blue-200',
  base: 'mt-3 p-3 rounded-md text-sm'
};

// Container styles
export const CONTAINER_STYLES = {
  card: 'bg-white rounded-2xl shadow-2xl border border-emerald-100',
  modal: 'bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto',
  section: 'section-padding',
  modern: 'container-modern'
};

// Animation classes
export const ANIMATION_STYLES = {
  fadeIn: 'animate-fade-in',
  slideIn: 'animate-slide-in',
  scaleOnHover: 'hover:scale-105 transition-transform',
  spinnerSpin: 'animate-spin'
};

// Common utility functions
export const getMessageClassName = (type) => {
  return `${MESSAGE_STYLES.base} ${MESSAGE_STYLES[type] || MESSAGE_STYLES.info}`;
};

export const getButtonClassName = (variant = 'primary', disabled = false) => {
  let baseClass = BUTTON_STYLES[variant] || BUTTON_STYLES.primary;
  if (disabled) {
    baseClass += ` ${BUTTON_STYLES.disabled}`;
  }
  return baseClass;
};

export const getInputClassName = (hasError = false, disabled = false, size = 'base') => {
  let baseClass = INPUT_STYLES[size] || INPUT_STYLES.base;
  if (hasError) {
    baseClass += ` ${INPUT_STYLES.error}`;
  }
  if (disabled) {
    baseClass += ` ${INPUT_STYLES.disabled}`;
  }
  return baseClass;
};

// Color utilities
export const COLORS = {
  primary: 'emerald',
  secondary: 'gray',
  success: 'emerald',
  danger: 'red',
  warning: 'yellow',
  info: 'blue'
};

// Responsive breakpoints
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

export default {
  BUTTON_STYLES,
  INPUT_STYLES,
  MESSAGE_STYLES,
  CONTAINER_STYLES,
  ANIMATION_STYLES,
  COLORS,
  BREAKPOINTS,
  getMessageClassName,
  getButtonClassName,
  getInputClassName
};
