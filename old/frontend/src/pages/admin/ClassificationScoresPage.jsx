import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TablePagination from '@mui/material/TablePagination'; // For pagination
import Box from '@mui/material/Box'; // Added Box
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'; // Added Recharts
import { useAuth } from '../../context/AuthContext';
import { authenticatedFetch } from '../../utils/apiUtil';

function ClassificationScoresPage() {
  const authContextValue = useAuth();
  const [scoresSummary, setScoresSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [page, setPage] = useState(0); // MUI TablePagination is 0-indexed
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default rows per page
  const [totalCount, setTotalCount] = useState(0);

  const fetchScores = async (currentPage, currentRowsPerPage) => {
    setLoading(true);
    setError(null);
    try {
      // Adjust API call to include pagination params (page is 1-indexed for backend)
      const backendPage = currentPage + 1;
      const response = await authenticatedFetch(`/api/admin/classification_scores_summary?page=${backendPage}&per_page=${currentRowsPerPage}`, {
        method: 'GET',
        // Headers handled by authenticatedFetch
      }, authContextValue);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch scores: ${response.status}`);
      }
      const data = await response.json();
      setScoresSummary(data.scores_summary || []);
      setTotalCount(data.total || 0);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching scores:", err);
      setScoresSummary([]); // Clear data on error
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores(page, rowsPerPage);
  }, [page, rowsPerPage]); // Re-fetch when page or rowsPerPage changes

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when rows per page changes
  };

  if (loading && scoresSummary.length === 0) { // Show loading only if no data yet
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 2 }}>
        <Alert severity="error">Error fetching classification scores: {error}</Alert>
      </Container>
    );
  }

  // Prepare data for the chart
  const chartData = scoresSummary.slice(0, 20).map(item => ({
    name: item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'N/A',
    score: item.score !== null ? parseFloat(item.score.toFixed(4)) : 0,
    // formattedName: item.timestamp ? new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A' // Alternative for XAxis
  })).reverse(); // Reverse to show oldest of the 20 on left, newest on right

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Classification Scores Summary
      </Typography>

      {/* Chart Section */}
      {scoresSummary.length > 0 && !loading && ( // Only show chart if there's data and not loading initial data
        <Paper sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Scores Distribution (Latest {chartData.length} on current page)
          </Typography>
          <Box sx={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                {/* For XAxis with formattedName: <XAxis dataKey="formattedName" /> */}
                <YAxis domain={[0, 1]} /> {/* Assuming scores are between 0 and 1 */}
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#8884d8" /> {/* Placeholder color, can use theme.palette.primary.main */}
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      )}

      {/* Table Section */}
      {scoresSummary.length === 0 && !loading ? (
        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          No classification scores found or all scores are null.
        </Typography>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 600 }}> {/* Optional: for scrollable table */}
            <Table stickyHeader aria-label="classification scores table">
              <TableHead>
                <TableRow>
                  <TableCell>Result ID</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Predicted Food Name</TableCell>
                  <TableCell>Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && ( // Show loader within table body during re-fetch
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                )}
                {!loading && scoresSummary.map((item) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={item.result_id}>
                    <TableCell>{item.result_id}</TableCell>
                    <TableCell>{item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}</TableCell>
                    <TableCell>{item.predicted_food_name}</TableCell>
                    <TableCell>{item.score !== null ? item.score.toFixed(4) : 'N/A'}</TableCell>
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

export default ClassificationScoresPage;
