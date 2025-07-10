# NutriChef: Your Intelligent Recipe and Nutrition Companion

NutriChef is a comprehensive web application designed to help users manage recipes, understand nutritional information, cater to dietary restrictions and allergies, and discover new culinary ideas. It leverages AI for advanced features like food classification from images, natural language processing of recipes, and personalized recommendations.

<!-- Placeholder for a general app screenshot or logo -->
<p align="center">
  <img src="./docs/images/logo.png" alt="NutriChef Overview" width="300"/>
</p>

<!-- Consider adding a screenshot of the HomePage here -->
![NutriChef Home Page](./docs/images/homepage_screenshot.png)

## Features

**For Users:**

*   **User Accounts:** Secure registration and login, with email verification.

    ![User Login Page](./docs/images/user_login_screenshot.png)

*   **Recipe Management:**
    *   **Browse & Search:** Explore a public collection of recipes with search and pagination.

        ![Recipe Browser Page](./docs/images/recipe_browser_screenshot.png)

    *   **View Details:** See full recipe details including ingredients, instructions, and images.

        ![Recipe Detail Page](./docs/images/recipe_detail_screenshot.png)

    *   **Upload Recipes:**
        *   Submit recipes through a structured form.
        *   Upload recipes by pasting raw text (ingredients & instructions).
        *   Upload recipe images.

        ![Recipe Upload Form](./docs/images/recipe_upload_screenshot.png)

*   **Personalization:**
    *   **Personalized Recipe Feed:** Get recipe recommendations filtered based on your registered allergies.

        ![Personalized Recipes Page](./docs/images/personalized_recipes_screenshot.png)

    *   **Allergy Management:** Specify your allergies and intolerances to customize your experience.

        ![User Allergy Settings](./docs/images/allergy_settings_screenshot.png)

    *   **User Settings:** Manage account preferences and password.
    *   **User Pantry Management:** Keep track of available ingredients in your personal pantry.

        <!-- Consider adding a screenshot of the Pantry Page here -->
        ![User Pantry Page](./docs/images/pantry_page_screenshot.png)

    *   **AI Chatbot:** Interact with an AI-powered chatbot for quick answers to your food, nutrition, and recipe questions.
        <!-- Consider adding a screenshot of the Chatbot interface here -->

        ![AI Chatbot](./docs/images/chatbot_screenshot.png)

    *   **Contact Us Form:** Easily send messages and feedback to the platform administrators.

        <!-- Consider adding a screenshot of the Contact Us Page here -->
        ![Contact Us Page](./docs/images/contact_us_screenshot.png)

*   **AI-Powered Tools:**
    *   **Ingredient Classifier:** Upload an image of an ingredient or food item to get it identified.

        ![Ingredient Classifier Page](./docs/images/classifier_screenshot.png)

        <!-- Consider showing an example of classification result -->
        ![Classification Result Example](./docs/images/classifier_result_screenshot.png)

    *   **Nutrition Lookup:** Get nutritional information for food items.

        ![Nutrition Lookup Result](./docs/images/nutrition_lookup_screenshot.png)
        
    *   **Ingredient Substitution:** Find suitable substitutes for ingredients.
    *   **NLP Recipe Parser:** Input recipe text to have it automatically parsed into structured data (ingredients, steps).
*   **(Planned/Partial) Meal Planner:** Interface for organizing recipes into a meal plan.
*   **(Planned/Partial) Shopping Basket:** Interface for managing a shopping list.

**For Administrators:**

*   **Admin Dashboard:** Centralized overview and access to management functions.

    ![Admin Dashboard Page](./docs/images/admin_dashboard_screenshot.png)

*   **User Management:** List, view details, update roles, and delete users.
*   **Recipe Management:** List and delete recipes from the platform.
*   **Classification Scores:** View a summary of AI classification model performance.
*   **View User Messages:** Access and review messages submitted by users via the Contact Us form.
        <!-- Consider adding a screenshot of the Admin Contact Messages Page here -->
        ![Admin Reply Messages Page](./docs/images/admin_messages_screenshot_2.png)


## Technologies Used

**Backend:**

