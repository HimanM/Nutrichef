import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useModal } from '../../context/ModalContext.jsx';
import { authenticatedFetch } from '../../utils/apiUtil.js';
import { PageLoaderSpinner } from '../../components/common/LoadingComponents.jsx';
import ResponsiveTable from '../../components/admin/ResponsiveTable.jsx';
import AdminFilters from '../../components/admin/AdminFilters.jsx';
import AdminBreadcrumb from '../../components/admin/AdminBreadcrumb.jsx';
import ResponsiveModal from '../../components/ui/ResponsiveModal.jsx';
import { HiTrash, HiEye, HiClock } from 'react-icons/hi';
import { AdminErrorDisplay } from '../../components/common/ErrorDisplay.jsx';

// Comment Detail Content Component for ResponsiveModal
const CommentDetailContent = ({ comment }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      {/* Comment Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-emerald-700 font-medium text-lg">
              {comment.Username?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h5 className="font-semibold text-gray-900">{comment.Username || 'Unknown User'}</h5>
            <p className="text-sm text-gray-500">Comment ID: {comment.CommentID}</p>
            <p className="text-sm text-gray-500">{formatDate(comment.CreatedAt)}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Comment #{comment.CommentID}
          </span>
          {comment.IsEdited && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mt-1">
              Edited
            </span>
          )}
        </div>
      </div>

      {/* Recipe Context */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Comment on Recipe:</h4>
        <div className="text-sm text-gray-700">
          <span className="font-medium text-emerald-600">{comment.RecipeTitle}</span>
        </div>
      </div>

      {/* Comment Content */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Comment:</h4>
        <div className="prose prose-gray max-w-none">
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-white border border-gray-200 rounded-lg p-4">
            {comment.Comment}
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div className="border-t border-gray-200 pt-4 text-sm text-gray-500">
        <div className="flex justify-between">
          <span>Created: {formatDate(comment.CreatedAt)}</span>
          {comment.IsEdited && comment.UpdatedAt && comment.UpdatedAt !== comment.CreatedAt && (
            <span>Last updated: {formatDate(comment.UpdatedAt)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

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
  const [usernameFilter, setUsernameFilter] = useState('');
  const [editedFilter, setEditedFilter] = useState('all'); // all, edited, original
  const [recipeFilter, setRecipeFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');

  // Sorting state
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Selected comment for viewing
  const [selectedComment, setSelectedComment] = useState(null);

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

  // Filter handling
  const handleFilterChange = (filterKey, value) => {
    switch (filterKey) {
      case 'username':
        setUsernameFilter(value);
        break;
      case 'recipe':
        setRecipeFilter(value);
        break;
      case 'editStatus':
        setEditedFilter(value);
        break;
      case 'dateFrom':
        setDateFromFilter(value);
        break;
      case 'dateTo':
        setDateToFilter(value);
        break;
      default:
        break;
    }
  };

  const clearFilters = () => {
    setUsernameFilter('');
    setEditedFilter('all');
    setRecipeFilter('');
    setDateFromFilter('');
    setDateToFilter('');
  };

  // Count active filters
  const activeFiltersCount = [
    usernameFilter,
    editedFilter !== 'all' ? editedFilter : '',
    recipeFilter,
    dateFromFilter,
    dateToFilter
  ].filter(Boolean).length;

  // Define filter configuration
  const filterConfig = [
    {
      key: 'username',
      label: 'Username',
      type: 'search',
      value: usernameFilter,
      placeholder: 'Search by username...'
    },
    {
      key: 'recipe',
      label: 'Recipe',
      type: 'search',
      value: recipeFilter,
      placeholder: 'Search by recipe title...'
    },
    {
      key: 'editStatus',
      label: 'Edit Status',
      type: 'select',
      value: editedFilter,
      options: [
        { value: 'all', label: 'All Comments' },
        { value: 'original', label: 'Original Only' },
        { value: 'edited', label: 'Edited Only' }
      ]
    },
    {
      key: 'dateFrom',
      label: 'From Date',
      type: 'date',
      value: dateFromFilter
    },
    {
      key: 'dateTo',
      label: 'To Date',
      type: 'date',
      value: dateToFilter
    }
  ];

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
    { 
      key: 'CommentID', 
      label: 'ID', 
      sortable: true,
      minWidth: '80px',
      maxWidth: '100px'
    },
    {
      key: 'Username',
      label: 'User',
      sortable: true,
      minWidth: '150px',
      maxWidth: '200px',
      render: (comment) => (
        <span className="flex items-center gap-2">
          <span className="inline-block w-8 h-8 bg-emerald-500 rounded-full text-white text-sm font-semibold leading-8 text-center">
            {comment.Username ? comment.Username[0].toUpperCase() : 'U'}
          </span>
          <span className="font-medium truncate">{comment.Username}</span>
        </span>
      )
    },
    {
      key: 'RecipeTitle',
      label: 'Recipe',
      sortable: true,
      minWidth: '150px',
      maxWidth: '250px',
      render: (comment) => (
        <span className="inline-block max-w-full">
          <span className="font-medium text-emerald-600 truncate block" title={comment.RecipeTitle}>
            {truncateText(comment.RecipeTitle, 40)}
          </span>
        </span>
      )
    },
    {
      key: 'Comment',
      label: 'Comment',
      sortable: false,
      minWidth: '200px',
      maxWidth: '400px',
      render: (comment) => (
        <div className="max-w-full">
          <div 
            className="text-gray-700 cursor-pointer hover:text-emerald-600 transition-colors overflow-hidden"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              wordBreak: 'break-word'
            }}
            onClick={() => setSelectedComment(comment)}
            title="Click to view full comment"
          >
            {truncateText(comment.Comment, 80)}
          </div>
          {comment.IsEdited && (
            <span className="text-xs text-gray-500 italic">(edited)</span>
          )}
          {comment.Comment.length > 80 && (
            <button
              onClick={() => setSelectedComment(comment)}
              className="text-xs text-emerald-600 hover:text-emerald-700 mt-1 block"
            >
              View full comment
            </button>
          )}
        </div>
      )
    },
    {
      key: 'CreatedAt',
      label: 'Posted',
      sortable: true,
      minWidth: '180px',
      maxWidth: '220px',
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
      label: 'View',
      icon: HiEye,
      onClick: (comment) => setSelectedComment(comment),
      className: 'bg-blue-50 text-blue-700 hover:bg-blue-100 focus:ring-blue-500'
    },
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
        {/* Breadcrumb */}
        <AdminBreadcrumb 
          items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Recipes', href: '/admin/recipes' },
            { label: 'Comments', href: '/admin/comments', current: true }
          ]}
          className="mb-6"
        />

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Comment Management</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            View and manage user comments on recipes
          </p>
        </div>

        {/* Filters */}
        <AdminFilters
          filters={filterConfig}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          activeFiltersCount={activeFiltersCount}
          className="mb-6"
        />

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

        {filteredComments.length === 0 && !loading && !error ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <HiEye className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeFiltersCount > 0 ? 'No matching comments found' : 'No comments found'}
            </h3>
            <p className="text-gray-500 mb-4">
              {activeFiltersCount > 0
                ? 'Try adjusting your filters to see more results.'
                : 'No recipe comments are currently available in the system.'
              }
            </p>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
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
        
        {/* Comment Detail Modal */}
        <ResponsiveModal
          isOpen={!!selectedComment}
          onClose={() => setSelectedComment(null)}
          title="Comment Details"
          maxWidth="max-w-3xl"
        >
          {selectedComment && <CommentDetailContent comment={selectedComment} />}
        </ResponsiveModal>
      </div>
    </div>
  );
}

export default CommentManagementPage;
