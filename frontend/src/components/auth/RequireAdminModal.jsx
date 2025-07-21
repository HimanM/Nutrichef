import React from 'react';
import InteractiveModal from '../ui/InteractiveModal';

const RequireAdminModal = ({
  isOpen,
  onClose,
  title = "Admin Access Required",
  message = "You do not have the necessary permissions to access this page or perform this action. Administrator privileges are required."
}) => {

  const handlePrimaryAction = () => {
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
      primaryActionText="OK"
      iconType="error"
      showCloseButton={true}
    />
  );
};

export default RequireAdminModal;
