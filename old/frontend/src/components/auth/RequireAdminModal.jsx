import React from 'react';
import { Modal, Box, Typography, Button, Stack } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CloseIcon from '@mui/icons-material/Close';

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

const RequireAdminModal = ({ isOpen, onClose, title }) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="require-admin-modal-title"
      aria-describedby="require-admin-modal-description"
    >
      <Box sx={style}>
        <AdminPanelSettingsIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
        <Typography id="require-admin-modal-title" variant="h6" component="h2">
          {title || 'Admin Access Required'}
        </Typography>
        <Typography id="require-admin-modal-description" sx={{ mt: 2, mb: 3 }}>
          You do not have the necessary permissions to access this page or perform this action. Administrator privileges are required.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloseIcon />}
            onClick={onClose}
          >
            Close
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default RequireAdminModal;
