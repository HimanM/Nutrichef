from backend.models import RecipeRating # Import RecipeRating model using relative import
from backend.db import db # Import db instance using relative import

class RecipeRatingDAO:
    def add_rating(self, recipe_id, user_id, rating):
        existing_rating = self.get_rating_by_user_and_recipe(recipe_id, user_id)
        if existing_rating:
            existing_rating.Rating = rating
            return existing_rating
        else:
            new_rating = RecipeRating(
                RecipeID=recipe_id,
                UserID=user_id,
                Rating=rating
            )
            db.session.add(new_rating)
            return new_rating

    def get_rating_by_user_and_recipe(self, recipe_id, user_id):
        return RecipeRating.query.filter_by(RecipeID=recipe_id, UserID=user_id).first()

    def get_ratings_for_recipe(self, recipe_id):
        return RecipeRating.query.filter_by(RecipeID=recipe_id).all()

    def get_average_rating_for_recipe(self, recipe_id):
        avg_rating = db.session.query(db.func.avg(RecipeRating.Rating)).filter_by(RecipeID=recipe_id).scalar()
        return float(avg_rating) if avg_rating is not None else 0.0
