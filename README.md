# NutriChef: Your Intelligent Recipe and Nutrition Companion

[![Deploy to VPS on push](https://github.com/HimanM/Nutrichef/actions/workflows/main.yml/badge.svg)](https://github.com/HimanM/Nutrichef/actions/workflows/main.yml)


NutriChef is a comprehensive web application designed to help users manage recipes, understand nutritional information, cater to dietary restrictions and allergies, and discover new culinary ideas. It leverages AI for advanced features like food classification from images, natural language processing of recipes, and personalized recommendations.

<p align="center">
  <img src="./docs/images/logo.png" alt="NutriChef Logo" width="300"/>
</p>

NutriChef combines modern web technologies with AI-powered features to provide an intelligent cooking companion that adapts to your dietary needs and preferences.

## 📱 Application Overview

| Feature | Desktop Screenshot | Mobile Screenshot |
|---------|-------------------|------------------|
| **Home Page** | ![NutriChef Home Page](./docs/images/homepage_screenshot.png) | ![Home Page Mobile](./docs/images/home_page_mobile.png) |

## ✨ Core Features

### 👤 User Features

#### 🔐 Account Management

| Feature | Desktop Screenshot | Mobile Screenshot |
|---------|-------------------|------------------|
| **Login & Registration** | ![User Login Page](./docs/images/user_login_screenshot.png) | ![User Login Mobile](./docs/images/user_login_screenshot_mobile.png) |

#### 🍳 Recipe Management
- **Browse & Search** public recipe collection with advanced filters
- **Detailed Recipe Views** with ingredients, instructions, and images
- **Multiple Upload Methods:**
  - Structured form submission
  - Raw text parsing with AI (NLP Recipe Parser)
  - Image upload support
- **Recipe Rating System** with user reviews
- **Recipe Comments** for community interaction
- **Recipe Tagging System** for better organization

| Feature | Screenshot |
|---------|------------|
| **Recipe Browser** | ![Recipe Browser Page](./docs/images/recipe_browser_screenshot.png) |
| **Recipe Details** | ![Recipe Detail Page](./docs/images/recipe_detail_screenshot.png) |
| **Recipe Upload** | ![Recipe Upload Form](./docs/images/recipe_upload_screenshot.png) |

#### 🎯 Personalization & Dietary Management
- **Personalized Recipe Feed** filtered by dietary restrictions
- **Allergy & Intolerance Management** with comprehensive database
- **Nutritional Target Setting** for health goals
- **Favorites System** for saving preferred recipes

| Feature | Screenshot |
|---------|------------|
| **Personalized Recipes** | ![Personalized Recipes Page](./docs/images/personalized_recipes_screenshot.png) |
| **Allergy Settings** | ![User Allergy Settings](./docs/images/allergy_settings_screenshot.png) |

#### 🏠 Kitchen Management
- **Smart Pantry Management** with ingredient tracking
- **Meal Planning** with nutritional analysis and PDF export
- **Shopping List Generation** from recipes and meal plans
- **Recipe Suggestions** based on available ingredients

| Feature | Screenshot |
|---------|------------|
| **Pantry Management** | ![User Pantry Page](./docs/images/pantry_page_screenshot.png) |
| **Meal Planner** | ![Meal Planner](./docs/images/meal_planner_screenshot.png) |

#### 🤖 AI-Powered Tools
- **Ingredient Classifier** using computer vision for food identification
- **Nutrition Lookup** with comprehensive nutritional database
- **Ingredient Substitution** recommendations
- **AI Chatbot** for cooking and nutrition assistance
- **Recipe Text Parser** using natural language processing

| Feature | Screenshot |
|---------|------------|
| **Ingredient Classifier** | ![Ingredient Classifier Page](./docs/images/classifier_screenshot.png) |
| **Classification Results** | ![Classification Result Example](./docs/images/classifier_result_screenshot.png) |
| **Nutrition Lookup** | ![Nutrition Lookup Result](./docs/images/nutrition_lookup_screenshot.png) |
| **AI Chatbot** | ![AI Chatbot](./docs/images/chatbot_screenshot.png) |

#### 💬 Community Features
- **Forum System** with recipe discussions and community posts
- **Recipe Tagging** with `#RecipeName` syntax
- **User Comments** on recipes and forum posts
- **Like System** for community engagement
- **Contact Form** for user feedback and support

| Feature | Screenshot |
|---------|------------|
| **Contact Us** | ![Contact Us Page](./docs/images/contact_us_screenshot.png) |
| **Forum Discussions** | ![Forum Management](./docs/images/forum_management.png) |
| **Recipe Suggestions** | ![Recipe Suggestions Page](./docs/images/recipe_suggestions_page.png) |
| **Shopping Basket** | ![Shopping Basket Interface](./docs/images/shopping_basket_interface.png) |
| **Nutritional Tracking** | ![Nutritional Tracking Dashboard](./docs/images/nutritional_tracking_dashboard.png) |
| **User Favorites** | ![User Favorites Page](./docs/images/user_favorites.png) |

### 🛡️ Administrator Features

#### 📊 Dashboard & Analytics
- **Comprehensive Admin Dashboard** with system overview
- **Real-time System Monitoring** with performance metrics
- **AI Model Performance Tracking** for classification accuracy
- **User Activity Analytics** and engagement metrics

| Feature | Screenshot |
|---------|------------|
| **Admin Dashboard** | ![Admin Dashboard Page](./docs/images/admin_dashboard_screenshot.png) |


#### 👥 User & Content Management
- **User Management** with role assignment and account control
- **Recipe Moderation** with approval and deletion capabilities
- **Forum Management** with post and comment moderation
- **Content Analytics** for platform insights

#### 📧 Communication & Support
- **Message Management** for user inquiries and support
- **Email Response System** for customer service
- **Notification System** for user engagement

| Feature | Screenshot |
|---------|------------|
| **Message Management** | ![Admin Reply Messages Page](./docs/images/admin_messages_screenshot_2.png) |
| **System Logs Monitor** | ![System Logs Monitor](./docs/images/system_logs_monitor.png) |
| **User Management** | ![User Management Interface](./docs/images/user_management.png) |
| **Recipe Management** | ![Recipe Management Interface](./docs/images/recipe_management.png) |
| **Forum Management** | ![Forum Administration Interface](./docs/images/forum_management.png) |

---

#### 🔧 System Administration
- **Real-time Log Monitoring** with filtering and search
- **System Health Checks** with automated alerts
- **Database Management** tools and utilities
- **Performance Optimization** monitoring

> [!NOTE]
> Admin features require elevated permissions and are protected by role-based access control.


## 🛠️ Technology Stack

### Backend Technologies

| Category | Technology | Description |
|----------|------------|-------------|
| **Framework** | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg" height="20" alt="Flask logo" /> Flask | Python web framework for RESTful API development |
| **Language** | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" height="20" alt="Python logo" /> Python 3.9+ | Core programming language |
| **Database** | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" height="20" alt="MySQL logo" /> MySQL | Relational database with SQLAlchemy ORM |
| **Authentication** | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/json/json-original.svg" height="20" alt="JWT logo" /> JWT | Flask-JWT-Extended for secure authentication |
| **Email Service** | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" height="20" alt="email logo" /> Flask-Mail | Email verification and notifications |

### AI & Machine Learning

| Technology | Purpose | Implementation |
|------------|---------|----------------|
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg" height="20" alt="Google Gemini logo" /> **Google Gemini** | Natural Language Processing | Recipe text parsing and chatbot responses |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg" height="20" alt="TensorFlow logo" /> **TensorFlow** | Computer Vision | Food and ingredient image classification |
| **Spacy** | NLP Processing | Text analysis and entity extraction |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg" height="20" alt="Pandas logo" /> **Pandas** | Data Processing | Nutritional data manipulation and analysis |
| **RapidFuzz** | String Matching | Ingredient substitution and fuzzy search |

### Frontend Technologies

| Category | Technology | Description |
|----------|------------|-------------|
| **Framework** | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" height="20" alt="React logo" /> React 18+ | Modern UI library with hooks and context |
| **Language** | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" height="20" alt="JavaScript logo" /> JavaScript (JSX) | ES6+ with modern syntax |
| **Build Tool** | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" height="20" alt="Vite logo" /> Vite | Fast development server and build tool |
| **Styling** | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" height="20" alt="Tailwind CSS logo" /> Tailwind CSS | Utility-first CSS framework |
| **UI Components** | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/materialui/materialui-original.svg" height="20" alt="Material UI logo" /> Material UI | React component library |
| **Routing** | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/reactrouter/reactrouter-original.svg" height="20" alt="React Router logo" /> React Router | Client-side routing |
| **State Management** | React Context API | Global state management |
| **Charts** | Recharts | Data visualization and analytics |
| **PDF Generation** | jsPDF | Export functionality for meal plans |

### DevOps & Deployment

| Technology | Purpose |
|------------|---------|
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" height="20" alt="docker logo" /> **Docker** | Containerization and deployment |
| **Docker Compose** | Multi-container orchestration |
| **Nginx** | Reverse proxy and static file serving |

### Development Tools

| Tool | Purpose |
|------|---------|
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" height="20" alt="VSCode logo" /> **VS Code** | Primary development environment |
| **ESLint** | JavaScript code linting |
| **Git** | Version control |
| **Postman** | API testing and documentation |

The application is designed with a microservices architecture in mind, making it easy to scale individual components as needed.

## 🧠 AI Models & Intelligence Features

### Core AI Capabilities

| Feature | Technology | Description |
|---------|------------|-------------|
| **🔍 Food Classification** | TensorFlow + Computer Vision | Identifies ingredients and food items from uploaded images |
| **📝 Recipe Text Parsing** | Google Gemini + NLP | Converts raw recipe text into structured data |
| **🤖 Intelligent Chatbot** | Google Gemini | Provides cooking advice and nutritional guidance |
| **🔄 Ingredient Substitution** | Fuzzy Matching + Database | Suggests suitable ingredient alternatives |
| **🍎 Nutrition Analysis** | External APIs + Database | Comprehensive nutritional information lookup |
| **🎯 Allergy Detection** | Pattern Matching | Identifies potential allergens in recipes |

### Model Implementation

> [!NOTE]
> **Food Classification Models:**
> - Core models are integrated within the `backend/ai_models/` directory
> - Detailed implementation and training notebooks: [Food Classification Repository](https://github.com/HimanM/Classification-Models-for-NutriChef.git)
> - Supports multiple food categories with high accuracy rates

### AI-Powered Features

- **Smart Recipe Suggestions** based on pantry contents and dietary preferences
- **Nutritional Goal Tracking** with intelligent meal planning
- **Automated Recipe Categorization** using machine learning
- **Personalized Content Filtering** based on user preferences and restrictions
- **Real-time Ingredient Recognition** through camera integration

## 📁 Project Architecture

### Directory Structure

```
NutriChef/
├── 🗄️ SQL/                           # Database schema and migrations
│   ├── schema_mysql.sql              # Main database schema
│   └── migration_scripts/            # Database migration files
├── 🐍 backend/                       # Flask API server
│   ├── 🤖 ai_models/                 # Machine learning models
│   │   ├── classification/           # Food classification models
│   │   ├── nlp/                     # Natural language processing
│   │   └── nutrition/               # Nutrition analysis models
│   ├── 🗃️ dao/                       # Data Access Objects
│   ├── 📊 models/                    # SQLAlchemy database models
│   ├── 🛣️ routes/                     # API endpoints (Flask Blueprints)
│   │   ├── admin_routes.py          # Admin management endpoints
│   │   ├── recipe_routes.py         # Recipe CRUD operations
│   │   ├── user_routes.py           # User authentication & profile
│   │   ├── forum_routes.py          # Community forum features
│   │   ├── chatbot_routes.py        # AI chatbot integration
│   │   ├── classification_routes.py  # Image classification API
│   │   ├── nutrition_routes.py      # Nutrition lookup services
│   │   ├── pantry_routes.py         # Pantry management
│   │   ├── meal_planner_routes.py   # Meal planning features
│   │   └── contact_message_routes.py # User support system
│   ├── 🔧 services/                  # Business logic layer
│   │   ├── main/                    # Core services
│   │   ├── ai/                      # AI service integrations
│   │   └── external/                # Third-party API services
│   ├── 🛠️ utils/                     # Utility functions and helpers
│   ├── 📁 static/                    # Uploaded files and assets
│   ├── 🧪 tests/                     # Backend test suites
│   ├── app.py                       # Flask application factory
│   ├── config.py                    # Configuration management
│   └── requirements.txt             # Python dependencies
├── ⚛️ frontend/                      # React client application
│   ├── 📱 src/
│   │   ├── 🧩 components/            # Reusable UI components
│   │   │   ├── admin/               # Admin-specific components
│   │   │   ├── auth/                # Authentication components
│   │   │   ├── forum/               # Forum and community features
│   │   │   ├── chatbot/             # AI chatbot interface
│   │   │   ├── ui/                  # Generic UI components
│   │   │   └── layout/              # Layout and navigation
│   │   ├── 📄 pages/                 # Route-level page components
│   │   │   ├── admin/               # Admin dashboard pages
│   │   │   ├── forum/               # Forum pages
│   │   │   └── recipes/             # Recipe-related pages
│   │   ├── 🔄 context/               # React Context providers
│   │   ├── 🎣 hooks/                 # Custom React hooks
│   │   ├── 🛠️ utils/                 # Frontend utilities
│   │   └── 🎨 styles/                # CSS and styling
│   ├── package.json                 # NPM dependencies
│   └── vite.config.js              # Vite build configuration
├── 🚀 deployment/                    # Deployment configurations
│   ├── VPS_DEPLOYMENT_GUIDE.md      # VPS deployment instructions
│   ├── EXTERNAL_ACCESS_GUIDE.md     # External access setup
│   ├── PUBLIC_ACCESS_GUIDE.md       # Public deployment guide
│   └── vps-setup.sh                # Automated VPS setup script
├── 📚 docs/                          # Project documentation
│   ├── 🖼️ images/                    # Screenshots and diagrams
│   ├── 📋 internal/                  # Internal documentation
│   ├── Project_Documentation.md     # Technical documentation
│   ├── User_Manual.md              # End-user guide
│   ├── Forum_Feature_Implementation.md
│   ├── Meal_Suggestion_Implementation.md
│   ├── Nutritional_Tracking_Feature.md
│   ├── Session_Expiration_Management.md
│   ├── Admin_Logs_Monitor.md
│   └── MobileModal_Animation_Updates.md
├── 🔧 scripts/                       # Development and deployment scripts
│   ├── main.py                      # Cross-platform launcher
│   ├── start_demo.bat              # Windows demo launcher
│   └── LAUNCHER_README.md          # Launcher documentation
├── docker-compose.yml              # Multi-container orchestration
├── .env.example                    # Environment variables template
└── README.md                       # This file
```

### Key Architecture Patterns

| Pattern | Implementation | Benefits |
|---------|----------------|----------|
| **MVC Architecture** | Models (SQLAlchemy), Views (React), Controllers (Flask Routes) | Clear separation of concerns |
| **Service Layer** | Business logic abstracted into service classes | Reusable and testable code |
| **Repository Pattern** | Data Access Objects (DAOs) for database operations | Database abstraction |
| **Component-Based UI** | React components with props and state management | Reusable and maintainable frontend |
| **RESTful API Design** | Consistent HTTP methods and resource naming | Standard API conventions |

The architecture follows modern web development best practices with clear separation between frontend, backend, and data layers.

## 🚀 Quick Start Guide

### Option 1: Automated Demo Launcher (Recommended)

The fastest way to get NutriChef running locally:

```bash
# Cross-platform Python launcher
python scripts/main.py

# Windows users can also use:
scripts/start_demo.bat
```

The automated launcher handles all dependencies, environment setup, and service orchestration automatically.

> [!TIP]
> This is the fastest way to get started with NutriChef. The launcher automatically detects your system configuration and sets up everything needed for development.

### Option 2: Docker Deployment (Production-Ready)

```bash
# Clone the repository
git clone https://github.com/HimanM/nutrichef.git
cd nutrichef

# Configure environment variables
cp .env.example .env
# Edit .env with your specific configurations

# Start all services
docker-compose up --build
```

### Option 3: Manual Development Setup

For developers who want full control over the setup process:

```bash
# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
flask run

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

> [!IMPORTANT]
> For production deployment, please refer to our comprehensive [deployment guides](./deployment/) which cover VPS setup, security configurations, and scaling considerations.

## 🔧 Detailed Setup Instructions

### Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| **Python** | 3.9+ | Backend API server |
| **Node.js** | 16+ | Frontend development and build |
| **npm/yarn** | Latest | Package management |
| **MySQL** | 8.0+ | Database server |
| **Docker** | 20+ (optional) | Containerized deployment |
| **Git** | Latest | Version control |

> [!WARNING]
> Ensure all prerequisites are installed and properly configured before proceeding with the setup.

### 💻 Local Development Setup

#### Step 1: Backend Setup (Flask API)

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

#### Step 2: Environment Configuration

Create and configure your environment variables:

```bash
# Copy environment template
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your configurations:

```env
# Database Configuration
DATABASE_URL=mysql+mysqlconnector://user:password@localhost/nutrichef
DB_HOST=localhost
DB_NAME=nutrichef
DB_USER=your_username
DB_PASS=your_password

# Security
JWT_SECRET_KEY=your-super-secret-jwt-key-here

# AI Services
GEMINI_API_KEY=your-google-gemini-api-key

# Email Configuration (for notifications)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_DEFAULT_SENDER=your-email@gmail.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

> [!IMPORTANT]
> **Required API Keys:**
> - **Google Gemini API**: Required for AI chatbot and recipe parsing
> - **Email Service**: Required for user verification and notifications

#### Step 3: Database Initialization

```bash
# Ensure MySQL is running and database exists
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS nutrichef;"

# Initialize database schema
flask init-db

# Start the Flask development server
flask run
```

The backend API will be available at `http://127.0.0.1:5000/`

#### Step 4: Frontend Setup (React + Vite)

```bash
# Navigate to frontend directory (new terminal)
cd frontend

# Install Node.js dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend will be available at `http://localhost:5173/`

#### Step 5: Verify Installation

1. **Backend Health Check**: Visit `http://127.0.0.1:5000/api/health/ping`
2. **Frontend Access**: Visit `http://localhost:5173`
3. **Database Connection**: Check backend logs for successful database connection

> [!TIP]
> **Development Workflow:**
> - Backend auto-reloads on Python file changes
> - Frontend supports hot module replacement (HMR)
> - Use browser developer tools for debugging

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

> [!IMPORTANT]
> **Important Notes on Docker `.env`:**
> - The `docker-compose.yml` file is configured to pass these environment variables from the root `.env` file to the respective services.
> - The `backend/.env` file (used for local Python development) is **not** directly used by the Dockerized backend service. Its settings must be consolidated into the **root `.env` file** for Docker Compose.
> - **Do not commit your actual root `.env` file (containing secrets) to version control.** Ensure `.env` is listed in your `.gitignore` file.

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
> [!CAUTION]
> Using `-v` with `down` permanently deletes data stored in Docker volumes.

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
-   **"No space left on device" errors:** Prune unused Docker resources: `docker system prune -a --volumes`

> [!CAUTION]
> The `docker system prune -a --volumes` command removes unused data and can delete important information.

## 📚 Comprehensive Documentation

### 📖 Core Documentation

| Document | Description | Audience |
|----------|-------------|----------|
| [**Project Documentation**](./docs/Project_Documentation.md) | Complete technical overview, architecture, and API reference | Developers, Architects |
| [**User Manual**](./docs/User_Manual.md) | End-user guide for all application features | End Users, Admins |
| [**Email Template System**](./docs/Email_Template_System.md) | Email notification system documentation | Developers |
| [**Nutritional Tracking Feature**](./docs/Nutritional_Tracking_Feature.md) | Nutritional analysis and tracking guide | Users, Developers |

### 🚀 Deployment Documentation

| Guide | Purpose | Environment |
|-------|---------|-------------|
| [**VPS Deployment Guide**](./deployment/VPS_DEPLOYMENT_GUIDE.md) | Complete VPS deployment instructions | Production |
| [**External Access Guide**](./deployment/EXTERNAL_ACCESS_GUIDE.md) | External network access configuration | Production |
| [**Public Access Guide**](./deployment/PUBLIC_ACCESS_GUIDE.md) | Public internet deployment setup | Production |
| [**VPS Setup Script**](./deployment/vps-setup.sh) | Automated deployment script | Production |

### 🔧 Feature-Specific Documentation

| Feature | Documentation | Status |
|---------|---------------|--------|
| **Forum System** | [Forum Implementation](./docs/Forum_Feature_Implementation.md) | ✅ Complete |
| **Meal Suggestions** | [Meal Suggestions](./docs/Meal_Suggestion_Implementation.md) | ✅ Complete |
| **Session Management** | [Session Expiration](./docs/Session_Expiration_Management.md) | ✅ Complete |
| **Admin Monitoring** | [Admin Logs Monitor](./docs/Admin_Logs_Monitor.md) | ✅ Complete |
| **Mobile Animations** | [Mobile Modal Updates](./docs/MobileModal_Animation_Updates.md) | ✅ Complete |

### 🛠️ Development Tools

| Tool | Documentation | Purpose |
|------|---------------|---------|
| [**Demo Launcher**](./docs/LAUNCHER_README.md) | Local development setup | Development |
| [**Scripts Guide**](./scripts/) | Automation and utility scripts | Development |
| **API Documentation** | Interactive API docs at `/api/docs` | Development |

> [!TIP]
> All documentation is kept up-to-date with the latest features and includes code examples, screenshots, and troubleshooting guides.

## 🧪 Testing

### Backend Testing

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
source venv/bin/activate  # Windows: venv\Scripts\activate

# Run all tests
pytest

# Run with coverage report
pytest --cov=. --cov-report=html

# Run specific test categories
pytest tests/test_routes/  # API endpoint tests
pytest tests/test_services/  # Business logic tests
pytest tests/test_models/  # Database model tests
```

### Frontend Testing

```bash
# Navigate to frontend directory
cd frontend

# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run end-to-end tests
npm run test:e2e
```

### Docker Testing

```bash
# Run tests in Docker environment
docker-compose exec backend pytest
docker-compose exec frontend npm test
```

Test databases are automatically configured and isolated from development data.

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 🐛 Bug Reports
- Use the [GitHub Issues](https://github.com/HimanM/nutrichef/issues) page
- Include detailed reproduction steps
- Provide system information and error logs

### 💡 Feature Requests
- Submit feature requests via GitHub Issues
- Describe the use case and expected behavior
- Include mockups or examples if applicable

### 🔧 Development Contributions
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 📝 Documentation
- Help improve documentation
- Add code examples and tutorials
- Translate documentation to other languages

> [!NOTE]
> Please read our contributing guidelines and code of conduct before submitting contributions.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Connect & Support

| Platform | Link | Purpose |
|----------|------|---------|
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" width="20" alt="GitHub logo" /> **GitHub** | [HimanM](https://github.com/HimanM) | Source code, issues, contributions |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-plain.svg" width="20" alt="Facebook logo" /> **Facebook** | [Developer Profile](https://www.facebook.com/himan.manduja.543/) | Updates and community |

## 🙏 Acknowledgments

- **Google Gemini** for AI-powered features
- **TensorFlow** community for machine learning models
- **React** and **Flask** communities for excellent frameworks
- **Open Source Contributors** who made this project possible

---

<p align="center">
  <strong>Built with ❤️ for the cooking community</strong><br>
  <em>Making healthy cooking accessible through technology</em>
</p>