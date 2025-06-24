import React from 'react';
import { Modal, Box, Typography, Button, TextField, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
// For future use:
// import WarningAmberIcon from '@mui/icons-material/WarningAmber';
// import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const InteractiveModal = ({
  open,
  onClose,
  title,
  message,
  modalType = 'alert', // 'alert', 'confirm', 'prompt'
  onConfirm,
  onCancel,
  promptLabel,
  promptValue,
  setPromptValue,
  isLoading = false, // To show a loader on confirm button
  iconType = null, // 'success', 'error', 'warning', 'info', or null
}) => {
  const theme = useTheme();

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`, // Softer, theme-aligned border
    boxShadow: theme.shadows[12], // Using theme shadows system, 12 is a moderate shadow for a modal
    p: 4,
    borderRadius: theme.shape.borderRadius, // Standard theme border radius
    // borderColor: theme.palette.divider, // Covered by 'border' shorthand now
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose(); // Always close on cancel
  };

  const handleAlertOk = () => {
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={(event, reason) => {
        // Prevent closing on backdrop click for confirm/prompt modals if desired,
        // but for now, let's allow it.
        // if (reason === 'backdropClick' && (modalType === 'confirm' || modalType === 'prompt')) {
        //   return;
        // }
        onClose();
      }}
      aria-labelledby="custom-modal-title"
      aria-describedby="custom-modal-description"
    >
      <Box sx={style}>
        {title && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {iconType === 'success' && <CheckCircleOutlineIcon sx={{ color: theme.palette.success.main, fontSize: '2rem', mr: 1.5 }} />}
            {iconType === 'error' && <ErrorOutlineIcon sx={{ color: theme.palette.error.main, fontSize: '2rem', mr: 1.5 }} />}
            {/* Example for future warning icon:
            {iconType === 'warning' && <WarningAmberIcon sx={{ color: theme.palette.warning.main, fontSize: '2rem', mr: 1.5 }} />}
            */}
            {/* Example for future info icon:
            {iconType === 'info' && <InfoOutlinedIcon sx={{ color: theme.palette.info.main, fontSize: '2rem', mr: 1.5 }} />}
            */}
            <Typography id="custom-modal-title" variant="h6" component="h2" sx={{ color: theme.palette.text.primary }}>
              {title}
            </Typography>
          </Box>
        )}
        <Typography id="custom-modal-description" sx={{ mb: 3, color: theme.palette.text.primary, ...(iconType && !title && { mt: 2 }) /* Add margin top if there's an icon but no title */ }}>
          {/* If there's an icon and no title, we might want to align the message with where the title would have been, or add the icon directly before the message. */}
          {/* For simplicity, let's assume icons are primarily for titles. If a message needs an icon without a title, this part might need more specific styling. */}
          {/* The current logic places icons next to the title. If no title, icon won't show based on current placement. */}
          {/* If an icon should be shown with message when title is absent, the logic would need adjustment here. */}
          {message}
        </Typography>

        {modalType === 'prompt' && (
          <TextField
            fullWidth
            label={promptLabel || 'Enter value'}
            value={promptValue}
            onChange={(e) => setPromptValue && setPromptValue(e.target.value)}
            variant="outlined"
            sx={{ mb: 3 }}
          />
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          {modalType === 'alert' && (
            <Button variant="contained" onClick={handleAlertOk} color="primary">
              OK
            </Button>
          )}

          {modalType === 'confirm' && (
            <>
              <Button variant="outlined" onClick={handleCancel} color="secondary">
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleConfirm}
                color="primary"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                Confirm
              </Button>
            </>
          )}

          {modalType === 'prompt' && (
            <>
              <Button variant="outlined" onClick={handleCancel} color="secondary">
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleConfirm}
                color="primary"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                Submit
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default InteractiveModal;
