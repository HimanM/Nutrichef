import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useModal } from '../../context/ModalContext.jsx';
import { authenticatedFetch } from '../../utils/apiUtil.js';
import ResponsiveTable from '../../components/admin/ResponsiveTable.jsx';
import { HiTrash } from 'react-icons/hi';

// Spinner components
const PageLoaderSpinner = () => <svg className="animate-spin h-10 w-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;


function UserManagementPage() {
  const authContextValue = useAuth();
  const { showModal, setLoading: setModalLoading } = useModal();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortColumn, setSortColumn] = useState('UserID');
  const [sortDirection, setSortDirection] = useState('asc');

  const fetchUsers = useCallback(async (currentPage, currentRowsPerPage) => {
    setLoading(true); setError(null);
    const backendPage = currentPage + 1;
    try {
      const response = await authenticatedFetch(
        `/api/admin/users?page=${backendPage}&per_page=${currentRowsPerPage}`,
        { method: 'GET' },
        authContextValue
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch users: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data.users || []);
      setTotalCount(data.total || 0);
    } catch (err) {
      setError(err.message); console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, [authContextValue]);

  useEffect(() => {
    fetchUsers(page, rowsPerPage);
  }, [page, rowsPerPage, fetchUsers]);

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(prevDirection => prevDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
    setPage(0);
  };

  const handleChangePage = (newPage) => setPage(newPage - 1); // Convert to 0-indexed
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRoleChange = async (userId, newRole) => {
    setActionError(null);
    try {
      const response = await authenticatedFetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT', body: JSON.stringify({ role: newRole }),
      }, authContextValue);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update role: ${response.status}`);
      }
      fetchUsers(page, rowsPerPage);
      showModal('alert', 'Role Updated', `User ${userId}'s role updated to ${newRole}.`, {iconType: 'success'});
    } catch (err) {
      console.error("Error updating role:", err);
      setActionError(err.message);
      showModal('alert', 'Update Error', err.message, {iconType: 'error'});
    }
  };

  const handleDeleteUser = async (userId) => {
    const userToDelete = users.find(u => u.UserID === userId);
    const userConfirmed = await showModal('confirm', 'Confirm Deletion', `Delete user "${userToDelete?.Name || userId}"? This cannot be undone.`);
    if (!userConfirmed) return;

    setActionError(null); setModalLoading(true);
    try {
      const response = await authenticatedFetch(`/api/admin/users/${userId}`, { method: 'DELETE' }, authContextValue);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete user: ${response.status}`);
      }
      await fetchUsers(page, rowsPerPage);
      showModal('alert', 'User Deleted', (await response.json()).message || `User ${userId} deleted.`, {iconType: 'success'});
    } catch (err) {
      console.error("Error deleting user:", err);
      setActionError(err.message);
      showModal('alert', 'Delete Error', err.message, {iconType: 'error'});
    } finally {
      setModalLoading(false);
    }
  };

  const columns = [
    { key: 'UserID', label: 'User ID', sortable: true },
    { key: 'Name', label: 'Name', sortable: true },
    { key: 'Email', label: 'Email', sortable: true },
    { 
      key: 'role', 
      label: 'Role', 
      sortable: true,
      render: (user) => (
        <select
          value={user.role}
          onChange={(e) => handleRoleChange(user.UserID, e.target.value)}
          disabled={user.UserID === 1 || (authContextValue.currentUser && user.UserID === authContextValue.currentUser.UserID)}
          className="block w-full pl-3 pr-10 py-1.5 text-xs bg-gray-100 border-gray-200 text-gray-800 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 rounded-md disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
      )
    }
  ];

  const actions = [
    {
      label: 'Delete',
      icon: HiTrash,
      onClick: (user) => handleDeleteUser(user.UserID),
      disabled: (user) => user.UserID === 1 || (authContextValue.currentUser && user.UserID === authContextValue.currentUser.UserID),
      className: 'bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-500'
    }
  ];

  const pagination = {
    currentPage: page + 1, // Convert to 1-indexed
    totalPages: Math.ceil(totalCount / rowsPerPage),
    onPageChange: handleChangePage,
    onRowsPerPageChange: handleChangeRowsPerPage,
    rowsPerPage
  };

  if (loading && users.length === 0) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><PageLoaderSpinner /></div>;
  }

  if (error && users.length === 0) {
    return (
      <div className="section-padding">
        <div className="container-modern">
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            <p>Error fetching users: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="container-modern">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">User Management</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">View, edit, and manage user accounts and roles.</p>
        </div>
        
        {actionError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            Action Error: {actionError}
          </div>
        )}
        
        {error && users.length > 0 && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-md text-sm">
            Could not refresh users: {error}
          </div>
        )}
        
        {users.length === 0 && !loading && !error ? (
          <p className="text-center text-gray-400 mt-6 text-lg">No users found.</p>
        ) : (
          <ResponsiveTable
            data={users}
            columns={columns}
            loading={loading}
            onSort={handleSort}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            actions={actions}
            pagination={pagination}
            tableTitle="Users"
          />
        )}
      </div>
    </div>
  );
}

export default UserManagementPage;
