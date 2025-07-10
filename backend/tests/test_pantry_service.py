import pytest
from unittest.mock import patch, MagicMock
import sys
import os

test_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(test_dir, '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from services.pantry_service import PantryService

@pytest.fixture
def pantry_service():
    with patch('services.pantry_service.PantryDAO') as MockPantryDAO, \
         patch('services.pantry_service.RecipeDAO') as MockRecipeDAO, \
         patch('services.pantry_service.db') as mock_db:
        service = PantryService()
        service.pantry_dao = MockPantryDAO()
        service.recipe_dao = MockRecipeDAO()
        yield service, service.pantry_dao, service.recipe_dao, mock_db

def test_add_ingredient_success(pantry_service):
    service, mock_pantry_dao, _, mock_db = pantry_service
    mock_item = MagicMock(to_dict=lambda include_relations=True: {'id': 1})
    mock_pantry_dao.add_ingredient_to_pantry.return_value = mock_item
    mock_db.session.commit.return_value = None
    result = service.add_ingredient(1, 'Tomato', 2, 'pcs')
    assert result['id'] == 1

def test_add_ingredients_bulk_success(pantry_service):
    service, mock_pantry_dao, _, mock_db = pantry_service
    mock_item = MagicMock(to_dict=lambda include_relations=True: {'id': 1})
    mock_pantry_dao.add_ingredient_to_pantry.return_value = mock_item
    mock_db.session.commit.return_value = None
    data = [{'ingredient_name': 'Tomato', 'quantity': 2, 'unit': 'pcs'}]
    result = service.add_ingredients_bulk(1, data)
    assert 'successful_items' in result
    assert result['successful_items'][0]['id'] == 1

def test_get_pantry_success(pantry_service):
    service, mock_pantry_dao, *_ = pantry_service
    mock_item = MagicMock(to_dict=lambda include_relations=True: {'id': 1})
    mock_pantry_dao.get_pantry_by_user_id.return_value = [mock_item]
    result = service.get_pantry(1)
    assert result[0]['id'] == 1

def test_update_ingredient_success(pantry_service):
    service, mock_pantry_dao, *_ = pantry_service
    mock_item = MagicMock(to_dict=lambda include_relations=True: {'id': 1})
    mock_pantry_dao.update_pantry_ingredient.return_value = mock_item
    with patch('services.pantry_service.db') as mock_db:
        mock_db.session.commit.return_value = None
        result = service.update_ingredient(1, 3, 'pcs')
        assert result['id'] == 1

def test_remove_ingredient_success(pantry_service):
    service, mock_pantry_dao, *_ = pantry_service
    mock_pantry_dao.remove_ingredient_from_pantry.return_value = True
    with patch('services.pantry_service.db') as mock_db:
        mock_db.session.commit.return_value = None
        result = service.remove_ingredient(1)
        assert result['success'] is True

def test_suggest_recipes_success(pantry_service):
    service, mock_pantry_dao, mock_recipe_dao, _ = pantry_service
    mock_pantry_dao.get_pantry_by_user_id.return_value = [MagicMock(IngredientID=1)]
    mock_recipe = MagicMock(RecipeID=1, to_dict=lambda: {'id': 1})
    mock_recipe_dao.get_all_recipes_for_suggestions.return_value = [mock_recipe]
    mock_recipe_dao.get_ingredients_for_recipe.return_value = [MagicMock(IngredientID=1)]
    mock_recipe_dao.get_average_rating_for_recipe.return_value = 4.5
    result = service.suggest_recipes(1)
    assert 'recipes' in result
    assert isinstance(result['recipes'], list) 