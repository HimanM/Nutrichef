import React, { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField'; // Added
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { Link as RouterLink } from 'react-router-dom';
import jsPDF from 'jspdf';
import { useModal } from '../context/ModalContext';

const SHOPPING_BASKET_KEY = 'shoppingBasketItems';

function ShoppingBasketPage() {
  const { showModal } = useModal();
  const [basketItems, setBasketItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      const storedBasket = localStorage.getItem(SHOPPING_BASKET_KEY);
      if (storedBasket) {
        // Ensure quantities are strings for controlled TextField, or handle conversion
        const parsedItems = JSON.parse(storedBasket).map(item => ({
          ...item,
          quantity: item.quantity !== undefined ? String(item.quantity) : '', // Ensure quantity is string
        }));
        setBasketItems(parsedItems);
      } else {
        setBasketItems([]);
      }
    } catch (err) {
      console.error("Error parsing shopping basket from localStorage:", err);
      setError("Could not load your shopping basket. Data might be corrupted.");
      setBasketItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRemoveItem = async (itemIdToRemove) => {
    const itemToRemove = basketItems.find(item => item.id === itemIdToRemove);
    if (!itemToRemove) {
      console.error("Item not found for removal:", itemIdToRemove);
      setError("Could not find the item to remove. Please refresh and try again.");
      return;
    }

    const userConfirmed = await showModal(
      'confirm',
      'Confirm Delete Item',
      `Are you sure you want to remove "${itemToRemove.name}" from your shopping basket?`
    );

    if (userConfirmed) {
      try {
        const updatedBasketItems = basketItems.filter(item => item.id !== itemIdToRemove);
        setBasketItems(updatedBasketItems);
        if (updatedBasketItems.length > 0) {
          localStorage.setItem(SHOPPING_BASKET_KEY, JSON.stringify(updatedBasketItems));
        } else {
          localStorage.removeItem(SHOPPING_BASKET_KEY);
        }
      } catch (error) {
        console.error("Error removing item from basket:", error);
        setError("Failed to update basket. Please try again.");
        // Optionally, show an error modal:
        // await showModal('alert', 'Error', 'Failed to remove item. Please try again.');
      }
    }
  };

  const handleClearBasket = async () => {
    const userConfirmed = await showModal(
      'confirm',
      'Confirm Clear Basket',
      'Are you sure you want to clear all items from your shopping basket?'
    );

    if (userConfirmed) {
      try {
        setBasketItems([]);
        localStorage.removeItem(SHOPPING_BASKET_KEY);
        // Consider adding a success alert/toast here if desired, e.g.,
        // await showModal('alert', 'Success', 'Shopping basket cleared.');
      } catch (error) {
        console.error("Error clearing basket:", error);
        setError("Failed to clear basket. Please try again.");
        // Optionally, show an error modal:
        // await showModal('alert', 'Error', 'Failed to clear basket. Please try again.');
      }
    }
  };

  const handleQuantityChange = (itemIdToUpdate, newQuantityStr) => {
    const newQuantity = parseInt(newQuantityStr, 10);

    // Allow empty string for temporary input, but don't save if it's not a positive number on blur/final change
    if (newQuantityStr === '') { // User might be clearing field to type new number
        const updatedBasketItems = basketItems.map(item => {
            if (item.id === itemIdToUpdate) {
              return { ...item, quantity: '' }; // Keep as empty string in state for controlled input
            }
            return item;
          });
        setBasketItems(updatedBasketItems);
        // Don't save to localStorage yet, wait for valid number or blur event if more complex handling is needed
        return;
    }

    if (isNaN(newQuantity) || newQuantity <= 0) {
      console.warn(`Invalid quantity entered: ${newQuantityStr}. Quantity not updated or set to 1.`);
      // To prevent invalid state in localStorage, one might choose to revert or set to a default
      // For simplicity, we'll update state to reflect input for now, but downloads should handle NaN/0
      // A better UX would be to validate onBlur of the TextField
      const revertedItems = basketItems.map(item => { // Revert to old value or 1 if invalid
        if (item.id === itemIdToUpdate) {
          return { ...item, quantity: '1' }; // Or keep old value: item.quantity (but it's already changed in input)
        }
        return item;
      });
      // setBasketItems(revertedItems); // This would revert the input field too
      // localStorage.setItem(SHOPPING_BASKET_KEY, JSON.stringify(revertedItems));
      alert("Please enter a valid quantity greater than 0."); // Simple feedback
      return;
    }

    try {
      const updatedBasketItems = basketItems.map(item => {
        if (item.id === itemIdToUpdate) {
          return { ...item, quantity: newQuantity.toString() };
        }
        return item;
      });
      setBasketItems(updatedBasketItems);
      localStorage.setItem(SHOPPING_BASKET_KEY, JSON.stringify(updatedBasketItems));
    } catch (error) {
      console.error("Error updating item quantity in basket:", error);
      setError("Failed to update quantity. Please try again.");
    }
  };

  // Corrected download functions
  const handleDownloadTxt = () => {
    if (basketItems.length === 0) { alert("Shopping basket is empty."); return; }
    let content = "Your Shopping Basket:\n\n";
    basketItems.forEach(item => {
      let line = `- ${item.quantity || '1'} ${item.unit || ''} ${item.name}`.trim(); // Default quantity to 1 if empty
      if (item.originalName && item.originalName !== item.name) line += ` (substituted for ${item.originalName})`;
      line += ` (from: ${item.recipeTitle || 'Unknown Recipe'})`;
      content += line + "\n";
    });
    content += "\nGenerated by NutriChef";
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = 'shopping-list.txt'; document.body.appendChild(a);
    a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    if (basketItems.length === 0) { alert("Shopping basket is empty."); return; }
    const doc = new jsPDF(); let yPosition = 15; const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.height; const margin = 10;
    const pageWidth = doc.internal.pageSize.width - margin * 2;
    doc.setFontSize(18); doc.text("Your Shopping Basket", margin, yPosition);
    yPosition += lineHeight * 2; doc.setFontSize(12);
    basketItems.forEach(item => {
      let itemText = `- ${item.quantity || '1'} ${item.unit || ''} ${item.name}`; // Default quantity to 1
      if (item.originalName && item.originalName !== item.name) itemText += ` (for ${item.originalName})`;
      itemText += ` (from: ${item.recipeTitle || 'Unknown Recipe'})`;
      const splitText = doc.splitTextToSize(itemText, pageWidth);
      if (yPosition + (splitText.length * lineHeight) > pageHeight - margin) {
        doc.addPage(); yPosition = margin; doc.setFontSize(12);
      }
      doc.text(splitText, margin, yPosition); yPosition += (splitText.length * lineHeight);
    });
    yPosition += lineHeight;
    if (yPosition > pageHeight - margin) { doc.addPage(); yPosition = margin; }
    doc.setFontSize(10); doc.text("Generated by NutriChef", margin, yPosition);
    doc.save('shopping-list.pdf');
  };

  if (loading) return <Container sx={{textAlign: 'center', mt: 5}}><CircularProgress /></Container>;
  if (error && basketItems.length === 0) return <Container sx={{mt:2}}><Alert severity="error">{error}</Alert></Container>;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Your Shopping Basket
      </Typography>
      {error && basketItems.length > 0 && <Alert severity="error" sx={{mb:2}}>{error}</Alert>}

      {basketItems.length === 0 && !loading && !error ? (
        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Your shopping basket is empty.
          <RouterLink to="/recipes" style={{ textDecoration: 'underline', color: 'primary.main', marginLeft: '4px' }}>
            Browse recipes
          </RouterLink>
           to add items.
        </Typography>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="outlined" color="error" startIcon={<DeleteSweepIcon />}
              onClick={handleClearBasket} disabled={basketItems.length === 0}
            >
              Clear All Items
            </Button>
          </Box>
          <Paper elevation={2} sx={{p: { xs: 2, sm: 3 }, maxHeight: '70vh', overflowY: 'auto' }}>
            {/* Box moved above */}
            <List>
            {basketItems.map((item, index) => (
              <React.Fragment key={item.id || index}>
                <ListItem
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveItem(item.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                  sx={{pr: {xs: 7, sm: 8} }} // Increased paddingRight for secondary action
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', flexDirection: { xs: 'column', sm: 'row' } }}>
                    <TextField
                      type="number"
                      value={item.quantity} // Controlled component
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      size="small"
                      sx={{
                        width: { xs: '100%', sm: '75px' },
                        mr: { xs: 0, sm: 1.5 },
                        mb: { xs: 1, sm: 0 },
                        '& .MuiInputBase-input': { textAlign: 'center' }
                      }}
                      inputProps={{ min: 1 }} // style: { textAlign: 'center' } moved to sx
                      variant="outlined"
                    />
                    <ListItemText
                      primary={`${item.unit || ''} ${item.name}`}
                      primaryTypographyProps={{ sx: { fontWeight: 500 } }}
                      secondary={
                        <>
                          {item.originalName && item.originalName !== item.name && (
                            <Typography component="span" variant="caption" color="textSecondary" display="block" sx={{fontStyle: 'italic'}}>
                              (Substituted for: {item.originalName})
                            </Typography>
                          )}
                          <Typography component="span" variant="caption" color="textSecondary" display="block">
                            From: {item.recipeTitle || 'Unknown Recipe'}
                          </Typography>
                        </>
                      }
                      sx={{ width: '100%', mb: { xs: 1, sm: 0 }, textAlign: { xs: 'center', sm: 'left'} }}
                    />
                  </Box>
                </ListItem>
                {index < basketItems.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
          {/* Download buttons box moved below Paper component */}
          {/* Closing React.Fragment added after Paper */}
        </Paper>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2, flexWrap: 'wrap', flexDirection: { xs: 'column', sm: 'row' } }}>
          <Button variant="outlined" onClick={handleDownloadTxt} disabled={basketItems.length === 0} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            Download as .txt
          </Button>
          <Button variant="contained" onClick={handleDownloadPdf} disabled={basketItems.length === 0} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            Download as .pdf
          </Button>
        </Box>
        </>
      )}
    </Container>
  );
}

export default ShoppingBasketPage;
