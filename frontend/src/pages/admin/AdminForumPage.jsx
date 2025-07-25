import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { authenticatedFetch } from '../../utils/apiUtil';
import ResponsiveTable from '../../components/admin/ResponsiveTable';
import { HiTrash, HiEye, HiChat, HiHeart } from 'react-icons/hi';
import { PageLoaderSpinner } from '../../components/common/LoadingComponents';

const AdminForumPage = () => {
  const authContextValue = useAuth();
  const { showModal, setLoading: setModalLoading } = useModal();
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  
  // Posts pagination and sorting
  const [postsPage, setPostsPage] = useState(0); // 0-indexed for consistency
  const [postsRowsPerPage, setPostsRowsPerPage] = useState(10);
  const [postsTotalCount, setPostsTotalCount] = useState(0);
  const [postsSortColumn, setPostsSortColumn] = useState('Id');
  const [postsSortDirection, setPostsSortDirection] = useState('desc');
  
  // Comments pagination and sorting
  const [commentsPage, setCommentsPage] = useState(0); // 0-indexed for consistency
  const [commentsRowsPerPage, setCommentsRowsPerPage] = useState(10);
  const [commentsTotalCount, setCommentsTotalCount] = useState(0);
  const [commentsSortColumn, setCommentsSortColumn] = useState('Id');
  const [commentsSortDirection, setCommentsSortDirection] = useState('desc');

  const fetchPosts = useCallback(async (currentPage, currentRowsPerPage, currentSortColumn, currentSortDirection) => {
    setLoading(true);
    setError(null);
    const backendPage = currentPage + 1; // Convert to 1-indexed for backend
    
    try {
      const response = await authenticatedFetch(
        `/api/admin/forum/posts?page=${backendPage}&per_page=${currentRowsPerPage}&sort_by=${currentSortColumn}&sort_order=${currentSortDirection}`,
        { method: 'GET' },
        authContextValue
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch posts: ${response.status}`);
      }

      const data = await response.json();
      setPosts(data.posts || []);
      setPostsTotalCount(data.pagination?.total || 0);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, [authContextValue]);

  const fetchComments = useCallback(async (currentPage, currentRowsPerPage, currentSortColumn, currentSortDirection) => {
    setLoading(true);
    setError(null);
    const backendPage = currentPage + 1; // Convert to 1-indexed for backend
    
    try {
      const response = await authenticatedFetch(
        `/api/admin/forum/comments?page=${backendPage}&per_page=${currentRowsPerPage}&sort_by=${currentSortColumn}&sort_order=${currentSortDirection}`,
        { method: 'GET' },
        authContextValue
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch comments: ${response.status}`);
      }

      const data = await response.json();
      setComments(data.comments || []);
      setCommentsTotalCount(data.pagination?.total || 0);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  }, [authContextValue]);

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchPosts(postsPage, postsRowsPerPage, postsSortColumn, postsSortDirection);
    } else {
      fetchComments(commentsPage, commentsRowsPerPage, commentsSortColumn, commentsSortDirection);
    }
  }, [activeTab, postsPage, postsRowsPerPage, postsSortColumn, postsSortDirection, 
      commentsPage, commentsRowsPerPage, commentsSortColumn, commentsSortDirection, 
      fetchPosts, fetchComments]);

  // Sorting handlers
  const handlePostsSort = (columnKey) => {
    if (postsSortColumn === columnKey) {
      setPostsSortDirection(prevDirection => prevDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setPostsSortColumn(columnKey);
      setPostsSortDirection('asc');
    }
    setPostsPage(0);
  };

  const handleCommentsSort = (columnKey) => {
    if (commentsSortColumn === columnKey) {
      setCommentsSortDirection(prevDirection => prevDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setCommentsSortColumn(columnKey);
      setCommentsSortDirection('asc');
    }
    setCommentsPage(0);
  };

  // Pagination handlers
  const handlePostsPageChange = (newPage) => setPostsPage(newPage - 1); // Convert to 0-indexed
  const handlePostsRowsPerPageChange = (event) => {
    setPostsRowsPerPage(parseInt(event.target.value, 10));
    setPostsPage(0);
  };

  const handleCommentsPageChange = (newPage) => setCommentsPage(newPage - 1); // Convert to 0-indexed
  const handleCommentsRowsPerPageChange = (event) => {
    setCommentsRowsPerPage(parseInt(event.target.value, 10));
    setCommentsPage(0);
  };

  const handleDeletePost = async (postId) => {
    setActionError(null);
    
    const confirmed = await showModal(
      'confirm',
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      setModalLoading(true);
      const response = await authenticatedFetch(`/api/admin/forum/posts/${postId}`, {
        method: 'DELETE'
      }, authContextValue);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete post');
      }

      // Refresh the current page
      fetchPosts(postsPage, postsRowsPerPage, postsSortColumn, postsSortDirection);
      await showModal('alert', 'Success', 'Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      setActionError(error.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setActionError(null);
    
    const confirmed = await showModal(
      'confirm',
      'Delete Comment',
      'Are you sure you want to delete this comment? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      setModalLoading(true);
      const response = await authenticatedFetch(`/api/admin/forum/comments/${commentId}`, {
        method: 'DELETE'
      }, authContextValue);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete comment');
      }

      // Refresh the current page
      fetchComments(commentsPage, commentsRowsPerPage, commentsSortColumn, commentsSortDirection);
      await showModal('alert', 'Success', 'Comment deleted successfully!');
    } catch (error) {
      console.error('Error deleting comment:', error);
      setActionError(error.message);
    } finally {
      setModalLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Posts table columns
  const postsColumns = [
    { key: 'Id', label: 'Post ID', sortable: true },
    { 
      key: 'Title', 
      label: 'Title', 
      sortable: true,
      render: (post) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 truncate">{post.Title}</div>
          <div className="text-sm text-gray-500 truncate">{truncateText(post.Content, 60)}</div>
        </div>
      )
    },
    { 
      key: 'UserName', 
      label: 'Author', 
      sortable: true,
      render: (post) => (
        <div>
          <div className="font-medium text-gray-900">{post.UserName}</div>
          <div className="text-sm text-gray-500">ID: {post.UserId}</div>
        </div>
      )
    },
    { 
      key: 'CreatedAt', 
      label: 'Created', 
      sortable: true,
      render: (post) => (
        <div className="text-sm text-gray-900">
          {formatDate(post.CreatedAt)}
        </div>
      )
    },
    { 
      key: 'LikesCount', 
      label: 'Likes', 
      sortable: true,
      render: (post) => (
        <div className="flex items-center gap-1 text-sm">
          <HiHeart className="w-4 h-4 text-red-500" />
          {post.LikesCount}
        </div>
      )
    },
    { 
      key: 'ViewsCount', 
      label: 'Views', 
      sortable: true,
      render: (post) => (
        <div className="flex items-center gap-1 text-sm">
          <HiEye className="w-4 h-4 text-blue-500" />
          {post.ViewsCount}
        </div>
      )
    },
    { 
      key: 'CommentsCount', 
      label: 'Comments', 
      sortable: true,
      render: (post) => (
        <div className="flex items-center gap-1 text-sm">
          <HiChat className="w-4 h-4 text-green-500" />
          {post.CommentsCount}
        </div>
      )
    }
  ];

  // Comments table columns
  const commentsColumns = [
    { key: 'Id', label: 'Comment ID', sortable: true },
    { 
      key: 'Comment', 
      label: 'Comment', 
      sortable: false,
      render: (comment) => (
        <div className="max-w-xs">
          <div className="text-sm text-gray-900 whitespace-pre-wrap">
            {truncateText(comment.Comment, 100)}
          </div>
        </div>
      )
    },
    { 
      key: 'PostTitle', 
      label: 'Post', 
      sortable: true,
      render: (comment) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 truncate">
            {truncateText(comment.PostTitle, 40)}
          </div>
          <div className="text-sm text-gray-500">Post ID: {comment.PostId}</div>
        </div>
      )
    },
    { 
      key: 'UserName', 
      label: 'Author', 
      sortable: true,
      render: (comment) => (
        <div>
          <div className="font-medium text-gray-900">{comment.UserName}</div>
          <div className="text-sm text-gray-500">ID: {comment.UserId}</div>
        </div>
      )
    },
    { 
      key: 'CreatedAt', 
      label: 'Created', 
      sortable: true,
      render: (comment) => (
        <div className="text-sm text-gray-900">
          {formatDate(comment.CreatedAt)}
        </div>
      )
    }
  ];

  // Actions for posts
  const postsActions = [
    {
      label: 'Delete',
      icon: HiTrash,
      onClick: (post) => handleDeletePost(post.Id),
      className: 'bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-500'
    }
  ];

  // Actions for comments
  const commentsActions = [
    {
      label: 'Delete',
      icon: HiTrash,
      onClick: (comment) => handleDeleteComment(comment.Id),
      className: 'bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-500'
    }
  ];

  // Pagination objects
  const postsPagination = {
    currentPage: postsPage + 1, // Convert to 1-indexed
    totalPages: Math.ceil(postsTotalCount / postsRowsPerPage),
    onPageChange: handlePostsPageChange,
    onRowsPerPageChange: handlePostsRowsPerPageChange,
    rowsPerPage: postsRowsPerPage
  };

  const commentsPagination = {
    currentPage: commentsPage + 1, // Convert to 1-indexed
    totalPages: Math.ceil(commentsTotalCount / commentsRowsPerPage),
    onPageChange: handleCommentsPageChange,
    onRowsPerPageChange: handleCommentsRowsPerPageChange,
    rowsPerPage: commentsRowsPerPage
  };

  // Loading state
  if (loading && ((activeTab === 'posts' && posts.length === 0) || (activeTab === 'comments' && comments.length === 0))) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><PageLoaderSpinner /></div>;
  }

  // Error state
  if (error && ((activeTab === 'posts' && posts.length === 0) || (activeTab === 'comments' && comments.length === 0))) {
    return (
      <div className="section-padding">
        <div className="container-modern">
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            <p>Error fetching {activeTab}: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="container-modern">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Forum Management</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Manage forum posts and comments, monitor community activity
          </p>
        </div>

        {/* Action Error */}
        {actionError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            Action Error: {actionError}
          </div>
        )}

        {/* Loading Error for existing data */}
        {error && ((activeTab === 'posts' && posts.length > 0) || (activeTab === 'comments' && comments.length > 0)) && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-md text-sm">
            Could not refresh {activeTab}: {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'posts'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Posts ({postsTotalCount})
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'comments'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Comments ({commentsTotalCount})
              </button>
            </nav>
          </div>
        </div>

        {/* Posts Table */}
        {activeTab === 'posts' && (
          <>
            {posts.length === 0 && !loading && !error ? (
              <p className="text-center text-gray-400 mt-6 text-lg">No forum posts found.</p>
            ) : (
              <ResponsiveTable
                data={posts}
                columns={postsColumns}
                loading={loading}
                onSort={handlePostsSort}
                sortColumn={postsSortColumn}
                sortDirection={postsSortDirection}
                actions={postsActions}
                pagination={postsPagination}
                tableTitle="Forum Posts"
              />
            )}
          </>
        )}

        {/* Comments Table */}
        {activeTab === 'comments' && (
          <>
            {comments.length === 0 && !loading && !error ? (
              <p className="text-center text-gray-400 mt-6 text-lg">No forum comments found.</p>
            ) : (
              <ResponsiveTable
                data={comments}
                columns={commentsColumns}
                loading={loading}
                onSort={handleCommentsSort}
                sortColumn={commentsSortColumn}
                sortDirection={commentsSortDirection}
                actions={commentsActions}
                pagination={commentsPagination}
                tableTitle="Forum Comments"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminForumPage;