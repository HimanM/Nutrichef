import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

const AllergyInfo = ({ allergens }) => {
    if (!allergens || allergens.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                No allergen information available.
            </Typography>
        );
    }

    return (
        <Box sx={{ mt: 1.5 }}> {/* Using theme spacing convention */}
            <Typography variant="subtitle2" component="strong" sx={{ mb: 0.5, display: 'block' }}>
                Allergens:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}> {/* Using theme spacing for gap */}
                {allergens.map(allergen => (
                    <Chip
                        key={allergen}
                        label={allergen.charAt(0).toUpperCase() + allergen.slice(1)}
                        // Using 'warning' color from theme for visibility, but a softer variant.
                        // Alternatively, 'default' or a custom color could be used.
                        // For this example, let's use a custom style that hints at warning but is softer.
                        sx={(theme) => ({
                            backgroundColor: theme.palette.warning.light, // Softer warning background
                            color: theme.palette.warning.contrastText || theme.palette.getContrastText(theme.palette.warning.light), // Ensure contrast
                            // If contrastText isn't defined for light variant, calculate it
                            margin: theme.spacing(0.25), // Small margin around chips
                            height: '28px', // Slightly taller chip
                            fontSize: theme.typography.caption.fontSize, // Use caption size
                            fontWeight: theme.typography.caption.fontWeight,
                            border: `1px solid ${theme.palette.warning.main}`, // Border with main warning color
                        })}
                        size="small" // Use small size for chips
                    />
                ))}
            </Box>
        </Box>
    );
};

export default AllergyInfo;
