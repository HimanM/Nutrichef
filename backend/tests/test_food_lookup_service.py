import pytest
from unittest.mock import patch, MagicMock
import sys
import os

test_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(test_dir, '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from services.food_lookup_service import FoodLookupService

@pytest.fixture
def food_lookup_service():
    with patch('services.food_lookup_service.NutritionDatabase') as MockNutritionDatabase:
        mock_db = MockNutritionDatabase()
        mock_db.get_food_info.return_value = '{"food": "Apple", "calories": 52}'
        with patch('services.food_lookup_service.json'):
            service = FoodLookupService()
            service.db = mock_db
            yield service, mock_db

def test_lookup_food_success(food_lookup_service):
    service, mock_db = food_lookup_service
    with patch('services.food_lookup_service.json.loads', return_value={"food": "Apple", "calories": 52}):
        result = service.lookup_food('Apple')
        assert result['food'] == 'Apple'
        assert result['calories'] == 52 