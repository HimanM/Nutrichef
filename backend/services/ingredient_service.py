from backend.dao import IngredientDAO

class IngredientService:
    def __init__(self):
        self.ingredient_dao = IngredientDAO()

    def get_allergies_for_ingredient(self, ingredient_id):
        """
        Retrieves allergies for a single ingredient and returns them as dicts.
        Output format: (data, error_dict, status_code)
        """
        allergies_list = self.ingredient_dao.get_allergies_for_ingredient(ingredient_id)

        if allergies_list is None:
            return None, {"error": f"Ingredient with ID {ingredient_id} not found"}, 404

        if not allergies_list:
            return [], None, 200

        return [allergy.to_dict() for allergy in allergies_list], None, 200

    def get_unique_allergies_for_multiple_ingredients(self, ingredient_ids):
        """
        Retrieves allergies for a list of ingredient IDs, returning them grouped by ingredient ID.
        Output format: (data_dict, error_dict, status_code)
        Example data_dict: {
            ingredient_id1: [{'id': allergy_id, 'name': 'allergy_name'}, ...],
            ingredient_id2: [] // No allergies for this one
        }
        """
        if not isinstance(ingredient_ids, list) or not all(isinstance(id, int) for id in ingredient_ids):
            return None, {"error": "Input must be a list of integer ingredient IDs"}, 400

        unique_input_ids = sorted(list(set(ingredient_ids)))

        allergies_by_ingredient_id = {}

        for ingredient_id in unique_input_ids:
            allergies_list = self.ingredient_dao.get_allergies_for_ingredient(ingredient_id)

            if allergies_list is None:
                print(f"Warning: Ingredient ID {ingredient_id} not found while fetching batch allergies.")
                allergies_by_ingredient_id[ingredient_id] = []
                continue

            if not allergies_list:
                allergies_by_ingredient_id[ingredient_id] = []
            else:
                allergies_by_ingredient_id[ingredient_id] = [allergy.to_dict() for allergy in allergies_list]

        return allergies_by_ingredient_id, None, 200
