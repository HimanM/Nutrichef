import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { authenticatedFetch } from '../../utils/apiUtil';

const ForumPostCard = ({ post, onPostDeleted, onRefresh }) => {
  const auth = useAuth();
  const { isAuthenticated, currentUser } = auth;
  const { showAlert, showModal } = useModal();
  const [isLiking, setIsLiking] = useState(false);
  const [localPost, setLocalPost] = useState(post);

  // Sync localPost with post prop when it changes (e.g., on page refresh)
  useEffect(() => {
    setLocalPost(post);
  }, [post]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleLikeToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showAlert('Authentication Required', 'Please sign in to like posts');
      return;
    }

    if (isLiking) return;

    try {
      setIsLiking(true);
      const response = await authenticatedFetch(`/api/forum/posts/${post.Id}/like`, {
        method: 'POST'
      }, auth);

      if (response.ok) {
        const data = await response.json();
        setLocalPost(prev => ({
          ...prev,
          LikesCount: data.likes_count,
          IsLikedByCurrentUser: data.liked
        }));
      } else {
        throw new Error('Failed to toggle like');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      showAlert('Error', 'Failed to update like status. Please try again.');
    } finally {
      setIsLiking(false);
    }
  };

  const handleDeletePost = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = await showModal(
      'confirm',
      'Confirm Delete',
      'Are you sure you want to delete this post? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      const response = await authenticatedFetch(`/api/forum/posts/${post.Id}`, {
        method: 'DELETE'
      }, auth);

      if (response.ok) {
        onPostDeleted(post.Id);
      } else {
        throw new Error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      showAlert('Error', 'Failed to delete post. Please try again.');
    }
  };

  const canDeletePost = currentUser && (currentUser.UserID === post.UserId || currentUser.role === 'admin');

  const truncateContent = (content, maxLength = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Link to={`/forum/posts/${post.Id}`} className="block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-700 font-medium text-sm">
                {post.UserName?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{post.UserName || 'Unknown User'}</p>
              <p className="text-sm text-gray-500">{formatDate(post.CreatedAt)}</p>
            </div>
          </div>
          
          {canDeletePost && (
            <button
              onClick={handleDeletePost}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Delete post"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
          {post.Title}
        </h3>

        {/* Content Preview */}
        <p className="text-gray-600 mb-4 line-clamp-3">
          {truncateContent(post.Content || '')}
        </p>

        {/* Tagged Recipes */}
        {post.TaggedRecipes && post.TaggedRecipes.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {post.TaggedRecipes.map((recipe) => (
                <span
                  key={recipe.Id}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-sm rounded-full"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {recipe.RecipeTitle}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats and Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {localPost.ViewsCount} views
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {localPost.CommentsCount} comments
            </span>
          </div>

          <button
            onClick={handleLikeToggle}
            disabled={isLiking}
            className={`flex items-center gap-1 px-3 py-2 sm:py-1 rounded-full text-sm font-medium transition-colors min-h-[36px] sm:min-h-0 ${
              localPost.IsLikedByCurrentUser
                ? 'bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-100'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 active:bg-gray-100'
            } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg 
              className={`w-5 h-5 sm:w-4 sm:h-4 ${localPost.IsLikedByCurrentUser ? 'fill-current' : ''}`} 
              fill={localPost.IsLikedByCurrentUser ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="font-medium">{localPost.LikesCount}</span>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ForumPostCard;