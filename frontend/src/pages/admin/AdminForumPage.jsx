import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { authenticatedFetch } from '../../utils/apiUtil';

const AdminForumPage = () => {
  const auth = useAuth();
  const { showAlert } = useModal();
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [postsPagination, setPostsPagination] = useState({});
  const [commentsPagination, setCommentsPagination] = useState({});
  const [postsPage, setPostsPage] = useState(1);
  const [commentsPage, setCommentsPage] = useState(1);

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchPosts();
    } else {
      fetchComments();
    }
  }, [activeTab, postsPage, commentsPage]);

  const fetchPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await authenticatedFetch(`/api/admin/forum/posts?page=${postsPage}&per_page=20`, {
        method: 'GET'
      }, auth);

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
        setPostsPagination(data.pagination);
      } else {
        throw new Error('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      showAlert('Error', 'Failed to load forum posts. Please try again.');
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const response = await authenticatedFetch(`/api/admin/forum/comments?page=${commentsPage}&per_page=20`, {
        method: 'GET'
      }, auth);

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
        setCommentsPagination(data.pagination);
      } else {
        throw new Error('Failed to fetch comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      showAlert('Error', 'Failed to load forum comments. Please try again.');
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    const confirmed = await showAlert(
      'Confirm Delete',
      'Are you sure you want to delete this post? This action cannot be undone.',
      { iconType: 'warning' }
    );

    if (!confirmed) return;

    try {
      const response = await authenticatedFetch(`/api/admin/forum/posts/${postId}`, {
        method: 'DELETE'
      }, auth);

      if (response.ok) {
        setPosts(prev => prev.filter(post => post.Id !== postId));
        showAlert('Success', 'Post deleted successfully!', { iconType: 'success' });
      } else {
        throw new Error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      showAlert('Error', 'Failed to delete post. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmed = await showAlert(
      'Confirm Delete',
      'Are you sure you want to delete this comment? This action cannot be undone.',
      { iconType: 'warning' }
    );

    if (!confirmed) return;

    try {
      const response = await authenticatedFetch(`/api/admin/forum/comments/${commentId}`, {
        method: 'DELETE'
      }, auth);

      if (response.ok) {
        setComments(prev => prev.filter(comment => comment.Id !== commentId));
        showAlert('Success', 'Comment deleted successfully!', { iconType: 'success' });
      } else {
        throw new Error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      showAlert('Error', 'Failed to delete comment. Please try again.');
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

  const renderPagination = (pagination, currentPage, onPageChange) => {
    if (!pagination || pagination.pages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Showing {((pagination.page - 1) * pagination.per_page) + 1} to{' '}
          {Math.min(pagination.page * pagination.per_page, pagination.total)} of{' '}
          {pagination.total} items
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={!pagination.has_prev}
            className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="px-3 py-2 text-sm font-medium text-gray-900">
            Page {pagination.page} of {pagination.pages}
          </span>
          
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.has_next}
            className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Forum Management</h1>
        <p className="text-gray-600 mt-1">Manage forum posts and comments</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'posts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Posts ({postsPagination.total || 0})
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'comments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Comments ({commentsPagination.total || 0})
            </button>
          </nav>
        </div>

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div>
            {postsLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">No forum posts found.</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-200">
                  {posts.map((post) => (
                    <div key={post.Id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {post.Title}
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Post #{post.Id}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-3">
                            {truncateText(post.Content)}
                          </p>
                          
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <span>By: {post.UserName}</span>
                            <span>Created: {formatDate(post.CreatedAt)}</span>
                            <span>{post.LikesCount} likes</span>
                            <span>{post.ViewsCount} views</span>
                            <span>{post.CommentsCount} comments</span>
                          </div>
                          
                          {post.TaggedRecipes && post.TaggedRecipes.length > 0 && (
                            <div className="mt-2">
                              <div className="flex flex-wrap gap-1">
                                {post.TaggedRecipes.map((recipe) => (
                                  <span
                                    key={recipe.Id}
                                    className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full"
                                  >
                                    #{recipe.RecipeTitle}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleDeletePost(post.Id)}
                          className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete post"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {renderPagination(postsPagination, postsPage, setPostsPage)}
              </>
            )}
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div>
            {commentsLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading comments...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">No forum comments found.</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-200">
                  {comments.map((comment) => (
                    <div key={comment.Id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Comment #{comment.Id}
                            </span>
                            <span className="text-sm text-gray-500">
                              on "{truncateText(comment.PostTitle, 50)}"
                            </span>
                          </div>
                          
                          <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                            {comment.Comment}
                          </p>
                          
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <span>By: {comment.UserName}</span>
                            <span>Created: {formatDate(comment.CreatedAt)}</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteComment(comment.Id)}
                          className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete comment"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {renderPagination(commentsPagination, commentsPage, setCommentsPage)}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminForumPage;