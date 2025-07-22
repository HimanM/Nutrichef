import React, { createContext, useState, useContext, useCallback, useRef } from 'react';
import InteractiveModal from '../components/ui/InteractiveModal';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    open: false,
    title: '',
    message: '',
    modalType: 'alert',
    isLoading: false,
    iconType: null,
    confirmText: 'OK',
    cancelText: 'Cancel',
  });

  const promiseCallbacks = useRef(null);

  const showModal = useCallback((type, title, message, options = {}) => {
    return new Promise((resolve, reject) => {
      setModalState({
        open: true,
        title,
        message,
        modalType: type,
        isLoading: false,
        iconType: options.iconType || null,
        confirmText: options.confirmText || (type === 'alert' ? 'OK' : 'Confirm'),
        cancelText: options.cancelText || 'Cancel',
      });
      promiseCallbacks.current = { resolve, reject };
    });
  }, []);

   const showAlert = useCallback((title, message, options = {}) => {
    return showModal('alert', title, message, { iconType: options.iconType || 'info', ...options });
  }, [showModal]);


  const hideModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, open: false, isLoading: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (promiseCallbacks.current) {
        promiseCallbacks.current.resolve(true);
    }
    hideModal();
  }, [hideModal]);

  const handleCancel = useCallback(() => {
    if (promiseCallbacks.current) {
        promiseCallbacks.current.resolve(false);
    }
    hideModal();
  }, [hideModal]);

  const setLoading = useCallback((isLoading) => {
    setModalState(prev => ({ ...prev, isLoading }));
  }, []);

  let interactiveModalProps = {
    isOpen: modalState.open,
    onClose: () => {
        if (modalState.modalType === 'alert') {
            handleConfirm();
        } else {
            handleCancel();
        }
    },
    title: modalState.title,
    message: modalState.message,
    isLoading: modalState.isLoading,
    iconType: modalState.iconType,
  };

  if (modalState.modalType === 'alert') {
    interactiveModalProps.primaryActionText = modalState.confirmText;
    interactiveModalProps.onConfirm = handleConfirm;
    interactiveModalProps.confirmText = modalState.confirmText;
  } else if (modalState.modalType === 'confirm') {
    interactiveModalProps.onConfirm = handleConfirm;
    interactiveModalProps.confirmText = modalState.confirmText;
    interactiveModalProps.onCancel = handleCancel;
    interactiveModalProps.cancelText = modalState.cancelText;
  } else if (modalState.modalType === 'prompt') {
    interactiveModalProps.message = `${modalState.message}\n(Prompt input is not yet implemented in this version of the modal.)`;
    interactiveModalProps.onConfirm = handleConfirm;
    interactiveModalProps.confirmText = modalState.confirmText || "Submit";
    interactiveModalProps.onCancel = handleCancel;
    interactiveModalProps.cancelText = modalState.cancelText;
  }

  return (
    <ModalContext.Provider value={{ showModal, showAlert, hideModal, setLoading }}>
      {children}
      <InteractiveModal {...interactiveModalProps} />
    </ModalContext.Provider>
  );
};
