from ..dao import RecipeRatingDAO # Relative import
from ..db import db # Relative import

class RecipeRatingService:
    def __init__(self):
        self.recipe_rating_dao = RecipeRatingDAO()

    def add_or_update_rating(self, recipe_id, user_id, rating):
        if not isinstance(rating, int) or not (1 <= rating <= 5):
            return None, {"error": "Rating must be an integer between 1 and 5"}, 400

        try:
            rating_obj = self.recipe_rating_dao.add_rating(recipe_id, user_id, rating)
            db.session.commit()
            avg_rating = self.recipe_rating_dao.get_average_rating_for_recipe(recipe_id)
            return {
                "user_rating": rating_obj.to_dict(),
                "average_rating": avg_rating
            }, None, 200
        except Exception as e:
            db.session.rollback()
            print(f"Error in add_or_update_rating: {e}")
            return None, {"error": "Failed to add or update rating"}, 500

    def get_user_rating_for_recipe(self, recipe_id, user_id):
        try:
            rating_obj = self.recipe_rating_dao.get_rating_by_user_and_recipe(recipe_id, user_id)
            if not rating_obj:
                return None, {"message": "No rating found for this user and recipe"}, 404
            return rating_obj.to_dict(), None, 200
        except Exception as e:
            print(f"Error in get_user_rating_for_recipe: {e}")
            return None, {"error": "Failed to retrieve user rating"}, 500

    def get_average_rating_for_recipe(self, recipe_id):
        try:
            avg_rating = self.recipe_rating_dao.get_average_rating_for_recipe(recipe_id)
            return {"average_rating": avg_rating}, None, 200
        except Exception as e:
            print(f"Error in get_average_rating_for_recipe: {e}")
            return None, {"error": "Failed to retrieve average rating"}, 500
