import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { authenticatedFetch } from '../../utils/apiUtil';

const ForumPostDetail = ({ post, onLikeToggle, onPostDeleted, currentUser }) => {
    const auth = useAuth();
    const { showAlert, showModal } = useModal();
    const [isLiking, setIsLiking] = useState(false);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleLikeClick = async () => {
        if (isLiking) return;
        setIsLiking(true);
        await onLikeToggle();
        setIsLiking(false);
    };

    const handleDeletePost = async () => {
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
                onPostDeleted();
            } else {
                throw new Error('Failed to delete post');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            showAlert('Error', 'Failed to delete post. Please try again.');
        }
    };

    const canDeletePost = currentUser && (currentUser.UserID === post.UserId || currentUser.role === 'admin');

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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                            <span className="text-emerald-700 font-medium text-lg">
                                {post.UserName?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900">{post.UserName || 'Unknown User'}</h4>
                            <p className="text-xs text-gray-500">{formatDate(post.CreatedAt)}</p>
                        </div>
                    </div>

                    {canDeletePost && (
                        <button
                            onClick={handleDeletePost}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete post"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>

                <h3 className="text-3xl font-bold text-gray-900 mb-4">{post.Title}</h3>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {post.ViewsCount} views
                    </span>
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {post.CommentsCount} comments
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div
                    className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: renderContentWithTags(post.Content) }}
                />

                {/* Tagged Recipes */}
                {post.TaggedRecipes && post.TaggedRecipes.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Tagged Recipes</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {post.TaggedRecipes.map((recipe) => (
                                <Link
                                    key={recipe.Id}
                                    to={`/recipe/${recipe.RecipeId}`}
                                    className="flex items-center gap-3 p-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
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
                                        <p className="text-sm text-gray-600">View Recipe →</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <button
                        onClick={handleLikeClick}
                        disabled={isLiking}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors self-start ${post.IsLikedByCurrentUser
                                ? 'bg-red-100 text-red-700 hover:bg-red-200 active:bg-red-200'
                                : 'bg-white text-gray-700 hover:bg-gray-100 active:bg-gray-100 border border-gray-300'
                            } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <svg
                            className={`w-5 h-5 ${post.IsLikedByCurrentUser ? 'fill-current' : ''}`}
                            fill={post.IsLikedByCurrentUser ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="text-sm">
                            {post.IsLikedByCurrentUser ? 'Liked' : 'Like'} ({post.LikesCount})
                        </span>
                    </button>

                    <div className="text-sm text-gray-500 text-left sm:text-right">
                        {post.UpdatedAt !== post.CreatedAt && (
                            <span>Last updated: {formatDate(post.UpdatedAt)}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForumPostDetail;