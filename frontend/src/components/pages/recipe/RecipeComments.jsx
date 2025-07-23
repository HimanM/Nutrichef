import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import { authenticatedFetch } from '../../../utils/apiUtil.js';
import { useModal } from '../../../context/ModalContext.jsx';
import { HiTrash, HiPencil, HiChat, HiClock } from 'react-icons/hi';
import { InlineSpinner } from '../../common/LoadingComponents.jsx';

const RecipeComments = ({ recipeId, className = '' }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editComment, setEditComment] = useState('');
    const auth = useAuth();
    const { isAuthenticated, currentUser } = auth;
    const { showModal } = useModal();
    const commentsContainerRef = useRef(null);

    // Check if current user has already commented (only after comments are loaded)
    const userHasCommented = !loading && isAuthenticated && comments.some(comment => comment.IsOwn === true);

    useEffect(() => {
        if (recipeId) {
            fetchComments();
        }
    }, [recipeId, isAuthenticated]); // Re-fetch when authentication status changes

    const fetchComments = async () => {
        try {
            setLoading(true);
            setError(null);
            
            let response;
            if (isAuthenticated) {
                // Use authenticated fetch when logged in to get IsOwn property correctly
                response = await authenticatedFetch(`/api/recipes/${recipeId}/comments`, {
                    method: 'GET'
                }, auth);
            } else {
                // Regular fetch for non-authenticated users
                response = await fetch(`/api/recipes/${recipeId}/comments`);
            }
            
            if (!response.ok) {
                throw new Error('Failed to fetch comments');
            }
            
            const data = await response.json();
            setComments(data.comments || []);
        } catch (err) {
            setError('Failed to load comments');
            console.error('Error fetching comments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!isAuthenticated || !newComment.trim() || isSubmitting) return;

        try {
            setIsSubmitting(true);
            setError(null);

            const response = await authenticatedFetch(`/api/recipes/${recipeId}/comments`, {
                method: 'POST',
                body: JSON.stringify({ comment: newComment.trim() })
            }, auth);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit comment');
            }

            const data = await response.json();
            setComments(prev => [data.comment, ...prev]);
            setNewComment('');
            
            // Scroll to top of comments to show the new comment
            if (commentsContainerRef.current) {
                commentsContainerRef.current.scrollTop = 0;
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditComment = async (commentId) => {
        if (!editComment.trim()) return;

        try {
            setError(null);
            const response = await authenticatedFetch(`/api/comments/${commentId}`, {
                method: 'PUT',
                body: JSON.stringify({ comment: editComment.trim() })
            }, auth);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update comment');
            }

            const data = await response.json();
            setComments(prev => prev.map(comment => 
                comment.CommentID === commentId ? data.comment : comment
            ));
            setEditingCommentId(null);
            setEditComment('');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteComment = async (commentId) => {
        const confirmed = await showModal('confirm', 'Delete Comment', 'Are you sure you want to delete this comment? This action cannot be undone.');
        if (!confirmed) return;

        try {
            setError(null);
            const response = await authenticatedFetch(`/api/comments/${commentId}`, {
                method: 'DELETE'
            }, auth);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete comment');
            }

            setComments(prev => prev.filter(comment => comment.CommentID !== commentId));
            showModal('alert', 'Success', 'Comment deleted successfully.', { iconType: 'success' });
        } catch (err) {
            setError(err.message);
            showModal('alert', 'Error', `Failed to delete comment: ${err.message}`, { iconType: 'error' });
        }
    };

    const startEdit = (comment) => {
        setEditingCommentId(comment.CommentID);
        setEditComment(comment.Comment);
    };

    const cancelEdit = () => {
        setEditingCommentId(null);
        setEditComment('');
    };

    const formatTimeAgo = (dateString) => {
        try {
            // Parse the date string - handle both ISO format and MySQL datetime format
            // Backend sends UTC time in ISO format, so we need to parse it correctly
            let date;
            if (dateString.includes('T')) {
                // ISO format: 2024-01-15T10:30:00.000Z
                date = new Date(dateString);
            } else {
                // MySQL datetime format: 2024-01-15 10:30:00
                date = new Date(dateString + 'Z'); // Append Z to indicate UTC
            }
            
            // Check if date is valid
            if (isNaN(date.getTime())) {
                console.error('Invalid date:', dateString);
                return 'Invalid date';
            }
            
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            
            // Handle future dates (shouldn't happen, but just in case)
            if (diffMs < 0) {
                return 'Just now';
            }
            
            const diffSeconds = Math.floor(diffMs / 1000);
            const diffMinutes = Math.floor(diffSeconds / 60);
            const diffHours = Math.floor(diffMinutes / 60);
            const diffDays = Math.floor(diffHours / 24);
            const diffMonths = Math.floor(diffDays / 30);
            const diffYears = Math.floor(diffDays / 365);

            if (diffSeconds < 60) return 'Just now';
            if (diffMinutes < 60) return `${diffMinutes}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays < 30) return `${diffDays}d ago`;
            if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
            return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
        } catch (error) {
            console.error('Error formatting date:', error, dateString);
            return 'Unknown time';
        }
    };

    if (loading) {
        return (
            <div className={`bg-white/80 rounded-xl p-6 border border-emerald-100 shadow-sm ${className}`}>
                <div className="flex items-center justify-center py-8">
                    <InlineSpinner />
                    <span className="ml-2 text-gray-600">Loading comments...</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white/80 rounded-xl p-6 border border-emerald-100 shadow-sm ${className}`}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <HiChat className="text-emerald-600 text-xl" />
                <h3 className="text-lg font-semibold text-emerald-700">
                    Comments ({comments.length})
                </h3>
            </div>

            {/* Comment Form */}
            {!loading && isAuthenticated && !userHasCommented && (
                <form onSubmit={handleSubmitComment} className="mb-6">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your thoughts about this recipe..."
                        className="w-full p-3 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none"
                        rows="3"
                        maxLength="1000"
                        disabled={isSubmitting}
                    />
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                            {newComment.length}/1000 characters
                        </span>
                        <button
                            type="submit"
                            disabled={!newComment.trim() || isSubmitting}
                            className="btn-primary py-2 px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? <InlineSpinner /> : 'Post Comment'}
                        </button>
                    </div>
                </form>
            )}
            
            {!loading && isAuthenticated && userHasCommented && (
                <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                    <p className="text-emerald-700 text-sm">
                        ✓ You've already commented on this recipe. You can edit your comment below.
                    </p>
                </div>
            )}
            
            {!loading && !isAuthenticated && (
                <div className="mb-6 p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-gray-600 text-sm">
                        <a href="/login" className="text-emerald-600 hover:underline">
                            Log in
                        </a> to share your thoughts about this recipe
                    </p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Comments List */}
            <div 
                ref={commentsContainerRef}
                className={`space-y-4 ${comments.length > 3 ? 'max-h-80 overflow-y-auto' : ''} pr-2`}
                style={comments.length > 3 ? { scrollBehavior: 'smooth' } : {}}
            >
                {comments.length === 0 ? (
                    <div className="text-center py-8">
                        <HiChat className="text-gray-300 text-4xl mx-auto mb-3" />
                        <p className="text-gray-500">No comments yet</p>
                        <p className="text-gray-400 text-sm">Be the first to share your thoughts!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.CommentID} className="border-b border-gray-100 pb-4 last:border-b-0">
                            <div className="flex items-start gap-3">
                                {/* User Avatar */}
                                <div className="flex-shrink-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                                    {comment.UserInitial}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    {/* Username and timestamp */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-medium text-gray-900">
                                            {comment.Username}
                                        </span>
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <HiClock className="w-3 h-3" />
                                            <span>{formatTimeAgo(comment.CreatedAt)}</span>
                                            {comment.IsEdited && (
                                                <span className="italic">(edited)</span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Comment text or edit form */}
                                    {editingCommentId === comment.CommentID ? (
                                        <div className="space-y-2">
                                            <textarea
                                                value={editComment}
                                                onChange={(e) => setEditComment(e.target.value)}
                                                className="w-full p-2 border border-emerald-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none text-sm"
                                                rows="2"
                                                maxLength="1000"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditComment(comment.CommentID)}
                                                    disabled={!editComment.trim()}
                                                    className="btn-primary py-1 px-3 text-xs disabled:opacity-50"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="btn-secondary py-1 px-3 text-xs"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-gray-700 whitespace-pre-wrap break-words">
                                                {comment.Comment}
                                            </p>
                                            
                                            {/* Action buttons for own comments */}
                                            {comment.IsOwn && (
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={() => startEdit(comment)}
                                                        className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 transition-colors"
                                                    >
                                                        <HiPencil className="w-3 h-3" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.CommentID)}
                                                        className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 transition-colors"
                                                    >
                                                        <HiTrash className="w-3 h-3" />
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RecipeComments;
