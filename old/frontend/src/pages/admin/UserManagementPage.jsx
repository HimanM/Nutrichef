import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination'; // Import TablePagination
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Box from '@mui/material/Box';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { authenticatedFetch } from '../../utils/apiUtil';

function UserManagementPage() {
  const authContextValue = useAuth();
  const { showModal, setLoading: setModalLoading } = useModal();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // For fetch error
  const [actionError, setActionError] = useState(null); // For errors from update/delete actions
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = async (currentPage = 0, currentRowsPerPage = 10) => {
    setLoading(true);
    setError(null);
    // setActionError(null); // Keep action errors visible
    const backendPage = currentPage + 1; // API is 1-indexed
    try {
      const response = await authenticatedFetch(`/api/admin/users?page=${backendPage}&per_page=${currentRowsPerPage}`, {
        method: 'GET',
        // Headers like Authorization and Content-Type are handled by authenticatedFetch
      }, authContextValue);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Failed to fetch users: ${response.status}` }));
        throw new Error(errorData.error || `Failed to fetch users: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data.users || []);
      setTotalCount(data.total || 0);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRoleChange = async (userId, newRole) => {
    setActionError(null);
    try {
      const response = await authenticatedFetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole }),
        // Headers handled by authenticatedFetch
      }, authContextValue);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update role: ${response.status}`);
      }
      setUsers(prevUsers =>
        prevUsers.map(u => (u.UserID === userId ? { ...u, role: newRole } : u))
      );
      // Consider adding a success snackbar/toast here
    } catch (err) {
      console.error("Error updating role:", err);
      setActionError(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    const userConfirmed = await showModal(
      'confirm',
      'Confirm Deletion',
      `Are you sure you want to delete user ${userId}? This action cannot be undone.`
    );

    if (!userConfirmed) {
      return;
    }

    setActionError(null);
    setModalLoading(true); // Show loading indicator on modal
    try {
      const response = await authenticatedFetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        // Headers handled by authenticatedFetch
      }, authContextValue);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to delete user: ${response.status}` }));
        throw new Error(errorData.message || `Failed to delete user: ${response.status}`);
      }
      // Success: re-fetch users. Modal will be closed by showModal's internal logic on confirm.
      fetchUsers(page, rowsPerPage);
    } catch (err) {
      console.error("Error deleting user:", err);
      setActionError(err.message);
      // Optionally, show an error alert modal here
    } finally {
      setModalLoading(false); // Hide loading indicator on modal
    }
  };

  if (loading && users.length === 0) { // Show full page loader only on initial load
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && users.length === 0) { // Show error only if no data can be displayed
    return (
      <Container sx={{ mt: 2 }}>
        <Alert severity="error">Error fetching users: {error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        User Management
      </Typography>
      {actionError && <Alert severity="error" sx={{ mb: 2 }}>Action Error: {actionError}</Alert>}
      {error && users.length > 0 && <Alert severity="warning" sx={{ mb: 2 }}>Could not refresh users: {error}</Alert>}

      {users.length === 0 && !loading && !error ? (
        <Typography variant="subtitle1" sx={{ mt: 2 }}>No users found.</Typography>
      ) : (
        <Paper>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="users table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Registration Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && ( /* In-table loader */
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                )}
                {!loading && users.map((user) => (
                  <TableRow
                    key={user.UserID}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">{user.UserID}</TableCell>
                    <TableCell>{user.Name}</TableCell>
                    <TableCell>{user.Email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.CreatedAt ? new Date(user.CreatedAt).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 100 }}>
                          <Select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.UserID, e.target.value)}
                            disabled={user.UserID === 1}
                          >
                            <MenuItem value="user">user</MenuItem>
                            <MenuItem value="admin">admin</MenuItem>
                          </Select>
                        </FormControl>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteUser(user.UserID)}
                          disabled={user.UserID === 1}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 20, 50]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
    </Container>
  );
}

export default UserManagementPage;
