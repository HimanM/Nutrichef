# Project Documentation: NutriChef

## 1. Introduction

*   **Project Name:** NutriChef
*   **Brief overview:** NutriChef is an intelligent recipe and nutrition companion designed to assist users in managing their recipes, understanding nutritional information, catering to dietary restrictions and allergies, and discovering new culinary ideas. The application integrates Artificial Intelligence (AI) for advanced functionalities such as classifying food items from images, parsing recipes from text using Natural Language Processing (NLP), and offering personalized dietary recommendations.
*   **Problems it aims to solve:**
    *   **Recipe Management:** Simplifies the organization, storage, and retrieval of personal and public recipes. Users can upload their own recipes or browse a shared collection.
    *   **Nutritional Information Access:** Provides easy access to detailed nutritional information for various food items and recipes, helping users make informed dietary choices.
    *   **Dietary Restriction Management:** Allows users to specify allergies and dietary preferences (e.g., vegetarian, gluten-free), filtering out unsuitable recipes and suggesting appropriate alternatives.
    *   **Culinary Discovery:** Facilitates the discovery of new recipes and ingredients, potentially tailored to user preferences and restrictions, broadening culinary horizons.
    *   **Time-Consuming Meal Planning:** Streamlines meal planning by providing tools to organize recipes and generate shopping lists.
    *   **Ingredient Understanding:** Helps users identify ingredients through image classification and find suitable substitutes.
    *   **Efficient Recipe Input:** Offers a streamlined recipe pipeline for parsing and saving recipes from raw text.

## 2. Project Scope

*   **Target Audience:**
    *   **General Users:** Individuals interested in cooking, exploring new recipes, and managing their nutritional intake.
    *   **Users with Dietary Needs:** People with specific allergies (e.g., peanuts, gluten, dairy), intolerances, or dietary preferences (e.g., vegetarian, vegan, low-carb) who need a reliable tool for recipe filtering and nutritional guidance.
    *   **Platform Administrators:** Personnel responsible for maintaining the application, managing user accounts, overseeing recipe content, and monitoring AI model performance.
*   **Key Goals and Objectives:**
    *   Provide a centralized platform for recipe management.
    *   Offer comprehensive nutritional analysis.
    *   Deliver personalized user experiences.
    *   Leverage AI for enhanced functionality: image classification, NLP recipe parsing (via efficient recipe pipeline), ingredient substitution.
    *   Ensure secure user account management.
    *   Facilitate easy recipe contribution (forms or raw text processed by recipe pipeline).
    *   Develop a user-friendly interface (styled with Tailwind CSS).
    *   Enable administrative oversight.
    *   Offer functional meal planning and shopping list generation.
    *   Implement User Pantry Management.

## 3. Core Functionalities

### User-Facing Features

*   **User Account Management:**
    *   **Registration:** Secure user sign-up process.
        *   ![Placeholder: User Registration Page](./docs/images/placeholder_registration_page.png)
    *   **Login:** Authenticated access.
        *   ![Placeholder: User Login Page](./docs/images/placeholder_login_page.png)
    *   **Email Verification:** For validity and communication.
    *   **Password Management:** Secure storage and reset.
*   **Recipe Management:**
    *   **Browse & Search:** Explore public recipes with filters and pagination.
        *   ![Placeholder: Recipe Browser Page](./docs/images/placeholder_recipe_browser.png)
    *   **View Details:** Comprehensive recipe info (title, ingredients, instructions, images, etc.).
        *   ![Placeholder: Recipe Detail Page](./docs/images/placeholder_recipe_detail.png)
    *   **Upload via Form:** Structured form for new recipes.
        *   ![Placeholder: Recipe Upload Form](./docs/images/placeholder_recipe_upload_form.png)
    *   **Upload via Raw Text (NLP Recipe Parser & Pipeline):** Paste raw recipe text. The ``recipe_pipeline_service.py`` coordinates NLP parsing (via Google Gemini) to structure text, potentially handle images, and save to the database.
    *   **Image Upload:** Attach images to recipes.
