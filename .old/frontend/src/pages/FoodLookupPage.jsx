import React, { useState } from 'react';
import { 
  Container, Typography, Box, TextField, Button, CircularProgress, Alert,
  List, ListItemButton, ListItemText, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Chip // Added Chip
} from '@mui/material';
import { authenticatedFetch } from '../utils/apiUtil';
import { useAuth } from '../context/AuthContext.jsx';

// Helper function for Title Case
function toTitleCase(str) {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

function FoodLookupPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [foodData, setFoodData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("Please enter a food name to search.");
      setFoodData(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setFoodData(null);

    const url = `/api/food-lookup?name=${encodeURIComponent(searchTerm)}`;

    try {
      const response = await authenticatedFetch(url, {}, auth); 
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errData = await response.json();
          errorMsg = errData.error || errData.message || errorMsg;
        } catch (parseError) {
          console.error("Failed to parse error JSON:", parseError);
        }
        throw new Error(errorMsg);
      }
      const data = await response.json();

      if (data.matches && Array.isArray(data.matches)) {
        const sortedMatches = [...data.matches].sort((a, b) => a.localeCompare(b));
        setFoodData({ ...data, matches: sortedMatches });
      } else {
        setFoodData(data);
      }
      setError(null);
    } catch (err) {
      setError(err.message ? err.message.toString() : 'Failed to fetch data.');
      setFoodData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectedFoodMatch = async (selectedFoodName) => {
    setIsLoading(true);
    setError(null);

    const url = `/api/food-lookup?name=${encodeURIComponent(selectedFoodName)}&is_exact=true`;

    try {
      const response = await authenticatedFetch(url, {}, auth); 
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errData = await response.json();
          errorMsg = errData.error || errData.message || errorMsg;
        } catch (parseError) {
          console.error("Failed to parse error JSON:", parseError);
        }
        throw new Error(errorMsg);
      }
      const data = await response.json();
      setFoodData(data); 
      setError(null);
    } catch (err) {
      setError(err.message ? err.message.toString() : 'Failed to fetch data for selected food.');
      setFoodData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setFoodData(null);
    setError(null);
    setIsLoading(false); 
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Food Nutrition Lookup
        </Typography>

        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}> {/* New Paper for search */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TextField
              fullWidth
            label="Enter food name"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mr: 1 }}
            disabled={isLoading}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            disabled={isLoading}
            sx={{ minWidth: 100 }}
          >
            {isLoading && !foodData ? <CircularProgress size={24} color="inherit" /> : "Search"}
          </Button>
          </Box>

          <Button
            variant="outlined"
            onClick={handleClearSearch}
            sx={{ mb: 0 }} 
            disabled={isLoading}
          >
            New Search
          </Button>
        </Paper> {/* End new Paper for search */}

        {isLoading && !error && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}

        {foodData && !error && !isLoading && (
          <Box sx={{ mt: 3 }}>
            {foodData.food && foodData.data && (
              <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}> {/* Updated sx */}
                <Typography variant="h5" gutterBottom>{toTitleCase(foodData.food)} {' '}
                    <Box component="span" fontSize="0.6em" verticalAlign="super" color="text.secondary">
                        (per 100g)
                    </Box>
                </Typography> {/* Modified this line */}
                <TableContainer component={Paper} sx={{ mt: 1, boxShadow: 'none' }}>
                  <Table size="small" aria-label={`Nutritional information for ${toTitleCase(foodData.food)}`}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Nutrient</TableCell>
                        <TableCell align="right">Value</TableCell>
                        <TableCell>Unit</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(foodData.data).map(([key, nutrient]) => (
                        <TableRow 
                          key={key} 
                          sx={{ 
                            '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }, // Alternating row color
                            '&:last-child td, &:last-child th': { border: 0 } 
                          }}
                        >
                          <TableCell component="th" scope="row">{key}</TableCell>
                          <TableCell align="right">{nutrient.value}</TableCell>
                          <TableCell>
                            {nutrient.unit ? <Chip label={nutrient.unit} size="small" variant="outlined" /> : ''} {/* Used Chip for units */}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}

            {foodData.matches && (
              <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}> {/* Updated sx */}
                <Typography variant="h6" gutterBottom>
                  {foodData.message || 'Multiple matches found. Please select one:'}
                </Typography>
                <List dense>
                  {foodData.matches.map((matchName, index) => (
                    <ListItemButton key={index} onClick={() => handleSelectedFoodMatch(matchName)}>
                      {/* Also apply title case to list items for consistency if desired, not requested but good practice */}
                      <ListItemText primary={toTitleCase(matchName)} /> 
                    </ListItemButton>
                  ))}
                </List>
              </Paper>
            )}
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default FoodLookupPage;
