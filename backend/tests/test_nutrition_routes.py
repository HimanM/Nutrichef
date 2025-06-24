import pytest
import json
from unittest.mock import patch, MagicMock

# Import the Flask app instance
# Ensure backend.app correctly initializes the Flask app for testing
# For example, if you have a create_app function, you might do:
# from backend.app import create_app
# app = create_app(testing_config) # where testing_config is a config for testing
from backend.app import app as flask_app # Assuming app is directly importable

@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    flask_app.config['TESTING'] = True
    with flask_app.test_client() as client:
        yield client

# The mock target should be where the service instance is used by the blueprint
MOCK_NUTRITION_SERVICE_PATH = 'backend.routes.nutrition_routes.nutrition_service'

def test_get_nutrition_success(client):
    """Test successful retrieval of nutritional information."""
    mock_service_response = {
        'success': True,
        'food_name': 'apple',
        'nutrients': {'calories': 95, 'sugar': '19g'}
    }
    # The route strips 'success' key before returning
    expected_response_data = {'food_name': 'apple', 'nutrients': {'calories': 95, 'sugar': '19g'}}

    with patch(MOCK_NUTRITION_SERVICE_PATH) as mock_service:
        mock_service.get_nutrition.return_value = mock_service_response

        response = client.get('/api/nutrition/apple')

        assert response.status_code == 200
        assert response.content_type == 'application/json'
        assert response.json == expected_response_data
        mock_service.get_nutrition.assert_called_once_with('apple')

def test_get_nutrition_not_found(client):
    """Test when nutritional information is not found for an ingredient."""
    mock_service_response = {
        'success': False,
        'error': 'Food not found in database'
    }
    # The route determines 404 if "not found" is in the error message
    expected_error_json = {'error': 'Food not found in database'}

    with patch(MOCK_NUTRITION_SERVICE_PATH) as mock_service:
        mock_service.get_nutrition.return_value = mock_service_response

        response = client.get('/api/nutrition/nonexistentfood')

        assert response.status_code == 404
        assert response.content_type == 'application/json'
        assert response.json == expected_error_json
        mock_service.get_nutrition.assert_called_once_with('nonexistentfood')

def test_get_nutrition_service_not_initialized(client):
    """Test when the nutrition service is not initialized."""
    mock_service_response = {
        'success': False,
        'error': 'Nutrition lookup module not initialized due to missing data directory.'
    }
    # Route should return 503 if "not initialized" is in the error message
    expected_error_json = {'error': 'Nutrition lookup module not initialized due to missing data directory.'}

    with patch(MOCK_NUTRITION_SERVICE_PATH) as mock_service:
        mock_service.get_nutrition.return_value = mock_service_response

        response = client.get('/api/nutrition/anyfood')

        assert response.status_code == 503
        assert response.content_type == 'application/json'
        assert response.json == expected_error_json
        mock_service.get_nutrition.assert_called_once_with('anyfood')

def test_get_nutrition_invalid_food_name_from_service(client):
    """Test when the service considers the food name invalid (e.g., empty string passed to service)."""
    # This tests how the route handles a 404-like error from the service for an invalid name.
    mock_service_response = {
        'success': False,
        'error': 'Invalid food name provided.'
    }
    expected_error_json = {'error': 'Invalid food name provided.'}

    with patch(MOCK_NUTRITION_SERVICE_PATH) as mock_service:
        mock_service.get_nutrition.return_value = mock_service_response

        # Simulate calling with a name the service deems invalid
        response = client.get('/api/nutrition/empty_or_invalid')

        assert response.status_code == 404 # As "invalid food name" implies "not found"
        assert response.content_type == 'application/json'
        assert response.json == expected_error_json
        mock_service.get_nutrition.assert_called_once_with('empty_or_invalid')

def test_get_nutrition_generic_service_error(client):
    """Test a generic error from the nutrition service."""
    mock_service_response = {
        'success': False,
        'error': 'Some internal processing error.'
    }
    # Route should return 500 for other errors
    expected_error_json = {'error': 'Some internal processing error.'}

    with patch(MOCK_NUTRITION_SERVICE_PATH) as mock_service:
        mock_service.get_nutrition.return_value = mock_service_response

        response = client.get('/api/nutrition/anyfood')

        assert response.status_code == 500
        assert response.content_type == 'application/json'
        assert response.json == expected_error_json
        mock_service.get_nutrition.assert_called_once_with('anyfood')

def test_get_nutrition_unexpected_exception_in_route(client):
    """Test an unexpected exception raised within the route's try block (e.g., before/after service call)."""
    with patch(MOCK_NUTRITION_SERVICE_PATH) as mock_service:
        # Simulate an error not from get_nutrition itself, but elsewhere in the route's try block
        mock_service.get_nutrition.side_effect = Exception("Unexpected route error")

        response = client.get('/api/nutrition/anyfood')

        assert response.status_code == 500
        assert response.content_type == 'application/json'
        assert response.json == {'error': 'An unexpected server error occurred.'}
        mock_service.get_nutrition.assert_called_once_with('anyfood')

# Note: Testing GET /api/nutrition/ (with a truly empty ingredient_name in the URL path)
# is tricky because Flask's routing itself might not match it to this route if it expects a value.
# The route's `if not ingredient_name:` check is more for robustness if the path param somehow becomes empty
# *after* routing, which is unlikely with standard Flask routing for <string:ingredient_name>.
# The `test_get_nutrition_invalid_food_name_from_service` covers cases where the service
# itself deems a non-empty name as invalid (e.g. if it were an empty string POSTed as JSON body,
# but here it's a GET with path param).
# If the route was /api/nutrition and took ingredient_name from query param ?name=, then testing empty
# query param would be more direct. For path params, Flask handles missing values before route code.
