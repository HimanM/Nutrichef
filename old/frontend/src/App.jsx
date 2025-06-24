// frontend/src/App.jsx
import React, { useState } from 'react'; // Import useState
import { ThemeProvider, CssBaseline, Fab } from '@mui/material'; // Added Fab
import theme from './theme'; // Import the custom theme
// Corrected import: Only Routes and Route are needed here from react-router-dom directly for App.jsx structure
import { Routes, Route } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat'; // Added ChatIcon

import NavigationBar from './components/NavigationBar.jsx';
import HomePage from './pages/HomePage.jsx';
import PublicRecipeBrowser from './pages/PublicRecipeBrowser.jsx';
import UserRegistration from './pages/UserRegistration.jsx';
import RecipeUpload from './pages/RecipeUpload.jsx';
import MealPlanner from './pages/MealPlanner.jsx';
import ShoppingBasket from './pages/ShoppingBasket.jsx';
import IngredientClassifier from './pages/IngredientClassifier.jsx';
import RecipeDetail from './pages/RecipeDetail.jsx';
import UserSettings from './pages/UserSettings.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import UserManagementPage from './pages/admin/UserManagementPage.jsx';
import RecipeManagementPage from './pages/admin/RecipeManagementPage.jsx';
import ClassificationScoresPage from './pages/admin/ClassificationScoresPage.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import PrivateRoute from './components/PrivateRoute.jsx'; // Import PrivateRoute
import PersonalizedRecipesPage from './pages/PersonalizedRecipesPage.jsx'; // Import PersonalizedRecipesPage
import EmailVerificationPage from './pages/EmailVerificationPage.jsx'; // Import EmailVerificationPage
import IngredientSubstitutePage from './pages/IngredientSubstitutePage.jsx'; // Import the new page
import PantryPage from './pages/PantryPage.jsx'; // Import PantryPage
import RecipeSuggestionsPage from './pages/RecipeSuggestionsPage.jsx'; // Import RecipeSuggestionsPage
import FoodLookupPage from './pages/FoodLookupPage.jsx'; // New page for food lookup
import NotFoundPage from './pages/NotFoundPage.jsx'; // Import the new page
import ContactUsPage from './pages/ContactUsPage.jsx'; // Import ContactUsPage
import { MealPlanSelectionProvider } from './context/MealPlanSelectionContext.jsx';
import SessionExpiredModal from './components/auth/SessionExpiredModal.jsx';
import FloatingChatbot from './components/FloatingChatbot.jsx'; // Import FloatingChatbot

function App() {
    const [isChatbotOpen, setIsChatbotOpen] = useState(false); // Chatbot visibility state

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <MealPlanSelectionProvider>
                <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <NavigationBar /> {/* This is the first flex item */}
                    <SessionExpiredModal /> {/* Render the modal here */}
                    {/* FloatingChatbot rendered here, before the main content Container */}
                    <FloatingChatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />

                    {/* FAB to open the chatbot */}
                    {!isChatbotOpen && (
                        <Fab
                            color="primary"
                            aria-label="open chatbot"
                            onClick={() => setIsChatbotOpen(true)}
                            sx={{
                                position: 'fixed',
                                bottom: 20,
                                right: 20,
                                zIndex: 1290, // Below chatbot (1300), above other content
                            }}
                        >
                            <ChatIcon />
                        </Fab>
                    )}

                    <Container 
                        maxWidth={false}
                        component="main" // Use component="main" for semantic HTML
                        sx={{
                            flexGrow: 1, // Allows this container to take up available vertical space
                            py: 2 // Use padding for vertical spacing instead of margin
                            // display: 'flex', // Removed to ensure block flow from top
                            // flexDirection: 'column' // Removed to ensure block flow from top
                        }}
                    >
                    <Routes> {/* This Routes component is from react-router-dom */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/recipes" element={<PublicRecipeBrowser />} />
                        <Route path="/meal-planner" element={<MealPlanner />} />
                        <Route path="/basket" element={<ShoppingBasket />} />
                        <Route path="/upload" element={<RecipeUpload />} />
                        <Route path="/classifier" element={<IngredientClassifier />} />
                        <Route path="/register" element={<UserRegistration />} />
                        <Route path="/login" element={<LoginPage />} />
                        {/* <Route path="/settings" element={<UserSettings />} /> */} {/* Moved to PrivateRoute */}
                        <Route path="/recipe/:recipeId" element={<RecipeDetail />} />
                        <Route path="/verify-email/:token" element={<EmailVerificationPage />} />
                        <Route path="/ingredient-substitute" element={<IngredientSubstitutePage />} />
                        <Route path="/food-lookup" element={<FoodLookupPage />} /> {/* New route for food lookup */}
                        <Route path="/contact-us" element={<ContactUsPage />} /> {/* Add route for ContactUsPage */}

                        {/* User-specific (authenticated) Routes */}
                        <Route element={<PrivateRoute />}>
                            <Route path="/settings" element={<UserSettings />} />
                            {/* UserSettings is now correctly inside PrivateRoute */}
                            <Route path="/personalized-recipes" element={<PersonalizedRecipesPage />} />
                            <Route path="/pantry" element={<PantryPage />} />
                            <Route path="/suggested-recipes" element={<RecipeSuggestionsPage />} />
                            {/* Add other routes that require login but not admin role here */}
                        </Route>

                        {/* Admin Routes - Corrected Structure */}
                        <Route element={<AdminRoute />}>
                          <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<AdminDashboard />} />
                            <Route path="users" element={<UserManagementPage />} />
                            <Route path="recipes" element={<RecipeManagementPage />} />
                            <Route path="classification-scores" element={<ClassificationScoresPage />} />
                          </Route>
                        </Route>

                        <Route path="*" element={<NotFoundPage />} /> {/* Add this line as the last route */}
                    </Routes>
                </Container>
                {/* NB: The FloatingChatbot is now placed before the Container, if it needs to be
                     absolutely last for stacking context, it could be moved after the Container
                     but still inside the main Box or ThemeProvider.
                     The current placement is as per the instruction: "Render the FloatingChatbot component
                     *inside* ThemeProvider but *before* or *after* the Box that contains NavigationBar
                     and the main Container... Let's place it just before the closing </Box> of the main
                     flex container" - actually, the instruction said "just after NavigationBar and
                     SessionExpiredModal but before the main page Container". This matches the current diff.
                */}
            </Box>
            </MealPlanSelectionProvider>
        </ThemeProvider>
    );
}

export default App;
