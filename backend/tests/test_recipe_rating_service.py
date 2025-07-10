import pytest
from unittest.mock import patch, MagicMock
import sys
import os

test_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(test_dir, '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from services.recipe_rating_service import RecipeRatingService

@pytest.fixture
def recipe_rating_service():
    with patch('services.recipe_rating_service.RecipeRatingDAO') as MockDAO, \
         patch('services.recipe_rating_service.db') as mock_db:
        service = RecipeRatingService()
        service.recipe_rating_dao = MockDAO()
        yield service, service.recipe_rating_dao, mock_db

def test_add_or_update_rating_success(recipe_rating_service):
    service, mock_dao, mock_db = recipe_rating_service
    mock_rating = MagicMock(to_dict=lambda: {'id': 1, 'rating': 5})
    mock_dao.add_rating.return_value = mock_rating
    mock_dao.get_average_rating_for_recipe.return_value = 4.5
    mock_db.session.commit.return_value = None
    resp, err, code = service.add_or_update_rating(1, 1, 5)
    assert code == 200
    assert err is None
    assert resp['user_rating']['rating'] == 5
    assert resp['average_rating'] == 4.5

def test_get_user_rating_for_recipe_success(recipe_rating_service):
    service, mock_dao, _ = recipe_rating_service
    mock_rating = MagicMock(to_dict=lambda: {'id': 1, 'rating': 5})
    mock_dao.get_rating_by_user_and_recipe.return_value = mock_rating
    resp, err, code = service.get_user_rating_for_recipe(1, 1)
    assert code == 200
    assert err is None
    assert resp['rating'] == 5

def test_get_average_rating_for_recipe_success(recipe_rating_service):
    service, mock_dao, _ = recipe_rating_service
    mock_dao.get_average_rating_for_recipe.return_value = 4.5
    resp, err, code = service.get_average_rating_for_recipe(1)
    assert code == 200
    assert err is None
    assert resp['average_rating'] == 4.5 