import pytest
from unittest.mock import patch, MagicMock
import sys
import os

test_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(test_dir, '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from services.ingredient_service import IngredientService

@pytest.fixture
def ingredient_service():
    with patch('services.ingredient_service.IngredientDAO') as MockIngredientDAO:
        service = IngredientService()
        service.ingredient_dao = MockIngredientDAO()
        yield service, service.ingredient_dao

def test_get_allergies_for_ingredient_success(ingredient_service):
    service, mock_dao = ingredient_service
    allergy_mock = MagicMock(to_dict=lambda: {'id': 1, 'name': 'Peanut'})
    mock_dao.get_allergies_for_ingredient.return_value = [allergy_mock]
    data, err, code = service.get_allergies_for_ingredient(1)
    assert code == 200
    assert err is None
    assert data[0]['id'] == 1

def test_get_unique_allergies_for_multiple_ingredients_success(ingredient_service):
    service, mock_dao = ingredient_service
    allergy_mock = MagicMock(to_dict=lambda: {'id': 1, 'name': 'Peanut'})
    mock_dao.get_allergies_for_ingredient.side_effect = lambda ingredient_id: [allergy_mock] if ingredient_id == 1 else []
    data, err, code = service.get_unique_allergies_for_multiple_ingredients([1, 2])
    assert code == 200
    assert err is None
    assert 1 in data
    assert isinstance(data[1], list) 