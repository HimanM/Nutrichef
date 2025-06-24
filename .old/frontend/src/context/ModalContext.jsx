import React, { createContext, useState, useContext, useCallback, useRef } from 'react';
import InteractiveModal from '../components/InteractiveModal';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    open: false,
    title: '',
    message: '',
    modalType: 'alert', // 'alert', 'confirm', 'prompt'
    promptLabel: '',
    initialPromptValue: '', // For resetting prompt
    isLoading: false,
  });

  const [promptValue, setPromptValue] = useState('');

  // Using a ref to store the resolve/reject functions of the promise
  const promiseCallbacks = useRef(null);

  const showModal = useCallback((type, title, message, options = {}) => {
    return new Promise((resolve, reject) => {
      setModalState({
        open: true,
        title,
        message,
        modalType: type,
        promptLabel: options.promptLabel || '',
        initialPromptValue: options.initialPromptValue || '',
        isLoading: false,
      });
      setPromptValue(options.initialPromptValue || ''); // Reset prompt field
      promiseCallbacks.current = { resolve, reject };
    });
  }, []);

  const showAlert = useCallback((title, message) => {
    // For alerts, we don't typically need a promise that waits for OK.
    // If we wanted one, it would resolve on OK.
    setModalState({
      open: true,
      title,
      message,
      modalType: 'alert',
      isLoading: false,
    });
    // No promise needed for simple alert, or could resolve immediately.
  }, []);

  const hideModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, open: false, isLoading: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (promiseCallbacks.current) {
      if (modalState.modalType === 'prompt') {
        promiseCallbacks.current.resolve(promptValue);
      } else {
        promiseCallbacks.current.resolve(true);
      }
    }
    hideModal();
  }, [hideModal, modalState.modalType, promptValue]);

  const handleCancel = useCallback(() => {
    if (promiseCallbacks.current) {
      if (modalState.modalType === 'prompt') {
        promiseCallbacks.current.resolve(null); // Resolve with null for cancelled prompt
      } else {
        promiseCallbacks.current.resolve(false); // Resolve with false for cancelled confirm
      }
    }
    hideModal();
  }, [hideModal, modalState.modalType]);

  const handleAlertOk = useCallback(() => {
    // If showAlert returned a promise, it would be resolved here.
    hideModal();
  }, [hideModal]);

  // Function to set loading state, e.g., before an async operation
  const setLoading = useCallback((isLoading) => {
    setModalState(prev => ({ ...prev, isLoading }));
  }, []);


  return (
    <ModalContext.Provider value={{ showModal, showAlert, hideModal, setLoading }}>
      {children}
      <InteractiveModal
        open={modalState.open}
        onClose={() => { // Handle backdrop click or ESC
          if (modalState.modalType === 'alert') {
            handleAlertOk();
          } else {
            // For confirm/prompt, backdrop click is like a cancel
            handleCancel();
          }
        }}
        title={modalState.title}
        message={modalState.message}
        modalType={modalState.modalType}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        promptLabel={modalState.promptLabel}
        promptValue={promptValue}
        setPromptValue={setPromptValue}
        isLoading={modalState.isLoading}
      />
    </ModalContext.Provider>
  );
};
