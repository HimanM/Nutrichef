import pytest
from unittest.mock import patch, MagicMock
import sys
import os

test_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(test_dir, '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from services.recipe_service import RecipeService

@pytest.fixture
def recipe_service():
    with patch('services.recipe_service.RecipeDAO') as MockRecipeDAO, \
         patch('services.recipe_service.IngredientDAO') as MockIngredientDAO, \
         patch('services.recipe_service.RecipeRatingDAO') as MockRecipeRatingDAO, \
         patch('services.recipe_service.AllergyAnalyzer'), \
         patch('services.recipe_service.GeminiNlpParser'), \
         patch('services.recipe_service.db') as mock_db:
        service = RecipeService()
        service.recipe_dao = MockRecipeDAO()
        service.ingredient_dao = MockIngredientDAO()
        service.recipe_rating_dao = MockRecipeRatingDAO()
        yield service, service.recipe_dao, service.ingredient_dao, service.recipe_rating_dao, mock_db

def test_get_public_recipes_summary_success(recipe_service):
    service, mock_recipe_dao, *_ = recipe_service
    mock_recipe = MagicMock(to_dict_summary=lambda: {'id': 1})
    mock_pagination = MagicMock(items=[mock_recipe], page=1, pages=1, per_page=12, total=1, has_next=False, has_prev=False)
    mock_recipe_dao.get_public_recipes.return_value = mock_pagination
    resp, err, code = service.get_public_recipes_summary()
    assert code == 200
    assert err is None
    assert 'recipes' in resp

def test_create_recipe_success(recipe_service):
    service, mock_recipe_dao, mock_ingredient_dao, *_ = recipe_service
    mock_ingredient = MagicMock()
    mock_ingredient_dao.get_or_create_ingredient.return_value = mock_ingredient
    mock_recipe = MagicMock(to_dict=lambda: {'id': 1})
    mock_recipe_dao.create_recipe.return_value = mock_recipe
    with patch('services.recipe_service.db') as mock_db:
        mock_db.session.commit.return_value = None
        data = {
            'title': 'Test Recipe',
            'description': 'desc',
            'instructions': 'do this',
            'ingredients': [{'name': 'Flour', 'quantity': '1', 'unit': 'cup'}]
        }
        resp, err, code = service.create_recipe(1, data)
        assert code == 201
        assert err is None
        assert resp['id'] == 1 