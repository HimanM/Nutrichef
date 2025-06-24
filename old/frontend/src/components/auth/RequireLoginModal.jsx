import React from 'react';
import { Modal, Box, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';
import CancelIcon from '@mui/icons-material/Cancel';

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
  borderRadius: 2,
  textAlign: 'center',
};

const RequireLoginModal = ({ isOpen, onClose, title, redirectState }) => { // Added redirectState
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login', { state: redirectState }); // Pass state here
    if (onClose) onClose(); // Ensure onClose is called
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="require-login-modal-title"
      aria-describedby="require-login-modal-description"
    >
      <Box sx={style}>
        <Typography id="require-login-modal-title" variant="h6" component="h2">
          {title || 'Authentication Required'}
        </Typography>
        <Typography id="require-login-modal-description" sx={{ mt: 2, mb: 3 }}>
          You need to be logged in to perform this action. Please log in to continue.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            startIcon={<LoginIcon />}
            onClick={handleLogin}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<CancelIcon />}
            onClick={onClose}
          >
            Cancel
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default RequireLoginModal;
