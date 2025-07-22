import pytest
from unittest.mock import patch, MagicMock
import sys
import os

test_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(test_dir, '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from services.nutrition_service import NutritionService

@pytest.fixture
def nutrition_service():
    with patch('services.nutrition_service.OfflineNutritionLookup') as MockLookup, \
         patch('services.nutrition_service.os.path.exists', return_value=True):
        mock_lookup = MockLookup()
        mock_lookup.get_nutrition_for_food.return_value = {'food': 'Apple', 'calories': 52}
        service = NutritionService()
        service.lookup = mock_lookup
        yield service, mock_lookup

def test_get_nutrition_success(nutrition_service):
    service, mock_lookup = nutrition_service
    result = service.get_nutrition('Apple')
    assert result['food'] == 'Apple'
    assert result['calories'] == 52 