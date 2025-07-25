import React, { useState, useRef, useCallback } from 'react';
import ResponsiveModal from '../ui/ResponsiveModal';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { authenticatedFetch } from '../../utils/apiUtil';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const auth = useAuth();
  const { showAlert } = useModal();
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recipeSearchResults, setRecipeSearchResults] = useState([]);
  const [showRecipeSearch, setShowRecipeSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const contentRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Handle recipe tagging in content
    if (name === 'content') {
      handleContentChange(value);
    }
  };

  const handleContentChange = useCallback(async (content) => {
    // Check if user is typing a recipe tag
    const cursorPosition = contentRef.current?.selectionStart || 0;
    const textBeforeCursor = content.substring(0, cursorPosition);
    const lastHashIndex = textBeforeCursor.lastIndexOf('#');

    if (lastHashIndex !== -1) {
      const textAfterHash = textBeforeCursor.substring(lastHashIndex + 1);

      // Check if we're in the middle of typing a tag (no spaces after #)
      if (!textAfterHash.includes(' ') && textAfterHash.length > 0) {
        setSearchQuery(textAfterHash);
        setShowRecipeSearch(true);
        await searchRecipes(textAfterHash);
      } else if (textAfterHash.length === 0) {
        setShowRecipeSearch(true);
        setRecipeSearchResults([]);
      } else {
        setShowRecipeSearch(false);
      }
    } else {
      setShowRecipeSearch(false);
    }
  }, []);

  const searchRecipes = async (query) => {
    if (query.length < 2) {
      setRecipeSearchResults([]);
      return;
    }

    try {
      // Use regular fetch for public endpoint (no auth required for searching recipes)
      const response = await fetch(`/api/forum/recipes/search?q=${encodeURIComponent(query)}&limit=5`, {
        method: 'GET'
      });

      if (response.ok) {
        const recipes = await response.json();
        setRecipeSearchResults(recipes);
      }
    } catch (error) {
      console.error('Error searching recipes:', error);
    }
  };

  const insertRecipeTag = (recipe) => {
    const content = formData.content;
    const cursorPosition = contentRef.current?.selectionStart || 0;
    const textBeforeCursor = content.substring(0, cursorPosition);
    const textAfterCursor = content.substring(cursorPosition);
    const lastHashIndex = textBeforeCursor.lastIndexOf('#');

    if (lastHashIndex !== -1) {
      const beforeHash = content.substring(0, lastHashIndex);
      const newContent = beforeHash + `#${recipe.Title} ` + textAfterCursor;

      setFormData(prev => ({
        ...prev,
        content: newContent
      }));
    }

    setShowRecipeSearch(false);
    setRecipeSearchResults([]);
    contentRef.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showAlert('Validation Error', 'Please enter a title for your post');
      return;
    }

    if (!formData.content.trim()) {
      showAlert('Validation Error', 'Please enter some content for your post');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await authenticatedFetch('/api/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim()
        })
      }, auth);

      if (response.ok) {
        const newPost = await response.json();
        onPostCreated(newPost);
        handleClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      showAlert('Error', error.message || 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ title: '', content: '' });
    setShowRecipeSearch(false);
    setRecipeSearchResults([]);
    setSearchQuery('');
    onClose();
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Post"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="What's your post about?"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            maxLength={255}
            required
          />
        </div>

        {/* Content Input */}
        <div className="relative">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <textarea
            ref={contentRef}
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Share your thoughts, experiences, or questions... Use #RecipeName to tag recipes!"
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
            required
          />

          {/* Recipe Search Dropdown */}
          {showRecipeSearch && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {recipeSearchResults.length > 0 ? (
                <div className="py-2">
                  <div className="px-3 py-1 text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Recipes
                  </div>
                  {recipeSearchResults.map((recipe) => (
                    <button
                      key={recipe.RecipeID}
                      type="button"
                      onClick={() => insertRecipeTag(recipe)}
                      className="w-full px-3 py-2 text-left hover:bg-emerald-50 flex items-center gap-3"
                    >
                      {recipe.ImageURL && (
                        <img
                          src={recipe.ImageURL}
                          alt={recipe.Title}
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{recipe.Title}</div>
                        {recipe.AuthorName && (
                          <div className="text-sm text-gray-500">by {recipe.AuthorName}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery.length >= 2 ? (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">
                  No recipes found for "{searchQuery}"
                </div>
              ) : (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">
                  Type to search for recipes to tag
                </div>
              )}
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-emerald-700">
              <p className="font-medium mb-1">Pro tip:</p>
              <p>Use <code className="bg-emerald-100 px-1 rounded">#RecipeName</code> to tag recipes in your post. Start typing after # to see suggestions!</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isSubmitting ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

export default CreatePostModal;