from backend.models.user import User
from backend.models.ingredient import Ingredient
from backend.models.recipe import Recipe
from backend.models.recipe_ingredient import RecipeIngredient
from backend.models.classification_result import ClassificationResult
from backend.models.allergy_intolerance import AllergyIntolerance, UserAllergy
from backend.models.meal_plan import UserMealPlan
from backend.models.user_pantry_ingredient import UserPantryIngredient
from backend.models.contact_message import ContactMessage
from backend.models.recipe_rating import RecipeRating
from backend.models.user_favorite_recipe import UserFavoriteRecipe
from backend.models.recipe_tag import RecipeTag, RecipeTagAssignment
from backend.models.recipe_comment import RecipeComment
from backend.models.forum_post import ForumPost
from backend.models.forum_comment import ForumComment
from backend.models.forum_like import ForumLike
from backend.models.forum_post_tag import ForumPostTag

__all__ = [
    'User',
    'Ingredient',
    'Recipe',
    'RecipeIngredient',
    'ClassificationResult',
    'AllergyIntolerance',
    'UserAllergy',
    'UserMealPlan',
    'UserPantryIngredient',
    'ContactMessage',
    'RecipeRating',
    'UserFavoriteRecipe',
    'RecipeTag',
    'RecipeTagAssignment',
    'RecipeComment',
    'ForumPost',
    'ForumComment',
    'ForumLike',
    'ForumPostTag'
]
