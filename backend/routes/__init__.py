from backend.routes.user_routes import user_bp
from backend.routes.recipe_routes import recipe_bp
from backend.routes.meal_planner_routes import meal_planner_bp
from backend.routes.shopping_list_routes import shopping_list_bp
from backend.routes.classification_routes import classification_bp
from backend.routes.substitution_routes import substitute_bp
from backend.routes.admin_routes import admin_bp
from backend.routes.ingredient_routes import ingredient_bp
from backend.routes.pantry_routes import pantry_bp
from backend.routes.contact_message_routes import contact_message_bp

__all__ = [
    'user_bp',
    'recipe_bp',
    'meal_planner_bp',
    'shopping_list_bp',
    'classification_bp',
    'substitute_bp',
    'admin_bp',
    'ingredient_bp',
    'food_lookup_bp',
    'pantry_bp',
    'contact_message_bp'
]
