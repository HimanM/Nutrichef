import unittest
from unittest.mock import patch, MagicMock
import os # For dummy image file creation
import tempfile # For dummy image file
from werkzeug.datastructures import FileStorage # To mock image_file_storage

# Adjust imports based on your project structure if Flask app context is needed for DB session
# For service tests, typically we mock DAOs and don't need full app context unless models are complexly tied.
from backend.services.classification_service import ClassificationService
# Assuming ClassificationResultDAO is mockable without full app context
# from backend.dao import ClassificationResultDAO # Not strictly needed if fully mocked

class TestClassificationService(unittest.TestCase):

    def setUp(self):
        """Set up for test methods."""
        # Mock the FoodIngredientClassifier if its loading is problematic or slow
        self.mock_food_classifier = MagicMock()
        self.mock_food_classifier.is_model_loaded.return_value = True
        self.mock_food_classifier.predict_ingredient.return_value = [{'name': 'apple', 'confidence': 0.9876}]

        # Patch the FoodIngredientClassifier where it's instantiated by ClassificationService
        self.food_classifier_patcher = patch('backend.services.classification_service.FoodIngredientClassifier', return_value=self.mock_food_classifier)
        self.mock_food_classifier_constructor = self.food_classifier_patcher.start()

        self.classification_service = ClassificationService()

        # Mock the ClassificationResultDAO
        self.mock_dao_instance = MagicMock()
        self.classification_service.classification_result_dao = self.mock_dao_instance

        # Mock db.session for commit/rollback
        self.mock_db_session = MagicMock()
        self.db_patcher = patch('backend.services.classification_service.db.session', self.mock_db_session)
        self.db_patcher.start()


    def tearDown(self):
        self.food_classifier_patcher.stop()
        self.db_patcher.stop()

    def test_classify_item_success_saves_to_db(self):
        """Test successful classification and saving to DB."""
        # Create a dummy FileStorage object
        temp_file = tempfile.NamedTemporaryFile(delete=False)
        temp_file.write(b"dummy image data")
        temp_file.close()

        mock_image_file = FileStorage(
            stream=open(temp_file.name, 'rb'),
            filename="dummy.jpg",
            content_type="image/jpeg"
        )

        dummy_user_id = 1
        food_name_param = "My Apple"

        expected_pred_name = "My Apple (image classified as: apple)" # Based on service logic
        expected_nutrition_json_toContain = '"item": "apple"' # Check part of the JSON

        result, error, status = self.classification_service.classify_item(
            image_file_storage=mock_image_file,
            user_id=dummy_user_id,
            food_name=food_name_param
        )

        self.assertEqual(status, 200)
        self.assertIsNone(error)
        self.assertIsNotNone(result)
        self.assertEqual(result.get("predictedFoodName"), expected_pred_name)
        self.assertTrue(expected_nutrition_json_toContain in result.get("nutritionInfoJSON"))

        # Assert DAO was called
        self.mock_dao_instance.create_classification_result.assert_called_once()
        call_args = self.mock_dao_instance.create_classification_result.call_args[1] # Get kwargs
        self.assertEqual(call_args.get('user_id'), dummy_user_id)
        self.assertEqual(call_args.get('predicted_food_name'), expected_pred_name)
        self.assertEqual(call_args.get('nutrition_info_json'), result.get("nutritionInfoJSON"))
        self.assertEqual(call_args.get('score'), 0.9876) # New/Updated assertion for score
        self.assertIsNone(call_args.get('uploaded_image_url'))

        # Assert db.session.commit was called
        self.mock_db_session.commit.assert_called_once()

        # Clean up dummy file
        os.remove(temp_file.name)
        mock_image_file.stream.close()


    def test_classify_item_model_not_loaded_no_db_call(self):
        """Test that if the model isn't loaded, no DB call is made."""
        self.mock_food_classifier.is_model_loaded.return_value = False
        # Re-initialize service or directly set the classifier for this test case if needed
        # For this setup, the mock is already in place from setUp, just change its behavior

        temp_file = tempfile.NamedTemporaryFile(delete=False); temp_file.close()
        mock_image_file = FileStorage(stream=open(temp_file.name, 'rb'), filename="dummy.jpg")

        result, error, status = self.classification_service.classify_item(mock_image_file, user_id=1, food_name="Test")

        self.assertEqual(status, 200) # Fallback returns 200
        self.assertIn("Fallback: Model Not Loaded", result.get("predictedFoodName"))
        self.mock_dao_instance.create_classification_result.assert_not_called()
        self.mock_db_session.commit.assert_not_called()

        os.remove(temp_file.name)
        mock_image_file.stream.close()

    def test_classify_item_db_error_still_returns_classification(self):
        """Test that if DB save fails, classification is still returned."""
        self.mock_dao_instance.create_classification_result.side_effect = Exception("DB Save Error")

        temp_file = tempfile.NamedTemporaryFile(delete=False); temp_file.close()
        mock_image_file = FileStorage(stream=open(temp_file.name, 'rb'), filename="dummy.jpg")

        dummy_user_id = 1
        result, error, status = self.classification_service.classify_item(mock_image_file, user_id=dummy_user_id, food_name="Test")

        self.assertEqual(status, 200)
        self.assertIsNone(error)
        self.assertIsNotNone(result)
        # Check if classification details are present despite DB error
        self.assertTrue("Test (image classified as: apple)" in result.get("predictedFoodName"))

        self.mock_dao_instance.create_classification_result.assert_called_once()
        self.mock_db_session.rollback.assert_called_once() # Ensure rollback was called
        self.mock_db_session.commit.assert_not_called() # Commit should not be called if create fails before it

        os.remove(temp_file.name)
        mock_image_file.stream.close()


if __name__ == '__main__':
    unittest.main()
