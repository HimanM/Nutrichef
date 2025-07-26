import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useModal } from '../../context/ModalContext.jsx';
import { authenticatedFetch } from '../../utils/apiUtil.js';
import { PageLoaderSpinner } from '../../components/common/LoadingComponents.jsx';
import ResponsiveTable from '../../components/admin/ResponsiveTable.jsx';
import { HiTrash, HiEye, HiClock, HiSearch, HiX, HiFilter } from 'react-icons/hi';
import { AdminErrorDisplay } from '../../components/common/ErrorDisplay.jsx';

function CommentManagementPage() {
  const authContextValue = useAuth();
  const { showModal } = useModal();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [page, setPage] = useState(0); // 0-indexed
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [usernameFilter, setUsernameFilter] = useState('');
  const [editedFilter, setEditedFilter] = useState('all'); // all, edited, original
  const [recipeFilter, setRecipeFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');

  // Sorting state
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const fetchComments = useCallback(async (currentPage, currentRowsPerPage) => {
    setLoading(true);
    setError(null);
    const backendPage = currentPage + 1;
    try {
      const response = await authenticatedFetch(
        `/api/admin/comments?page=${backendPage}&limit=${currentRowsPerPage}`,
        { method: 'GET' },
        authContextValue
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch comments: ${response.status}`);
      }
      const data = await response.json();
      setComments(data.comments || []);
      setTotalCount(data.pagination?.total || 0);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  }, [authContextValue]);

  useEffect(() => {
    fetchComments(page, rowsPerPage);
  }, [page, rowsPerPage, fetchComments]);

  const handleDeleteComment = async (commentId) => {
    const commentToDelete = comments.find(c => c.CommentID === commentId);
    const userConfirmed = await showModal(
      'confirm',
      'Confirm Deletion',
      `Delete comment by "${commentToDelete?.Username || 'Unknown User'}"?`,
      'This action cannot be undone.'
    );
    if (!userConfirmed) return;

    setActionError(null);
    try {
      const response = await authenticatedFetch(
        `/api/admin/comments/${commentId}`,
        { method: 'DELETE' },
        authContextValue
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete comment.');
      }

      await fetchComments(page, rowsPerPage);
      await showModal('info', 'Success', 'Comment deleted successfully!');
    } catch (err) {
      setActionError(`Failed to delete comment: ${err.message}`);
      console.error("Error deleting comment:", err);
    }
  };

  const handleChangePage = (newPage) => setPage(newPage - 1);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter comments based on current filters
  const filteredComments = comments.filter(comment => {
    // Username filter
    if (usernameFilter && !comment.Username.toLowerCase().includes(usernameFilter.toLowerCase())) {
      return false;
    }

    // Edited filter
    if (editedFilter === 'edited' && !comment.IsEdited) return false;
    if (editedFilter === 'original' && comment.IsEdited) return false;

    // Recipe filter
    if (recipeFilter && !comment.RecipeTitle?.toLowerCase().includes(recipeFilter.toLowerCase())) {
      return false;
    }

    // Date filters
    if (dateFromFilter || dateToFilter) {
      const commentDate = new Date(comment.CreatedAt);
      if (dateFromFilter && commentDate < new Date(dateFromFilter)) return false;
      if (dateToFilter && commentDate > new Date(dateToFilter + 'T23:59:59')) return false;
    }

    return true;
  }).sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue = a[sortColumn];
    let bValue = b[sortColumn];

    // Handle different data types
    if (sortColumn === 'CreatedAt' || sortColumn === 'UpdatedAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else if (sortColumn === 'CommentID') {
      aValue = parseInt(aValue);
      bValue = parseInt(bValue);
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue?.toLowerCase() || '';
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const clearFilters = () => {
    setUsernameFilter('');
    setEditedFilter('all');
    setRecipeFilter('');
    setDateFromFilter('');
    setDateToFilter('');
  };

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString() + ' ' +
      new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const columns = [
    { key: 'CommentID', label: 'ID', sortable: true },
    {
      key: 'Username',
      label: 'User',
      sortable: true,
      render: (comment) => (
        <span className="flex items-center gap-2">
          <span className="inline-block w-8 h-8 bg-emerald-500 rounded-full text-white text-sm font-semibold leading-8 text-center">
            {comment.Username ? comment.Username[0].toUpperCase() : 'U'}
          </span>
          <span className="font-medium">{comment.Username}</span>
        </span>
      )
    },
    {
      key: 'RecipeTitle',
      label: 'Recipe',
      sortable: true,
      render: (comment) => (
        <span className="inline-block max-w-xs">
          <span className="font-medium text-emerald-600" title={comment.RecipeTitle}>
            {truncateText(comment.RecipeTitle, 40)}
          </span>
        </span>
      )
    },
    {
      key: 'Comment',
      label: 'Comment',
      sortable: false,
      render: (comment) => (
        <span className="inline-block max-w-md">
          <span className="text-gray-700 block" title={comment.Comment}>
            {truncateText(comment.Comment, 80)}
          </span>
          {comment.IsEdited && (
            <span className="text-xs text-gray-500 italic">(edited)</span>
          )}
        </span>
      )
    },
    {
      key: 'CreatedAt',
      label: 'Posted',
      sortable: true,
      render: (comment) => (
        <span className="inline-block text-sm">
          <span className="flex items-center gap-1 text-gray-600">
            <HiClock className="w-4 h-4" />
            <span>{formatDate(comment.CreatedAt)}</span>
          </span>
          {comment.IsEdited && comment.UpdatedAt && (
            <span className="text-xs text-gray-500 block mt-1">
              Updated: {formatDate(comment.UpdatedAt)}
            </span>
          )}
        </span>
      )
    }
  ];

  const actions = [
    {
      label: 'Delete',
      icon: HiTrash,
      onClick: (comment) => handleDeleteComment(comment.CommentID),
      className: 'bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-500'
    }
  ];

  const pagination = {
    currentPage: page + 1,
    totalPages: Math.ceil(totalCount / rowsPerPage),
    onPageChange: handleChangePage,
    onRowsPerPageChange: handleChangeRowsPerPage,
    rowsPerPage
  };

  if (loading && comments.length === 0) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><PageLoaderSpinner /></div>;
  }

  return (
    <div className="section-padding">
      <div className="container-modern">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Comment Management</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            View and manage user comments on recipes
          </p>
        </div>

        {/* Filter Controls */}
        <div className="bg-white/60 rounded-xl p-6 border border-emerald-100 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-emerald-700 flex items-center gap-2">
              <HiFilter className="w-5 h-5" />
              Filters
            </h3>
            <div className="flex items-center gap-2">
              {(usernameFilter || editedFilter !== 'all' || recipeFilter || dateFromFilter || dateToFilter) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <HiX className="w-4 h-4" />
                  Clear All
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1 px-3 py-1 text-sm text-emerald-600 hover:text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Username Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={usernameFilter}
                    onChange={(e) => setUsernameFilter(e.target.value)}
                    placeholder="Search by username..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Recipe Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe
                </label>
                <div className="relative">
                  <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={recipeFilter}
                    onChange={(e) => setRecipeFilter(e.target.value)}
                    placeholder="Search by recipe title..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Edited Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Edit Status
                </label>
                <select
                  value={editedFilter}
                  onChange={(e) => setEditedFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="all">All Comments</option>
                  <option value="original">Original Only</option>
                  <option value="edited">Edited Only</option>
                </select>
              </div>

              {/* Date From Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Date To Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        {actionError && (
          <div className="mb-4">
            <AdminErrorDisplay 
              error={`Action Error: ${actionError}`}
              onRetry={() => setActionError(null)}
              retryText="Dismiss"
            />
          </div>
        )}

        {error && comments.length > 0 && (
          <div className="mb-4">
            <AdminErrorDisplay 
              error={`Could not refresh comments: ${error}`}
              type="warning"
            />
          </div>
        )}

        {/* Results Summary */}
        {!loading && comments.length > 0 && (
          <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing {filteredComments.length} of {comments.length} comments
              {filteredComments.length !== comments.length && (
                <span className="text-emerald-600 font-medium"> (filtered)</span>
              )}
            </div>
            {(usernameFilter || editedFilter !== 'all' || recipeFilter || dateFromFilter || dateToFilter) && (
              <div className="text-emerald-600">
                {filteredComments.length === 0 ? 'No matches found' : 'Filters applied'}
              </div>
            )}
          </div>
        )}

        {filteredComments.length === 0 && !loading && !error ? (
          <div className="text-center py-12 bg-white/60 rounded-xl border border-emerald-100 shadow-sm">
            <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <HiEye className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {(usernameFilter || editedFilter !== 'all' || recipeFilter || dateFromFilter || dateToFilter)
                ? 'No matching comments found'
                : 'No comments found'
              }
            </h3>
            <p className="text-gray-500">
              {(usernameFilter || editedFilter !== 'all' || recipeFilter || dateFromFilter || dateToFilter)
                ? 'Try adjusting your filters to see more results.'
                : 'No recipe comments are currently available in the system.'
              }
            </p>
            {(usernameFilter || editedFilter !== 'all' || recipeFilter || dateFromFilter || dateToFilter) && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 text-sm text-emerald-600 hover:text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white/60 rounded-xl shadow-lg border border-emerald-100 overflow-hidden">
            <ResponsiveTable
              data={filteredComments}
              columns={columns}
              actions={actions}
              pagination={pagination}
              loading={loading}
              emptyStateMessage="No comments found"
              onSort={handleSort}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default CommentManagementPage;
