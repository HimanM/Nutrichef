from ..dao.meal_planner_dao import MealPlannerDAO
from ..db import db
from sqlalchemy.exc import SQLAlchemyError
import json

class MealPlannerService:
    def __init__(self):
        self.meal_planner_dao = MealPlannerDAO()

    def get_user_meal_plan(self, user_id: int):
        """
        Retrieves a user's meal plan.
        Returns the meal plan data (dict/list) if found, otherwise None or {}.
        """
        try:
            meal_plan_model = self.meal_planner_dao.get_meal_plan_by_user_id(user_id)
            if meal_plan_model and meal_plan_model.MealPlanData:
                return meal_plan_model.MealPlanData
            return {}
        except Exception as e:
            print(f"Error in MealPlannerService getting meal plan for user_id {user_id}: {e}")
            return None


    def save_user_meal_plan(self, user_id: int, client_data: dict):
        """
        Saves or updates a user's meal plan.
        client_data is a Python dictionary representing the meal plan.
        Returns a dictionary with success status and message/data.
        """
        try:
            saved_plan = self.meal_planner_dao.save_or_update_meal_plan(user_id, client_data)

            if saved_plan:
                db.session.commit()
                return {"success": True, "message": "Meal plan saved successfully.", "data": saved_plan.to_dict()}
            else:
                db.session.rollback()
                return {"success": False, "message": "Failed to save meal plan (DAO returned None)."}

        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"SQLAlchemyError in MealPlannerService saving meal plan for user_id {user_id}: {e}")
            return {"success": False, "message": f"Database error: {str(e)}"}
        except Exception as e:
            db.session.rollback()
            print(f"Generic error in MealPlannerService saving meal plan for user_id {user_id}: {e}")
            return {"success": False, "message": f"An unexpected error occurred: {str(e)}"}
