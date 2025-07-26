import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useModal } from '../../context/ModalContext.jsx';
import RecipeDetailPopup from '../../components/admin/RecipeDetailPopup.jsx';
import { authenticatedFetch } from '../../utils/apiUtil.js';
import { PageLoaderSpinner } from '../../components/common/LoadingComponents.jsx';
import ResponsiveTable from '../../components/admin/ResponsiveTable.jsx';
import { HiTrash, HiEye, HiChat } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { AdminErrorDisplay, AdminFullPageError } from '../../components/common/ErrorDisplay.jsx';

function RecipeManagementPage() {
  const authContextValue = useAuth();
  const { showModal, setLoading: setModalLoading } = useModal();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [page, setPage] = useState(0); // 0-indexed
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [sortColumn, setSortColumn] = useState('RecipeID');
  const [sortDirection, setSortDirection] = useState('asc');
  const [publicFilter, setPublicFilter] = useState('all');

  const fetchRecipes = useCallback(async (currentPage, currentRowsPerPage, currentSortColumn, currentSortDirection) => {
    setLoading(true); setError(null); 
    const backendPage = currentPage + 1;
    try {
      const response = await authenticatedFetch(
        `/api/admin/recipes?page=${backendPage}&per_page=${currentRowsPerPage}&sort_by=${currentSortColumn}&sort_order=${currentSortDirection}`,
        { method: 'GET' },
        authContextValue
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch recipes: ${response.status}`);
      }
      const data = await response.json();
      setRecipes(data.recipes || []);
      setTotalCount(data.total || 0);
    } catch (err) {
      setError(err.message); console.error("Error fetching recipes:", err);
    } finally {
      setLoading(false);
    }
  }, [authContextValue]);

  useEffect(() => {
    fetchRecipes(page, rowsPerPage, sortColumn, sortDirection);
  }, [page, rowsPerPage, sortColumn, sortDirection, fetchRecipes]);

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(prevDirection => prevDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
    setPage(0);
  };

  const handleChangePage = (newPage) => setPage(newPage - 1);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewRecipe = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleDeleteRecipe = async (recipeId) => {
    const recipeToDelete = recipes.find(r => r.RecipeID === recipeId);
    const userConfirmed = await showModal('confirm', 'Confirm Deletion', `Delete "${recipeToDelete?.Title || `Recipe ID ${recipeId}`}"?`);
    if (!userConfirmed) return;

    setActionError(null); setModalLoading(true);
    try {
      const response = await authenticatedFetch(`/api/admin/recipes/${recipeId}`, { method: 'DELETE' }, authContextValue);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete recipe: ${response.status}`);
      }
      await fetchRecipes(page, rowsPerPage, sortColumn, sortDirection);
      showModal('alert', 'Success', (await response.json()).message || 'Recipe deleted.', {iconType: 'success'});
    } catch (err) {
      console.error("Error deleting recipe:", err);
      setActionError(err.message);
      showModal('alert', 'Error Deleting Recipe', err.message, {iconType: 'error'});
    } finally {
      setModalLoading(false);
    }
  };

  // Filter recipes based on publicFilter
  const filteredRecipes = recipes.filter(recipe => {
    if (publicFilter === 'all') return true;
    if (publicFilter === 'public') return recipe.is_public === true;
    if (publicFilter === 'private') return recipe.is_public === false;
    return true;
  });

  const columns = [
    { key: 'RecipeID', label: 'Recipe ID', sortable: true },
    { 
      key: 'Title', 
      label: 'Title', 
      sortable: true,
      render: (recipe) => (
        <span
          className="cursor-pointer hover:text-emerald-600 transition-colors duration-150 font-medium"
          onClick={() => handleViewRecipe(recipe)}
          title="Click to view recipe details"
        >
          {recipe.Title}
        </span>
      )
    },
    { key: 'AuthorName', label: 'Author', sortable: true },
    { 
      key: 'is_public', 
      label: 'Visibility', 
      sortable: true,
      render: (recipe) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          recipe.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {recipe.is_public ? 'Public' : 'Private'}
        </span>
      )
    }
  ];

  const actions = [
    {
      label: 'View',
      icon: HiEye,
      onClick: (recipe) => handleViewRecipe(recipe),
      className: 'bg-blue-50 text-blue-700 hover:bg-blue-100 focus:ring-blue-500'
    },
    {
      label: 'Delete',
      icon: HiTrash,
      onClick: (recipe) => handleDeleteRecipe(recipe.RecipeID),
      className: 'bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-500'
    }
  ];

  const pagination = {
    currentPage: page + 1,
    totalPages: Math.ceil(totalCount / rowsPerPage),
    onPageChange: handleChangePage,
    onRowsPerPageChange: handleChangeRowsPerPage,
    rowsPerPage
  };

  if (loading && recipes.length === 0) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><PageLoaderSpinner /></div>;
  }

  if (error && recipes.length === 0) {
    return (
      <AdminFullPageError 
        error={error}
        title="Recipe Management"
        onRetry={() => fetchRecipes(page, rowsPerPage)}
      />
    );
  }

  return (
    <div className="section-padding">
      <div className="container-modern">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Recipe Management</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-4">View and manage user-submitted recipes.</p>
          
          {/* Quick Action Links */}
          <div className="flex justify-center gap-4 mt-6">
            <Link 
              to="/admin/comments"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors font-medium"
            >
              <HiChat className="w-5 h-5" />
              Manage Comments
            </Link>
          </div>
        </div>
        
        {actionError && (
          <div className="mb-4">
            <AdminErrorDisplay 
              error={`Action Error: ${actionError}`}
              onRetry={() => setActionError(null)}
              retryText="Dismiss"
            />
          </div>
        )}
        
        {error && recipes.length > 0 && (
          <div className="mb-4">
            <AdminErrorDisplay 
              error={`Could not refresh recipes: ${error}`}
              type="warning"
            />
          </div>
        )}
        
        {filteredRecipes.length === 0 && !loading && !error ? (
          <p className="text-center text-gray-400 mt-6 text-lg">No recipes found.</p>
        ) : (
          <ResponsiveTable
            data={filteredRecipes}
            columns={columns}
            loading={loading}
            onSort={handleSort}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            actions={actions}
            pagination={pagination}
            tableTitle="Recipes"
          />
        )}
        
        {selectedRecipe && (
          <RecipeDetailPopup
            recipe={selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
          />
        )}
      </div>
    </div>
  );
}
export default RecipeManagementPage;