*   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg" height="20" alt="Flask logo" />  **Framework:** Flask
*   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" height="20" alt="Python logo" />  **Programming Language:** Python
*   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlalchemy/sqlalchemy-original.svg" height="20" alt="SQLAlchemy logo" />  **Database ORM:** SQLAlchemy
*   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/json/json-original.svg" height="20" alt="JWT logo" />  **Authentication:** Flask-JWT-Extended (JWT-based)
*   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" height="20" alt="email logo" />  **Email Service:** Flask-Mail
*   **AI/ML Libraries:**
    *   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg" height="20" alt="Google Gemini logo" />  Google Gemini (for NLP)
    *   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg" height="20" alt="TensorFlow logo" />  TensorFlow & TensorFlow Hub (for image classification)
    *   <img src="https://upload.wikimedia.org/wikipedia/commons/8/88/SpaCy_logo.svg" height="20" alt="Spacy logo" />  Spacy (NLP)
    *   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg" height="20" alt="Pandas logo" />  Pandas (data manipulation)
    *   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/atom/atom-original.svg" height="20" alt="RapidFuzz logo" />  RapidFuzz (string matching)  FuzzyWuzzy
*   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" height="20" alt="MySQL logo" />  **Database:** Relational (designed for MySQL/MSSQL, uses `mysql-connector-python`)

**Frontend:**

*   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" height="20" alt="React logo" />  **Framework/Library:** React
*   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" height="20" alt="JavaScript logo" />  **Programming Language:** JavaScript (with JSX)
*   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" height="20" alt="Vite logo" />  **Build Tool/Development Server:** Vite
*   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/materialui/materialui-original.svg" height="20" alt="Material UI logo" />  **UI Library:** Material UI (MUI)
*   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" height="20" alt="Tailwind CSS logo" />  **Styling:** Tailwind CSS
*   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/reactrouter/reactrouter-original.svg" height="20" alt="React Router logo" />  **Routing:** React Router
*   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" height="20" alt="React Context API logo" />  **State Management:** React Context API
*   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/grafana/grafana-original.svg" height="20" alt="Recharts logo placeholder" />  **Charting:** Recharts
*   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/acrobat/acrobat-original.svg" height="20" alt="jsPDF" />  **PDF Generation:** jsPDF

**Deployment:**
*   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" height="20" alt="docker logo" />  Docker:

**Development Tools:**
*   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" height="20" alt="ESLint logo" />  VScode

## AI Models & External Resources

