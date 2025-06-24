import unittest
from unittest.mock import patch, MagicMock
from flask import Flask, jsonify # For creating a dummy app context if needed
import io # For creating dummy FileStorage

# Assuming you have a way to get your Flask app instance for testing
# This might be from a conftest.py or a helper function.
# For simplicity, we'll mock the service directly.
# from backend.app import app # Or your app factory

# If your routes are in a blueprint, you'd register it to a test app.
from backend.routes.classification_routes import classification_bp

class TestClassificationRoutes(unittest.TestCase):

    def setUp(self):
        """Set up test client and mock service."""
        self.app = Flask(__name__)
        self.app.register_blueprint(classification_bp, url_prefix='/api') # Match your app's setup
        self.client = self.app.test_client()

        # Mock the ClassificationService object within the routes module
        # This assumes 'classification_service' is the name of the instantiated service object
        # in classification_routes.py
        self.classification_service_patcher = patch('backend.routes.classification_routes.classification_service')
        self.mock_service_instance = self.classification_service_patcher.start()
        # self.mock_service_instance is now the mock object that replaced 'classification_service'

    def tearDown(self):
        self.classification_service_patcher.stop()

    def test_classify_food_item_route_success(self):
        """Test successful classification route call."""
        # Mock service return value
        self.mock_service_instance.classify_item.return_value = (
            {"predictedFoodName": "Test Apple", "nutritionInfoJSON": "{}"},
            None,
            200
        )

        # Create a dummy image file for POST request
        data = {
            'image': (io.BytesIO(b"dummy_image_content"), 'test.jpg'),
            'name': 'Test Apple from Route' # Optional food name
        }

        response = self.client.post('/api/classify', data=data, content_type='multipart/form-data')

        self.assertEqual(response.status_code, 200)
        json_data = response.get_json()
        self.assertEqual(json_data.get("predictedFoodName"), "Test Apple")

        # Check if service was called with user_id (even if dummy)
        self.mock_service_instance.classify_item.assert_called_once()
        call_args = self.mock_service_instance.classify_item.call_args[1] # Get kwargs
        self.assertIn('user_id', call_args)
        self.assertEqual(call_args['user_id'], 1) # Assuming dummy_user_id=1 in route
        self.assertEqual(call_args['food_name'], 'Test Apple from Route')
        self.assertIsNotNone(call_args['image_file_storage'])


    def test_classify_food_item_route_no_image(self):
        """Test route when no image is provided (service handles this)."""
        self.mock_service_instance.classify_item.return_value = (
            None,
            {"error": "Image file or food name is required for classification"}, # Or whatever the service returns
            400
        )

        data = {'name': 'NoImageApple'} # No image file
        response = self.client.post('/api/classify', data=data, content_type='multipart/form-data')

        self.assertEqual(response.status_code, 400)
        json_data = response.get_json()
        self.assertIn("error", json_data)

        self.mock_service_instance.classify_item.assert_called_once()
        call_args = self.mock_service_instance.classify_item.call_args[1]
        self.assertIsNone(call_args['image_file_storage']) # Image should be None
        self.assertEqual(call_args['food_name'], 'NoImageApple')


if __name__ == '__main__':
    unittest.main()
