import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import NavigationBar from './components/NavigationBar.jsx';
import Footer from './components/Footer.jsx';
import SessionExpiredModal from './components/auth/SessionExpiredModal.jsx';
import FloatingChatbot from './components/FloatingChatbot.jsx';
import FloatingScroller from './components/FloatingScroller.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';

import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import UserRegistration from './pages/UserRegistration.jsx';

import PublicRecipeBrowser from './pages/PublicRecipeBrowser.jsx';
import IngredientClassifier from './pages/IngredientClassifier.jsx';
import IngredientSubstitutePage from './pages/IngredientSubstitutePage.jsx';
import FoodLookupPage from './pages/FoodLookupPage.jsx';
import PersonalizedRecipesPage from './pages/PersonalizedRecipesPage.jsx';
import PantryPage from './pages/PantryPage.jsx';

import EmailVerificationPage from './pages/EmailVerificationPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ContactUsPage from './pages/ContactUsPage.jsx';
import AboutUsPage from './pages/AboutUsPage.jsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx';

import RecipeDetailPage from './pages/RecipeDetailPage.jsx';
import RecipeSuggestionsPage from './pages/RecipeSuggestionsPage.jsx';
import ShoppingBasketPage from './pages/ShoppingBasketPage.jsx';
import UserSettingsPage from './pages/UserSettingsPage.jsx';

import MealPlanner from './pages/MealPlanner.jsx';

import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import UserManagementPage from './pages/admin/UserManagementPage.jsx';
import RecipeManagementPage from './pages/admin/RecipeManagementPage.jsx';
import ClassificationScoresPage from './pages/admin/ClassificationScoresPage.jsx';
import AdminContactMessagesPage from './pages/admin/AdminContactMessagesPage.jsx';

import { AuthProvider } from './context/AuthContext.jsx';
import { ModalProvider } from './context/ModalContext.jsx';
import { MealPlanSelectionProvider } from './context/MealPlanSelectionContext.jsx';

const ChatIconTailwind = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
  </svg>
);

function App() {
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);

    return (
        <AuthProvider>
          <ModalProvider>
            <MealPlanSelectionProvider>
              <div className="flex flex-col min-h-screen">
                  <NavigationBar /> 
                  <SessionExpiredModal /> 
                  <FloatingChatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} /> 

                <main className="flex-grow min-w-screen container ">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/recipes" element={<PublicRecipeBrowser />} />
                        <Route path="/meal-planner" element={<MealPlanner />} /> 
                        <Route path="/basket" element={<ShoppingBasketPage />} />
                        <Route path="/classifier" element={<IngredientClassifier />} />
                        <Route path="/register" element={<UserRegistration />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/recipe/:recipeId" element={<RecipeDetailPage />} />
                        <Route path="/verify-email/:token" element={<EmailVerificationPage />} />
                        <Route path="/ingredient-substitute" element={<IngredientSubstitutePage />} />
                        <Route path="/food-lookup" element={<FoodLookupPage />} />
                        <Route path="/contact-us" element={<ContactUsPage />} />
                        <Route path="/about" element={<AboutUsPage />} />
                        <Route path="/privacy" element={<PrivacyPolicyPage />} />

                        <Route element={<PrivateRoute />}>
                            <Route path="/settings" element={<UserSettingsPage />} />
                            <Route path="/personalized-recipes" element={<PersonalizedRecipesPage />} />
                            <Route path="/pantry" element={<PantryPage />} />
                            <Route path="/suggested-recipes" element={<RecipeSuggestionsPage />} />
                        </Route>

                        <Route element={<AdminRoute />}>
                          <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<AdminDashboard />} />
                            <Route path="users" element={<UserManagementPage />} />
                            <Route path="recipes" element={<RecipeManagementPage />} />
                            <Route path="classification-scores" element={<ClassificationScoresPage />} />
                            <Route path="contact-messages" element={<AdminContactMessagesPage />} />
                          </Route>
                        </Route>

                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </main>
                <FloatingScroller />
                <Footer />
              </div>
        </MealPlanSelectionProvider>
          </ModalProvider>
        </AuthProvider>
    );
}

export default App;
