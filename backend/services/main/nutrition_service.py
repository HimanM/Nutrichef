import os
from backend.ai_models.nutrition_lookup.nutrition_lookup import OfflineNutritionLookup

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
AI_MODELS_DIR = os.path.join(SCRIPT_DIR, '..', '..', 'ai_models', 'nutrition_lookup')
DATA_FOLDER_PATH = os.path.join(AI_MODELS_DIR, 'Data')

class NutritionService:
    _instance = None

    def __init__(self):
        if not os.path.exists(DATA_FOLDER_PATH):
            print(f"Warning: Data directory not found at {DATA_FOLDER_PATH}. Nutrition lookup may fail.")
            self.lookup = None
        else:
            self.lookup = OfflineNutritionLookup(data_folder=DATA_FOLDER_PATH)

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def get_nutrition(self, food_name: str):
        if self.lookup is None:
            return {'success': False, 'error': 'Nutrition lookup module not initialized due to missing data directory.'}

        if not food_name or not isinstance(food_name, str):
            return {'success': False, 'error': 'Invalid food name provided.'}

        try:
            return self.lookup.get_nutrition_for_food(food_name)
        except Exception as e:
            print(f"Error during nutrition lookup for '{food_name}': {e}")
            return {'success': False, 'error': f"An error occurred while fetching nutrition data for '{food_name}'."}
