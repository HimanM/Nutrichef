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
import warnings
import logging

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
warnings.filterwarnings('ignore')
logging.getLogger('tensorflow').setLevel(logging.ERROR)

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

app = Flask(__name__, static_folder='static', static_url_path='/static')
app.config.from_object(Config)
app.extensions = {}

app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "your-super-secret-jwt-key-fallback")
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

with app.app_context():
    initialize_chatbot_service()

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
    app.run(debug=True)
