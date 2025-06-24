import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavigationBar from '../../components/admin/AdminNavigationBar'; // Adjust path if needed
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

export default function AdminLayout() {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      marginTop: (theme) => `-${theme.spacing(2)}`, // Counteract App.jsx Container's py:2
    }}>
      <AdminNavigationBar />
      <Container component="main" maxWidth={false} sx={{ flexGrow: 1, py: 3, px: { xs: 2, sm: 3 } }}>
        {/* py: 3 adds some padding top and bottom to the main content area */}
        {/* px added for horizontal padding */}
        <Outlet /> {/* This is where the nested admin route components will render */}
      </Container>
      {/* You could add a common AdminFooter component here if needed */}
    </Box>
  );
}
