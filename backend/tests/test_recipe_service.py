import pytest
from unittest.mock import MagicMock, patch
from backend.services.recipe_service import RecipeService
# from backend.services.recipe_rating_service import RecipeRatingService # Not directly imported by RecipeService for method calls
from backend.models import Recipe, User # For creating instances if needed for type hints or spec

# Mock DAO instances that will be injected or patched
@pytest.fixture
def mock_recipe_dao():
    return MagicMock()

@pytest.fixture
def mock_ingredient_dao():
    return MagicMock()

@pytest.fixture
def mock_recipe_rating_dao():
    return MagicMock()

@pytest.fixture
def recipe_service(mock_recipe_dao, mock_ingredient_dao, mock_recipe_rating_dao):
    # Patch DAO instantiations within RecipeService's scope
    with patch('backend.services.recipe_service.RecipeDAO', return_value=mock_recipe_dao) as patched_recipe_dao, \
         patch('backend.services.recipe_service.IngredientDAO', return_value=mock_ingredient_dao) as patched_ingredient_dao, \
         patch('backend.services.recipe_service.RecipeRatingDAO', return_value=mock_recipe_rating_dao) as patched_recipe_rating_dao:

        service = RecipeService()
        # The RecipeService __init__ creates its own DAO instances.
        # The patches ensure these are the mocks.
        # service.recipe_dao = mock_recipe_dao -> no, this is handled by patch
        # service.ingredient_dao = mock_ingredient_dao -> no, this is handled by patch
        # service.recipe_rating_dao = mock_recipe_rating_dao -> no, this is handled by patch
        return service

def test_create_recipe_service(recipe_service, mock_recipe_dao, mock_ingredient_dao): # mock_ingredient_dao from fixture
    user_id = 1
    recipe_data = {
        'title': 'Service Test Recipe', 'description': 'Desc', 'instructions': 'Instr',
        'ingredients': [{'name': 'Test Ing', 'quantity': '1', 'unit': 'cup'}], # Ingredient name is 'Test Ing'
        'is_public': True, 'preparationTimeMinutes': 10, 'cookingTimeMinutes': 20, 'servings': 2
    }

    mock_ingredient_model = MagicMock() # This represents the Ingredient ORM model
    # Ensure the ingredient_dao mock (which is recipe_service.ingredient_dao) returns this
    recipe_service.ingredient_dao.get_or_create_ingredient.return_value = mock_ingredient_model

    mock_created_recipe = MagicMock(spec=Recipe)
    mock_created_recipe.to_dict.return_value = {"RecipeID": 1, "Title": "Service Test Recipe", "is_public": True}
    mock_recipe_dao.create_recipe.return_value = mock_created_recipe # This is recipe_service.recipe_dao

    with patch('backend.services.recipe_service.db.session.commit') as mock_commit:
        result, error, status = recipe_service.create_recipe(user_id, recipe_data)

    # Assert that get_or_create_ingredient was called with 'Test Ing'
    recipe_service.ingredient_dao.get_or_create_ingredient.assert_called_once_with('Test Ing')

    mock_recipe_dao.create_recipe.assert_called_once()
    args, kwargs = mock_recipe_dao.create_recipe.call_args
    assert kwargs['is_public'] is True
    assert kwargs['title'] == 'Service Test Recipe'
    # Check that the ingredient_model was passed in ingredients_data
    assert len(kwargs['ingredients_data']) == 1
    assert kwargs['ingredients_data'][0]['ingredient_model'] == mock_ingredient_model

    mock_commit.assert_called_once()
    assert status == 201
    assert result['Title'] == "Service Test Recipe"

def test_get_public_recipes_summary(recipe_service, mock_recipe_dao):
    mock_recipe = MagicMock(spec=Recipe)
    mock_recipe.to_dict_summary.return_value = {"RecipeID": 1, "Title": "Public Summary"}
    mock_paginated_obj = MagicMock()
    mock_paginated_obj.items = [mock_recipe]
    mock_paginated_obj.total = 1
    mock_paginated_obj.pages = 1
    mock_paginated_obj.page = 1
    mock_recipe_dao.get_public_recipes.return_value = mock_paginated_obj

    result, error, status = recipe_service.get_public_recipes_summary(page=1, limit=10)

    mock_recipe_dao.get_public_recipes.assert_called_once_with(page=1, limit=10, search_term=None)
    assert status == 200
    assert result['total'] == 1
    assert result['recipes'][0]['Title'] == "Public Summary"

