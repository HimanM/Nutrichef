import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
// import FormControlLabel from '@mui/material/FormControlLabel'; // Not used
// import Checkbox from '@mui/material/Checkbox'; // Not used
import Link from '@mui/material/Link'; // MUI Link for styling
import { Link as RouterLink } from 'react-router-dom'; // React Router Link for navigation
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper'; // Added Paper
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'; // Renamed for clarity
import LoginIcon from '@mui/icons-material/Login'; // Import LoginIcon
import InputAdornment from '@mui/material/InputAdornment'; // For icons in TextFields
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert'; // For displaying login errors

// Copyright/Footer component - assuming it exists as in standard MUI examples
function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://yourwebsite.com/"> {/* Update this link */}
        NutriChef
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}


export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Get login function from AuthContext
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // For login API errors
  const [loading, setLoading] = useState(false); // For loading state during API call

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/login', { // Ensure this matches your backend route
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // data.error should contain the specific message from the backend
        // e.g., "Email not verified..." or "Invalid email or password"
        setError(data.error || `Login failed: ${response.status} ${response.statusText}`);
        // No need to throw an error here if we're setting state and returning
        setLoading(false);
        return;
      }

      // Assuming backend returns: { message: "...", token: "...", user: { UserID: ..., Name: ..., Email: ..., role: ... } }
      if (data.token && data.user) {
        login(data.token, data.user); // Call login from AuthContext
        navigate('/'); // Redirect to homepage or dashboard after login
      } else {
        // Should not happen if backend API is consistent
        throw new Error('Login successful, but token or user data was not provided by the server.');
      }

    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Paper
        elevation={3}
        className="fade-in" // Animation class
        sx={(theme) => ({
          p: { xs: 2, sm: 3 },
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          transition: 'box-shadow 0.3s ease-in-out', // For hover effect
          '&:hover': {
            boxShadow: theme.shadows[6], // Increase shadow on hover
          }
        })}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}> {/* Ensure form takes width of Paper */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon />
                </InputAdornment>
              ),
            }}
          />
          {/* Remember me checkbox can be added here if needed */}
          {/* <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          /> */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ 
              mt: 3, 
              mb: 2, 
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark', // Darken button on hover
              }
            }}
            disabled={loading}
            startIcon={<LoginIcon />} // Add LoginIcon here
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link 
                component={RouterLink} 
                to="/register" 
                variant="body2"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                  fontWeight: 'medium', // Consistent with UserRegistration
                }}
              >
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper> {/* End of Paper */}
      <Copyright sx={{ mt: 8, mb: 4 }} />
    </Container>
  );
}
