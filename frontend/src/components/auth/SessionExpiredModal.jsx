import React from 'react';
import { useNavigate } from 'react-router-dom';
import InteractiveModal from '../InteractiveModal';
import { useAuth } from '../../context/AuthContext.jsx';

const SessionExpiredModal = () => {
  const { sessionExpiredMessage, setSessionExpiredMessage, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleCloseAndRedirect = () => {
    if (setSessionExpiredMessage) {
      setSessionExpiredMessage(null);
    }
    navigate('/login');
  };

  if (authLoading || !sessionExpiredMessage) {
    return null;
  }

  return (
    <InteractiveModal
      isOpen={Boolean(sessionExpiredMessage)}
      onClose={handleCloseAndRedirect}
      title="Session Expired"
      message={sessionExpiredMessage || "Your session has ended. Please log in again."}
      onConfirm={handleCloseAndRedirect}
      confirmText="Login Again"
      iconType="error"
      showCloseButton={false}
    />
  );
};

export default SessionExpiredModal;
