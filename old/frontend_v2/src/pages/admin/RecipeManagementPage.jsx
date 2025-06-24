import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useModal } from '../../context/ModalContext.jsx';
import RecipeDetailPopup from '../../components/admin/RecipeDetailPopup.jsx';
import { authenticatedFetch } from '../../utils/apiUtil.js';

// Spinner components
const PageLoaderSpinner = () => <svg className="animate-spin h-10 w-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>; {/* text-indigo-400 */}
const TableSpinner = () => <svg className="animate-spin h-6 w-6 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>; {/* text-indigo-400 */}
const DeleteIcon = () => <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>;


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
  const [selectedRecipe, setSelectedRecipe] = useState(null); // Renamed from hoveredRecipe
  // popupPosition state is removed
  const [sortColumn, setSortColumn] = useState('RecipeID'); // Default sort column
  const [sortDirection, setSortDirection] = useState('asc'); // Default sort direction

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
  }, [authContextValue]); // fetchRecipes itself doesn't need to depend on sortColumn/Direction from state, they are passed as args

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

  const handleChangePage = (newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
      await fetchRecipes(page, rowsPerPage); // Refresh
      showModal('alert', 'Success', (await response.json()).message || 'Recipe deleted.', {iconType: 'success'});
    } catch (err) {
      console.error("Error deleting recipe:", err);
      setActionError(err.message);
      showModal('alert', 'Error Deleting Recipe', err.message, {iconType: 'error'});
    } finally {
      setModalLoading(false);
    }
  };

  // handleMouseEnter and handleMouseLeave are removed

  const handleRecipeTitleClick = (recipe) => {
    setSelectedRecipe(recipe);
  };
  
  // It's good practice to have a way to close the modal/popup. 
  // This can be a button inside the popup or clicking outside.
  // For now, clicking another recipe title will change it, or we can add a close button to the popup itself.
  // Or, if `selectedRecipe` is clicked again, we can close it.
  // Let's refine handleRecipeTitleClick to toggle:
  const handleRecipeTitleClickRevised = (recipe) => {
    if (selectedRecipe && selectedRecipe.RecipeID === recipe.RecipeID) {
      setSelectedRecipe(null); // Close if clicking the same recipe title again
    } else {
      setSelectedRecipe(recipe);
    }
  };


  const commonButtonClassNameBase = "px-3 py-1.5 text-xs font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50"; // Renamed

  if (loading && recipes.length === 0) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><PageLoaderSpinner /></div>;
  }
  if (error && recipes.length === 0) {
    return (
      <div className="page-container my-8"> {/* page-container */}
        <div className="p-4 bg-red-700/[0.5] border-l-4 border-red-500 text-red-200 rounded-md"> {/* Dark theme error */}
          <p>Error fetching recipes: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container my-8"> {/* Applied page-container */}
      <h1 className="text-2xl sm:text-3xl mb-6"> {/* Uses global h1 style */}
        Recipe Management
      </h1>
      {actionError && <div className="mb-4 p-3 bg-red-700/[0.5] border border-red-500 text-red-200 rounded-md text-sm">Action Error: {actionError}</div>} {/* Dark theme error */}
      {error && recipes.length > 0 && <div className="mb-4 p-3 bg-yellow-700/[0.5] border border-yellow-500 text-yellow-200 rounded-md text-sm">Could not refresh recipes: {error}</div>} {/* Dark theme warning */}

      {recipes.length === 0 && !loading && !error ? (
        <p className="text-center text-gray-400 mt-6 text-lg">No recipes found.</p> /* text-gray-400 */
      ) : (
        <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden"> 
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700"> 
              <thead className="bg-gray-700"> 
                <tr>
                  {/* Sortable Headers */}
                  <th scope="col" onClick={() => handleSort('RecipeID')} className="px-4 py-3 text-left text-xs font-medium text-gray-300 hover:text-gray-100 uppercase tracking-wider cursor-pointer">
                    ID {sortColumn === 'RecipeID' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th scope="col" onClick={() => handleSort('Title')} className="px-4 py-3 text-left text-xs font-medium text-gray-300 hover:text-gray-100 uppercase tracking-wider cursor-pointer">
                    Title {sortColumn === 'Title' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th scope="col" onClick={() => handleSort('UserID')} className="px-4 py-3 text-left text-xs font-medium text-gray-300 hover:text-gray-100 uppercase tracking-wider cursor-pointer">
                    Author ID {sortColumn === 'UserID' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th scope="col" onClick={() => handleSort('is_public')} className="px-4 py-3 text-left text-xs font-medium text-gray-300 hover:text-gray-100 uppercase tracking-wider cursor-pointer">
                    Public {sortColumn === 'is_public' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  {/* Non-sortable Header */}
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description (excerpt)</th>
                  {/* Sortable Header */}
                  <th scope="col" onClick={() => handleSort('CreatedAt')} className="px-4 py-3 text-left text-xs font-medium text-gray-300 hover:text-gray-100 uppercase tracking-wider cursor-pointer">
                    Created At {sortColumn === 'CreatedAt' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  {/* Non-sortable Header */}
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700"> 
                {!loading && recipes.map((recipe) => (
                  <tr key={recipe.RecipeID} className="hover:bg-gray-700"> 
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{recipe.RecipeID}</td> 
                    <td 
                      className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-100 cursor-pointer hover:text-green-400" // Changed cursor, added hover effect
                      onClick={() => handleRecipeTitleClickRevised(recipe)} // Changed to onClick and new handler
                    >
                      {recipe.Title}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{recipe.UserID}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{recipe.is_public ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 text-sm text-gray-300 max-w-xs truncate">{recipe.Description}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{new Date(recipe.CreatedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteRecipe(recipe.RecipeID)}
                        className={`${commonButtonClassNameBase} bg-red-700 text-red-100 hover:bg-red-600 focus:ring-red-500 flex items-center`} // Dark theme danger button
                      >
                        <DeleteIcon/> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalCount > 0 && (
             <div className="px-4 py-3 flex items-center justify-between border-t border-gray-700 sm:px-6 bg-gray-800 rounded-b-lg"> {/* border-gray-700, bg-gray-800 */}
              <div className="flex-1 flex justify-between sm:hidden">
                <button onClick={() => handleChangePage(page - 1)} disabled={page === 0} className={`gradient-button ${commonButtonClassNameBase}`}>Previous</button> {/* Gradient button */}
                <button onClick={() => handleChangePage(page + 1)} disabled={(page + 1) * rowsPerPage >= totalCount} className={`gradient-button ${commonButtonClassNameBase}`}>Next</button> {/* Gradient button */}
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-gray-300"> {/* text-gray-300 */}
                    Showing <span className="font-medium">{page * rowsPerPage + 1}</span> to <span className="font-medium">{Math.min((page + 1) * rowsPerPage, totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <label htmlFor="adminRowsPerPageSelect" className="text-xs text-gray-300">Rows:</label> {/* text-gray-300 */}
                  <select id="adminRowsPerPageSelect" value={rowsPerPage} onChange={handleChangeRowsPerPage} className="px-2 py-1 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"> {/* Dark theme select */}
                    <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
                  </select>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button onClick={() => handleChangePage(page - 1)} disabled={page === 0} className={`${commonButtonClassNameBase} bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600 rounded-l-md border`}>Prev</button> {/* Dark theme secondary button */}
                    <button onClick={() => handleChangePage(page + 1)} disabled={(page + 1) * rowsPerPage >= totalCount} className={`${commonButtonClassNameBase} bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600 rounded-r-md border`}>Next</button> {/* Dark theme secondary button */}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {selectedRecipe && ( // Changed from hoveredRecipe
        <RecipeDetailPopup
          recipe={selectedRecipe} // Changed from hoveredRecipe
          // position prop is removed
          onClose={() => setSelectedRecipe(null)} // Added onClose prop to RecipeDetailPopup for closing
        />
      )}
    </div>
  );
}

export default RecipeManagementPage;