*   **Personalization:**
    *   **Allergy Management:** Manage specific allergies from a predefined list.
        *   ![Placeholder: Allergy Settings Page](./docs/images/placeholder_allergy_settings.png)
    *   **Personalized Recipe Feed:** Filters recipes based on registered allergies.
        *   ![Placeholder: Personalized Recipe Feed](./docs/images/placeholder_personalized_feed.png)
    *   **User Settings:** Manage account preferences.
    *   **User Pantry Management (``PantryPage.jsx``):** Manage available ingredients. This can be used for recipe suggestions or shopping list generation. Fully implemented.
        *   ![Placeholder: User Pantry Page](./docs/images/placeholder_pantry_page.png)
*   **AI-Powered Tools:**
    *   **Ingredient Classifier (Image-based):** Upload an image for AI identification.
        *   ![Placeholder: Ingredient Classifier Page](./docs/images/placeholder_ingredient_classifier.png)
    *   **Nutrition Lookup:** Get detailed nutritional info for food items.
        *   ![Placeholder: Nutrition Lookup Page](./docs/images/placeholder_nutrition_lookup.png)
    *   **Ingredient Substitution:** Suggests alternative ingredients.
    *   **NLP Recipe Parser (Text-based Recipes):** Part of the recipe pipeline for structuring unstructured recipe text.
*   **Meal Planner (``MealPlanner.jsx``):** Organize recipes into daily/weekly meal plans. Implemented.
    *   ![Placeholder: Meal Planner Page](./docs/images/placeholder_meal_planner.png)
*   **Shopping Basket (``ShoppingBasketPage.jsx``):** Manage a shopping list, generated from recipes/meal plans or manually. Implemented.
    *   ![Placeholder: Shopping Basket Page](./docs/images/placeholder_shopping_basket.png)
*   **Recipe Suggestions (``RecipeSuggestionsPage.jsx``):** Dedicated page for general recipe suggestions (trending, new, seasonal).
    *   ![Placeholder: Recipe Suggestions Page](./docs/images/placeholder_recipe_suggestions.png)

### Administrator Features

*   **Admin Dashboard Overview:** Centralized management interface.
    *   ![Placeholder: Admin Dashboard Overview](./docs/images/placeholder_admin_dashboard.png)
*   **User Management:** List, view, update roles, delete users.
    *   ![Placeholder: Admin User Management](./docs/images/placeholder_admin_user_mgmt.png)
*   **Recipe Management:** List and delete any recipes.
*   **View AI Classification Model Performance/Scores:** Monitor AI model accuracy.
*   **View User Messages (``AdminContactMessagePage.jsx``):** View and reply to user messages from the "Contact Us" form.
    *   ![Placeholder: Admin View User Messages](./docs/images/placeholder_admin_messages.png)

## 4. Technologies Used

*   **Backend:**
    *   **Programming Language:** Python (3.9+)
    *   **Framework:** Flask
    *   **Database ORM:** SQLAlchemy
    *   **Authentication:** Flask-JWT-Extended
    *   **Email Service:** Flask-Mail
    *   **AI/ML Libraries:**
        *   Google Gemini (NLP for recipe pipeline)
        *   TensorFlow & TensorFlow Hub (Image classification)
        *   Spacy (Supplementary NLP)
        *   Pandas (Data manipulation)
        *   RapidFuzz/FuzzyWuzzy (String matching)
    *   **Database:** RDBMS (MySQL/MSSQL using ``mysql-connector-python``)
*   **Frontend:**
    *   **Programming Language:** JavaScript (JSX)
    *   **Framework/Library:** React
    *   **Build Tool/Development Server:** Vite
    *   **UI Library & Styling:** Tailwind CSS
    *   **Routing:** React Router
    *   **State Management:** React Context API
