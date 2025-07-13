from ..db import db
from ..models.user_favorite_recipe import UserFavoriteRecipe
from ..models.recipe import Recipe
from ..models.user import User
from sqlalchemy.orm import joinedload
from sqlalchemy import and_, func

class FavoritesDAO:
    def __init__(self):
        pass
    
    def add_favorite(self, user_id: int, recipe_id: int):
        """Add a recipe to user's favorites"""
        try:
            # Check if already favorited
            existing = UserFavoriteRecipe.query.filter_by(
                UserID=user_id, 
                RecipeID=recipe_id
            ).first()
            
            if existing:
                return False, "Recipe is already in favorites"
            
            # Add new favorite
            favorite = UserFavoriteRecipe(UserID=user_id, RecipeID=recipe_id)
            db.session.add(favorite)
            db.session.commit()
            return True, None
            
        except Exception as e:
            db.session.rollback()
            return False, str(e)
    
    def remove_favorite(self, user_id: int, recipe_id: int):
        """Remove a recipe from user's favorites"""
        try:
            favorite = UserFavoriteRecipe.query.filter_by(
                UserID=user_id, 
                RecipeID=recipe_id
            ).first()
            
            if not favorite:
                return False, "Recipe is not in favorites"
            
            db.session.delete(favorite)
            db.session.commit()
            return True, None
            
        except Exception as e:
            db.session.rollback()
            return False, str(e)
    
    def is_recipe_favorited(self, user_id: int, recipe_id: int):
        """Check if a recipe is favorited by user"""
        favorite = UserFavoriteRecipe.query.filter_by(
            UserID=user_id, 
            RecipeID=recipe_id
        ).first()
        return favorite is not None
    
    def get_user_favorite_recipe_ids(self, user_id: int):
        """Get list of recipe IDs that user has favorited"""
        favorites = UserFavoriteRecipe.query.filter_by(UserID=user_id).all()
        return [fav.RecipeID for fav in favorites]
    
    def get_user_favorites_paginated(self, user_id: int, page=1, limit=12, search=None):
        """Get paginated user favorite recipes with optional search"""
        try:
            # Build query for recipes that are favorited by the user
            query = db.session.query(Recipe).join(
                UserFavoriteRecipe, 
                Recipe.RecipeID == UserFavoriteRecipe.RecipeID
            ).filter(
                UserFavoriteRecipe.UserID == user_id
            ).options(
                joinedload(Recipe.author)
            )
            
            # Add search filter if provided
            if search and search.strip():
                search_term = f"%{search.strip()}%"
                query = query.filter(
                    db.or_(
                        Recipe.Title.ilike(search_term),
                        Recipe.Description.ilike(search_term)
                    )
                )
            
            # Simple order by recipe ID for now
            query = query.order_by(Recipe.RecipeID.desc())
            
            # Paginate
            paginated_favorites = query.paginate(
                page=page, 
                per_page=limit, 
                error_out=False
            )
            
            return paginated_favorites
            
        except Exception as e:
            print(f"Error in get_user_favorites_paginated: {e}")
            # Return empty pagination result
            return Recipe.query.filter_by(RecipeID=-1).paginate(
                page=page, 
                per_page=limit, 
                error_out=False
            )
    
    def get_favorite_count_for_recipe(self, recipe_id: int):
        """Get count of users who favorited this recipe"""
        return UserFavoriteRecipe.query.filter_by(RecipeID=recipe_id).count()
    
    def get_user_favorite_count(self, user_id: int):
        """Get count of recipes favorited by user"""
        return UserFavoriteRecipe.query.filter_by(UserID=user_id).count()
    
    def get_most_favorited_recipes(self, limit=10):
        """Get most favorited recipes across all users"""
        try:
            # Query to count favorites per recipe
            favorite_counts = db.session.query(
                UserFavoriteRecipe.RecipeID,
                func.count(UserFavoriteRecipe.FavoriteID).label('favorite_count')
            ).group_by(
                UserFavoriteRecipe.RecipeID
            ).subquery()
            
            # Join with recipes and order by favorite count
            query = db.session.query(Recipe).join(
                favorite_counts,
                Recipe.RecipeID == favorite_counts.c.RecipeID
            ).options(
                joinedload(Recipe.author),
                joinedload(Recipe.tag_assignments).joinedload('tag')
            ).order_by(
                favorite_counts.c.favorite_count.desc()
            ).limit(limit)
            
            return query.all()
            
        except Exception as e:
            print(f"Error in get_most_favorited_recipes: {e}")
            return []
