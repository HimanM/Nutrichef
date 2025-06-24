// frontend/src/components/FloatingChatbot.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Box, TextField, Button, Paper, Typography, CircularProgress, Alert, IconButton, Link as MuiLink } from '@mui/material'; // Added MuiLink for completeness if needed, Button is used.
import { Send as SendIcon, Image as ImageIcon, Close as CloseIcon } from '@mui/icons-material'; // Import CloseIcon
import { Link as RouterLink } from 'react-router-dom'; // Import RouterLink
import { authenticatedFetch } from '../utils/apiUtil';
import { useAuth } from '../context/AuthContext';

const FloatingChatbot = ({ isOpen, onClose }) => {
    // 1. All useRef hooks
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const chatbotRef = useRef(null);

    // 2. All useState hooks
    const [messages, setMessages] = useState([]);
    const [inputQuery, setInputQuery] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // 3. All useContext hooks (via custom hooks like useAuth)
    const auth = useAuth();

    // 4. All useEffect hooks
    // Effect for scrolling to bottom
    useEffect(() => {
        // The scrollToBottom function was defined below, moving its logic here
        // or ensuring it's defined before this effect if used as a callback.
        // For now, direct implementation:
        if (messagesEndRef.current) { // Ensure ref is attached
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Effect for initial greeting - runs once on mount
    useEffect(() => {
        setMessages([{ sender: 'bot', text: 'Hello! I am FoodieBot. How can I help you with your culinary questions today?' }]);
    }, []); // Empty dependency array ensures this runs only once

    // Effect for handling clicks outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // No need to check isOpen here as listener is only added when open (as per original logic)
            if (chatbotRef.current && !chatbotRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            // Also remove if isOpen becomes false and effect re-runs (due to isOpen in dependency array)
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]); // Dependencies are correct

    // Conditional return (early exit) - MUST be after all hook calls
    if (!isOpen) {
        return null;
    }

    // Helper functions & Event Handlers
    // Note: scrollToBottom logic is now directly in its useEffect.
    // If it were needed elsewhere, it should be defined here.

    const renderFormattedText = (text) => {
        if (typeof text !== 'string') {
            return ''; // Or handle as an error, but ensure it's a string
        }
        let processedText = text;

        // Bold: **text**
        processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Italic: _text_ or *text*
        // Process _text_ first
        processedText = processedText.replace(/\_(.*?)\_/g, '<em>$1</em>');
        // Process *text* (ensure it's not part of a ** bold tag already handled)
        // This regex tries to match * only if not preceded or followed by another *
        // A simpler way is to rely on the order of replacement (bold first).
        processedText = processedText.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');


        // Handle lists: visual cue with bullet points
        // Split into lines, process, then join. pre-wrap will handle display.
        const lines = processedText.split('\n');
        processedText = lines.map(line => {
            // Matches lines starting with '- ' or '  - ' (allowing for indentation)
            const listMatch = line.match(/^(\s*)- (.*)/);
            if (listMatch) {
                // listMatch[1] is the leading whitespace (indentation)
                // listMatch[2] is the content after '- '
                return `${listMatch[1]}&bull; ${listMatch[2]}`;
            }
            return line;
        }).join('\n');

        return processedText;
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setError(''); // Clear previous errors
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Check for authentication before processing the query
        if (!auth.isAuthenticated && (inputQuery.trim() !== '' || selectedImage)) {
            setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: 'Please login to use me.' }]);
            setInputQuery('');
            setSelectedImage(null);
            setImagePreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = ""; // Clear the file input
            }
            // setError(''); // Optionally clear any existing general error, or set a specific one
            return; // Return early
        }

        if (!inputQuery.trim() && !selectedImage) {
            setError('Please type a message or select an image.');
            return;
        }

        const userQuery = inputQuery || (selectedImage ? "Image uploaded" : "Empty query");
        const userMessage = { sender: 'user', text: userQuery, image: imagePreview };
        setMessages(prevMessages => [...prevMessages, userMessage]);
        setIsLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('text_query', inputQuery);
        if (selectedImage) {
            formData.append('image_file', selectedImage);
        }

        try {
            const fetchOptions = {
                method: 'POST',
                body: formData,
                // Content-Type for FormData is set by the browser automatically.
                // authenticatedFetch handles removing it from headers if body is FormData.
            };

            const response = await authenticatedFetch('/api/chatbot/query', fetchOptions, auth);

            let botResponseText;
            let disambiguationMatches = null;
            let responseData = null; // Will hold the parsed JSON response

            // For logging the raw response text (optional, for deeper debugging if needed)
            // let rawResponseTextForLogging = "";

            if (response.ok) {
                // rawResponseTextForLogging = await response.text(); // Get raw text first
                // responseData = JSON.parse(rawResponseTextForLogging); // Then parse
                responseData = await response.json(); // Assuming direct json parsing is fine
                console.log('API Response Data for Bot Message:', responseData); // DEBUG LOG

                if (responseData.error) { // Backend might send a 200 OK with an error field
                    botResponseText = `Error: ${responseData.error}`;
                } else if (responseData.response) {
                    botResponseText = responseData.response;
                } else {
                    botResponseText = "Received an unexpected response structure.";
                }
                // Preserve disambiguation_matches if present
                if (responseData.disambiguation_matches && Array.isArray(responseData.disambiguation_matches)) {
                    disambiguationMatches = responseData.disambiguation_matches;
                }
            } else { // Handle non-OK HTTP responses (4xx, 5xx)
                try {
                    // rawResponseTextForLogging = await response.text();
                    // responseData = JSON.parse(rawResponseTextForLogging);
                    responseData = await response.json();
                    console.log('API Error Response Data:', responseData); // DEBUG LOG
                    botResponseText = `Error: ${responseData.error || response.statusText || 'Unknown error'}`;
                } catch (e) {
                    // If parsing error response as JSON fails, use status text
                    // botResponseText = `Error: ${response.status} ${response.statusText || 'Unknown error'}. Response: ${rawResponseTextForLogging}`;
                    botResponseText = `Error: ${response.status} ${response.statusText || 'Unknown error'}`;
                }
            }

            // Construct the new bot message object carefully
            const newBotMessage = {
                sender: 'bot',
                text: botResponseText,
                // Ensure all relevant fields from responseData are included
                image_url: responseData?.image_url || null, // Use optional chaining and provide null default
                link_url: responseData?.link_url || null,
                link_text: responseData?.link_text || null,
                matches: disambiguationMatches // This was already being handled
            };
            setMessages(prevMessages => [...prevMessages, newBotMessage]);

        } catch (err) {
            let errorMsg = 'Failed to connect to the chatbot service. Please try again later.';
            // err might not have a response property if it's a network error or an error thrown by authenticatedFetch itself
            if (err.message) {
                errorMsg = err.message;
            } else if (err.status) { // If 'err' itself is a Response object from a failed fetch (less likely with current authenticatedFetch)
                 errorMsg = `Error: ${err.status} ${err.statusText}`;
            }
            setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: errorMsg }]);
            setError(errorMsg); // Display error prominently as well
        } finally {
            setIsLoading(false);
            setInputQuery('');
            setSelectedImage(null);
            setImagePreview(null);
            if(fileInputRef.current) {
                fileInputRef.current.value = ""; // Reset file input
            }
        }
    };

    const handleDisambiguationChoiceClick = async (selectedItem) => {
        // 1. Add a user message confirming the selection
        // Using a more direct "You clicked: Item" or simply "Item" to mimic user input
        const userConfirmationText = `${selectedItem}`; // Or `Nutrition for ${selectedItem}`
        setMessages(prevMessages => [...prevMessages, { sender: 'user', text: userConfirmationText }]);

        setIsLoading(true);
        setError('');

        try {
            // 2. Make a POST request to the new direct nutrition endpoint
            const fetchOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Explicitly set for JSON body
                },
                body: JSON.stringify({ food_name: selectedItem }),
            };

            const response = await authenticatedFetch('/api/chatbot/food_nutrition_direct', fetchOptions, auth);

            let botResponseText = "Sorry, I couldn't get the nutrition details for that item.";
            let responseData = null;

            if (response.ok) {
                responseData = await response.json();
                if (responseData.response) {
                    botResponseText = responseData.response;
                } else if (responseData.error) { // Error from the backend endpoint logic
                    botResponseText = `Error: ${responseData.error}`;
                } else {
                    botResponseText = "Received an unexpected response for nutrition details.";
                }
            } else { // Handle HTTP errors (e.g., 400, 500 from server)
                try {
                    responseData = await response.json(); // Try to parse error from backend
                    botResponseText = `Error: ${responseData.error || response.statusText || 'Failed to fetch details'}`;
                } catch (e) {
                    botResponseText = `Error: ${response.status} ${response.statusText || 'Failed to fetch details'}`;
                }
            }
            // 3. Add the bot's response to the chat
            setMessages(prevMessages => [...prevMessages, {
                sender: 'bot',
                text: botResponseText,
                matches: null // Direct nutrition lookup shouldn't return new disambiguation matches
            }]);

        } catch (err) { // Handle network errors or errors from authenticatedFetch itself
            let errorMsg = 'Failed to connect to the nutrition service. Please try again later.';
            if (err.message) {
                errorMsg = err.message; // Use message from thrown error if available
            }
            setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: errorMsg }]);
            setError(errorMsg); // Optionally display error prominently
        } finally {
            setIsLoading(false);
            // Optional: Consider removing or disabling the original message's buttons here
            // For now, keeping it simple as per plan.
        }
    };

    return (
        <Box ref={chatbotRef} sx={{ // Assign the ref to the outermost Box
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1300,
            width: { xs: 'calc(100% - 30px)', sm: '480px' }, // Updated width
            height: { xs: 'calc(100% - 30px)', sm: '650px' }, // Updated height
            boxShadow: 6,
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px solid', // Added border
            borderColor: 'divider', // Added borderColor
            display: 'flex',
            flexDirection: 'column',
            p: 2, // Overall padding
            userSelect: 'none', // Prevent text selection
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
        }}>
            {/* Removed Typography "FoodieBot Chat" */}
            {/* Added new header with optional title and close button */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ ml: 1 }}>FoodieBot</Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </Box>
            <Paper elevation={0} sx={{ // Changed elevation to 0
                flexGrow: 1, // Make Paper take available space
                overflowY: 'auto',
                p: 1, // Padding inside the message area
                mb: 1, // Margin below message area
                display: 'flex', // Keep these as they are useful for messagesEndRef
                flexDirection: 'column'
            }}>
                {messages.map((msg, index) => (
                    <Box
                        key={index}
                        sx={{
                            mb: 1,
                            p: 1.5,
                            borderRadius: '10px',
                            bgcolor: msg.sender === 'user' ? 'primary.light' : 'secondary.light',
                            color: msg.sender === 'user' ? 'primary.contrastText' : 'secondary.contrastText',
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '70%',
                            wordWrap: 'break-word',
                        }}
                    >
                        {/* Debug log for each message object being rendered */}
                        {console.log('Rendering message:', msg)}
                        {/* Render text: Apply formatting for bot, direct for user */}
                        {msg.sender === 'bot' ? (
                            <Typography
                                component="div" // Use div to allow dangerouslySetInnerHTML
                                variant="body1"
                                sx={{ whiteSpace: 'pre-wrap' }} // Handles \n
                                dangerouslySetInnerHTML={{ __html: renderFormattedText(msg.text) }}
                            />
                        ) : (
                            <Typography variant="body1">{msg.text}</Typography>
                        )}
                        {/* User uploaded image preview in chat */}
                        {msg.image && msg.sender === 'user' && (
                            <Box sx={{ mt: 1 }}>
                                <img src={msg.image} alt="Uploaded preview" style={{ maxHeight: '150px', borderRadius: '5px' }} />
                            </Box>
                        )}
                        {/* Debug log for image rendering check */}
                        {msg.sender === 'bot' && console.log('Image render check for bot msg:', 'isBot:', msg.sender === 'bot', 'hasImageUrl:', !!msg.image_url, 'URL:', msg.image_url)}
                        {/* Bot image display */}
                        {msg.sender === 'bot' && msg.image_url && (
                            <Box
                                component="img"
                                src={msg.image_url}
                                alt="FoodieBot Image" // Specific alt text
                                sx={{
                                    maxWidth: '100%',
                                    maxHeight: { xs: '200px', sm: '250px' }, // Responsive max height
                                    mt: 1,
                                    borderRadius: 2,
                                    objectFit: 'contain',
                                    border: '3px solid red' // TEMPORARY DEBUG STYLE
                                }}
                            />
                        )}
                        {/* Bot Link Button */}
                        {msg.sender === 'bot' && msg.link_url && msg.link_text && (
                            <Button
                                component={RouterLink}
                                to={msg.link_url}
                                variant="contained"
                                color="primary"
                                size="small" // Keep link buttons less prominent than main action buttons
                                sx={{ mt: 1.5, display: 'inline-block', textTransform: 'none' }}
                            >
                                {msg.link_text}
                            </Button>
                        )}
                        {/* Bot disambiguation buttons */}
                        {msg.sender === 'bot' && msg.matches && msg.matches.length > 0 && (
                            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'flex-start' }}>
                                {msg.matches.map((matchItem, matchIndex) => (
                                    <Button
                                        key={matchIndex}
                                        variant="outlined"
                                        size="small"
                                        onClick={() => isLoading ? null : handleDisambiguationChoiceClick(matchItem)}
                                        disabled={isLoading}
                                        sx={{
                                            textTransform: 'none',
                                            borderRadius: '16px',
                                            borderColor: 'primary.main',
                                            color: 'primary.main',
                                            m: 0.25,
                                            '&:hover': {
                                                backgroundColor: 'primary.light',
                                                color: 'primary.contrastText',
                                                borderColor: 'primary.dark',
                                            }
                                        }}
                                    >
                                        {matchItem}
                                    </Button>
                                ))}
                            </Box>
                        )}
                    </Box>
                ))}
                <div ref={messagesEndRef} />
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}> {/* Added padding */}
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type your message..."
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    disabled={isLoading}
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    id="image-upload-button"
                    ref={fileInputRef}
                    disabled={isLoading}
                />
                <label htmlFor="image-upload-button">
                    <IconButton color="primary" component="span" disabled={isLoading}>
                        <ImageIcon />
                    </IconButton>
                </label>
                <Button type="submit" variant="contained" endIcon={<SendIcon />} disabled={isLoading}>
                    {isLoading ? <CircularProgress size={24} /> : 'Send'}
                </Button>
            </Box>
            {imagePreview && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="caption">Selected image preview:</Typography>
                    <img src={imagePreview} alt="Selected" style={{ maxHeight: '100px', borderRadius: '5px', display: 'block', margin: 'auto' }} />
                    <Button size="small" onClick={() => {setSelectedImage(null); setImagePreview(null); if(fileInputRef.current) fileInputRef.current.value = "";}} sx={{mt:0.5}}>
                        Clear Image
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default FloatingChatbot; // Changed export name
