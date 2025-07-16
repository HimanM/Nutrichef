import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useModal } from '../../context/ModalContext.jsx';
import RecipeDetailPopup from '../../components/admin/RecipeDetailPopup.jsx';
import { authenticatedFetch } from '../../utils/apiUtil.js';
import { PageLoaderSpinner, TableSpinner } from '../../components/common/LoadingComponents.jsx';

// Spinner components
const DeleteIcon = () => <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>;
const ViewIcon = () => <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path></svg>;

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
  const [sortColumn, setSortColumn] = useState('RecipeID'); // Default sort column
  const [sortDirection, setSortDirection] = useState('asc'); // Default sort direction
  const [publicFilter, setPublicFilter] = useState('all'); // 'all', 'public', 'private'

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
    setPage(0); // Reset to first page on sort change
  };

  const handlePublicFilterClick = () => {
    if (publicFilter === 'all') {
      setPublicFilter('public');
    } else if (publicFilter === 'public') {
      setPublicFilter('private');
    } else {
      setPublicFilter('all');
    }
    setPage(0); // Reset to first page on filter change
  };

  const handleChangePage = (newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewRecipe = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleRecipeTitleClick = (recipe) => {
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
      await fetchRecipes(page, rowsPerPage, sortColumn, sortDirection); // Refresh
      showModal('alert', 'Success', (await response.json()).message || 'Recipe deleted.', {iconType: 'success'});
    } catch (err) {
      console.error("Error deleting recipe:", err);
      setActionError(err.message);
      showModal('alert', 'Error Deleting Recipe', err.message, {iconType: 'error'});
    } finally {
      setModalLoading(false);
    }
  };

  const commonButtonClassNameBase = "px-3 py-1.5 text-xs font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50";

  // Filter recipes based on publicFilter
  const filteredRecipes = recipes.filter(recipe => {
    if (publicFilter === 'all') return true;
    if (publicFilter === 'public') return recipe.is_public === true;
    if (publicFilter === 'private') return recipe.is_public === false;
    return true;
  });

  // Update total count for filtered results
  const filteredTotalCount = publicFilter === 'all' ? totalCount : filteredRecipes.length;

  if (loading && recipes.length === 0) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><PageLoaderSpinner /></div>;
  }

  if (error && recipes.length === 0) {
    return (
      <div className="section-padding">
        <div className="container-modern">
          <div className="text-center mb-10 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Recipe Management</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">View and manage user-submitted recipes.</p>
          </div>
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="container-modern">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Recipe Management</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">View and manage user-submitted recipes.</p>
        </div>
        {actionError && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">Action Error: {actionError}</div>}
        {error && recipes.length > 0 && <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-md text-sm">Could not refresh recipes: {error}</div>}
        {filteredRecipes.length === 0 && !loading && !error ? (
          <p className="text-center text-gray-400 mt-6 text-lg">No recipes found.</p>
        ) : (
          <div className="card-glass shadow-xl rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-emerald-50">
                  <tr>
                    <th 
                      scope="col" 
                      onClick={() => handleSort('RecipeID')} 
                      className="px-4 py-3 text-left text-xs font-medium text-emerald-700 hover:text-emerald-900 uppercase tracking-wider cursor-pointer"
                    >
                      Recipe ID {sortColumn === 'RecipeID' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      scope="col" 
                      onClick={() => handleSort('Title')} 
                      className="px-4 py-3 text-left text-xs font-medium text-emerald-700 hover:text-emerald-900 uppercase tracking-wider cursor-pointer"
                    >
                      Title {sortColumn === 'Title' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      scope="col" 
                      onClick={() => handleSort('AuthorName')} 
                      className="px-4 py-3 text-left text-xs font-medium text-emerald-700 hover:text-emerald-900 uppercase tracking-wider cursor-pointer"
                    >
                      Author {sortColumn === 'AuthorName' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      scope="col" 
                      onClick={handlePublicFilterClick}
                      className="px-4 py-3 text-left text-xs font-medium text-emerald-700 hover:text-emerald-900 uppercase tracking-wider cursor-pointer"
                    >
                      Visibility {publicFilter !== 'all' && `(${publicFilter})`}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loading && (
                    <tr><td colSpan={5} className="text-center py-4"><TableSpinner /></td></tr>
                  )}
                  {!loading && filteredRecipes.map((recipe) => (
                    <tr key={recipe.RecipeID} className="hover:bg-emerald-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{recipe.RecipeID}</td>
                      <td 
                        className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800 cursor-pointer hover:text-emerald-600 transition-colors duration-150"
                        onClick={() => handleRecipeTitleClick(recipe)}
                        title="Click to view recipe details"
                      >
                        {recipe.Title}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{recipe.AuthorName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          recipe.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {recipe.is_public ? 'Public' : 'Private'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteRecipe(recipe.RecipeID)}
                          className={`${commonButtonClassNameBase} bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-500 flex items-center`}
                        >
                          <DeleteIcon/> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredTotalCount > 0 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 bg-white rounded-b-3xl">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button onClick={() => handleChangePage(page - 1)} disabled={page === 0} className={`btn-primary ${commonButtonClassNameBase}`}>Previous</button>
                  <button onClick={() => handleChangePage(page + 1)} disabled={(page + 1) * rowsPerPage >= filteredTotalCount} className={`btn-primary ${commonButtonClassNameBase}`}>Next</button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-gray-500">
                      Showing <span className="font-medium">{page * rowsPerPage + 1}</span> to <span className="font-medium">{Math.min((page + 1) * rowsPerPage, filteredTotalCount)}</span> of <span className="font-medium">{filteredTotalCount}</span> results
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label htmlFor="adminRecipeRowsPerPageSelect" className="text-xs text-gray-500">Rows:</label>
                    <select id="adminRecipeRowsPerPageSelect" value={rowsPerPage} onChange={handleChangeRowsPerPage} className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 text-xs">
                      <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
                    </select>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button onClick={() => handleChangePage(page - 1)} disabled={page === 0} className={`${commonButtonClassNameBase} bg-gray-100 text-gray-500 hover:bg-gray-200 border-gray-200 rounded-l-md border`}>Prev</button>
                      <button onClick={() => handleChangePage(page + 1)} disabled={(page + 1) * rowsPerPage >= filteredTotalCount} className={`${commonButtonClassNameBase} bg-gray-100 text-gray-500 hover:bg-gray-200 border-gray-200 rounded-r-md border`}>Next</button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
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
