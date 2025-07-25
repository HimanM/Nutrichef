import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { authenticatedFetch } from '../../utils/apiUtil';

const ForumComments = ({ 
  postId, 
  comments, 
  loading, 
  pagination, 
  onCommentAdded, 
  onCommentDeleted, 
  onCommentUpdated,
  onLoadMore, 
  isAuthenticated, 
  currentUser 
}) => {
  const auth = useAuth();
  const { showAlert, showModal } = useModal();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState('');

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

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      showAlert('Validation Error', 'Please enter a comment');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await authenticatedFetch(`/api/forum/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comment: newComment.trim()
        })
      }, auth);

      if (response.ok) {
        const comment = await response.json();
        onCommentAdded(comment);
        setNewComment('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      showAlert('Error', error.message || 'Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmed = await showModal(
      'confirm',
      'Confirm Delete',
      'Are you sure you want to delete this comment? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      const response = await authenticatedFetch(`/api/forum/comments/${commentId}`, {
        method: 'DELETE'
      }, auth);

      if (response.ok) {
        onCommentDeleted(commentId);
      } else {
        throw new Error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      showAlert('Error', 'Failed to delete comment. Please try again.');
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editingText.trim()) {
      showAlert('Validation Error', 'Please enter a comment');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await authenticatedFetch(`/api/forum/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comment: editingText.trim()
        })
      }, auth);

      if (response.ok) {
        const updatedComment = await response.json();
        // Call parent component to update the comment
        if (onCommentUpdated) {
          onCommentUpdated(commentId, updatedComment.Comment);
        }
        setEditingCommentId(null);
        setEditingText('');
        showAlert('Success', 'Comment updated successfully');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update comment');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      showAlert('Error', error.message || 'Failed to update comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditingComment = (comment) => {
    setEditingCommentId(comment.Id);
    setEditingText(comment.Comment);
  };

  const cancelEditingComment = () => {
    setEditingCommentId(null);
    setEditingText('');
  };

  const canDeleteComment = (comment) => {
    return currentUser && (currentUser.UserID === comment.UserId || currentUser.role === 'admin');
  };

  const canEditComment = (comment) => {
    return currentUser && currentUser.UserID === comment.UserId;
  };

  const hasUserCommented = isAuthenticated && currentUser && comments.some(
    (comment) => comment.UserId === currentUser.UserID
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h4 className="text-lg font-semibold text-gray-900">
          Comments ({pagination?.total || comments.length})
        </h4>
      </div>

      {/* Add Comment Form */}
      {isAuthenticated ? (
        hasUserCommented ? (
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 text-center">
            <p className="text-gray-600">You have already commented on this post.</p>
          </div>
        ) : (
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div>
                <label htmlFor="comment" className="sr-only">
                  Add a comment
                </label>
                <textarea
                  id="comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {isSubmitting ? 'Adding...' : 'Add Comment'}
                </button>
              </div>
            </form>
          </div>
        )
      ) : (
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 text-center">
          <p className="text-gray-600">
            <a href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Sign in
            </a> to join the conversation
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="divide-y divide-gray-100">
        {loading && comments.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h5 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h5>
            <p className="text-gray-600">Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className={`${comments.length > 5 ? 'max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100' : ''}`}>
            {/* Show indicator if there are more than 5 comments */}
            {comments.length > 5 && (
              <div className="px-6 py-3 bg-gradient-to-r from-emerald-50 to-blue-50 text-center border-b border-gray-100">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span className="text-sm text-gray-700 font-medium">
                    {comments.length} comments - scroll to view all
                  </span>
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            )}
            
            {/* All comments */}
            <div className="divide-y divide-gray-100">
              {comments.map((comment) => (
                <div key={comment.Id} className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-700 font-medium text-sm">
                        {comment.UserName?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{comment.UserName || 'Unknown User'}</span>
                        <span className="text-sm text-gray-500">{formatDate(comment.CreatedAt)}</span>
                      </div>
                      
                      {editingCommentId === comment.Id ? (
                        <div className="space-y-3">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                            rows={3}
                            disabled={isSubmitting}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditComment(comment.Id)}
                              disabled={isSubmitting || !editingText.trim()}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                              {isSubmitting && (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              )}
                              {isSubmitting ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={cancelEditingComment}
                              disabled={isSubmitting}
                              className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-700 whitespace-pre-wrap">{comment.Comment}</p>
                      )}
                    </div>
                    
                    {editingCommentId !== comment.Id && (
                      <div className="flex gap-1">
                        {canEditComment(comment) && (
                          <button
                            onClick={() => startEditingComment(comment)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit comment"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        {canDeleteComment(comment) && (
                          <button
                            onClick={() => handleDeleteComment(comment.Id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete comment"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Load More Button */}
      {pagination && pagination.has_next && (
        <div className="px-6 py-4 border-t border-gray-100 text-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-6 py-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
            )}
            {loading ? 'Loading...' : 'Load More Comments'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ForumComments;