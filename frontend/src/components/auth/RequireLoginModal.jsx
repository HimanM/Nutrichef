import React from 'react';
import { useNavigate } from 'react-router-dom';
import InteractiveModal from '../ui/InteractiveModal';

const RequireLoginModal = ({
  isOpen,
  onClose,
  title = "Login Required",
  message = "You need to be logged in to access this page or perform this action. Please login to continue.",
  redirectState
}) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login', { state: redirectState });
    if (onClose) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <InteractiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      message={message}
      onConfirm={handleLogin}
      confirmText="Login"
      onCancel={handleCancel}
      cancelText="Cancel"
      showCloseButton={true}
      iconType="info"
    />
  );
};

export default RequireLoginModal;
