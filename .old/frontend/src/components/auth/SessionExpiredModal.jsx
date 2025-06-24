import React from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useAuth } from '../../context/AuthContext'; // Adjust path as needed

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  textAlign: 'center',
};

export default function SessionExpiredModal() {
  const { sessionExpiredMessage, setSessionExpiredMessage } = useAuth();
  const navigate = useNavigate();

  const handleCloseAndRedirect = () => {
    if (setSessionExpiredMessage) {
      setSessionExpiredMessage(null); // Clear the message in context
    }
    navigate('/login');
  };

  // Only render the modal if there's a message
  if (!sessionExpiredMessage) {
    return null;
  }

  return (
    <Modal
      open={Boolean(sessionExpiredMessage)}
      onClose={(event, reason) => {
        // Prevent closing on backdrop click or escape key if desired,
        // but for session expiry, forcing action via button is better.
        // For now, let's allow default close and redirect anyway.
        // if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
        handleCloseAndRedirect();
      }}
      aria-labelledby="session-expired-title"
      aria-describedby="session-expired-description"
    >
      <Box sx={style}>
        <Typography id="session-expired-title" variant="h6" component="h2">
          Session Expired
        </Typography>
        <Typography id="session-expired-description" sx={{ mt: 2 }}>
          {sessionExpiredMessage || "Your session has ended. Please log in again."}
        </Typography>
        <Button
          onClick={handleCloseAndRedirect}
          variant="contained"
          sx={{ mt: 3 }}
        >
          Login Again
        </Button>
      </Box>
    </Modal>
  );
}