def test_get_user_private_recipes_summary(recipe_service, mock_recipe_dao):
    user_id = 1
    mock_recipe = MagicMock(spec=Recipe)
    mock_recipe.to_dict_summary.return_value = {"RecipeID": 2, "Title": "Private Summary"}
    mock_paginated_obj = MagicMock()
    mock_paginated_obj.items = [mock_recipe]
    mock_paginated_obj.total = 1
    mock_paginated_obj.pages = 1
    mock_paginated_obj.page = 1
    mock_recipe_dao.get_user_private_recipes.return_value = mock_paginated_obj

    result, error, status = recipe_service.get_user_private_recipes_summary(user_id=user_id, page=1, limit=10)

    mock_recipe_dao.get_user_private_recipes.assert_called_once_with(user_id, page=1, limit=10, search_term=None)
    assert status == 200
    assert result['recipes'][0]['Title'] == "Private Summary"


def test_get_recipe_details_with_user_rating(recipe_service, mock_recipe_dao, mock_recipe_rating_dao):
    recipe_id = 1
    user_id = 1
    mock_db_recipe = MagicMock(spec=Recipe)
    # The DAO sets average_rating on the recipe object before service gets it
    mock_db_recipe.average_rating = 4.5
    mock_db_recipe.to_dict.return_value = {
        "RecipeID": recipe_id, "Title": "Detailed Recipe", "average_rating": 4.5
        # to_dict in model now includes average_rating if hasattr
    }
    mock_recipe_dao.get_recipe_by_id.return_value = mock_db_recipe

    mock_user_rating_model = MagicMock() # This is a RecipeRating model instance
    mock_user_rating_model.Rating = 5
    # This is recipe_service.recipe_rating_dao
    recipe_service.recipe_rating_dao.get_rating_by_user_and_recipe.return_value = mock_user_rating_model

    result, error, status = recipe_service.get_recipe_details(recipe_id, current_user_id=user_id)

    mock_recipe_dao.get_recipe_by_id.assert_called_once_with(recipe_id)
    recipe_service.recipe_rating_dao.get_rating_by_user_and_recipe.assert_called_once_with(recipe_id, user_id)
    assert status == 200
    assert result['Title'] == "Detailed Recipe"
    assert result['average_rating'] == 4.5 # This comes from recipe.to_dict() using recipe.average_rating
    assert result['current_user_rating'] == 5 # This is added by the service

def test_get_recipe_details_no_user_rating(recipe_service, mock_recipe_dao, mock_recipe_rating_dao):
    recipe_id = 1
    user_id = 1 # User exists but has not rated
    mock_db_recipe = MagicMock(spec=Recipe)
    mock_db_recipe.average_rating = 3.0
    mock_db_recipe.to_dict.return_value = {"RecipeID": recipe_id, "Title": "Another Recipe", "average_rating": 3.0}
    mock_recipe_dao.get_recipe_by_id.return_value = mock_db_recipe

    recipe_service.recipe_rating_dao.get_rating_by_user_and_recipe.return_value = None # Simulate no rating found

    result, error, status = recipe_service.get_recipe_details(recipe_id, current_user_id=user_id)

    recipe_service.recipe_rating_dao.get_rating_by_user_and_recipe.assert_called_once_with(recipe_id, user_id)
    assert status == 200
    assert result['current_user_rating'] is None

def test_get_recipe_details_unauthenticated(recipe_service, mock_recipe_dao, mock_recipe_rating_dao):
    recipe_id = 1
    mock_db_recipe = MagicMock(spec=Recipe)
    mock_db_recipe.average_rating = 4.0
    mock_db_recipe.to_dict.return_value = {"RecipeID": recipe_id, "Title": "Public View Recipe", "average_rating": 4.0}
    mock_recipe_dao.get_recipe_by_id.return_value = mock_db_recipe

    result, error, status = recipe_service.get_recipe_details(recipe_id, current_user_id=None) # No user ID

    recipe_service.recipe_rating_dao.get_rating_by_user_and_recipe.assert_not_called()
    assert status == 200
    assert result['current_user_rating'] is None # Service sets this to None if no user_id
    assert result['average_rating'] == 4.0
