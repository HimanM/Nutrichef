from backend.db import db
from backend.models.meal_plan import UserMealPlan
from sqlalchemy.exc import SQLAlchemyError
import json

class MealPlannerDAO:
    def get_meal_plan_by_user_id(self, user_id: int):
        """
        Retrieves a user's meal plan by their user ID.
        Returns the UserMealPlan model instance if found, else None.
        """
        try:
            return UserMealPlan.query.filter_by(UserID=user_id).first()
        except SQLAlchemyError as e:
            print(f"Error fetching meal plan for user_id {user_id}: {e}")
            return None

    def save_or_update_meal_plan(self, user_id: int, meal_plan_data: dict):
        """
        Saves a new meal plan or updates an existing one for a user.
        meal_plan_data is a Python dictionary. The model's JSON type handles conversion.
        Returns the UserMealPlan model instance or None if an error occurs.
        """
        try:
            existing_plan = self.get_meal_plan_by_user_id(user_id)

            if existing_plan:
                existing_plan.MealPlanData = meal_plan_data
                db.session.add(existing_plan)
                return existing_plan
            else:
                new_plan = UserMealPlan(
                    UserID=user_id,
                    MealPlanData=meal_plan_data
                )
                db.session.add(new_plan)
                return new_plan
        except SQLAlchemyError as e:
            print(f"Error saving/updating meal plan for user_id {user_id}: {e}")
            return None