*   **DevOps/Deployment:**
    *   **Containerization:** Docker and Docker Compose

## 5. Software Architecture

*   **Overall Architecture:** Client-server web application.
    *   **Frontend:** SPA (React), styled with Tailwind CSS.
    *   **Backend:** RESTful API (Flask).
    *   Communication via HTTP requests.
    *   ![Placeholder: Overall Architecture Diagram](./docs/images/placeholder_architecture_diagram.png)
*   **Frontend Architecture:**
    *   SPA using React.
    *   Component-Based Structure (``frontend/src/components/``, ``frontend/src/pages/``). Styling by Tailwind CSS utility classes.
    *   Interaction with backend via asynchronous API calls.
    *   Static assets served by Vite (dev) or Nginx (Docker).
*   **Backend Architecture:**
    *   RESTful API (Flask).
    *   Layered Architecture:
        *   **Routes (``backend/routes/``):** API endpoints (Flask Blueprints).
        *   **Services (``backend/services/``):** Business logic.
            *   Includes ``recipe_pipeline_service.py`` for coordinating recipe processing.
        *   **Data Access Objects (``backend/dao/``):** Database interactions (SQLAlchemy queries).
        *   **Models (``backend/models/``):** SQLAlchemy database models.
    *   **AI Models Integration (``backend/ai_models/``):** Modules for AI functionalities.
*   **Database Architecture:**
    *   Relational Database (MySQL).
    *   **Key Tables:** ``Users``, ``Recipes``, ``Ingredients``, ``AllergyIntolerances``, ``UserAllergies``, ``RecipeIngredients``, ``ClassificationResults``, ``UserMealPlans``, ``Substitutions``, ``IngredientAllergiesIntolerances``, ``UserPantryIngredients``, ``ContactMessages``.
    *   **Relationships:** Standard relational links.
*   **Directory Structure Overview:**
    ```
    .
    ├── SQL/                      # SQL schema definitions
    ├── backend/                  # Flask backend application
    ├── docs/                     # Documentation files (including this one)
    ├── frontend/                 # React frontend application
    ├── .env.example              # Environment variable template
    ├── docker-compose.yml        # Docker Compose configuration
    └── README.md                 # Project README
    ```

## 6. Database Schema Details

Based on ``SQL/schema_mysql.sql``:

*   **Table: `Users`** (UserID, Name, Email, PasswordHash, role, etc.)
*   **Table: `Recipes`** (RecipeID, UserID, Title, Description, Instructions, ImageURL, etc.)
*   **Table: `Ingredients`** (IngredientID, Name)
*   **Table: `AllergyIntolerances`** (id, name)
*   **Table: `UserAllergies`** (UserAllergyID, UserID, AllergyID)
*   **Table: `RecipeIngredients`** (RecipeIngredientID, RecipeID, IngredientID, Quantity, Unit)
*   **Table: `ClassificationResults`** (ResultID, UserID, PredictedFoodName, NutritionInfoJSON, score, etc.)
*   **Table: `UserMealPlans`** (UserMealPlanID, UserID, MealPlanData)
*   **Table: `Substitutions`** (SubstitutionID, OriginalIngredientID, SubstituteIngredientID)
*   **Table: `IngredientAllergiesIntolerances`** (ingredient_id, allergy_intolerance_id)
*   **Table: `UserPantryIngredients`**
    *   **Primary Key:** ``UserPantryIngredientID`` (INT, AUTO_INCREMENT)
    *   **Important Columns:** ``UserID``, ``IngredientID``, ``Quantity``, ``Unit``, ``CreatedAt``, ``UpdatedAt``.
*   **Table: `ContactMessages`**
    *   **Primary Key:** ``MessageID`` (INT, AUTO_INCREMENT)
    *   **Important Columns:** ``Name``, ``Email``, ``Subject``, ``Message``, ``IsRead``, ``SubmittedAt``, ``RespondedAt``, ``AdminResponse``.

