import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Alert, CircularProgress, InputAdornment, Link, Paper } from '@mui/material'; // Import Link from MUI
import { PersonOutline, EmailOutlined, LockOutlined, PersonAdd as PersonAddIcon } from '@mui/icons-material'; // Added PersonAddIcon
import { Link as RouterLink } from 'react-router-dom'; // Alias for clarity
// import '../styles/UserRegistration.css'; // Removed old CSS import

const UserRegistration = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // New state for confirm password
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setMessage('');
        setIsError(false);

        // Check if passwords match
        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            setIsError(true);
            setIsLoading(false); // Reset loading state
            return; // Stop submission
        }

        const userData = { name, email, password };

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const responseData = await response.json();

            if (response.ok) {
                // Backend now returns a message like: {"message": "Registration successful. Please check your email..."}
                setMessage(responseData.message || 'Registration successful!');
                setIsError(false);
                // Clear form fields after successful submission
                setName('');
                setEmail('');
                setPassword('');
                setConfirmPassword(''); // Clear confirm password field
            } else {
                setMessage(responseData.error || `Registration failed: ${response.statusText}`);
                setIsError(true);
            }
        } catch (error) {
            console.error('Registration System Error:', error);
            setMessage(`Registration failed: ${error.message}`);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box // Replace Container with Box
            sx={{
                minHeight: 'calc(100vh - 64px)', // Assuming 64px app bar
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3, // Overall padding
            }}
        >
            <Paper
                elevation={3}
                className="fade-in" // Animation class
                sx={(theme) => ({
                    p: { xs: 2, sm: 3 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: '400px',
                    transition: 'box-shadow 0.3s ease-in-out', // For hover effect
                    '&:hover': {
                        boxShadow: theme.shadows[6], // Increase shadow on hover
                    }
                })}
            >
                <Typography component="h1" variant="h5">
                    User Registration
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Name"
                        name="name"
                        autoComplete="name"
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isLoading}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PersonOutline />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        disabled={isLoading}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <EmailOutlined />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockOutlined />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        id="confirmPassword"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockOutlined />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary" // Ensure it uses primary color from theme
                        sx={{ mt: 3, mb: 2 }}
                        disabled={isLoading}
                        startIcon={<PersonAddIcon />} // Add icon here
                    >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
                    </Button>
                    {message && (
                        <Alert severity={isError ? "error" : "success"} sx={{ mt: 2, mb: 2 }}>
                            {message}
                        </Alert>
                    )}
                    <Box sx={{ textAlign: 'center', mt: 2, mb: 2 }}>
                        <Link 
                            component={RouterLink} 
                            to="/login" 
                            variant="body2" // Apply typography variant directly
                            sx={{ 
                                color: 'primary.main', // Access theme palette
                                textDecoration: 'none',
                                '&:hover': {
                                    textDecoration: 'underline',
                                },
                                fontWeight: 'medium'
                            }}
                        >
                            Already have an account? Sign In
                        </Link>
                    </Box>
                </Box>
            </Paper> {/* Close Paper */}
        </Box>
    );
};

export default UserRegistration;
