from .user_routes import user_bp
from .recipe_routes import recipe_bp
from .meal_planner_routes import meal_planner_bp
from .shopping_list_routes import shopping_list_bp
from .classification_routes import classification_bp
from .substitution_routes import substitute_bp
from .admin_routes import admin_bp
from .ingredient_routes import ingredient_bp
from .pantry_routes import pantry_bp
from .contact_message_routes import contact_message_bp

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
