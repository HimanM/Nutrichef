import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import ForumPostList from '../../components/forum/ForumPostList';
import CreatePostModal from '../../components/forum/CreatePostModal';
import { useResponsiveModal } from '../../hooks/useResponsiveModal';
import { authenticatedFetch } from '../../utils/apiUtil';

const ForumPage = () => {
    const auth = useAuth();
    const { isAuthenticated } = auth;
    const { showAlert } = useModal();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);

    const createPostModal = useResponsiveModal();

    useEffect(() => {
        fetchPosts();
    }, [currentPage, sortBy, sortOrder]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            let response;

            // Use authenticatedFetch if user is authenticated to get like status
            if (isAuthenticated) {
                response = await authenticatedFetch(`/api/forum/posts?page=${currentPage}&per_page=10&sort_by=${sortBy}&sort_order=${sortOrder}`, {
                    method: 'GET'
                }, auth);
            } else {
                // Use regular fetch for non-authenticated users
                response = await fetch(`/api/forum/posts?page=${currentPage}&per_page=10&sort_by=${sortBy}&sort_order=${sortOrder}`, {
                    method: 'GET'
                });
            }

            if (response.ok) {
                const data = await response.json();
                setPosts(data.posts);
                setPagination(data.pagination);
            } else {
                throw new Error('Failed to fetch posts');
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
            showAlert('Error', 'Failed to load forum posts. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePostCreated = (newPost) => {
        setPosts(prevPosts => [newPost, ...prevPosts]);
        createPostModal.closeModal();
        showAlert('Success', 'Your post has been created successfully!', { iconType: 'success' });
    };

    const handlePostDeleted = (postId) => {
        setPosts(prevPosts => prevPosts.filter(post => post.Id !== postId));
        showAlert('Success', 'Post deleted successfully!', { iconType: 'success' });
    };

    const handleSortChange = (newSortBy) => {
        if (newSortBy === sortBy) {
            setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
        } else {
            setSortBy(newSortBy);
            setSortOrder('desc');
        }
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
            <div className="section-padding">
                <div className="container-modern">
                    {/* Header */}
                    <div className="text-center mb-6 animate-fade-in">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">
                            <span className="gradient-text">Recipe Forum</span>
                        </h1>
                        <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                            Share your culinary experiences, discover new recipes, and connect with fellow food enthusiasts
                        </p>
                    </div>

                    {/* Action Bar */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            {/* Create Post Button */}
                            <div>
                                {isAuthenticated ? (
                                    <button
                                        onClick={createPostModal.openModal}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                        Create Post
                                    </button>
                                ) : (
                                    <div className="text-gray-500 text-sm">
                                        <a href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                                            Sign in
                                        </a> to create posts and interact with the community
                                    </div>
                                )}
                            </div>

                            {/* Sort Options */}
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600">Sort by:</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleSortChange('created_at')}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${sortBy === 'created_at'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        Recent {sortBy === 'created_at' && (sortOrder === 'desc' ? '↓' : '↑')}
                                    </button>
                                    <button
                                        onClick={() => handleSortChange('likes')}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${sortBy === 'likes'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        Popular {sortBy === 'likes' && (sortOrder === 'desc' ? '↓' : '↑')}
                                    </button>
                                    <button
                                        onClick={() => handleSortChange('views')}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${sortBy === 'views'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        Views {sortBy === 'views' && (sortOrder === 'desc' ? '↓' : '↑')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Posts List */}
                    <ForumPostList
                        posts={posts}
                        loading={loading}
                        pagination={pagination}
                        onPageChange={handlePageChange}
                        onPostDeleted={handlePostDeleted}
                        onRefresh={fetchPosts}
                    />

                    {/* Create Post Modal */}
                    <CreatePostModal
                        isOpen={createPostModal.isOpen}
                        onClose={createPostModal.closeModal}
                        onPostCreated={handlePostCreated}
                    />
                </div>
            </div>
        </div>
    );
};

export default ForumPage;