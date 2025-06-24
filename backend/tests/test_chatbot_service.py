# backend/tests/test_chatbot_service.py
import unittest
from unittest.mock import MagicMock, patch, mock_open
import os
import shutil
import tempfile
import io # For BytesIO

# Assuming werkzeug is available (common with Flask)
try:
    from werkzeug.datastructures import FileStorage
except ImportError:
    # Mock FileStorage if werkzeug is not installed in the test environment
    class FileStorage:
        def __init__(self, stream=None, filename=None, name=None, content_type=None, content_length=None, headers=None):
            self.stream = stream
            self.filename = filename
            self.name = name # Werkzeug uses 'name' for the form field name, 'filename' for the actual file name
            self.content_type = content_type
            self.content_length = content_length
            self.headers = headers
        def save(self, dst, buffer_size=16384):
            if self.stream:
                # Ensure stream is at the beginning before copying
                self.stream.seek(0)
                with open(dst, 'wb') as f:
                    shutil.copyfileobj(self.stream, f, buffer_size)
        def close(self):
            if self.stream:
                self.stream.close()

# Correct import path
# If tests run from project root, and backend is a package: from backend.services.chatbot_service import ChatbotService
# If tests run from backend directory:
from services.chatbot_service import ChatbotService


class TestChatbotService(unittest.TestCase):

    @patch('backend.services.chatbot_service.FoodChatbot')
    @patch('backend.services.chatbot_service.SubstitutionService')
    @patch('backend.services.chatbot_service.FoodLookupService.get_instance') # UPDATED
    @patch('backend.services.chatbot_service.FoodClassifier')
    def setUp(self, MockFoodClassifier, MockFoodLookupGetInstance, MockSubstitutionService, MockFoodChatbot): # UPDATED
        self.test_upload_dir = tempfile.mkdtemp(prefix="test_chatbot_uploads_")

        # Configure mocks for the services/models ChatbotService will instantiate
        self.mock_fc_instance = MockFoodClassifier.return_value
        self.mock_fc_instance.is_model_loaded.return_value = True

        self.mock_fls_instance = MockFoodLookupGetInstance.return_value # UPDATED ns_instance to fls_instance
        # No specific methods on FoodLookupService instance need to be mocked for ChatbotService's __init__

        self.mock_ss_instance = MockSubstitutionService.return_value

        # Configure the mock for FoodChatbot instance (which ChatbotService creates)
        self.mock_food_chatbot_instance = MockFoodChatbot.return_value
        self.mock_food_chatbot_instance.is_ready.return_value = True # Assume FoodChatbot reports ready

        # Now, when ChatbotService is initialized, it will use the mocked classes above
        self.service = ChatbotService(static_tmp_folder=self.test_upload_dir)

        # Store mocks for assertion in tests
        self.MockFoodClassifier = MockFoodClassifier
        self.MockFoodLookupGetInstance = MockFoodLookupGetInstance # UPDATED
        self.MockSubstitutionService = MockSubstitutionService
        self.MockFoodChatbot = MockFoodChatbot

    def tearDown(self):
        if os.path.exists(self.test_upload_dir):
            shutil.rmtree(self.test_upload_dir)

    def test_service_initialization(self):
        self.assertTrue(os.path.exists(self.test_upload_dir))
        # Check that ChatbotService attempted to instantiate its dependencies
        self.MockFoodClassifier.assert_called_once()
        self.MockFoodLookupGetInstance.assert_called_once() # UPDATED
        self.MockSubstitutionService.assert_called_once()

        # Check that FoodChatbot was instantiated with the mocked dependency instances
        self.MockFoodChatbot.assert_called_once_with(
            food_classifier_instance=self.mock_fc_instance,
            food_lookup_service_instance=self.mock_fls_instance, # UPDATED
            substitution_service_instance=self.mock_ss_instance
        )
        # service.is_chatbot_ready() calls self.chatbot_instance.is_ready()
        self.assertTrue(self.service.is_chatbot_ready())
        self.mock_food_chatbot_instance.is_ready.assert_called() # is_ready is checked by ChatbotService init and its own method

    def test_initialization_one_dependency_fails(self):
        # Reset mocks for a fresh scenario
        self.MockFoodClassifier.reset_mock()
        self.MockFoodLookupGetInstance.reset_mock() # UPDATED
        self.MockSubstitutionService.reset_mock()
        self.MockFoodChatbot.reset_mock()
        self.mock_food_chatbot_instance.reset_mock()

        # Simulate FoodLookupService instantiation failing
        self.MockFoodLookupGetInstance.side_effect = Exception("FLS Load Error") # UPDATED

        # Simulate FoodChatbot's is_ready behavior based on injected instances
        def food_chatbot_init_effect(food_classifier_instance, food_lookup_service_instance, substitution_service_instance): # UPDATED
            if food_lookup_service_instance is None: # UPDATED
                self.mock_food_chatbot_instance.is_ready.return_value = False
            else:
                self.mock_food_chatbot_instance.is_ready.return_value = True
            return self.mock_food_chatbot_instance

        self.MockFoodChatbot.side_effect = food_chatbot_init_effect

        service_with_failed_dep = ChatbotService(static_tmp_folder=self.test_upload_dir)

        self.MockFoodLookupGetInstance.assert_called_once() # UPDATED

        args, kwargs_call = self.MockFoodChatbot.call_args # UPDATED variable name for clarity
        self.assertIsNone(kwargs_call.get('food_lookup_service_instance')) # UPDATED

        self.assertFalse(service_with_failed_dep.is_chatbot_ready())


    def test_process_user_query_text_only(self):
        self.mock_food_chatbot_instance.process_query.return_value = {"response": "Hello from bot"}
        response = self.service.process_user_query("Hello")
        self.mock_food_chatbot_instance.process_query.assert_called_once_with("Hello", image_path=None)
        self.assertEqual(response, {"response": "Hello from bot"})

    def test_process_user_query_with_image(self):
        self.mock_food_chatbot_instance.process_query.return_value = {"response": "Image classified"}

        mock_image_stream = io.BytesIO(b"dummy_image_content")
        mock_image_file = FileStorage(
            stream=mock_image_stream,
            filename="test_image.jpg",
            name="image_file", # This is the form field name
            content_type="image/jpeg"
        )

        response = self.service.process_user_query("What is this?", image_file_storage=mock_image_file)

        args, kwargs = self.mock_food_chatbot_instance.process_query.call_args
        self.assertEqual(args[0], "What is this?")
        self.assertIsNotNone(kwargs.get('image_path'))
        saved_filename = os.path.basename(kwargs['image_path'])
        self.assertTrue(saved_filename.endswith('_test_image.jpg')) # werkzeug.utils.secure_filename behavior

        self.assertEqual(len(os.listdir(self.test_upload_dir)), 0, "Temp directory should be empty after processing")
        self.assertEqual(response, {"response": "Image classified"})

    def test_process_user_query_chatbot_instance_not_ready(self):
        # Test the check at the beginning of process_user_query
        self.mock_food_chatbot_instance.is_ready.return_value = False
        response = self.service.process_user_query("Hi")
        # This error message comes from ChatbotService directly
        self.assertEqual(response["error"], "Chatbot is not fully operational at the moment. Please try again later.")

    def test_process_user_query_image_save_failure(self):
        mock_image_file = MagicMock(spec=FileStorage)
        mock_image_file.filename = "test_fail.jpg"
        # Ensure 'name' attribute is also set if secure_filename or other parts rely on it
        mock_image_file.name = "image_file"
        mock_image_file.save = MagicMock(side_effect=IOError("Disk full"))

        response = self.service.process_user_query("Image query", image_file_storage=mock_image_file)

        # Check the response when image saving fails
        self.assertIn("error", response)
        self.assertIn("Could not process the uploaded image", response["error"])
        self.assertEqual(len(os.listdir(self.test_upload_dir)), 0, "Temp directory should be empty after save failure.")

    def test_get_nutrition_for_food_direct_scenarios(self):
        # Ensure chatbot and its food_lookup_service are initially "available" and "ready"
        self.mock_food_chatbot_instance.is_ready.return_value = True
        # self.mock_fls_instance is the one injected into FoodChatbot,
        # so self.mock_food_chatbot_instance.food_lookup_service should be this mock.
        # For clarity, we'll mock the methods on this specific attribute path.
        original_lookup_service_mock = self.mock_food_chatbot_instance.food_lookup_service

        test_cases = [
            {
                "name": "successful_lookup",
                "food_name": "Apple, cooked",
                "lookup_return": {"food": "Apple, cooked", "data": {"calories": "100"}},
                "format_return": "Formatted Apple details",
                "expected_response": {"response": "Nutrition for Apple, cooked: Formatted Apple details"},
                "setup_food_lookup_service_is_none": False,
                "setup_chatbot_is_ready": True,
            },
            {
                "name": "food_not_found",
                "food_name": "Unknown Food",
                "lookup_return": {"error": "Not found"},
                "format_return": None, # Not called
                "expected_response": {"response": "Could not retrieve nutritional information for 'Unknown Food': Not found"},
                "setup_food_lookup_service_is_none": False,
                "setup_chatbot_is_ready": True,
            },
            {
                "name": "empty_food_name",
                "food_name": "",
                "lookup_return": None, # Not called
                "format_return": None, # Not called
                "expected_response": {"error": "Food name cannot be empty."},
                "setup_food_lookup_service_is_none": False,
                "setup_chatbot_is_ready": True, # Check happens before readiness
            },
            {
                "name": "food_lookup_service_none",
                "food_name": "Any Food",
                "lookup_return": None, # Not called
                "format_return": None, # Not called
                "expected_response": {"error": "Food lookup service is not available within the chatbot."},
                "setup_food_lookup_service_is_none": True,
                "setup_chatbot_is_ready": True,
            },
            {
                "name": "chatbot_not_ready",
                "food_name": "Any Food",
                "lookup_return": None, # Not called
                "format_return": None, # Not called
                "expected_response": {"error": "Chatbot core components are not ready."},
                "setup_food_lookup_service_is_none": False,
                "setup_chatbot_is_ready": False,
            },
            {
                "name": "unexpected_lookup_structure",
                "food_name": "Test Food",
                "lookup_return": {"unexpected_key": "value"}, # No "error", "data", or "food"
                "format_return": None, # Not called
                "expected_response": {"response": "Could not find specific nutritional details for 'Test Food' in the expected format."},
                "setup_food_lookup_service_is_none": False,
                "setup_chatbot_is_ready": True,
            },
            {
                "name": "lookup_service_exception",
                "food_name": "Risky Food",
                "lookup_side_effect": Exception("Database connection failed"),
                "format_return": None, # Not called
                "expected_response": {"error": "An unexpected error occurred while fetching nutrition data for Risky Food."},
                "setup_food_lookup_service_is_none": False,
                "setup_chatbot_is_ready": True,
            }
        ]

        for tc in test_cases:
            with self.subTest(name=tc["name"]):
                # Setup mocks based on test case
                self.mock_food_chatbot_instance.is_ready.return_value = tc["setup_chatbot_is_ready"]

                if tc["setup_food_lookup_service_is_none"]:
                    self.mock_food_chatbot_instance.food_lookup_service = None
                else:
                    # Ensure it's the original mock, then configure its methods
                    self.mock_food_chatbot_instance.food_lookup_service = original_lookup_service_mock
                    if tc.get("lookup_side_effect"):
                        self.mock_food_chatbot_instance.food_lookup_service.lookup_food.side_effect = tc["lookup_side_effect"]
                        # Clear previous return_value if side_effect is set
                        self.mock_food_chatbot_instance.food_lookup_service.lookup_food.return_value = MagicMock()
                    else:
                        self.mock_food_chatbot_instance.food_lookup_service.lookup_food.return_value = tc.get("lookup_return")
                        # Clear previous side_effect if return_value is set
                        self.mock_food_chatbot_instance.food_lookup_service.lookup_food.side_effect = None


                if tc.get("format_return") is not None:
                    self.mock_food_chatbot_instance._format_nutrition.return_value = tc["format_return"]

                # Call the method under test
                response = self.service.get_nutrition_for_food_direct(tc["food_name"])
                self.assertEqual(response, tc["expected_response"])

                # Reset mocks for food_lookup_service methods if they were configured
                if not tc["setup_food_lookup_service_is_none"]:
                     self.mock_food_chatbot_instance.food_lookup_service.lookup_food.reset_mock(return_value=True, side_effect=True)
                self.mock_food_chatbot_instance._format_nutrition.reset_mock(return_value=True, side_effect=True)


        # Restore original mocks after all subtests are done
        self.mock_food_chatbot_instance.is_ready.return_value = True
        self.mock_food_chatbot_instance.food_lookup_service = original_lookup_service_mock


if __name__ == '__main__':
    unittest.main()
