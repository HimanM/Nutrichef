import unittest
from unittest.mock import MagicMock, patch, PropertyMock, ANY
from backend.dao.pantry_dao import PantryDAO
from backend.models.ingredient import Ingredient
from backend.models.user_pantry_ingredient import UserPantryIngredient
from datetime import datetime

# Path for patching 'db' object as it's imported in pantry_dao.py
# If pantry_dao.py has 'from ..db import db', this is correct.
DB_PATH = 'backend.dao.pantry_dao.db'
# Path for patching Model.query, as it's accessed from the model's module
UPI_QUERY_PATH = 'backend.models.user_pantry_ingredient.UserPantryIngredient.query'
INGREDIENT_QUERY_PATH = 'backend.models.ingredient.Ingredient.query' # If needed for IngredientDAO mock behavior

class TestPantryDAO(unittest.TestCase):

    @patch(DB_PATH)
    @patch('backend.dao.pantry_dao.IngredientDAO')
    def setUp(self, MockIngredientDAO, MockDBModule):
        self.mock_sqlalchemy_session = MockDBModule.session

        self.mock_ingredient_dao_instance = MockIngredientDAO.return_value

        self.pantry_dao = PantryDAO()

    def test_add_ingredient_to_pantry_new_ingredient_not_in_pantry(self):
        # --- Arrange ---
        created_ingredient = Ingredient(IngredientID=100, Name="New Spice", CreatedAt=datetime.utcnow())
        self.mock_ingredient_dao_instance.get_or_create_ingredient.return_value = created_ingredient

        # Mock the internal call to self.get_pantry_ingredient_by_user_and_ingredient_id
        # This method uses UserPantryIngredient.query.filter_by().options().first()
        mock_upi_query_for_get = MagicMock()
        mock_upi_query_for_get.options.return_value.filter_by.return_value.first.return_value = None # Item not in pantry

        with patch(UPI_QUERY_PATH, new_callable=PropertyMock(return_value=mock_upi_query_for_get)):
            # --- Act ---
            result_model = self.pantry_dao.add_ingredient_to_p pantry(user_id=1, ingredient_name="New Spice", quantity="10", unit="g")

        # --- Assert ---
        self.mock_ingredient_dao_instance.get_or_create_ingredient.assert_called_once_with("New Spice")

        # Check that UserPantryIngredient.query was used by the internal call as expected
        mock_upi_query_for_get.options.return_value.filter_by.assert_called_once_with(UserID=1, IngredientID=100)

        # Check that db.session.add was called with a new UserPantryIngredient instance
        self.mock_sqlalchemy_session.add.assert_called_once()
        added_object = self.mock_sqlalchemy_session.add.call_args[0][0]
        self.assertIsInstance(added_object, UserPantryIngredient)
        self.assertEqual(added_object.UserID, 1)
        self.assertEqual(added_object.IngredientID, 100)
        self.assertEqual(added_object.Quantity, "10")
        self.assertEqual(added_object.Unit, "g")

        self.assertEqual(result_model, added_object) # DAO should return the model instance
        self.assertIsNotNone(result_model.ingredient) # Ensure ingredient was attached
        self.assertEqual(result_model.ingredient.Name, "New Spice")


    def test_add_ingredient_to_pantry_existing_ingredient_updates_pantry_item(self):
        # --- Arrange ---
        existing_ingredient_model = Ingredient(IngredientID=5, Name="Salt", CreatedAt=datetime.utcnow())
        self.mock_ingredient_dao_instance.get_or_create_ingredient.return_value = existing_ingredient_model

        # Mock the internal call to self.get_pantry_ingredient_by_user_and_ingredient_id
        # This time, it returns an existing pantry item
        current_pantry_item_model = UserPantryIngredient(
            UserPantryIngredientID=20, UserID=1, IngredientID=5, Quantity="100", Unit="g",
            ingredient=existing_ingredient_model, CreatedAt=datetime.utcnow(), UpdatedAt=datetime.utcnow()
        )
        mock_upi_query_for_get_existing = MagicMock()
        mock_upi_query_for_get_existing.options.return_value.filter_by.return_value.first.return_value = current_pantry_item_model

        with patch(UPI_QUERY_PATH, new_callable=PropertyMock(return_value=mock_upi_query_for_get_existing)):
            # --- Act ---
            # Adding "20" "g" of "Salt", existing is "100" "g". Expect "120.0" "g".
            result_model = self.pantry_dao.add_ingredient_to_pantry(user_id=1, ingredient_name="Salt", quantity="20", unit="g")

        # --- Assert ---
        self.mock_ingredient_dao_instance.get_or_create_ingredient.assert_called_once_with("Salt")
        mock_upi_query_for_get_existing.options.return_value.filter_by.assert_called_once_with(UserID=1, IngredientID=5)

        # Check that db.session.add was called with the updated existing_pantry_item_model
        self.mock_sqlalchemy_session.add.assert_called_once_with(current_pantry_item_model)
        self.assertEqual(current_pantry_item_model.Quantity, "120.0") # "100.0" + "20.0" -> "120.0"
        self.assertEqual(result_model, current_pantry_item_model)


    def test_get_pantry_by_user_id_with_items(self):
        # --- Arrange ---
        mock_flour_ing = Ingredient(IngredientID=10, Name="Flour")
        mock_sugar_ing = Ingredient(IngredientID=12, Name="Sugar")
        mock_item1 = UserPantryIngredient(UserPantryIngredientID=1, UserID=1, IngredientID=10, Quantity="2", Unit="cups", ingredient=mock_flour_ing)
        mock_item2 = UserPantryIngredient(UserPantryIngredientID=2, UserID=1, IngredientID=12, Quantity="1", Unit="kg", ingredient=mock_sugar_ing)

        mock_upi_query_all = MagicMock()
        mock_upi_query_all.filter_by.return_value.join.return_value.options.return_value.order_by.return_value.all.return_value = [mock_item1, mock_item2]

        with patch(UPI_QUERY_PATH, new_callable=PropertyMock(return_value=mock_upi_query_all)):
            # --- Act ---
            results = self.pantry_dao.get_pantry_by_user_id(1)

        # --- Assert ---
        mock_upi_query_all.filter_by.assert_called_once_with(UserID=1)
        # Could also assert join, options, order_by were called if specific arguments are important
        self.assertEqual(len(results), 2)
        self.assertEqual(results[0].ingredient.Name, "Flour")
        self.assertEqual(results[1].ingredient.Name, "Sugar")


    def test_get_pantry_ingredient_by_id_found(self):
        # --- Arrange ---
        mock_item = UserPantryIngredient(UserPantryIngredientID=1, UserID=1, IngredientID=10, Quantity="2", Unit="cups", ingredient=Ingredient(Name="Flour"))
        mock_upi_query_get = MagicMock()
        mock_upi_query_get.options.return_value.get.return_value = mock_item

        with patch(UPI_QUERY_PATH, new_callable=PropertyMock(return_value=mock_upi_query_get)):
            # --- Act ---
            result = self.pantry_dao.get_pantry_ingredient_by_id(1)

        # --- Assert ---
        mock_upi_query_get.options.return_value.get.assert_called_once_with(1)
        self.assertEqual(result, mock_item)

    def test_update_pantry_ingredient_success(self):
        # --- Arrange ---
        # This item will be "fetched" by the mocked get_pantry_ingredient_by_id
        existing_item_to_update = UserPantryIngredient(UserPantryIngredientID=1, UserID=1, IngredientID=1, Quantity="100", Unit="g", ingredient=Ingredient(Name="Milk"))

        # Mock the UserPantryIngredient.query.options().get() call sequence
        mock_upi_query_for_update = MagicMock()
        mock_upi_query_for_update.options.return_value.get.return_value = existing_item_to_update

        with patch(UPI_QUERY_PATH, new_callable=PropertyMock(return_value=mock_upi_query_for_update)):
            # --- Act ---
            updated_model = self.pantry_dao.update_pantry_ingredient(user_pantry_ingredient_id=1, quantity="300", unit="ml")

        # --- Assert ---
        mock_upi_query_for_update.options.return_value.get.assert_called_once_with(1)
        self.mock_sqlalchemy_session.add.assert_called_once_with(existing_item_to_update)
        self.assertEqual(existing_item_to_update.Quantity, "300")
        self.assertEqual(existing_item_to_update.Unit, "ml")
        self.assertEqual(updated_model, existing_item_to_update)


    def test_remove_ingredient_from_pantry_found_and_deleted(self):
        # --- Arrange ---
        item_to_delete = UserPantryIngredient(UserPantryIngredientID=1, UserID=1, IngredientID=1)
        mock_upi_query_for_delete = MagicMock()
        mock_upi_query_for_delete.options.return_value.get.return_value = item_to_delete

        with patch(UPI_QUERY_PATH, new_callable=PropertyMock(return_value=mock_upi_query_for_delete)):
            # --- Act ---
            result = self.pantry_dao.remove_ingredient_from_pantry(1)

        # --- Assert ---
        mock_upi_query_for_delete.options.return_value.get.assert_called_once_with(1)
        self.mock_sqlalchemy_session.delete.assert_called_once_with(item_to_delete)
        self.assertTrue(result)


    def test_remove_ingredient_from_pantry_not_found(self):
        # --- Arrange ---
        mock_upi_query_delete_not_found = MagicMock()
        mock_upi_query_delete_not_found.options.return_value.get.return_value = None # Item not found

        with patch(UPI_QUERY_PATH, new_callable=PropertyMock(return_value=mock_upi_query_delete_not_found)):
            # --- Act ---
            result = self.pantry_dao.remove_ingredient_from_pantry(999)

        # --- Assert ---
        mock_upi_query_delete_not_found.options.return_value.get.assert_called_once_with(999)
        self.mock_sqlalchemy_session.delete.assert_not_called()
        self.assertFalse(result)

    def test_get_pantry_ingredient_by_user_and_ingredient_id_found(self):
        # --- Arrange ---
        mock_item = UserPantryIngredient(UserPantryIngredientID=1, UserID=1, IngredientID=10, Quantity="2", Unit="cups", ingredient=Ingredient(Name="Flour"))
        mock_upi_query_filter = MagicMock()
        mock_upi_query_filter.options.return_value.filter_by.return_value.first.return_value = mock_item

        with patch(UPI_QUERY_PATH, new_callable=PropertyMock(return_value=mock_upi_query_filter)):
            # --- Act ---
            result = self.pantry_dao.get_pantry_ingredient_by_user_and_ingredient_id(1, 10)

        # --- Assert ---
        mock_upi_query_filter.options.return_value.filter_by.assert_called_once_with(UserID=1, IngredientID=10)
        self.assertEqual(result, mock_item)

    def test_get_pantry_ingredient_by_user_and_ingredient_id_not_found(self):
        # --- Arrange ---
        mock_upi_query_filter_not_found = MagicMock()
        mock_upi_query_filter_not_found.options.return_value.filter_by.return_value.first.return_value = None

        with patch(UPI_QUERY_PATH, new_callable=PropertyMock(return_value=mock_upi_query_filter_not_found)):
            # --- Act ---
            result = self.pantry_dao.get_pantry_ingredient_by_user_and_ingredient_id(1, 999)

        # --- Assert ---
        mock_upi_query_filter_not_found.options.return_value.filter_by.assert_called_once_with(UserID=1, IngredientID=999)
        self.assertIsNone(result)

if __name__ == '__main__':
    unittest.main(argv=['first-arg-is-ignored'], exit=False)
