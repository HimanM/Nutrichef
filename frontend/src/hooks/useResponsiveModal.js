import { useState, useCallback } from 'react';

/**
 * Custom hook for managing responsive modal state
 * Provides consistent API for opening/closing modals with mobile-friendly features
 */
export const useResponsiveModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleModal = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    setIsOpen
  };
};

export default useResponsiveModal;