_(Detailed column descriptions for common tables omitted for brevity but are consistent with the previous version of this document)._

## 7. API Endpoints Overview (Conceptual)

The backend provides RESTful API endpoints. Common patterns include:

*   **Authentication Endpoints (e.g., ``/api/auth/``)**:
    ```
    /register
    /login
    /logout
    /verify-email/<token>
    ```
*   **Recipe Endpoints (e.g., ``/api/recipes/``)**:
    ```
    / (GET, POST)
    /{recipe_id} (GET, PUT, DELETE)
    /parse-nlp (POST - handled by recipe_pipeline_service)
    ```
*   **User Profile & Personalization Endpoints (e.g., ``/api/users/``)**:
    ```
    /me
    /me/allergies
    /me/settings
    /me/recipes
    ```
*   **Pantry Endpoints (e.g., ``/api/pantry/``)**:
    ```
    / (GET, requires JWT)
    /add (POST, requires JWT)
    /{pantry_ingredient_id} (PUT, DELETE, requires JWT)
    ```
*   **AI Tool Endpoints (e.g., ``/api/ai/`` or ``/api/tools/``)**:
    ```
    /classify-image
    /lookup-nutrition
    /substitute-ingredient
    ```
*   **Meal Planner Endpoints (e.g., ``/api/mealplanner/``)**:
    ```
    / (GET, POST, requires JWT)
    ```
*   **Shopping List Endpoints (e.g., ``/api/shoppinglist/``)**:
    ```
    / (GET, POST, requires JWT)
    /generate (POST, requires JWT)
    ```
*   **Admin Endpoints (e.g., ``/api/admin/``)**:
    ```
    /users
    /recipes
    /classification-scores
    /contact-messages
    ```
*   **Other Endpoints**:
    ```
    /api/allergies
    /api/ingredients
    /api/recipe-suggestions
    ```

## 8. AI Models and Integration

*   **Allergy Analysis:** (Uses ``UserAllergies`` and ``IngredientAllergiesIntolerances``).
*   **Food & Ingredient Classification (Image-based):** (Uses TensorFlow model).
*   **Natural Language Processing (Recipe Text Parsing) & Recipe Pipeline:**
    *   **Model type:** Google Gemini, potentially with Spacy.
    *   **Input:** Raw recipe text, optionally an image.
    *   **Output:** Structured recipe data saved to the database.
    *   **Integration (via ``recipe_pipeline_service.py``):**
        1.  Frontend sends data to ``/api/recipes/parse-nlp``.
        2.  ``RecipePipelineService`` receives data.
        3.  **Text Parsing:** Service sends text to Google Gemini.
        4.  Gemini returns structured JSON; service validates.
        5.  **(Optional) Image Processing.**
        6.  **Database Interaction:** Service uses DAOs to save structured recipe data.
        7.  Response returned to frontend.
*   **Nutrition Lookup:** (Uses internal/external databases).
*   **Ingredient Substitution Recommendation:** (Uses ``Substitutions`` table or CSV).

## 9. Setup and Deployment (Brief Summary)

*   **Local Development Setup:** Backend (Flask), Frontend (React/Vite).
*   **Docker-Based Deployment:** Docker Compose, root ``.env`` file.

## 10. Contribution and Future Scope

*   **Contribution:** (Standard fork, branch, PR process).
*   **Potential Future Enhancements:**
    *   Advanced Meal Planner features.
    *   Enhanced Shopping Basket features.
    *   Pantry-driven Recipe Suggestions.
    *   Social Features (ratings, reviews, sharing).
    *   Advanced Search (nutritional content, difficulty).
    *   (Other enhancements as previously listed).

This documentation provides a comprehensive overview of the NutriChef project, its functionalities, architecture, and technical details, reflecting the latest updates including the use of Tailwind CSS, fully implemented Meal Planner, Shopping Basket, User Pantry, Recipe Suggestions, and the integrated recipe pipeline.
