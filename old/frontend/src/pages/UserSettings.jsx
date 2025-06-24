import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useAuth } from '../context/AuthContext'; // Adjust path as needed
import { useModal } from '../context/ModalContext'; // Import useModal
// import '../styles/UserSettings.css'; // CSS import removed
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Alert,
    CircularProgress,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Chip,
    InputAdornment,
    IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const UserSettings = () => {
    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState(''); // New state for confirm password
    const [passwordMessage, setPasswordMessage] = useState({ text: '', type: 'info' }); // Updated state for typed messages
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Allergies State
    const [allAllergies, setAllAllergies] = useState([]); // Stores all available allergies from API
    const [selectedAllergyIds, setSelectedAllergyIds] = useState([]); // Stores IDs of user's selected allergies
    const [allergiesMessage, setAllergiesMessage] = useState({ text: '', type: 'info' }); // Updated state for typed messages
    const [isLoadingAllergies, setIsLoadingAllergies] = useState(false);

    const { currentUser: authContextUser, token, showExpiryMessageAndLogout } = useAuth(); // Destructure token & showExpiryMessageAndLogout
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState('User'); // State for user's name

    const { showModal } = useModal(); // Use the modal context
    const navigate = useNavigate(); // For navigation

    useEffect(() => {
        let effectiveUserId = null;
        let userIdSource = 'default fallback';
        let resolvedUserName = 'User'; // Default user name

        const storedCurrentUserStr = localStorage.getItem('currentUser');
        if (storedCurrentUserStr) {
            try {
                const storedUserObject = JSON.parse(storedCurrentUserStr);
                if (storedUserObject) {
                    if (storedUserObject.UserID) {
                        effectiveUserId = String(storedUserObject.UserID);
                        userIdSource = 'localStorage.currentUser (UserID)';
                    } else if (storedUserObject.id) { // Fallback to 'id' if 'UserID' isn't present
                        effectiveUserId = String(storedUserObject.id);
                        userIdSource = 'localStorage.currentUser (id)';
                    }

                    if (storedUserObject.Name) {
                        resolvedUserName = storedUserObject.Name;
                    } else if (storedUserObject.Email) {
                        resolvedUserName = storedUserObject.Email.split('@')[0]; // Use part of email if name is absent
                    } else if (effectiveUserId) {
                        resolvedUserName = `User ID: ${effectiveUserId}`; // Fallback to User ID if no name/email
                    }
                }
            } catch (e) {
                console.error('Failed to parse currentUser from localStorage:', e);
                // Keep default 'User' name if parsing fails
            }
        }

        // If not found in localStorage, try AuthContext (primarily for ID, name might be there too)
        if (!effectiveUserId && authContextUser) {
            if (authContextUser.id) {
                effectiveUserId = String(authContextUser.id);
                userIdSource = 'AuthContext';
                if (authContextUser.Name) {
                    resolvedUserName = authContextUser.Name;
                } else if (authContextUser.email) {
                    resolvedUserName = authContextUser.email.split('@')[0];
                } else {
                    resolvedUserName = `User ID: ${effectiveUserId}`;
                }
            } else if (authContextUser.UserID) { // Check UserID on authContextUser as well
                 effectiveUserId = String(authContextUser.UserID);
                 userIdSource = 'AuthContext (UserID)';
                 if (authContextUser.Name) resolvedUserName = authContextUser.Name;
                 // ... further fallbacks for name from authContextUser
            }
        }

        // Fallback for UserID if still not found (e.g. from older localStorage key)
        if (!effectiveUserId) {
            const individualUserIdStr = localStorage.getItem('userId');
            if (individualUserIdStr) {
                effectiveUserId = String(individualUserIdStr);
                userIdSource = 'localStorage.userId (deprecated)';
                // At this point, name is likely still the default 'User' or from a malformed currentUser object
                if (resolvedUserName === 'User') { // Only update if still default
                    resolvedUserName = `User ID: ${effectiveUserId}`;
                }
            }
        }

        if (effectiveUserId) {
            setUserId(effectiveUserId);
            console.log(`UserSettings: UserID ${effectiveUserId} obtained from ${userIdSource}.`);
        } else {
            console.warn('UserSettings: UserID could not be determined. Defaulting or waiting for context.');
        }
        setUserName(resolvedUserName); // Set the resolved user name

    }, [authContextUser]);


    // Fetch dietary preferences and allergies on component mount or when userId changes
    useEffect(() => {
        const fetchAllergiesData = async () => {
            setIsLoadingAllergies(true);
            try {
                const response = await fetch('/api/allergies');
                const data = await response.json();
                if (response.ok) {
                    setAllAllergies(data || []);
                } else {
                    setAllergiesMessage(`Error fetching all allergies: ${data.error || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Error fetching all allergies:', error);
                setAllergiesMessage(`Network error fetching allergies: ${error.message}`);
            }
            // setIsLoadingAllergies(false); // Moved to after user allergies are fetched
        };

        const fetchUserAllergies = async () => {
            if (!userId) {
                // setIsLoadingAllergies(false); // Ensure loading stops if no userId
                return;
            }
            // setIsLoadingAllergies(true); // Already set by fetchAllergiesData or should be set before this
            try {
                const response = await fetch(`/api/users/${userId}/allergies`);
                const data = await response.json();
                if (response.ok) {
                    // Assuming backend returns { allergies: [{id: 1, name: "Peanuts"}, ...] }
                    setSelectedAllergyIds(data.allergies.map(a => a.id));
                } else {
                    setAllergiesMessage(`Error fetching user allergies: ${data.error || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Error fetching user allergies:', error);
                setAllergiesMessage(`Network error fetching user allergies: ${error.message}`);
            } finally {
                setIsLoadingAllergies(false); // Set to false after all allergy calls complete
            }
        };

        fetchAllergiesData().then(() => {
             if(userId) fetchUserAllergies(); // Fetch user allergies after all allergies are loaded and if userId is available
             else setIsLoadingAllergies(false); // If no userId, stop loading
        });

    }, [userId]); // Re-run if userId changes

    const handleChangePassword = async (event) => {
        event.preventDefault();
        setPasswordMessage({ text: '', type: 'info' }); // Reset message

        if (!newPassword) {
            setPasswordMessage({ type: 'error', text: 'New password cannot be empty.' });
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }

        if (!userId) {
            // This case should ideally not happen if the form is disabled when userId is not available,
            // but as a safeguard for the API call logic:
            setPasswordMessage({ type: 'error', text: 'User ID not found. Cannot change password.'});
            return;
        }
        if (!token) {
            showModal({
                title: "Authentication Required",
                message: "Your session may have expired or you are not logged in. Please log in again to change your password.",
                buttons: [{ label: "Go to Login", onClick: () => navigate('/login') }]
            });
            return;
        }

        const payload = {
            currentPassword,
            newPassword,
            userID: userId
        };
        // try { // Original try block start
        fetch('/api/user/password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload),
        })
        .then(response => response.json().then(data => ({ ok: response.ok, status: response.status, body: data })))
        .then(result => {
            if (result.ok) {
                setPasswordMessage({ type: 'success', text: result.body.message || 'Password changed successfully!' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
            } else {
                // Check for specific token expiry message from backend
                // Adjust "Token has expired" if backend sends a different specific error message or code for it
                if (result.body.error && (result.body.error.includes("Token has expired") || result.body.error.includes("Invalid token"))) {
                    console.log('Token expired or invalid, showing expiry message and logging out.');
                    showExpiryMessageAndLogout(result.body.error); // Use message from backend if available
                } else {
                    setPasswordMessage({ type: 'error', text: result.body.error || result.body.message || `Password change failed: ${result.status}` });
                }
            }
        })
        .catch(error => { // Catches network errors or if .json() fails
            console.error('Change password error:', error);
            setPasswordMessage({ type: 'error', text: error.message || 'An unexpected error occurred while changing password.' });
        });
        // } catch (error) { // Original catch block - now handled by .catch()
        //     console.error('Change password error:', error);
        //     setPasswordMessage({ type: 'error', text: `Change password error: ${error.message}` });
        // }
    };

    const handleAllergyChange = (event) => {
        const {
            target: { value },
        } = event;
        setSelectedAllergyIds(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const handleSaveAllergies = async (event) => {
        event.preventDefault();
        if (!userId) {
            setAllergiesMessage({ type: 'error', text: "User ID not found. Cannot save allergies." });
            return;
        }
        setIsLoadingAllergies(true);
        setAllergiesMessage({ text: '', type: 'info' }); // Reset message

        if (!token) {
            showModal({
                title: "Authentication Required",
                message: "Your session may have expired or you are not logged in. Please log in again to save your allergies.",
                buttons: [{ label: "Go to Login", onClick: () => navigate('/login') }]
            });
            setIsLoadingAllergies(false);
            return;
        }

        const payload = { allergy_ids: selectedAllergyIds };

        fetch(`/api/users/${userId}/allergies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload),
        })
        .then(response => response.json().then(data => ({ ok: response.ok, status: response.status, body: data })))
        .then(result => {
            if (result.ok) {
                setAllergiesMessage({ type: 'success', text: result.body.message || 'Allergies updated successfully!' });
            } else {
                if (result.body.error && (result.body.error.includes("Token has expired") || result.body.error.includes("Invalid token"))) {
                    showExpiryMessageAndLogout(result.body.error);
                } else {
                    setAllergiesMessage({ type: 'error', text: result.body.error || result.body.message || `Failed to update allergies: ${result.status}` });
                }
            }
        })
        .catch(error => {
            console.error('Save allergies error:', error);
            setAllergiesMessage({ type: 'error', text: error.message || 'An unexpected error occurred while saving allergies.' });
        })
        .finally(() => {
            setIsLoadingAllergies(false);
        });
    };

    if (!userId && !authContextUser) { // Still determining user or genuinely no user
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Loading user information...</Typography>
                </Box>
            </Container>
        );
    }

    // Determine message type for alerts (simplified for example)
    // const getSeverity = (message) => (message && (message.toLowerCase().includes('error') || message.toLowerCase().includes('failed'))) ? 'error' : 'success';
    // This is now handled by passwordMessage.type

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom textAlign="center">
                {userName}'s Settings
            </Typography>

            {/* Change Password Section */}
            <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom borderBottom={1} borderColor="divider" pb={1} mb={2}>
                    Change Password
                </Typography>
                <Box component="form" onSubmit={handleChangePassword} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        type={showCurrentPassword ? "text" : "password"}
                        label="Current Password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        fullWidth
                        variant="outlined"
                        error={passwordMessage.type === 'error' && passwordMessage.text.toLowerCase().includes("current password")} // Example more specific error
                        helperText={passwordMessage.type === 'error' && passwordMessage.text.toLowerCase().includes("current password") ? passwordMessage.text : ''}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle current password visibility"
                                        onMouseDown={() => setShowCurrentPassword(true)}
                                        onMouseUp={() => setShowCurrentPassword(false)}
                                        onMouseLeave={() => setShowCurrentPassword(false)}
                                        onTouchStart={() => setShowCurrentPassword(true)}
                                        onTouchEnd={() => setShowCurrentPassword(false)}
                                        edge="end"
                                    >
                                        {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        type={showNewPassword ? "text" : "password"}
                        label="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        fullWidth
                        variant="outlined"
                        error={passwordMessage.type === 'error'}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle new password visibility"
                                        onMouseDown={() => setShowNewPassword(true)}
                                        onMouseUp={() => setShowNewPassword(false)}
                                        onMouseLeave={() => setShowNewPassword(false)}
                                        onTouchStart={() => setShowNewPassword(true)}
                                        onTouchEnd={() => setShowNewPassword(false)}
                                        edge="end"
                                    >
                                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        type={showConfirmPassword ? "text" : "password"}
                        label="Confirm New Password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                        fullWidth
                        variant="outlined"
                        error={passwordMessage.type === 'error' && passwordMessage.text.includes("match")}
                        helperText={passwordMessage.type === 'error' && passwordMessage.text.includes("match") ? passwordMessage.text : ''}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle confirm password visibility"
                                        onMouseDown={() => setShowConfirmPassword(true)}
                                        onMouseUp={() => setShowConfirmPassword(false)}
                                        onMouseLeave={() => setShowConfirmPassword(false)}
                                        onTouchStart={() => setShowConfirmPassword(true)}
                                        onTouchEnd={() => setShowConfirmPassword(false)}
                                        edge="end"
                                    >
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button variant="contained" type="submit" sx={{ alignSelf: 'flex-start' }}>
                        Change Password
                    </Button>
                    {passwordMessage.text && (
                        <Alert severity={passwordMessage.type || 'info'} sx={{ mt: 2 }}>
                            {passwordMessage.text}
                        </Alert>
                    )}
                </Box>
            </Paper>

            {/* Allergies/Intolerances Section */}
            <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom borderBottom={1} borderColor="divider" pb={1} mb={2}>
                    Allergies/Intolerances
                </Typography>
                <Box component="form" onSubmit={handleSaveAllergies} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {isLoadingAllergies && !allAllergies.length && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            <Typography>Loading available allergies...</Typography>
                        </Box>
                    )}
                    {/* Display initial loading/error for allAllergies list itself if needed, before FormGroup */}
                    {/* This specific error for fetching all allergies might need its own state if it's a string and not an object */}
                    {typeof allergiesMessage === 'string' && allergiesMessage && !allAllergies.length && !isLoadingAllergies && (
                         <Alert severity="error" sx={{ mb: 2 }}>{allergiesMessage}</Alert>
                    )}
                    {/* The main allergiesMessage for save operation feedback */}
                    {typeof allergiesMessage === 'object' && allergiesMessage.text && !isLoadingAllergies && (
                         <Alert severity={allergiesMessage.type || 'info'} sx={{ mb: 2 }}>{allergiesMessage.text}</Alert>
                    )}

                    <FormControl fullWidth disabled={isLoadingAllergies}>
                        <InputLabel id="allergies-select-label">Allergies/Intolerances</InputLabel>
                        <Select
                            labelId="allergies-select-label"
                            id="allergies-select"
                            multiple
                            value={selectedAllergyIds}
                            onChange={handleAllergyChange}
                            label="Allergies/Intolerances" // This connects to the InputLabel
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {allAllergies
                                        .filter(allergy => selected.includes(allergy.id))
                                        .map(allergy => (
                                            <Chip key={allergy.id} label={allergy.name} />
                                        ))}
                                </Box>
                            )}
                        >
                            {allAllergies.map(allergy => (
                                <MenuItem key={allergy.id} value={allergy.id}>
                                    {allergy.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {allAllergies.length > 0 && (
                        <Button variant="contained" type="submit" sx={{ alignSelf: 'flex-start', mt: 2 }} disabled={isLoadingAllergies}>
                            {isLoadingAllergies ? <CircularProgress size={24} color="inherit" /> : 'Save Allergies'}
                        </Button>
                    )}
                    {/* Display feedback for save operation - This is now handled by the Alert above, which shows after loading is complete */}
                    {/* The condition `!isLoadingAllergies` in the Alert above ensures it shows post-operation */}
                </Box>
            </Paper>
        </Container>
    );
};

export default UserSettings;
