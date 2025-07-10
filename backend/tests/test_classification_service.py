import pytest
from unittest.mock import patch, MagicMock
import sys
import os

test_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(test_dir, '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from services.classification_service import ClassificationService

@pytest.fixture
def classification_service():
    with patch('services.classification_service.ClassificationResultDAO') as MockDAO, \
         patch('services.classification_service.NutritionService') as MockNutritionService, \
         patch('services.classification_service.FoodIngredientClassifier') as MockIngredientClassifier, \
         patch('services.classification_service.FoodClassifier') as MockFoodClassifier, \
         patch('services.classification_service.db') as mock_db:
        mock_nutrition = MockNutritionService.get_instance.return_value
        mock_nutrition.get_nutrition.return_value = {'food': 'Apple', 'calories': 52}
        mock_food_classifier = MockFoodClassifier()
        mock_food_classifier.is_model_loaded.return_value = True
        mock_food_classifier.predict_food.return_value = [{'name': 'Apple', 'confidence': 0.99}]
        MockFoodClassifier.return_value = mock_food_classifier
        service = ClassificationService()
        service.classification_result_dao = MockDAO()
        service.nutrition_service = mock_nutrition
        service.food_classifier = mock_food_classifier
        yield service, service.classification_result_dao, mock_nutrition, mock_food_classifier, mock_db

def test_classify_item_food_mode_success(classification_service):
    service, mock_dao, mock_nutrition, mock_food_classifier, mock_db = classification_service
    image_file_storage = MagicMock()
    image_file_storage.filename = 'test.jpg'
    with patch('services.classification_service.secure_filename', return_value='test.jpg'), \
         patch('services.classification_service.os.path.exists', return_value=True), \
         patch('services.classification_service.os.remove'):
        # Simulate file save and remove
        image_file_storage.save.return_value = None
        resp, err, code = service.classify_item(image_file_storage, 1, 'food')
        assert code == 200
        assert err is None
        assert 'classification' in resp
        assert resp['classification']['imagePredictedFoodName'] == 'Apple' 