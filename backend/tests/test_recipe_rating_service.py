import pytest
from unittest.mock import MagicMock, patch
from backend.services.recipe_rating_service import RecipeRatingService
from backend.models import RecipeRating # For creating instances if needed for type hints or spec

@pytest.fixture
def mock_rating_dao(): # Renamed from mock_recipe_rating_dao to avoid conflict
    return MagicMock()

@pytest.fixture
def rating_service(mock_rating_dao):
    # Patch DAO instantiation within RecipeRatingService's scope
    with patch('backend.services.recipe_rating_service.RecipeRatingDAO', return_value=mock_rating_dao) as patched_dao:
        service = RecipeRatingService()
        # service.recipe_rating_dao = mock_rating_dao # No, this is handled by the patch
        return service

def test_add_or_update_rating_valid(rating_service, mock_rating_dao):
    recipe_id = 1
    user_id = 1
    rating_val = 5

    mock_rating_obj = MagicMock(spec=RecipeRating) # This is a RecipeRating model instance
    mock_rating_obj.to_dict.return_value = {"RatingID": 1, "Rating": rating_val, "RecipeID": recipe_id, "UserID": user_id}

    mock_rating_dao.add_rating.return_value = mock_rating_obj
    mock_rating_dao.get_average_rating_for_recipe.return_value = 4.5

    with patch('backend.services.recipe_rating_service.db.session.commit') as mock_commit:
        result, error, status = rating_service.add_or_update_rating(recipe_id, user_id, rating_val)

    mock_rating_dao.add_rating.assert_called_once_with(recipe_id, user_id, rating_val)
    mock_commit.assert_called_once()
    mock_rating_dao.get_average_rating_for_recipe.assert_called_once_with(recipe_id)
    assert status == 200
    assert result['user_rating']['Rating'] == rating_val
    assert result['average_rating'] == 4.5

@pytest.mark.parametrize("invalid_rating", [0, 6, "abc", 3.5])
def test_add_or_update_rating_invalid_input(rating_service, mock_rating_dao, invalid_rating):
    result, error, status = rating_service.add_or_update_rating(1, 1, invalid_rating)

    assert status == 400
    assert "Rating must be an integer between 1 and 5" in error['error']
    mock_rating_dao.add_rating.assert_not_called()

def test_add_or_update_rating_dao_exception(rating_service, mock_rating_dao):
    recipe_id = 1
    user_id = 1
    rating_val = 4

    mock_rating_dao.add_rating.side_effect = Exception("DAO error")
    with patch('backend.services.recipe_rating_service.db.session.rollback') as mock_rollback:
        result, error, status = rating_service.add_or_update_rating(recipe_id, user_id, rating_val)

    assert status == 500
    assert "Failed to add or update rating" in error['error']
    mock_rollback.assert_called_once()


def test_get_user_rating_for_recipe_found(rating_service, mock_rating_dao):
    recipe_id = 1
    user_id = 1
    mock_rating_obj = MagicMock(spec=RecipeRating)
    mock_rating_obj.to_dict.return_value = {"RatingID": 1, "Rating": 4, "RecipeID": recipe_id, "UserID": user_id}
    mock_rating_dao.get_rating_by_user_and_recipe.return_value = mock_rating_obj

    result, error, status = rating_service.get_user_rating_for_recipe(recipe_id, user_id)

    mock_rating_dao.get_rating_by_user_and_recipe.assert_called_once_with(recipe_id, user_id)
    assert status == 200
    assert result['Rating'] == 4

def test_get_user_rating_for_recipe_not_found(rating_service, mock_rating_dao):
    recipe_id = 1
    user_id = 1
    mock_rating_dao.get_rating_by_user_and_recipe.return_value = None # Simulate not found

    result, error, status = rating_service.get_user_rating_for_recipe(recipe_id, user_id)

    mock_rating_dao.get_rating_by_user_and_recipe.assert_called_once_with(recipe_id, user_id)
    assert status == 404
    assert error['message'] == "No rating found for this user and recipe"


def test_get_average_rating_service(rating_service, mock_rating_dao):
    recipe_id = 1
    mock_rating_dao.get_average_rating_for_recipe.return_value = 3.75

    result, error, status = rating_service.get_average_rating_for_recipe(recipe_id)

    mock_rating_dao.get_average_rating_for_recipe.assert_called_once_with(recipe_id)
    assert status == 200
    assert result['average_rating'] == 3.75

def test_get_average_rating_service_dao_exception(rating_service, mock_rating_dao):
    recipe_id = 1
    mock_rating_dao.get_average_rating_for_recipe.side_effect = Exception("DAO error")

    result, error, status = rating_service.get_average_rating_for_recipe(recipe_id)

    assert status == 500
    assert "Failed to retrieve average rating" in error['error']
