import json
from backend.ai_models.food_data.nutrition_database import NutritionDatabase

class FoodLookupService:
    _instance = None

    def __init__(self):
        self.db = NutritionDatabase()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def lookup_food(self, food_query_or_exact_name: str, is_exact_match: bool = False) -> dict:
        '''
        Looks up food information.

        Args:
            food_query_or_exact_name: The food name to query or the exact food name.
            is_exact_match: If True, uses get_food_by_exact_name. Otherwise, uses get_food_info.

        Returns:
            A dictionary containing the food data or an error message.
        '''
        if not food_query_or_exact_name:
            return {"error": "Food name cannot be empty."}

        try:
            if is_exact_match:
                json_string_data = self.db.get_food_by_exact_name(food_query_or_exact_name)
            else:
                json_string_data = self.db.get_food_info(food_query_or_exact_name)
            
            if isinstance(json_string_data, str):
                return json.loads(json_string_data)
            elif isinstance(json_string_data, dict):
                return json_string_data
            else:
                return {"error": "Unexpected data format from database."}

        except json.JSONDecodeError:
            return {"error": "Failed to decode food data."}
        except Exception as e:
            print(f"Error in FoodLookupService: {e}")
            return {"error": "An unexpected error occurred while fetching food data."}
