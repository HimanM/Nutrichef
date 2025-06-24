import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useModal } from '../../context/ModalContext.jsx';
import { authenticatedFetch } from '../../utils/apiUtil.js';

// Spinner components
const PageLoaderSpinner = () => <svg className="animate-spin h-10 w-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>; {/* text-indigo-400 */}
const TableSpinner = () => <svg className="animate-spin h-6 w-6 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>; {/* text-indigo-400 */}
const DeleteIcon = () => <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>;


function UserManagementPage() {
  const authContextValue = useAuth();
  const { showModal, setLoading: setModalLoading } = useModal();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [page, setPage] = useState(0); // 0-indexed
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

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

  const handleChangePage = (newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRoleChange = async (userId, newRole) => {
    setActionError(null);
    // Optimistic update (optional, for better UX)
    // const oldUsers = users;
    // setUsers(prevUsers => prevUsers.map(u => (u.UserID === userId ? { ...u, role: newRole } : u)));
    try {
      const response = await authenticatedFetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT', body: JSON.stringify({ role: newRole }),
      }, authContextValue);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // setUsers(oldUsers); // Revert optimistic update on error
        throw new Error(errorData.error || `Failed to update role: ${response.status}`);
      }
      // If optimistic update isn't used, re-fetch or update state from response
      fetchUsers(page, rowsPerPage); // Re-fetch to confirm change
      showModal('alert', 'Role Updated', `User ${userId}'s role updated to ${newRole}.`, {iconType: 'success'});
    } catch (err) {
      console.error("Error updating role:", err);
      setActionError(err.message);
      showModal('alert', 'Update Error', err.message, {iconType: 'error'});
      // fetchUsers(page, rowsPerPage); // Optionally re-fetch to revert optimistic UI if any
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
      await fetchUsers(page, rowsPerPage); // Refresh
      showModal('alert', 'User Deleted', (await response.json()).message || `User ${userId} deleted.`, {iconType: 'success'});
    } catch (err) {
      console.error("Error deleting user:", err);
      setActionError(err.message);
      showModal('alert', 'Delete Error', err.message, {iconType: 'error'});
    } finally {
      setModalLoading(false);
    }
  };

  const commonButtonClassNameBase = "px-3 py-1.5 text-xs font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50"; // Renamed

  if (loading && users.length === 0) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><PageLoaderSpinner /></div>;
  }
  if (error && users.length === 0) {
    return (
      <div className="page-container my-8"> {/* page-container */}
        <div className="p-4 bg-red-700/[0.5] border-l-4 border-red-500 text-red-200 rounded-md"> {/* Dark theme error */}
          <p>Error fetching users: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container my-8"> {/* Applied page-container */}
      <h1 className="text-2xl sm:text-3xl mb-6"> {/* Uses global h1 style */}
        User Management
      </h1>
      {actionError && <div className="mb-4 p-3 bg-red-700/[0.5] border border-red-500 text-red-200 rounded-md text-sm">Action Error: {actionError}</div>} {/* Dark theme error */}
      {error && users.length > 0 && <div className="mb-4 p-3 bg-yellow-700/[0.5] border border-yellow-500 text-yellow-200 rounded-md text-sm">Could not refresh users: {error}</div>} {/* Dark theme warning */}

      {users.length === 0 && !loading && !error ? (
        <p className="text-center text-gray-400 mt-6 text-lg">No users found.</p> /* text-gray-400 */
      ) : (
        <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden"> {/* bg-gray-800 */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700"> {/* divide-gray-700 */}
              <thead className="bg-gray-700"> {/* bg-gray-700 */}
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th> {/* text-gray-400 */}
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Registered</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700"> {/* bg-gray-800, divide-gray-700 */}
                {loading && (
                  <tr><td colSpan={6} className="text-center py-4"><TableSpinner /></td></tr>
                )}
                {!loading && users.map((user) => (
                  <tr key={user.UserID} className="hover:bg-gray-700"> {/* hover:bg-gray-700 */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{user.UserID}</td> {/* text-gray-300 */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-100">{user.Name}</td> {/* text-gray-100 */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{user.Email}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300"> {/* text-gray-300 for cell */}
                       <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.UserID, e.target.value)}
                          disabled={user.UserID === 1 || (authContextValue.currentUser && user.UserID === authContextValue.currentUser.UserID)}
                          className="block w-full pl-3 pr-10 py-1.5 text-xs bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed" // Dark theme select
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{new Date(user.CreatedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteUser(user.UserID)}
                        disabled={user.UserID === 1 || (authContextValue.currentUser && user.UserID === authContextValue.currentUser.UserID)}
                        className={`${commonButtonClassNameBase} bg-red-700 text-red-100 hover:bg-red-600 focus:ring-red-500 flex items-center`} // Dark theme danger button
                      >
                        <DeleteIcon/> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalCount > 0 && (
             <div className="px-4 py-3 flex items-center justify-between border-t border-gray-700 sm:px-6 bg-gray-800 rounded-b-lg"> {/* border-gray-700, bg-gray-800 */}
              <div className="flex-1 flex justify-between sm:hidden">
                <button onClick={() => handleChangePage(page - 1)} disabled={page === 0} className={`gradient-button ${commonButtonClassNameBase}`}>Previous</button> {/* Gradient button */}
                <button onClick={() => handleChangePage(page + 1)} disabled={(page + 1) * rowsPerPage >= totalCount} className={`gradient-button ${commonButtonClassNameBase}`}>Next</button> {/* Gradient button */}
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-gray-300"> {/* text-gray-300 */}
                    Showing <span className="font-medium">{page * rowsPerPage + 1}</span> to <span className="font-medium">{Math.min((page + 1) * rowsPerPage, totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <label htmlFor="adminUserRowsPerPageSelect" className="text-xs text-gray-300">Rows:</label> {/* text-gray-300 */}
                  <select id="adminUserRowsPerPageSelect" value={rowsPerPage} onChange={handleChangeRowsPerPage} className="px-2 py-1 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"> {/* Dark theme select */}
                    <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
                  </select>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button onClick={() => handleChangePage(page - 1)} disabled={page === 0} className={`${commonButtonClassNameBase} bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600 rounded-l-md border`}>Prev</button> {/* Dark theme secondary button */}
                    <button onClick={() => handleChangePage(page + 1)} disabled={(page + 1) * rowsPerPage >= totalCount} className={`${commonButtonClassNameBase} bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600 rounded-r-md border`}>Next</button> {/* Dark theme secondary button */}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UserManagementPage;
