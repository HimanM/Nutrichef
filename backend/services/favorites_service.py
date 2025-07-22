from ..dao.favorites_dao import FavoritesDAO
from ..dao.recipe_dao import RecipeDAO

class FavoritesService:
    def __init__(self):
        self.favorites_dao = FavoritesDAO()
        self.recipe_dao = RecipeDAO()
    
    def toggle_favorite(self, user_id: int, recipe_id: int):
        """Toggle favorite status and return new status"""
        try:
            # Check if recipe exists
            recipe = self.recipe_dao.get_recipe_by_id(recipe_id)
            if not recipe:
                return False, "Recipe not found"
            
            # Check current status
            is_currently_favorited = self.favorites_dao.is_recipe_favorited(user_id, recipe_id)
            
            if is_currently_favorited:
                success, error = self.favorites_dao.remove_favorite(user_id, recipe_id)
                if success:
                    return False, None  # No longer favorited
                else:
                    return None, error
            else:
                success, error = self.favorites_dao.add_favorite(user_id, recipe_id)
                if success:
                    return True, None  # Now favorited
                else:
                    return None, error
                    
        except Exception as e:
            return None, str(e)
    
    def add_favorite(self, user_id: int, recipe_id: int):
        """Add a recipe to user's favorites"""
        try:
            # Check if recipe exists
            recipe = self.recipe_dao.get_recipe_by_id(recipe_id)
            if not recipe:
                return False, "Recipe not found"
            
            return self.favorites_dao.add_favorite(user_id, recipe_id)
            
        except Exception as e:
            return False, str(e)
    
    def remove_favorite(self, user_id: int, recipe_id: int):
        """Remove a recipe from user's favorites"""
        try:
            return self.favorites_dao.remove_favorite(user_id, recipe_id)
            
        except Exception as e:
            return False, str(e)
    
    def is_recipe_favorited(self, user_id: int, recipe_id: int):
        """Check if a recipe is favorited by user"""
        try:
            return self.favorites_dao.is_recipe_favorited(user_id, recipe_id)
        except Exception as e:
            print(f"Error checking favorite status: {e}")
            return False
    
    def get_user_favorite_recipe_ids(self, user_id: int):
        """Get list of recipe IDs that user has favorited"""
        try:
            return self.favorites_dao.get_user_favorite_recipe_ids(user_id)
        except Exception as e:
            print(f"Error getting user favorite IDs: {e}")
            return []
    
    def get_user_favorites(self, user_id: int, page=1, limit=12, search=None):
        """Get paginated user favorite recipes with optional search"""
        try:
            paginated_favorites = self.favorites_dao.get_user_favorites_paginated(
                user_id, page=page, limit=limit, search=search
            )
            
            # Enhance recipes with additional data
            for recipe in paginated_favorites.items:
                # Add average rating
                avg_rating = self.recipe_dao.get_average_rating_for_recipe(recipe.RecipeID)
                recipe.average_rating = avg_rating
                
                # Mark as favorited (we know they're all favorited in this context)
                recipe.is_favorited = True
            
            # Format response
            recipes_data = [recipe.to_dict_summary() for recipe in paginated_favorites.items]
            
            return {
                "recipes": recipes_data,
                "pagination": {
                    "page": paginated_favorites.page,
                    "pages": paginated_favorites.pages,
                    "per_page": paginated_favorites.per_page,
                    "total": paginated_favorites.total,
                    "has_next": paginated_favorites.has_next,
                    "has_prev": paginated_favorites.has_prev
                }
            }, None, 200
            
        except Exception as e:
            print(f"Error getting user favorites: {e}")
            return None, {"error": "Failed to retrieve favorite recipes"}, 500
    
    def get_favorite_count_for_recipe(self, recipe_id: int):
        """Get count of users who favorited this recipe"""
        try:
            return self.favorites_dao.get_favorite_count_for_recipe(recipe_id)
        except Exception as e:
            print(f"Error getting favorite count for recipe: {e}")
            return 0
    
    def get_user_favorite_count(self, user_id: int):
        """Get count of recipes favorited by user"""
        try:
            return self.favorites_dao.get_user_favorite_count(user_id)
        except Exception as e:
            print(f"Error getting user favorite count: {e}")
            return 0
    
    def get_most_favorited_recipes(self, limit=10):
        """Get most favorited recipes across all users"""
        try:
            recipes = self.favorites_dao.get_most_favorited_recipes(limit)
            
            # Enhance with additional data
            enhanced_recipes = []
            for recipe in recipes:
                # Add average rating
                avg_rating = self.recipe_dao.get_average_rating_for_recipe(recipe.RecipeID)
                recipe.average_rating = avg_rating
                
                # Add favorite count
                favorite_count = self.get_favorite_count_for_recipe(recipe.RecipeID)
                recipe.favorite_count = favorite_count
                
                enhanced_recipes.append(recipe.to_dict_summary())
            
            return enhanced_recipes, None, 200
            
        except Exception as e:
            print(f"Error getting most favorited recipes: {e}")
            return [], {"error": "Failed to retrieve popular recipes"}, 500
