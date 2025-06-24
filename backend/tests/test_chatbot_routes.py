# backend/tests/test_chatbot_routes.py
import unittest
from unittest.mock import patch, MagicMock
import os
import io

# Assuming your Flask app instance is named 'app' in 'backend.app'
# Adjust the import if your app factory or instance is located differently.
# If tests are run from project root: from backend.app import app
# If tests are run from backend directory:
from app import app
# Import the function to be tested
from backend.routes.chatbot_routes import initialize_chatbot_service

class TestChatbotRoutes(unittest.TestCase):

    def setUp(self):
        app.testing = True
        # Make sure instance_path exists for the route's initialize_chatbot_service
        # or that the ChatbotService itself can create its temp folder robustly.
        # For testing, we can pre-create it or ensure the service mock handles it.
        # The route creates current_app.instance_path / 'chatbot_temp_uploads'
        # For this test, we'll assume the patching of ChatbotService bypasses actual folder creation needs.

        # If current_app.instance_path is not set or doesn't exist, os.path.join might behave unexpectedly.
        # Flask's test app usually has a default instance_path.
        if not os.path.exists(app.instance_path):
             os.makedirs(app.instance_path, exist_ok=True)

        self.client = app.test_client()

        # Patch ChatbotService where it's imported in chatbot_routes
        # The original patch target was 'routes.chatbot_routes.ChatbotService'
        # This needs to match the import statement in backend/routes/chatbot_routes.py
        # The import in chatbot_routes.py is:
        # try: from backend.services.chatbot_service import ChatbotService
        # except ImportError: from services.chatbot_service import ChatbotService
        # If tests run from 'backend' folder, 'services.chatbot_service' is more likely.
        # However, if PYTHONPATH includes project root, 'backend.services.chatbot_service' is also possible.
        # Let's try patching both common import styles or ensure one is canonical for testing.
        # For consistency, assuming tests run from backend dir, 'services.chatbot_service' is a good candidate.
        # Or, if the 'backend' package is in PYTHONPATH, 'backend.services.chatbot_service'.
        # Given the FoodChatbot test used 'ai_models.chatbot...', this implies 'backend' is not the top for resolution.
        # So, 'backend.services.chatbot_service' is the most robust path if project root is in sys.path.
        # The prompt used 'routes.chatbot_routes.ChatbotService', which means patching it within that module's namespace.

        # Let's assume the import `from backend.services.chatbot_service import ChatbotService` is resolved
        # by the test environment (e.g. PYTHONPATH includes the project root).
        # So, the routes file (backend/routes/chatbot_routes.py) will have ChatbotService in its namespace.
        self.service_patcher = patch('backend.routes.chatbot_routes.ChatbotService')
        self.MockChatbotServiceClass = self.service_patcher.start() # Store the Class mock on self

        self.mock_chatbot_service_instance = self.MockChatbotServiceClass.return_value

        # Ensure the app context has the mocked service instance
        # This simulates the @chatbot_bp.before_app_first_request behavior
        if not hasattr(app, 'extensions') or app.extensions is None:
            app.extensions = {}
        app.extensions['chatbot_service'] = self.mock_chatbot_service_instance

    def tearDown(self):
        self.service_patcher.stop()
        if hasattr(app, 'extensions') and 'chatbot_service' in app.extensions:
            del app.extensions['chatbot_service']
        # Clean up instance_path if it was created by setUp
        # Be cautious if instance_path is used by other tests or app components.
        # For isolated testing, specific temp dirs within instance_path are better.
        # The route creates 'chatbot_temp_uploads' inside instance_path.
        instance_chatbot_temp = os.path.join(app.instance_path, 'chatbot_temp_uploads')
        if os.path.exists(instance_chatbot_temp):
            # shutil.rmtree(instance_chatbot_temp) # Requires import shutil
            pass # Let's assume it's fine for it to persist or be cleaned by other means.


    def test_query_text_only_success(self):
        self.mock_chatbot_service_instance.is_chatbot_ready.return_value = True
        self.mock_chatbot_service_instance.process_user_query.return_value = {"response": "Text processed"}

        response = self.client.post('/api/chatbot/query', data={'text_query': 'Hello'})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {"response": "Text processed"})
        # In Flask routes, request.files.get('image_file') would be None if not sent.
        # ChatbotService's process_user_query expects image_file_storage (FileStorage obj or None)
        self.mock_chatbot_service_instance.process_user_query.assert_called_once_with('Hello', image_file_storage=None)

    def test_query_with_image_success(self):
        self.mock_chatbot_service_instance.is_chatbot_ready.return_value = True
        self.mock_chatbot_service_instance.process_user_query.return_value = {"response": "Image processed"}

        mock_image_data = (io.BytesIO(b"dummy_image_content"), 'test.jpg')

        response = self.client.post(
            '/api/chatbot/query',
            data={'text_query': 'What is this?', 'image_file': mock_image_data}, # image_file is the key
            content_type='multipart/form-data'
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {"response": "Image processed"})

        args, kwargs = self.mock_chatbot_service_instance.process_user_query.call_args
        self.assertEqual(args[0], 'What is this?') # text_query
        # The image_file_storage argument in process_user_query will be a FileStorage object
        self.assertIsNotNone(kwargs.get('image_file_storage'))
        self.assertEqual(kwargs.get('image_file_storage').filename, 'test.jpg')


    def test_query_image_only_success(self):
        self.mock_chatbot_service_instance.is_chatbot_ready.return_value = True
        self.mock_chatbot_service_instance.process_user_query.return_value = {"response": "Image-only processed"}

        mock_image_data = (io.BytesIO(b"dummy_image_content_img_only"), 'test_img_only.jpg')

        response = self.client.post(
            '/api/chatbot/query',
            data={'image_file': mock_image_data}, # No text_query
            content_type='multipart/form-data'
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {"response": "Image-only processed"})

        args, kwargs = self.mock_chatbot_service_instance.process_user_query.call_args
        # Default text_query "What is this?" should be used by the route
        self.assertEqual(args[0], 'What is this?')
        self.assertIsNotNone(kwargs.get('image_file_storage'))
        self.assertEqual(kwargs.get('image_file_storage').filename, 'test_img_only.jpg')

    def test_query_missing_input(self):
        self.mock_chatbot_service_instance.is_chatbot_ready.return_value = True
        response = self.client.post('/api/chatbot/query', data={}) # No text_query or image_file
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json)
        self.assertIn("Missing 'text_query' or 'image_file'", response.json['error'])

    def test_query_service_not_ready(self):
        self.mock_chatbot_service_instance.is_chatbot_ready.return_value = False
        response = self.client.post('/api/chatbot/query', data={'text_query': 'Hi'})
        self.assertEqual(response.status_code, 503)
        self.assertIn("error", response.json)
        self.assertIn("Chatbot is currently initializing", response.json['error'])

    def test_query_service_not_initialized_in_app(self):
        # Simulate service not being in app.extensions
        original_extensions = app.extensions
        app.extensions = {} # Clear extensions to simulate it not being there

        response = self.client.post('/api/chatbot/query', data={'text_query': 'trigger service missing'})
        self.assertEqual(response.status_code, 503)
        self.assertIn("error", response.json)
        self.assertIn("Chatbot service is not available", response.json['error'])

        app.extensions = original_extensions # Restore

    def test_query_service_process_raises_exception(self):
        self.mock_chatbot_service_instance.is_chatbot_ready.return_value = True
        self.mock_chatbot_service_instance.process_user_query.side_effect = Exception("Unexpected model error")

        response = self.client.post('/api/chatbot/query', data={'text_query': 'trigger error'})
        self.assertEqual(response.status_code, 500)
        self.assertIn("error", response.json)
        self.assertIn("An unexpected error occurred", response.json['error'])

    def test_initialize_chatbot_service_integration(self):
        """
        Tests if initialize_chatbot_service correctly instantiates ChatbotService
        and places it into app.extensions.
        """
        # The class-level patch self.MockChatbotServiceClass is active.
        # self.mock_chatbot_service_instance is its default return_value.

        # Reset call count for the class mock from setUp or other tests.
        self.MockChatbotServiceClass.reset_mock()
        self.mock_chatbot_service_instance.reset_mock() # Also reset instance mock if its calls are checked

        with app.app_context():
            # Remove the service if it was added by setUp, to test initialize_chatbot_service's action
            if 'chatbot_service' in app.extensions:
                del app.extensions['chatbot_service']

            initialize_chatbot_service() # This should call the mocked ChatbotService constructor

            # Assert that the mocked ChatbotService constructor was called by initialize_chatbot_service
            self.MockChatbotServiceClass.assert_called_once()

            # Assert that the instance in extensions is the one produced by our mock constructor
            self.assertIn('chatbot_service', app.extensions)
            self.assertIs(app.extensions['chatbot_service'], self.mock_chatbot_service_instance)

            # Optionally, check logger calls if you mock current_app.logger
            # Example (requires logger mock setup):
            # current_app.logger.info.assert_any_call(
            #     f"ChatbotService initialized and stored in app.extensions. Temp folder: ..."
            # )

    def test_route_food_nutrition_direct_scenarios(self):
        test_cases = [
            {
                "name": "successful_request",
                "payload": {"food_name": "Test Food"},
                "service_ready": True,
                "service_method_return": {"response": "Nutrition details for Test Food"},
                "service_method_side_effect": None,
                "expected_status": 200,
                "expected_json": {"response": "Nutrition details for Test Food"},
                "expect_service_call_with": "Test Food"
            },
            {
                "name": "missing_food_name_key",
                "payload": {}, # food_name key is missing
                "service_ready": True,
                "service_method_return": None,
                "service_method_side_effect": None,
                "expected_status": 400,
                "expected_json": {"error": "Missing or empty 'food_name' in request body"},
                "expect_service_call_with": None # Method not called
            },
            {
                "name": "empty_food_name_value",
                "payload": {"food_name": "  "}, # Empty after strip
                "service_ready": True,
                "service_method_return": None,
                "service_method_side_effect": None,
                "expected_status": 400,
                "expected_json": {"error": "Missing or empty 'food_name' in request body"},
                "expect_service_call_with": None # Method not called
            },
            {
                "name": "service_method_returns_error_payload",
                "payload": {"food_name": "Error Food"},
                "service_ready": True,
                "service_method_return": {"error": "Internal service failure"},
                "service_method_side_effect": None,
                "expected_status": 200, # Route worked, service indicated error
                "expected_json": {"error": "Internal service failure"},
                "expect_service_call_with": "Error Food"
            },
            {
                "name": "service_not_ready",
                "payload": {"food_name": "Any Food"},
                "service_ready": False,
                "service_method_return": None,
                "service_method_side_effect": None,
                "expected_status": 503,
                "expected_json": {"error": "Chatbot is currently initializing or encountered an issue. Please try again shortly."},
                "expect_service_call_with": None # Method not called due to readiness check
            },
            {
                "name": "service_method_raises_exception",
                "payload": {"food_name": "Exception Food"},
                "service_ready": True,
                "service_method_return": None,
                "service_method_side_effect": Exception("Unexpected boom"),
                "expected_status": 500,
                "expected_json": {"error": "An unexpected error occurred while fetching nutrition data."},
                "expect_service_call_with": "Exception Food"
            },
             {
                "name": "malformed_json_input", # Test client's json parameter handles stringification. This tests empty body.
                "payload_raw_body": "not a json string", # Send raw non-JSON string
                "content_type": "application/json",
                "service_ready": True,
                "expected_status": 400, # Werkzeug's get_json() will raise BadRequest
                "expected_json_contains_error": "Invalid request format", # Or similar, depends on Flask error handling
                "expect_service_call_with": None
            }
        ]

        for tc in test_cases:
            with self.subTest(name=tc["name"]):
                self.mock_chatbot_service_instance.is_chatbot_ready.return_value = tc["service_ready"]

                if tc.get("service_method_side_effect"):
                    self.mock_chatbot_service_instance.get_nutrition_for_food_direct.side_effect = tc["service_method_side_effect"]
                    self.mock_chatbot_service_instance.get_nutrition_for_food_direct.return_value = MagicMock() # Clear previous return
                else:
                    self.mock_chatbot_service_instance.get_nutrition_for_food_direct.return_value = tc.get("service_method_return")
                    self.mock_chatbot_service_instance.get_nutrition_for_food_direct.side_effect = None # Clear previous side_effect

                if tc.get("payload_raw_body"):
                    response = self.client.post('/api/chatbot/food_nutrition_direct',
                                                data=tc["payload_raw_body"],
                                                content_type=tc["content_type"])
                else:
                    response = self.client.post('/api/chatbot/food_nutrition_direct', json=tc.get("payload"))

                self.assertEqual(response.status_code, tc["expected_status"])
                if tc.get("expected_json"):
                    self.assertEqual(response.json, tc["expected_json"])
                elif tc.get("expected_json_contains_error"):
                     self.assertIn("error", response.json)
                     self.assertIn(tc["expected_json_contains_error"], response.json["error"])


                if tc.get("expect_service_call_with"):
                    self.mock_chatbot_service_instance.get_nutrition_for_food_direct.assert_called_once_with(tc["expect_service_call_with"])
                else:
                    self.mock_chatbot_service_instance.get_nutrition_for_food_direct.assert_not_called()

                # Reset mocks for the next subtest
                self.mock_chatbot_service_instance.get_nutrition_for_food_direct.reset_mock(return_value=True, side_effect=True)
                self.mock_chatbot_service_instance.is_chatbot_ready.reset_mock(return_value=True, side_effect=True)


if __name__ == '__main__':
    unittest.main()
