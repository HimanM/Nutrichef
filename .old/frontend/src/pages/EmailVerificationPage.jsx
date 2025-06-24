import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Container, Typography, CircularProgress, Alert, Button, Box } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useTheme } from '@mui/material/styles'; // To access theme colors

const EmailVerificationPage = () => {
    const theme = useTheme(); // Hook to access theme
    const { token } = useParams();
    const [verificationStatus, setVerificationStatus] = useState('pending');
    const [message, setMessage] = useState('');
    const effectRanOnThisMount = useRef(false); // Renamed for clarity

    useEffect(() => {
        // If this specific effect invocation has already run its course for this mount, skip.
        if (effectRanOnThisMount.current) {
            return;
        }
        // Mark that this effect will now run its logic.
        effectRanOnThisMount.current = true;

        if (!token) {
            setVerificationStatus('error');
            setMessage('No verification token provided.');
            return; // No cleanup needed here as effectRanOnThisMount is already true for this run.
        }

        const verifyToken = async () => {
            // No need to check effectRanOnThisMount.current here again,
            // as this function is only called if the above check passes.
            setVerificationStatus('pending');
            setMessage('');
            try {
                console.log("Frontend: Calling /api/verify-email one time."); // Added log
                const response = await fetch(`/api/verify-email/${token}`);
                const responseData = await response.json();

                if (response.ok) {
                    setVerificationStatus('success');
                    setMessage(responseData.message || 'Email successfully verified! You can now log in.');
                } else {
                    setVerificationStatus('error');
                    setMessage(responseData.error || `Verification failed: ${response.statusText}`);
                }
            } catch (error) {
                console.error('Email Verification System Error:', error);
                setVerificationStatus('error');
                setMessage(`Verification failed: ${error.message}`);
            }
        };

        verifyToken();

    }, [token]); // Dependency: token

    return (
        <Container component="main" maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                }}
            >
                <Typography component="h1" variant="h5" gutterBottom>
                    Email Verification
                </Typography>

                {verificationStatus === 'pending' && (
                    <Box>
                        <CircularProgress sx={{ mb: 2 }} />
                        <Typography>Verifying your email, please wait...</Typography>
                    </Box>
                )}

                {verificationStatus === 'success' && (
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <CheckCircleOutlineIcon sx={{ fontSize: '4rem', color: theme.palette.success?.main || theme.palette.primary.main, mb: 2 }} />
                        <Alert severity="success" sx={{ mb: 2, width: '100%' }}>{message}</Alert>
                        <Button
                            component={RouterLink}
                            to="/login"
                            variant="contained"
                            color="primary" // This will use theme.palette.primary.main
                            sx={{ mt: 1, '&:hover': { bgcolor: theme.palette.primary.dark } }}
                        >
                            Go to Login
                        </Button>
                    </Box>
                )}

                {verificationStatus === 'error' && (
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <ErrorOutlineIcon sx={{ fontSize: '4rem', color: theme.palette.error?.main || theme.palette.secondary.main, mb: 2 }} />
                        <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{message}</Alert>
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            <Button
                                component={RouterLink}
                                to="/register"
                                variant="outlined"
                                color="secondary" // This will use theme.palette.secondary.main
                                sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}
                            >
                                Go to Registration
                            </Button>
                            {/* Optional: Add a button to go to homepage or try again */}
                            {/* <Button component={RouterLink} to="/" variant="outlined" color="primary">Go to Homepage</Button> */}
                        </Box>
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default EmailVerificationPage;
