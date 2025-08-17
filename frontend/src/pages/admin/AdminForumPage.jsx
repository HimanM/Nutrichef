import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { authenticatedFetch } from '../../utils/apiUtil';
import ResponsiveTable from '../../components/admin/ResponsiveTable';
import AdminBreadcrumb from '../../components/admin/AdminBreadcrumb';
import AdminFilters from '../../components/admin/AdminFilters';
import ResponsiveModal from '../../components/ui/ResponsiveModal';
import { HiTrash, HiEye, HiChat, HiHeart } from 'react-icons/hi';
import { PageLoaderSpinner } from '../../components/common/LoadingComponents';
import { AdminErrorDisplay, AdminFullPageError } from '../../components/common/ErrorDisplay.jsx';

// Post Detail Content Component for ResponsiveModal
const PostDetailContent = ({ post }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderContentWithTags = (content) => {
    if (!content) return '';

    // Replace #RecipeName with styled tags
    const taggedRecipeNames = post.TaggedRecipes?.map(recipe => recipe.RecipeTitle) || [];
    let processedContent = content;

    taggedRecipeNames.forEach(recipeName => {
      const regex = new RegExp(`#${recipeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
      processedContent = processedContent.replace(
        regex,
        `<span class="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full font-medium">#${recipeName}</span>`
      );
    });

    return processedContent;
  };

  return (
    <div>
      {/* Post Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-emerald-700 font-medium text-lg">
              {post.UserName?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h5 className="font-semibold text-gray-900">{post.UserName || 'Unknown User'}</h5>
            <p className="text-sm text-gray-500">User ID: {post.UserId}</p>
            <p className="text-sm text-gray-500">{formatDate(post.CreatedAt)}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Post #{post.Id}
          </span>
        </div>
      </div>

      {/* Title */}
      <h4 className="text-2xl font-bold text-gray-900 mb-4">{post.Title}</h4>

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
        <span className="flex items-center gap-1">
          <HiEye className="w-4 h-4" />
          {post.ViewsCount} views
        </span>
        <span className="flex items-center gap-1">
          <HiHeart className="w-4 h-4" />
          {post.LikesCount} likes
        </span>
        <span className="flex items-center gap-1">
          <HiChat className="w-4 h-4" />
          {post.CommentsCount} comments
        </span>
      </div>

      {/* Content */}
      <div className="prose prose-gray max-w-none mb-6">
        <div
          className="text-gray-700 leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: renderContentWithTags(post.Content) }}
        />
      </div>

      {/* Tagged Recipes */}
      {post.TaggedRecipes && post.TaggedRecipes.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Tagged Recipes</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {post.TaggedRecipes.map((recipe) => (
              <div
                key={recipe.Id}
                className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg"
              >
                {recipe.RecipeImageURL && (
                  <img
                    src={recipe.RecipeImageURL}
                    alt={recipe.RecipeTitle}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-gray-900 truncate">{recipe.RecipeTitle}</h5>
                  <p className="text-sm text-gray-600">Recipe ID: {recipe.RecipeId}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="border-t border-gray-200 pt-4 mt-6 text-sm text-gray-500">
        <div className="flex justify-between">
          <span>Created: {formatDate(post.CreatedAt)}</span>
          {post.UpdatedAt !== post.CreatedAt && (
            <span>Last updated: {formatDate(post.UpdatedAt)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

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
              {comment.UserName?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h5 className="font-semibold text-gray-900">{comment.UserName || 'Unknown User'}</h5>
            <p className="text-sm text-gray-500">User ID: {comment.UserId}</p>
            <p className="text-sm text-gray-500">{formatDate(comment.CreatedAt)}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Comment #{comment.Id}
          </span>
        </div>
      </div>

      {/* Post Context */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Commenting on:</h4>
        <div className="text-sm text-gray-700">
          <span className="font-medium">{comment.PostTitle}</span>
          <span className="text-gray-500 ml-2">(Post ID: {comment.PostId})</span>
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
        </div>
      </div>
    </div>
  );
};

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

  // Selected post for viewing
  const [selectedPost, setSelectedPost] = useState(null);
  
  // Selected comment for viewing
  const [selectedComment, setSelectedComment] = useState(null);

  // Filter states for posts
  const [postTitleFilter, setPostTitleFilter] = useState('');
  const [postAuthorFilter, setPostAuthorFilter] = useState('');
  const [postContentFilter, setPostContentFilter] = useState('');
  const [postDateFromFilter, setPostDateFromFilter] = useState('');
  const [postDateToFilter, setPostDateToFilter] = useState('');

  // Filter states for comments
  const [commentTextFilter, setCommentTextFilter] = useState('');
  const [commentAuthorFilter, setCommentAuthorFilter] = useState('');
  const [commentPostFilter, setCommentPostFilter] = useState('');
  const [commentDateFromFilter, setCommentDateFromFilter] = useState('');
  const [commentDateToFilter, setCommentDateToFilter] = useState('');

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

  // Filter handling for posts
  const handlePostFilterChange = (filterKey, value) => {
    switch (filterKey) {
      case 'title':
        setPostTitleFilter(value);
        break;
      case 'author':
        setPostAuthorFilter(value);
        break;
      case 'content':
        setPostContentFilter(value);
        break;
      case 'dateFrom':
        setPostDateFromFilter(value);
        break;
      case 'dateTo':
        setPostDateToFilter(value);
        break;
      default:
        break;
    }
  };

  const clearPostFilters = () => {
    setPostTitleFilter('');
    setPostAuthorFilter('');
    setPostContentFilter('');
    setPostDateFromFilter('');
    setPostDateToFilter('');
  };

  // Filter handling for comments
  const handleCommentFilterChange = (filterKey, value) => {
    switch (filterKey) {
      case 'comment':
        setCommentTextFilter(value);
        break;
      case 'author':
        setCommentAuthorFilter(value);
        break;
      case 'post':
        setCommentPostFilter(value);
        break;
      case 'dateFrom':
        setCommentDateFromFilter(value);
        break;
      case 'dateTo':
        setCommentDateToFilter(value);
        break;
      default:
        break;
    }
  };

  const clearCommentFilters = () => {
    setCommentTextFilter('');
    setCommentAuthorFilter('');
    setCommentPostFilter('');
    setCommentDateFromFilter('');
    setCommentDateToFilter('');
  };

  // Count active filters
  const activePostFiltersCount = [
    postTitleFilter,
    postAuthorFilter,
    postContentFilter,
    postDateFromFilter,
    postDateToFilter
  ].filter(Boolean).length;

  const activeCommentFiltersCount = [
    commentTextFilter,
    commentAuthorFilter,
    commentPostFilter,
    commentDateFromFilter,
    commentDateToFilter
  ].filter(Boolean).length;

  // Define filter configurations
  const postFilterConfig = [
    {
      key: 'title',
      label: 'Title',
      type: 'search',
      value: postTitleFilter,
      placeholder: 'Search by title...'
    },
    {
      key: 'author',
      label: 'Author',
      type: 'search',
      value: postAuthorFilter,
      placeholder: 'Search by author...'
    },
    {
      key: 'content',
      label: 'Content',
      type: 'search',
      value: postContentFilter,
      placeholder: 'Search in content...'
    },
    {
      key: 'dateFrom',
      label: 'From Date',
      type: 'date',
      value: postDateFromFilter,
      placeholder: 'Start date'
    },
    {
      key: 'dateTo',
      label: 'To Date',
      type: 'date',
      value: postDateToFilter,
      placeholder: 'End date'
    }
  ];

  const commentFilterConfig = [
    {
      key: 'comment',
      label: 'Comment',
      type: 'search',
      value: commentTextFilter,
      placeholder: 'Search in comments...'
    },
    {
      key: 'author',
      label: 'Author',
      type: 'search',
      value: commentAuthorFilter,
      placeholder: 'Search by author...'
    },
    {
      key: 'post',
      label: 'Post',
      type: 'search',
      value: commentPostFilter,
      placeholder: 'Search by post title...'
    },
    {
      key: 'dateFrom',
      label: 'From Date',
      type: 'date',
      value: commentDateFromFilter,
      placeholder: 'Start date'
    },
    {
      key: 'dateTo',
      label: 'To Date',
      type: 'date',
      value: commentDateToFilter,
      placeholder: 'End date'
    }
  ];

  // Filter posts based on current filters
  const filteredPosts = posts.filter(post => {
    // Title filter
    if (postTitleFilter && !post.Title?.toLowerCase().includes(postTitleFilter.toLowerCase())) {
      return false;
    }

    // Author filter
    if (postAuthorFilter && !post.UserName?.toLowerCase().includes(postAuthorFilter.toLowerCase())) {
      return false;
    }

    // Content filter
    if (postContentFilter && !post.Content?.toLowerCase().includes(postContentFilter.toLowerCase())) {
      return false;
    }

    // Date range filters
    if (postDateFromFilter || postDateToFilter) {
      const postDate = new Date(post.CreatedAt);
      if (postDateFromFilter) {
        const fromDate = new Date(postDateFromFilter);
        if (postDate < fromDate) return false;
      }
      if (postDateToFilter) {
        const toDate = new Date(postDateToFilter);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (postDate > toDate) return false;
      }
    }

    return true;
  });

  // Filter comments based on current filters
  const filteredComments = comments.filter(comment => {
    // Comment text filter
    if (commentTextFilter && !comment.Comment?.toLowerCase().includes(commentTextFilter.toLowerCase())) {
      return false;
    }

    // Author filter
    if (commentAuthorFilter && !comment.UserName?.toLowerCase().includes(commentAuthorFilter.toLowerCase())) {
      return false;
    }

    // Post title filter
    if (commentPostFilter && !comment.PostTitle?.toLowerCase().includes(commentPostFilter.toLowerCase())) {
      return false;
    }

    // Date range filters
    if (commentDateFromFilter || commentDateToFilter) {
      const commentDate = new Date(comment.CreatedAt);
      if (commentDateFromFilter) {
        const fromDate = new Date(commentDateFromFilter);
        if (commentDate < fromDate) return false;
      }
      if (commentDateToFilter) {
        const toDate = new Date(commentDateToFilter);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (commentDate > toDate) return false;
      }
    }

    return true;
  });

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
    { 
      key: 'Id', 
      label: 'ID', 
      sortable: true,
      minWidth: '60px',
      maxWidth: '80px'
    },
    {
      key: 'Title',
      label: 'Title',
      sortable: true,
      minWidth: '180px',
      maxWidth: '280px',
      render: (post) => (
        <div className="max-w-full">
          <div className="font-medium text-gray-900 truncate">{post.Title}</div>
          <div className="text-sm text-gray-500 truncate">{truncateText(post.Content, 50)}</div>
        </div>
      )
    },
    {
      key: 'UserName',
      label: 'Author',
      sortable: true,
      minWidth: '100px',
      maxWidth: '140px',
      render: (post) => (
        <div>
          <div className="font-medium text-gray-900 truncate">{post.UserName}</div>
          <div className="text-sm text-gray-500">ID: {post.UserId}</div>
        </div>
      )
    },
    {
      key: 'CreatedAt',
      label: 'Created',
      sortable: true,
      minWidth: '120px',
      maxWidth: '150px',
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
      minWidth: '70px',
      maxWidth: '85px',
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
      minWidth: '70px',
      maxWidth: '85px',
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
      minWidth: '80px',
      maxWidth: '100px',
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
    { 
      key: 'Id', 
      label: 'Comment ID', 
      sortable: true,
      minWidth: '80px',
      maxWidth: '120px'
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
            className="text-sm text-gray-900 cursor-pointer hover:text-emerald-600 transition-colors overflow-hidden"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              wordBreak: 'break-word'
            }}
            onClick={() => setSelectedComment(comment)}
            title="Click to view full comment"
          >
            {truncateText(comment.Comment, 100)}
          </div>
          {comment.Comment.length > 100 && (
            <button
              onClick={() => setSelectedComment(comment)}
              className="text-xs text-emerald-600 hover:text-emerald-700 mt-1"
            >
              View full comment
            </button>
          )}
        </div>
      )
    },
    {
      key: 'PostTitle',
      label: 'Post',
      sortable: true,
      minWidth: '150px',
      maxWidth: '250px',
      render: (comment) => (
        <div className="max-w-full">
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
      minWidth: '120px',
      maxWidth: '180px',
      render: (comment) => (
        <div>
          <div className="font-medium text-gray-900 truncate">{comment.UserName}</div>
          <div className="text-sm text-gray-500">ID: {comment.UserId}</div>
        </div>
      )
    },
    {
      key: 'CreatedAt',
      label: 'Created',
      sortable: true,
      minWidth: '140px',
      maxWidth: '180px',
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
      label: 'View',
      icon: HiEye,
      onClick: (post) => setSelectedPost(post),
      className: 'bg-blue-50 text-blue-700 hover:bg-blue-100 focus:ring-blue-500'
    },
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
      label: 'View',
      icon: HiEye,
      onClick: (comment) => setSelectedComment(comment),
      className: 'bg-blue-50 text-blue-700 hover:bg-blue-100 focus:ring-blue-500'
    },
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
      <AdminFullPageError 
        error={`Error fetching ${activeTab}: ${error}`}
        title="Forum Management"
        onRetry={() => activeTab === 'posts' ? fetchPosts(postsPage, postsRowsPerPage) : fetchComments(commentsPage, commentsRowsPerPage)}
      />
    );
  }

  return (
    <div className="section-padding">
      <div className="container-modern">
        {/* Breadcrumb */}
        <AdminBreadcrumb 
          items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Forum Management', href: '/admin/forum', current: true }
          ]}
          className="mb-6"
        />

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Forum Management</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Manage forum posts and comments, monitor community activity
          </p>
        </div>

        {/* Action Error */}
        {actionError && (
          <div className="mb-4">
            <AdminErrorDisplay 
              error={`Action Error: ${actionError}`}
              onRetry={() => setActionError(null)}
              retryText="Dismiss"
            />
          </div>
        )}

        {/* Loading Error for existing data */}
        {error && ((activeTab === 'posts' && posts.length > 0) || (activeTab === 'comments' && comments.length > 0)) && (
          <div className="mb-4">
            <AdminErrorDisplay 
              error={`Could not refresh ${activeTab}: ${error}`}
              type="warning"
            />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'posts'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Posts ({postsTotalCount})
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'comments'
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
            {/* Post Filters */}
            <AdminFilters 
              filters={postFilterConfig}
              onFilterChange={handlePostFilterChange}
              onClearFilters={clearPostFilters}
              activeFiltersCount={activePostFiltersCount}
              className="mb-6"
            />
            
            {posts.length === 0 && !loading && !error ? (
              <p className="text-center text-gray-400 mt-6 text-lg">No forum posts found.</p>
            ) : (
              <ResponsiveTable
                data={filteredPosts}
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
            {/* Comment Filters */}
            <AdminFilters 
              filters={commentFilterConfig}
              onFilterChange={handleCommentFilterChange}
              onClearFilters={clearCommentFilters}
              activeFiltersCount={activeCommentFiltersCount}
              className="mb-6"
            />
            
            {comments.length === 0 && !loading && !error ? (
              <p className="text-center text-gray-400 mt-6 text-lg">No forum comments found.</p>
            ) : (
              <ResponsiveTable
                data={filteredComments}
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

        {/* Post Detail Modal */}
        <ResponsiveModal
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          title="Forum Post Details"
          maxWidth="max-w-4xl"
        >
          {selectedPost && <PostDetailContent post={selectedPost} />}
        </ResponsiveModal>

        {/* Comment Detail Modal */}
        <ResponsiveModal
          isOpen={!!selectedComment}
          onClose={() => setSelectedComment(null)}
          title="Forum Comment Details"
          maxWidth="max-w-3xl"
        >
          {selectedComment && <CommentDetailContent comment={selectedComment} />}
        </ResponsiveModal>
      </div>
    </div>
  );
};

export default AdminForumPage;