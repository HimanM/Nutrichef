
# How This Web Application Works

This document provides a high-level overview of the technical workings of the NutriChef web application.

## Project Structure

The application is divided into two main parts:

- **`frontend/`**: A React-based single-page application (SPA) that provides the user interface.
- **`backend/`**: A Flask (Python) server that provides a RESTful API for the frontend.

## Frontend

The frontend is built using React and Vite. It uses `react-router-dom` for navigation and `tailwindcss` for styling. The main application component, `App.jsx`, defines the routes for the application. The application is wrapped in an `AuthProvider` to provide authentication context to all components. It also uses a `ModalProvider` for managing modals and a `MealPlanSelectionProvider` for managing meal plan selections.

### Routing

The application uses `react-router-dom` to handle client-side routing. The routes are defined in the `App.jsx` file. The application has public routes, private routes, and admin routes. Private routes are protected by the `PrivateRoute` component, which checks if the user is authenticated. Admin routes are protected by the `AdminRoute` component, which checks if the user is an administrator.

### Key Components

- **`NavigationBar`**: The main navigation bar for the application.
- **`Footer`**: The main footer for the application.
- **`FloatingChatbot`**: A floating chatbot that allows users to interact with a chatbot.
- **`FloatingScroller`**: A floating button that allows users to scroll to the top of the page.
- **`SessionExpiredModal`**: A modal that is displayed when the user's session has expired.
- **`AnimatedBackground`**: An animated background for the application.

### Key Dependencies:

- **`react`**: The core library for building the user interface.
- **`react-router-dom`**: For handling client-side routing.
- **`tailwindcss`**: For styling the application.
- **`recharts`**: For creating charts and graphs.
- **`date-fns`**: For date and time manipulation.

### Building and Running the Frontend

- To run the frontend in development mode, use `npm run dev`.
- To build the frontend for production, use `npm run build`.

## Backend

The backend is a Flask application that provides a RESTful API for the frontend. It uses a MySQL database for data storage and `SQLAlchemy` as an ORM.

### Key Dependencies:

- **`Flask`**: The core web framework.
- **`Flask-SQLAlchemy`**: For interacting with the database.
- **`Flask-JWT-Extended`**: For handling user authentication with JSON Web Tokens (JWT).
- **`Flask-Mail`**: For sending emails.
- **`tensorflow` and `keras`**: For machine learning models.
- **`pandas`**: For data manipulation.
- **`spacy`**: For natural language processing.

### Database

The application uses several AI models to provide various features.

### Ingredient Classification

The ingredient classification model is a TensorFlow/Keras model that is used to classify images of ingredients. The model is located in the `backend/ai_models/ingredient_classification/` directory. The `FoodIngredientClassifier` class in `ingredient_classifier.py` is used to load and run the model.

### Nutrition Lookup

The nutrition lookup model is used to find nutrition information for a given food item. The model is located in the `backend/ai_models/nutrition_lookup/` directory. The `OfflineNutritionLookup` class in `nutrition_lookup.py` is used to load and run the model. The model uses a CSV file containing nutrition data to look up nutrition information.

### Ingredient Substitution

The ingredient substitution model is used to find substitutes for a given ingredient. The model is located in the `backend/ai_models/substitution_models/` directory. The `IngredientSubstitutor` class in `substitution_model.py` is used to load and run the model. The model uses a CSV file containing ingredient substitutions to find suitable substitutes.

### API Routes

The API routes are defined in the `backend/routes/` directory. Each file in this directory corresponds to a different set of API endpoints. For example, `user_routes.py` handles user-related endpoints, and `recipe_routes.py` handles recipe-related endpoints.

### User Routes (`user_routes.py`)

- **`/api/register`**: (POST) Registers a new user.
- **`/api/login`**: (POST) Logs in a user and returns a JWT token.
- **`/api/user/preferences`**: (GET, PUT) Gets or updates user preferences.
- **`/api/user/password`**: (PUT) Updates the user's password.
- **`/api/user/nutritional-targets`**: (PUT) Updates the user's nutritional targets.
- **`/api/verify-email/<token>`**: (GET) Verifies a user's email address.
- **`/api/user/profile`**: (GET, PUT) Gets or updates the user's profile.
- **`/api/user/allergies`**: (GET, PUT) Gets or updates the user's allergies.
- **`/api/user/dietary-restrictions`**: (GET, PUT) Gets or updates the user's dietary restrictions.
- **`/api/user/health-goals`**: (GET, PUT) Gets or updates the user's health goals.
- **`/api/user/kitchen-equipment`**: (GET, PUT) Gets or updates the user's kitchen equipment.
- **`/api/user/cooking-skill-level`**: (GET, PUT) Gets or updates the user's cooking skill level.
- **`/api/user/favorite-cuisines`**: (GET, PUT) Gets or updates the user's favorite cuisines.
- **`/api/user/disliked-ingredients`**: (GET, PUT) Gets or updates the user's disliked ingredients.
- **`/api/user/meal-complexity`**: (GET, PUT) Gets or updates the user's meal complexity preferences.
- **`/api/user/meal-prep-time`**: (GET, PUT) Gets or updates the user's meal prep time preferences.
- **`/api/user/macronutrient-targets`**: (GET, PUT) Gets or updates the user's macronutrient targets.
- **`/api/user/micronutrient-targets`**: (GET, PUT) Gets or updates the user's micronutrient targets.
- **`/api/user/activity-level`**: (GET, PUT) Gets or updates the user's activity level.
- **`/api/user/notification-settings`**: (GET, PUT) Gets or updates the user's notification settings.
- **`/api/user/privacy-settings`**: (GET, PUT) Gets or updates the user's privacy settings.
- **`/api/user/account-status`**: (GET) Gets the user's account status.
- **`/api/user/deactivate`**: (POST) Deactivates the user's account.
- **`/api/user/delete`**: (DELETE) Deletes the user's account.

### Recipe Routes (`recipe_routes.py`)

- **`/api/recipes`**: (GET) Gets a list of all public recipes.
- **`/api/recipes/<recipe_id>`**: (GET) Gets details for a specific recipe.
- **`/api/recipes/upload`**: (POST) Creates a new recipe from uploaded data.
- **`/api/recipes/upload_text`**: (POST) Creates a new recipe from raw text input.
- **`/api/recipes/process_submission`**: (POST) Processes a recipe submission, accepting either structured JSON or raw text.
- **`/api/recipes/upload_image`**: (POST) Uploads an image for a recipe.
- **`/api/recipes/my-private`**: (GET) Gets a list of the user's private recipes.
- **`/api/recipes/<recipe_id>/rate`**: (POST) Rates a recipe.
- **`/api/recipes/<recipe_id>/my-rating`**: (GET) Gets the user's rating for a recipe.
- **`/api/recipes/<recipe_id>/toggle-public`**: (PATCH) Toggles the public status of a recipe.

### Running the Backend

- To run the backend in development mode, use `python -m flask run`.
- The backend can also be run using a Docker container, as defined in the `backend/Dockerfile`.

## Communication between Frontend and Backend

The frontend communicates with the backend via HTTP requests to the RESTful API. The API endpoints are defined in the `backend/routes/` directory. The frontend uses the `fetch` API to make requests to the backend.
