import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import ForumPostDetail from '../../components/forum/ForumPostDetail';
import ForumComments from '../../components/forum/ForumComments';
import { authenticatedFetch } from '../../utils/apiUtil';

const ForumPostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const { isAuthenticated, currentUser } = auth;
  const { showAlert } = useModal();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsPagination, setCommentsPagination] = useState({});

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      // Use regular fetch for public endpoint (no auth required for viewing posts)
      const response = await fetch(`/api/forum/posts/${postId}`, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        setPost(data);
      } else if (response.status === 404) {
        showAlert('Error', 'Post not found');
        navigate('/forum');
      } else {
        throw new Error('Failed to fetch post');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      showAlert('Error', 'Failed to load post. Please try again.');
      navigate('/forum');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (page = 1) => {
    try {
      setCommentsLoading(true);
      // Use regular fetch for public endpoint (no auth required for viewing comments)
      const response = await fetch(`/api/forum/posts/${postId}/comments?page=${page}&per_page=20`, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        if (page === 1) {
          setComments(data.comments);
        } else {
          setComments(prev => [...prev, ...data.comments]);
        }
        setCommentsPagination(data.pagination);
      } else {
        throw new Error('Failed to fetch comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      showAlert('Error', 'Failed to load comments. Please try again.');
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      showAlert('Authentication Required', 'Please sign in to like posts');
      return;
    }

    try {
      const response = await authenticatedFetch(`/api/forum/posts/${postId}/like`, {
        method: 'POST'
      }, auth);

      if (response.ok) {
        const data = await response.json();
        setPost(prev => ({
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
    }
  };

  const handleCommentAdded = (newComment) => {
    setComments(prev => [...prev, newComment]);
    showAlert('Success', 'Comment added successfully!', { iconType: 'success' });
  };

  const handleCommentDeleted = (commentId) => {
    setComments(prev => prev.filter(comment => comment.Id !== commentId));
    showAlert('Success', 'Comment deleted successfully!', { iconType: 'success' });
  };

  const handlePostDeleted = () => {
    showAlert('Success', 'Post deleted successfully!', { iconType: 'success' });
    navigate('/forum');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h2>
          <p className="text-gray-600 mb-6">The post you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/forum')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Forum
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/forum')}
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Forum
        </button>

        <div className="max-w-4xl mx-auto">
          {/* Post Detail */}
          <ForumPostDetail
            post={post}
            onLikeToggle={handleLikeToggle}
            onPostDeleted={handlePostDeleted}
            currentUser={currentUser}
          />

          {/* Comments Section */}
          <ForumComments
            postId={postId}
            comments={comments}
            loading={commentsLoading}
            pagination={commentsPagination}
            onCommentAdded={handleCommentAdded}
            onCommentDeleted={handleCommentDeleted}
            onLoadMore={() => fetchComments(commentsPagination.page + 1)}
            isAuthenticated={isAuthenticated}
            currentUser={currentUser}
          />
        </div>
      </div>
    </div>
  );
};

export default ForumPostDetailPage;