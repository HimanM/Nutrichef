import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination'; // Import TablePagination
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box'; // For layout in actions cell
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { authenticatedFetch } from '../../utils/apiUtil';

function RecipeManagementPage() {
  const authContextValue = useAuth();
  const { showModal, setLoading: setModalLoading } = useModal();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // For fetch error
  const [actionError, setActionError] = useState(null); // For delete action error
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchRecipes = async (currentPage = 0, currentRowsPerPage = 10) => {
    setLoading(true);
    setError(null);
    // setActionError(null); // Keep action error visible until next action or successful fetch

    const backendPage = currentPage + 1; // API is 1-indexed for pages
    try {
      const response = await authenticatedFetch(`/api/admin/recipes?page=${backendPage}&per_page=${currentRowsPerPage}`, {
        method: 'GET',
        // Headers handled by authenticatedFetch
      }, authContextValue);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Failed to fetch recipes: ${response.status}` }));
        throw new Error(errorData.error || `Failed to fetch recipes: ${response.status}`);
      }
      const data = await response.json();
      setRecipes(data.recipes || []);
      setTotalCount(data.total || 0);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching recipes:", err);
      // Don't clear recipes on error, so table can still show old data if desired
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes(page, rowsPerPage);
  }, [page, rowsPerPage]); // Re-fetch when page or rowsPerPage changes

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when rows per page changes
  };

  const handleDeleteRecipe = async (recipeId) => {
    const userConfirmed = await showModal('confirm', 'Confirm Deletion', `Are you sure you want to delete recipe ${recipeId}?`);
    if (!userConfirmed) {
      return;
    }

    setActionError(null);
    setModalLoading(true); // Show loading indicator on modal
    try {
      const response = await authenticatedFetch(`/api/admin/recipes/${recipeId}`, {
        method: 'DELETE',
        // Headers handled by authenticatedFetch
      }, authContextValue);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to delete recipe: ${response.status}` }));
        throw new Error(errorData.message || `Failed to delete recipe: ${response.status}`);
      }
      // Success: re-fetch recipes. Modal will be closed by showModal's internal logic on confirm.
      fetchRecipes(page, rowsPerPage);
    } catch (err) {
      console.error("Error deleting recipe:", err);
      setActionError(err.message);
      // Optionally, show an error alert modal here if desired, or rely on existing Alert component
      // For now, the existing Alert component `actionError` will display the error.
    } finally {
      setModalLoading(false); // Hide loading indicator on modal
      // The modal closes itself on confirm/cancel, so no explicit hideModal call needed here unless an error occurs
      // and we want to keep the modal open, which is not the current design of ModalContext.
    }
  };

  // Show full page loader only on initial load when recipes array is empty
  if (loading && recipes.length === 0) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && recipes.length === 0) { // Show error only if no data can be displayed
    return (
      <Container sx={{ mt: 2 }}>
        <Alert severity="error">Error fetching recipes: {error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Recipe Management
      </Typography>
      {actionError && <Alert severity="error" sx={{ mb: 2 }}>Action Error: {actionError}</Alert>}
      {/* Display error message if fetch failed but we still have some data */}
      {error && recipes.length > 0 && <Alert severity="warning" sx={{ mb: 2 }}>Could not refresh recipes: {error}</Alert>}

      {recipes.length === 0 && !loading && !error ? ( // Adjusted condition for "No recipes found"
        <Typography variant="subtitle1" sx={{ mt: 2 }}>No recipes found.</Typography>
      ) : (
        <Paper> {/* TableContainer is usually wrapped by Paper for elevation/background */}
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="recipes table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Author ID</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && ( /* In-table loader */
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                )}
                {!loading && recipes.map((recipe) => (
                  <TableRow
                    key={recipe.RecipeID}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">{recipe.RecipeID}</TableCell>
                    <TableCell>{recipe.Title}</TableCell>
                    <TableCell>{recipe.UserID}</TableCell>
                    <TableCell sx={{
                        maxWidth: 300,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                      {recipe.Description}
                    </TableCell>
                    <TableCell>{recipe.CreatedAt ? new Date(recipe.CreatedAt).toLocaleDateString() : (recipe.CreationTimestamp ? new Date(recipe.CreationTimestamp).toLocaleDateString() : 'N/A')}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteRecipe(recipe.RecipeID)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 20, 50]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
    </Container>
  );
}

export default RecipeManagementPage;
