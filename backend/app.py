from flask import Flask, jsonify
from .db import db
from .config import Config
from . import models
from .models import User, Recipe, Ingredient, RecipeIngredient, Substitution, ClassificationResult, UserMealPlan
from .dao import UserDAO, IngredientDAO, RecipeDAO
from .services import UserService, RecipeService
from flask_jwt_extended import JWTManager, get_jwt_identity
from flask_mail import Mail
import os
import signal
import sys
import atexit
from datetime import timedelta
from .utils.logging_utils import suppress_external_warnings, log_header, log_info
from .utils.log_monitor import log_monitor

# Suppress warnings before other imports
suppress_external_warnings()

from .routes.user_routes import user_bp
from .routes.recipe_routes import recipe_bp
from .routes.meal_planner_routes import meal_planner_bp
from .routes.shopping_list_routes import shopping_list_bp
from .routes.classification_routes import classification_bp
from .routes.substitution_routes import substitute_bp
from .routes.admin_routes import admin_bp
from .routes.ingredient_routes import ingredient_bp
from .routes.nlp_routes import nlp_bp
from .routes.allergy_routes import allergy_bp
from .routes.personalized_recipe_routes import personalized_recipe_bp
from .routes.nutrition_routes import nutrition_bp
from .routes.food_lookup_routes import food_lookup_bp
from .routes.chatbot_routes import chatbot_bp, initialize_chatbot_service
from .routes.pantry_routes import pantry_bp
from .routes.contact_message_routes import contact_message_bp
from .routes.favorites_routes import favorites_bp
from .routes.tags_routes import tags_bp

log_header("Application Startup")
app = Flask(__name__, 
           static_folder='static', 
           static_url_path='/static',
           template_folder='templates')
log_info("Flask app initialized with template folder.", "Startup")

# Setup log monitoring for Flask
log_monitor.setup_flask_logging(app)
log_info("Log monitoring initialized.", "Startup")

app.config.from_object(Config)
log_info("Configuration loaded from object.", "Startup")
app.extensions = {}

app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "your-super-secret-jwt-key-fallback")
# # Set JWT access token to expire in 1 minute for testing
# app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=1)

app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)  # Set JWT access token to expire in 7 days
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=7)  # Set
jwt = JWTManager(app)

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"error": "Token has expired"}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error_string):
    return jsonify({"error": "Invalid token"}), 422

@jwt.unauthorized_loader
def missing_token_callback(error_string):
    return jsonify({"error": "Missing access token"}), 401

@jwt.revoked_token_loader
def revoked_token_callback(jwt_header, jwt_payload):
    return jsonify({"error": "Token has been revoked"}), 401

@jwt.needs_fresh_token_loader
def needs_fresh_token_callback(jwt_header, jwt_payload):
    return jsonify({"error": "Fresh token required"}), 401

db.init_app(app)
mail = Mail(app)

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    print(f"DEBUG: user_lookup_callback - JWT Header: {_jwt_header}", flush=True)
    print(f"DEBUG: user_lookup_callback - JWT Data: {jwt_data}", flush=True)
    identity = jwt_data["sub"]
    print(f"DEBUG: user_lookup_callback - Identity (sub) from JWT: {identity}, type: {type(identity)}", flush=True)

    user_dao = UserDAO()
    user = None
    try:
        user_id_int = int(identity)
        user = user_dao.get_user_by_id(user_id_int)
        print(f"DEBUG: user_lookup_callback - User loaded after int conversion: {user}", flush=True)
        if user:
             print(f"DEBUG: user_lookup_callback - UserID: {user.UserID}, type: {type(user.UserID)}", flush=True)
    except ValueError:
        print(f"DEBUG: user_lookup_callback - ValueError: Could not convert identity '{identity}' to int.", flush=True)

    return user

app.register_blueprint(user_bp)
app.register_blueprint(recipe_bp)
app.register_blueprint(meal_planner_bp)
app.register_blueprint(shopping_list_bp)
app.register_blueprint(classification_bp)
app.register_blueprint(substitute_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(ingredient_bp)
app.register_blueprint(nlp_bp)
app.register_blueprint(allergy_bp)
app.register_blueprint(personalized_recipe_bp)
app.register_blueprint(nutrition_bp)
app.register_blueprint(food_lookup_bp)
app.register_blueprint(chatbot_bp)
app.register_blueprint(pantry_bp)
app.register_blueprint(contact_message_bp)
app.register_blueprint(favorites_bp)
app.register_blueprint(tags_bp)

with app.app_context():
    log_header("Service Initialization")
    initialize_chatbot_service()
    log_header("Service Initialization Complete")

def graceful_shutdown():
    """Perform cleanup tasks before shutting down the application."""
    log_info("Initiating graceful shutdown...", "Shutdown")
    try:
        # Cleanup any background services or tasks here
        # Add any other cleanup tasks specific to your application
        log_info("Background services cleaned up.", "Shutdown")
    except Exception as e:
        log_info(f"Error during service cleanup: {e}", "Shutdown")
    
    log_info("Graceful shutdown complete.", "Shutdown")

def signal_handler(signum, frame):
    """Handle termination signals gracefully."""
    signal_name = signal.Signals(signum).name
    log_info(f"Received signal {signal_name} ({signum}). Shutting down gracefully...", "Shutdown")
    graceful_shutdown()
    sys.exit(0)

# Register signal handlers for graceful shutdown
signal.signal(signal.SIGINT, signal_handler)   # Ctrl+C
signal.signal(signal.SIGTERM, signal_handler)  # Termination signal

# Register cleanup function to run on normal exit
atexit.register(graceful_shutdown)

@app.errorhandler(404)
def handle_not_found_error(e):
    return jsonify(error="Not Found", message="The requested URL was not found on the server."), 404

@app.route('/')
def hello_world():
    return 'Hello, World! Welcome to the Recipe App Backend!'

def init_db():
    """Drops all tables and creates new ones."""
    db.drop_all()
    db.create_all()
    print("Initialized the database and created tables.")

@app.cli.command("init-db")
def init_db_command_wrapper():
    '''Clears existing data and creates new tables.'''
    with app.app_context():
        init_db()
    print("Database initialization complete.")


@app.shell_context_processor
def make_shell_context():
    return {
        'db': db,
        'User': User,
        'Recipe': Recipe,
        'Ingredient': Ingredient,
        'RecipeIngredient': RecipeIngredient,
        'Substitution': Substitution,
        'ClassificationResult': ClassificationResult,
        'UserDAO': UserDAO,
        'IngredientDAO': IngredientDAO,
        'RecipeDAO': RecipeDAO,
        'UserService': UserService,
        'RecipeService': RecipeService
    }

if __name__ == '__main__':
    try:
        log_info("Starting Flask application...", "Startup")
        app.run(debug=True, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        log_info("Received keyboard interrupt. Shutting down...", "Shutdown")
    except Exception as e:
        log_info(f"Application error: {e}", "Error")
    finally:
        graceful_shutdown()
