import React from 'react';
import { Container, Typography, TextField, Button, Grid, Paper, Box } from '@mui/material';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import InfoIcon from '@mui/icons-material/Info'; // Added for "Get in Touch"
import { useTheme } from '@mui/material/styles'; // To access theme properties

const ContactUsPage = () => {
  const theme = useTheme(); // Hook to get theme object

  return (
    // Ensure content aligns to the top by default, mt for top margin
    <Container maxWidth="md" sx={{ mt: theme.spacing(4), mb: theme.spacing(4) }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: theme.spacing(4) }}>
        Contact Us
      </Typography>
      {/* Removed justifyContent="center" from this Grid to allow top alignment */}
      <Grid container spacing={theme.spacing(3)}>
        <Grid item xs={12} md={8} sx={{ margin: '0 auto' }}> {/* Centering the content column */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: theme.spacing(2) }}>
            <InfoIcon sx={{ mr: theme.spacing(1), color: theme.palette.primary.main }} />
            <Typography variant="h5" component="h2">
              Get in Touch
            </Typography>
          </Box>
          <Typography variant="body1" paragraph sx={{ mb: theme.spacing(1) }}>
            Have a question or want to learn more? Reach out to us!
          </Typography>
          <Typography variant="body1" paragraph sx={{ mb: theme.spacing(3) }}>
            <strong>Email:</strong> contact@example.com
          </Typography>

          <Paper elevation={3} sx={{ p: theme.spacing(3), mt: theme.spacing(4) }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: theme.spacing(3) }}>
              Send us a Message
            </Typography>
            <form noValidate autoComplete="off">
              <Grid container spacing={theme.spacing(2)}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    variant="outlined"
                    required
                    sx={{ mb: theme.spacing(2) }} // Added margin bottom
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    variant="outlined"
                    type="email"
                    required
                    sx={{ mb: theme.spacing(2) }} // Added margin bottom
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Message"
                    variant="outlined"
                    multiline
                    rows={4}
                    required
                    sx={{ mb: theme.spacing(2) }} // Added margin bottom
                  />
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: theme.spacing(2) }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<ContactMailIcon />}
                    size="large"
                    sx={{ minWidth: '180px' }} // Ensure button has a good width
                  >
                    Send Message
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ContactUsPage;
