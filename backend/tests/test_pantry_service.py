import unittest
from unittest.mock import MagicMock, patch
from backend.services.pantry_service import PantryService
from backend.models.user_pantry_ingredient import UserPantryIngredient
from backend.models.recipe import Recipe
from backend.models.ingredient import Ingredient
from datetime import datetime

# Path for patching 'db' object as it's imported in pantry_service.py
DB_PATH_IN_SERVICE = 'backend.services.pantry_service.db'

class TestPantryService(unittest.TestCase):

    @patch(DB_PATH_IN_SERVICE)
    @patch('backend.services.pantry_service.RecipeDAO')
    @patch('backend.services.pantry_service.PantryDAO')
    def setUp(self, MockPantryDAO, MockRecipeDAO, MockDBModule):
        self.mock_pantry_dao_instance = MockPantryDAO.return_value
        self.mock_recipe_dao_instance = MockRecipeDAO.return_value
        self.mock_db_session = MockDBModule.session # Mock for db.session used by PantryService
        self.pantry_service = PantryService()

    def test_add_ingredient_success(self):
        # --- Arrange ---
        mock_pantry_item_model = UserPantryIngredient(
            UserPantryIngredientID=1, UserID=1, IngredientID=10,
            Quantity="100", Unit="g", CreatedAt=datetime.utcnow()
        )
        mock_pantry_item_model.IngredientName = "Flour" # Assume DAO or model setup handles this

        expected_dict = {
            "UserPantryIngredientID": 1, "UserID": 1, "IngredientID": 10,
            "Quantity": "100", "Unit": "g", "IngredientName": "Flour",
            "CreatedAt": mock_pantry_item_model.CreatedAt.isoformat(),
            "UpdatedAt": mock_pantry_item_model.UpdatedAt.isoformat() if mock_pantry_item_model.UpdatedAt else None
        }
        mock_pantry_item_model.to_dict = MagicMock(return_value=expected_dict)

        self.mock_pantry_dao_instance.add_ingredient_to_pantry.return_value = mock_pantry_item_model

        # --- Act ---
        result_dict = self.pantry_service.add_ingredient(user_id=1, ingredient_name="Flour", quantity="100", unit="g")

        # --- Assert ---
        self.mock_pantry_dao_instance.add_ingredient_to_pantry.assert_called_once_with(1, "Flour", "100", "g")
        self.mock_db_session.commit.assert_called_once()
        self.mock_db_session.rollback.assert_not_called()
        mock_pantry_item_model.to_dict.assert_called_once_with(include_relations=True)
        self.assertEqual(result_dict, expected_dict)

    def test_add_ingredient_dao_returns_none(self):
        # --- Arrange ---
        self.mock_pantry_dao_instance.add_ingredient_to_pantry.return_value = None # Simulate DAO failure

        # --- Act ---
        result = self.pantry_service.add_ingredient(user_id=1, ingredient_name="Flour", quantity="100", unit="g")

        # --- Assert ---
        self.mock_pantry_dao_instance.add_ingredient_to_pantry.assert_called_once_with(1, "Flour", "100", "g")
        self.mock_db_session.commit.assert_not_called()
        self.mock_db_session.rollback.assert_called_once() # Service should rollback
        self.assertIsNone(result)

    def test_add_ingredient_dao_raises_exception(self):
        # --- Arrange ---
        self.mock_pantry_dao_instance.add_ingredient_to_pantry.side_effect = Exception("DAO Database Error")

        # --- Act & Assert ---
        with self.assertRaises(Exception) as context:
            self.pantry_service.add_ingredient(user_id=1, ingredient_name="Flour", quantity="100", unit="g")

        self.assertTrue("DAO Database Error" in str(context.exception))
        self.mock_pantry_dao_instance.add_ingredient_to_pantry.assert_called_once_with(1, "Flour", "100", "g")
        self.mock_db_session.commit.assert_not_called()
        self.mock_db_session.rollback.assert_called_once()


    def test_get_pantry(self): # Read operation - no commit/rollback check needed for this method itself
        item1_model = UserPantryIngredient(UserPantryIngredientID=1, IngredientID=10)
        item1_model.to_dict = MagicMock(return_value={"id": 1, "name": "Flour"})
        item2_model = UserPantryIngredient(UserPantryIngredientID=2, IngredientID=12)
        item2_model.to_dict = MagicMock(return_value={"id": 2, "name": "Sugar"})

        self.mock_pantry_dao_instance.get_pantry_by_user_id.return_value = [item1_model, item2_model]
        result = self.pantry_service.get_pantry(user_id=1)
        self.mock_pantry_dao_instance.get_pantry_by_user_id.assert_called_once_with(1)
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]["name"], "Flour")
        item1_model.to_dict.assert_called_once_with(include_relations=True)
        item2_model.to_dict.assert_called_once_with(include_relations=True)

    def test_update_ingredient_success(self):
        updated_item_model = UserPantryIngredient(UserPantryIngredientID=1, Quantity="150")
        updated_item_model.to_dict = MagicMock(return_value={"id": 1, "quantity": "150"})
        self.mock_pantry_dao_instance.update_pantry_ingredient.return_value = updated_item_model

        result = self.pantry_service.update_ingredient(1, "150", "g")
        self.mock_pantry_dao_instance.update_pantry_ingredient.assert_called_once_with(1, "150", "g")
        self.mock_db_session.commit.assert_called_once()
        self.mock_db_session.rollback.assert_not_called()
        updated_item_model.to_dict.assert_called_once_with(include_relations=True)
        self.assertEqual(result["quantity"], "150")

    def test_update_ingredient_dao_returns_none(self): # e.g. item not found
        self.mock_pantry_dao_instance.update_pantry_ingredient.return_value = None
        result = self.pantry_service.update_ingredient(1, "150", "g")
        self.mock_pantry_dao_instance.update_pantry_ingredient.assert_called_once_with(1, "150", "g")
        self.mock_db_session.commit.assert_not_called()
        self.mock_db_session.rollback.assert_not_called() # No exception, no rollback by service for None return
        self.assertIsNone(result)

    def test_update_ingredient_dao_raises_exception(self):
        self.mock_pantry_dao_instance.update_pantry_ingredient.side_effect = Exception("DAO Update Error")
        with self.assertRaises(Exception) as context:
            self.pantry_service.update_ingredient(1, "150", "g")
        self.assertTrue("DAO Update Error" in str(context.exception))
        self.mock_pantry_dao_instance.update_pantry_ingredient.assert_called_once_with(1, "150", "g")
        self.mock_db_session.commit.assert_not_called()
        self.mock_db_session.rollback.assert_called_once()


    def test_remove_ingredient_success(self):
        self.mock_pantry_dao_instance.remove_ingredient_from_pantry.return_value = True # DAO indicates success
        result = self.pantry_service.remove_ingredient(1)
        self.mock_pantry_dao_instance.remove_ingredient_from_pantry.assert_called_once_with(1)
        self.mock_db_session.commit.assert_called_once()
        self.mock_db_session.rollback.assert_not_called()
        self.assertTrue(result["success"])

    def test_remove_ingredient_dao_returns_false(self): # e.g. item not found
        self.mock_pantry_dao_instance.remove_ingredient_from_pantry.return_value = False
        result = self.pantry_service.remove_ingredient(1)
        self.mock_pantry_dao_instance.remove_ingredient_from_pantry.assert_called_once_with(1)
        self.mock_db_session.commit.assert_not_called()
        self.mock_db_session.rollback.assert_not_called()
        self.assertFalse(result["success"])

    def test_remove_ingredient_dao_raises_exception(self):
        self.mock_pantry_dao_instance.remove_ingredient_from_pantry.side_effect = Exception("DAO Delete Error")
        with self.assertRaises(Exception) as context:
            self.pantry_service.remove_ingredient(1)
        self.assertTrue("DAO Delete Error" in str(context.exception))
        self.mock_pantry_dao_instance.remove_ingredient_from_pantry.assert_called_once_with(1)
        self.mock_db_session.commit.assert_not_called()
        self.mock_db_session.rollback.assert_called_once()

    # Tests for suggest_recipes remain largely the same as they are read operations
    # and don't directly involve session commit/rollback by the service itself.
    def test_suggest_recipes_basic_match(self):
        pantry_item1 = UserPantryIngredient(UserID=1, IngredientID=1)
        pantry_item2 = UserPantryIngredient(UserID=1, IngredientID=2)
        self.mock_pantry_dao_instance.get_pantry_by_user_id.return_value = [pantry_item1, pantry_item2]

        recipe1_model = Recipe(RecipeID=101, Title="Recipe A")
        recipe1_model.to_dict = MagicMock(return_value={"RecipeID": 101, "Title": "Recipe A"})
        recipe1_ingredients = [Ingredient(IngredientID=1), Ingredient(IngredientID=2)]

        recipe2_model = Recipe(RecipeID=102, Title="Recipe B")
        recipe2_model.to_dict = MagicMock(return_value={"RecipeID": 102, "Title": "Recipe B"})
        recipe2_ingredients = [Ingredient(IngredientID=1), Ingredient(IngredientID=3)]

        self.mock_recipe_dao_instance.get_all_recipes.return_value = [recipe1_model, recipe2_model]

        def mock_get_ingredients(recipe_id):
            if recipe_id == 101: return recipe1_ingredients
            if recipe_id == 102: return recipe2_ingredients
            return []
        self.mock_recipe_dao_instance.get_ingredients_for_recipe.side_effect = mock_get_ingredients

        result_obj = self.pantry_service.suggest_recipes(user_id=1, match_threshold=0.5)
        results = result_obj["recipes"]

        self.mock_pantry_dao_instance.get_pantry_by_user_id.assert_called_once_with(1)
        self.mock_recipe_dao_instance.get_all_recipes.assert_called_once()
        self.assertEqual(len(results), 2)
        self.assertEqual(results[0]["Title"], "Recipe A")
        self.assertEqual(results[0]["match_percentage"], 100.0)
        self.assertEqual(results[1]["Title"], "Recipe B")
        self.assertEqual(results[1]["match_percentage"], 50.0)

    def test_suggest_recipes_empty_pantry(self):
        self.mock_pantry_dao_instance.get_pantry_by_user_id.return_value = []
        result_obj = self.pantry_service.suggest_recipes(user_id=1)
        self.mock_pantry_dao_instance.get_pantry_by_user_id.assert_called_once_with(1)
        self.mock_recipe_dao_instance.get_all_recipes.assert_not_called()
        self.assertEqual(len(result_obj["recipes"]), 0)
        self.assertIn("Your pantry is empty", result_obj["message"])


if __name__ == '__main__':
    unittest.main(argv=['first-arg-is-ignored'], exit=False)