*   **Allergy Analysis**
*   **Food & Ingredient Classification (Image-based):**
    *   The core models are integrated within the `backend/ai_models/` directory.
    *   An example notebook and further details on a similar food classification approach can be found here: [Food Classification Notebook (TF)](https://github.com/HimanM/Classification-Models-for-NutriChef.git)
*   **Natural Language Processing (Recipe Text Parsing)**
*   **Nutrition Lookup**
*   **Ingredient Substitution Recommendation**

<!-- Placeholder for an architecture diagram -->
<!-- ![Architecture Diagram](./docs/images/architecture_diagram.png) -->

## Folder Structure

```
.
├── SQL/                      # SQL schema definitions (MySQL)
├── backend/                  # Flask backend application
│   ├── README.md             # Backend specific documentation
│   ├── .env.example          # Environment variable template for local backend
│   ├── app.py                # Main Flask application setup
│   ├── config.py             # Flask configuration classes
│   ├── db.py                 # SQLAlchemy setup
│   ├── requirements.txt      # Python dependencies
│   ├── ai_models/            # AI/ML models and scripts
│   ├── dao/                  # Data Access Objects
│   ├── models/               # SQLAlchemy database models
│   ├── routes/               # API route definitions (Flask Blueprints)
│   ├── services/             # Business logic layer
│   ├── static/               # Static files (e.g., uploaded recipe images)
│   └── tests/                # Backend tests
├── docs/                     # Documentation files
│   ├── documents/
│   └── images/
├── frontend/                 # React frontend application
│   ├── README.md             # Frontend specific documentation
│   ├── index.html            # Main HTML entry point for SPA
│   ├── package.json          # NPM dependencies and scripts
│   ├── vite.config.js        # Vite configuration
│   └── src/                  # React application source code
│       ├── App.jsx           # Main React app component, routing
│       ├── main.jsx          # React app entry point
│       ├── assets/           # Static assets used in components
│       ├── components/       # Reusable React components
│       ├── context/          # React Context API providers
│       ├── pages/            # Page-level components
│       └── utils/            # Utility functions
├── old/                      # Older or deprecated code versions
├── .env.example              # General example for root .env (used by Docker)
├── .gitignore                # Git ignore file
├── README.md                 # This file
└── docker-compose.yml        # Docker Compose configuration
```

## Setup and Running

This section guides you through setting up and running the NutriChef application, either locally for development or using Docker for a containerized environment.

### Prerequisites

*   Python (3.9+ recommended)
*   Node.js and npm
*   For Docker deployment, see Docker-specific prerequisites below.

### 💻 Local Development Setup

Follow these steps to set up the development environment on your local machine.

#### Backend Setup (Flask)

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Configure Environment Variables (for local backend):**
    *   Inside the `backend` directory, copy `.env.example` to `.env`: `cp .env.example .env`
    *   Edit `backend/.env` and fill in your specific configurations:
        *   `DATABASE_URL`: Your database connection string (e.g., `mysql+mysqlconnector://user:password@host/dbname`)
        *   `JWT_SECRET_KEY`: A strong secret key for JWT.
        *   `GEMINI_API_KEY`: Your API key for Google Gemini.
        *   Email Service (Flask-Mail):
            *   `MAIL_SERVER`, `MAIL_PORT`, `MAIL_USE_TLS`, `MAIL_USE_SSL`
            *   `MAIL_USERNAME`, `MAIL_PASSWORD` (use App Password for Gmail if 2FA is enabled)
            *   `MAIL_DEFAULT_SENDER`
        *   `FRONTEND_URL`: The base URL of your running frontend (e.g., `http://localhost:5173`)
    *   **Note:** This `backend/.env` file is for local Flask development. For Docker, you'll use a root `.env` file (see Docker section).
5.  **Initialize the Database:**
    (Ensure your database server is running and the database specified in `DATABASE_URL` exists)
    ```bash
    flask init-db
    ```
6.  **Run the Flask development server:**
    ```bash
    flask run
    ```
    The backend will typically be available at `http://127.0.0.1:5000/`.

#### Frontend Setup (Vite/NPM)

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```
2.  **Install npm dependencies:**
    ```bash
    npm install
    ```
3.  **Run the Vite development server:**
    ```bash
    npm run dev
    ```
    The frontend will typically be available at `http://localhost:5173/` (or another port if 5173 is busy, check your terminal output).

#### Running the Application Locally

*   Ensure both the backend Flask server (from `backend` directory) and the frontend Vite development server (from `frontend` directory) are running.
*   Open your web browser and navigate to the frontend URL (e.g., `http://localhost:5173`).

### 🐳 Running with Docker

This section explains how to run the application using Docker and Docker Compose, which simplifies deployment and environment management.

#### Docker Prerequisites
Before you begin, ensure you have the following installed on your system:
- [Docker Engine](https://docs.docker.com/engine/install/)
- [Docker Compose](https://docs.docker.com/compose/install/) (Usually included with Docker Desktop for Windows and Mac)

#### Environment Variables for Docker
The `docker-compose.yml` file defines environment variables to configure the services. For sensitive data and local development, it's highly recommended to use a `.env` file in the project's root directory (the same directory as `docker-compose.yml`). Docker Compose automatically loads variables from a file named `.env` in this location.

1.  **Create a root `.env` file:**
    Copy the example configuration from `backend/.env.example` to a new file named `.env` in the **project root**:
    ```bash
    cp backend/.env.example .env 
    ```
    (If a more general `.env.example` exists in the root, prefer that one.)
2.  **Update the root `.env` with your credentials:**
    Open the newly created root `.env` file and replace the placeholder values. This file will configure **all services** for Docker, including database credentials that the backend service will use.
    -   **Database Connection (for Backend Service within Docker):**
        -   `DB_HOST`: Set to `db` (this is the service name defined in `docker-compose.yml`).
        -   `DB_NAME`: e.g., `NutriChef` (to match `MYSQL_DATABASE` below).
        -   `DB_USER`: e.g., `root` or a dedicated app user (to match MySQL setup).
        -   `DB_PASS`: e.g., `nutrichef` (to match `MYSQL_ROOT_PASSWORD` or the dedicated user's password).
        -   `DATABASE_URL`: If your backend uses a full URL, construct it like: `mysql+mysqlconnector://root:nutrichef@db/NutriChef`
    -   **Database Service (`db` service in `docker-compose.yml`):**
        -   `MYSQL_ROOT_PASSWORD`: e.g., `nutrichef` (Root password for the MySQL instance).
        -   `MYSQL_DATABASE`: e.g., `NutriChef` (The database that will be automatically created).
        -   `MYSQL_USER`, `MYSQL_PASSWORD`: (Optional) If you want to create a dedicated user for the application.
    -   **Flask Specific (for Backend Service):**
        -   `FLASK_APP`: `app.py`
        -   `FLASK_RUN_HOST`: `0.0.0.0`
        -   `JWT_SECRET_KEY`: A strong, unique secret.
    -   **Mail Server (for Backend Service):**
        -   `MAIL_SERVER`, `MAIL_PORT`, `MAIL_USE_TLS`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_DEFAULT_SENDER`
    -   **Gemini NLP Configuration (for Backend Service):**
        -   `GEMINI_API_KEY`
        -   `PROJECT_NUMBER` (if applicable)
    -   **Frontend URL (for Backend Service, if it needs to generate frontend links):**
        -   `FRONTEND_URL` (e.g., `http://localhost:3000` if accessing frontend directly on host, or could be different in other setups)

**Important Notes on Docker `.env`:**
-   The `docker-compose.yml` file is configured to pass these environment variables from the root `.env` file to the respective services.
-   The `backend/.env` file (used for local Python development) is **not** directly used by the Dockerized backend service. Its settings must be consolidated into the **root `.env` file** for Docker Compose.
-   **Do not commit your actual root `.env` file (containing secrets) to version control.** Ensure `.env` is listed in your `.gitignore` file.

#### Building and Starting Services
1.  **Clone the Repository (if you haven't already):**
    ```bash
    git clone https://github.com/HimanM/nutrichef.git
    cd nutrichef
    ```
2.  **Ensure your root `.env` file is configured** as described above.

3.  **Build and Start Services:**
    Open a terminal in the project's root directory (where `docker-compose.yml` is located) and run:
    ```bash
    docker-compose up --build
    ```
    - `--build`: This flag tells Docker Compose to build the images before starting the containers. Use it the first time or when you've made changes to Dockerfiles or application code that requires a rebuild.
    - `-d`: (Optional) To run the containers in detached mode (in the background): `docker-compose up --build -d`.

#### Accessing the Services
-   **Frontend:** Open your web browser and navigate to `http://localhost:3000` (or the port you've mapped for the frontend service in `docker-compose.yml`).
-   **Backend API & Static Content:** The backend service will be running, typically not accessed directly from the browser but through the frontend. The frontend's Nginx (within its Docker container) is usually configured to proxy requests starting with `/api/` and `/static/` to the backend service (e.g., `http://backend:5000`).
-   **Database (MySQL - `db` service):** The MySQL database (e.g., `NutriChef`) is accessible on the port mapped in `docker-compose.yml` (e.g., `3307` on your host machine).
    -   Host: `localhost` or `127.0.0.1`
    -   Port: e.g., `3308`
    -   Username: `root` (or your configured user)
    -   Password: The value from your root `.env` for `MYSQL_ROOT_PASSWORD` (or your configured user's password)
    -   Database Name: e.g., `NutriChef`

#### Database Initialization and Persistence
-   **Initialization**: The `db` service in `docker-compose.yml` may be configured to run initialization scripts (e.g., `SQL/schema_mysql_clean.sql`) the first time the `db` container is created. This sets up the database schema.
-   **Persistence**: Database files are typically stored in a Docker named volume (e.g., `mysql_data`, defined in `docker-compose.yml`). This ensures your data persists even if you stop or remove the containers.

#### Verifying Service Status
After running `docker-compose up`, verify that all services are running correctly:
-   **Check container status:**
    ```bash
    docker-compose ps
    # or
    docker ps 
    ```
    Ensure `db`, `backend`, and `frontend` containers are up and running.
-   **MySQL/Database (`db` service):**
    -   Connect using a MySQL client (details above).
    -   Verify schema: `SHOW DATABASES; USE NutriChef; SHOW TABLES;`
    -   Check logs: `docker-compose logs db`.
-   **Backend (`backend` service):**
    -   Check logs: `docker-compose logs backend`. Look for database connection success and Flask server startup messages.
-   **Frontend (`frontend` service):**
    -   Access `http://localhost:3000` in your browser.
    -   Test API interaction (e.g., login) and check browser developer console (Network tab) for successful API calls to the backend.
    -   Check logs: `docker-compose logs frontend`.

#### Viewing Logs
To view the logs for all services:
```bash
docker-compose logs
```
To view logs for a specific service (e.g., `backend`):
```bash
docker-compose logs backend
```
To follow the logs in real-time:
```bash
docker-compose logs -f backend
```

#### Stopping and Cleaning Up
1.  **Stop Services:**
    If running in the foreground, press `Ctrl+C`. If in detached mode (`-d`), use:
    ```bash
    docker-compose down
    ```
2.  **Stop Services and Remove Containers, Networks, and Volumes:**
    To also remove the named volume for the database (e.g., `mysql_data`, which **deletes all database data**), use:
    ```bash
    docker-compose down -v
    ```
    **Caution:** Using `-v` with `down` permanently deletes data stored in Docker volumes.

#### Development Workflow with Docker
-   **Live Reloading**: `docker-compose.yml` is often configured with volume mounts mapping your local code directories into the containers (e.g., `./backend:/app`, `./frontend_tailwind/src:/app/src`).
    -   **Backend (Flask):** Flask's development server usually reloads on Python code changes.
    -   **Frontend (Vite):** Vite's dev server supports Hot Module Replacement (HMR) for automatic browser updates on code changes.
-   **Rebuilding Images**: If you change dependencies (`requirements.txt`, `package.json`) or modify Dockerfiles, rebuild the images:
    ```bash
    docker-compose build
    # or incorporate with up
    docker-compose up --build 
    ```

#### Troubleshooting Common Docker Issues
-   **Port Conflicts:** If ports `3000`, `5000`, or `3308` are in use, change host-side port mappings in `docker-compose.yml` (e.g., `"3001:3000"`).
-   **Database Connection Issues (Backend in Docker):**
    -   Verify `DB_HOST=db`, `DB_USER`, `DB_PASS`, `DB_NAME` in the root `.env` file.
    -   Ensure the `backend` service `depends_on` the `db` service in `docker-compose.yml`.
    -   Check `docker-compose logs backend` for errors.
-   **Frontend API Proxy Issues:**
    -   Ensure `nginx.conf` (for frontend service) correctly proxies to `http://backend:5000/api/` and `http://backend:5000/static/`.
    -   Check browser console and `docker-compose logs frontend`.
-   **"No space left on device" errors:** Prune unused Docker resources: `docker system prune -a --volumes` (Caution: removes unused data).

## 📚 Documentation

For more detailed information about the project architecture, features, and how to use the application, please refer to the following documents:

*   [**Project Documentation**](./docs/Project_Documentation.md): Provides a comprehensive overview of the project's scope, architecture, technical details, API endpoints, and AI model integrations.
*   [**User Manual**](./docs/User_Manual.md): A detailed guide for end-users and administrators on how to use NutriChef's features.

## Running Tests (Backend)

1.  Navigate to the `backend` directory.
2.  Ensure your test database is configured (if different from development) via environment variables (e.g., in your local `backend/.env` or shell environment).
3.  Run:
    ```bash
    pytest
    ```
    (If running tests inside Docker, you would typically execute a command within the backend container: `docker-compose exec backend pytest`)

## 🔗 Connect With Us

Find us on other platforms:

*   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" width="20" alt="GitHub logo" />  [GitHub](https://github.com/HimanM)
*   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-plain.svg" width="20" alt="Facebook logo" />  [Facebook](https://www.facebook.com/himan.manduja.543/)
