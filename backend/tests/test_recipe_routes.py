import json
import pytest
from backend.models import User, Recipe, RecipeRating # For verification
from backend.db import db # Assuming this is the SQLAlchemy db instance from your app

# init_database fixture is assumed to be in conftest.py or defined similarly
# to the one in test_dao files, ensuring clean DB for each test.
# If not, it needs to be added to conftest.py or this file.
# For this subtask, we assume 'init_database' is available and works like in DAO tests.

@pytest.fixture(scope='function', autouse=True)
def setup_teardown_db(db): # db fixture from conftest.py
    # Clean up relevant tables before each test
    RecipeRating.query.delete()
    # RecipeIngredient.query.delete() # If these tables get populated by helpers
    # Ingredient.query.delete()
    Recipe.query.delete()
    User.query.delete()
    db.session.commit()
    yield
    # No explicit teardown here, conftest.py's db fixture handles session.remove
    # and app fixture handles db.drop_all at session end.

# Helper function to create a user
def create_test_user(username, email, password):
    user = User(Name=username, Email=email)
    user.set_password(password) # Assuming User model has set_password method
    db.session.add(user)
    db.session.commit()
    return user

# Helper to create a recipe
def create_test_recipe(user_id, title, is_public, description="Desc", instructions="Instr"):
    recipe = Recipe(
        UserID=user_id, Title=title, Description=description,
        Instructions=instructions, PreparationTimeMinutes=10, CookingTimeMinutes=10,
        Servings=2, ImageURL="/path/to/image.jpg", is_public=is_public
    )
    db.session.add(recipe)
    db.session.commit()
    return recipe

# Helper to create a rating
def create_test_rating(user_id, recipe_id, rating_value):
    rating = RecipeRating(UserID=user_id, RecipeID=recipe_id, Rating=rating_value)
    db.session.add(rating)
    db.session.commit()
    return rating

def test_create_recipe_public_and_private(client, setup_teardown_db): # use setup_teardown_db
    user = create_test_user("testuser_create", "create@test.com", "password")

    public_payload = {
        "user_id": user.UserID,
        "title": "Public Recipe Test",
        "description": "Public description",
        "instructions": "Public instructions",
        "ingredients": [{"name": "Public Ing", "quantity": "1", "unit": "cup"}],
        "is_public": True,
        "imageURL": "/static/public.jpg" # Key as sent by frontend/service call
    }
    response_public = client.post('/api/recipes/upload', json=public_payload)
    assert response_public.status_code == 201
    public_data = response_public.get_json()
    assert public_data['recipe']['Title'] == "Public Recipe Test"
    assert public_data['recipe']['is_public'] is True # Service ensures this is in the dict

    # Verify in DB
    db_public_recipe = Recipe.query.get(public_data['recipe']['RecipeID'])
    assert db_public_recipe is not None
    assert db_public_recipe.is_public is True

    private_payload = {
        "user_id": user.UserID,
        "title": "Private Recipe Test",
        "description": "Private description",
        "instructions": "Private instructions",
        "ingredients": [{"name": "Private Ing", "quantity": "1", "unit": "cup"}],
        "is_public": False,
        "imageURL": "/static/private.jpg"
    }
    response_private = client.post('/api/recipes/upload', json=private_payload)
    assert response_private.status_code == 201
    private_data = response_private.get_json()
    assert private_data['recipe']['Title'] == "Private Recipe Test"
    assert private_data['recipe']['is_public'] is False

    db_private_recipe = Recipe.query.get(private_data['recipe']['RecipeID'])
    assert db_private_recipe is not None
    assert db_private_recipe.is_public is False


def test_get_public_recipes_route(client, setup_teardown_db):
    user = create_test_user("testuser_public_get", "public_get@test.com", "password")
    create_test_recipe(user.UserID, "Public Recipe 1", True)
    create_test_recipe(user.UserID, "Private Recipe 1", False) # This should not be fetched
    create_test_recipe(user.UserID, "Public Recipe 2", True)

    response = client.get('/api/recipes') # This endpoint should call get_public_recipes_summary
    assert response.status_code == 200
    data = response.get_json()
    assert data['total'] == 2
    assert len(data['recipes']) == 2
    for recipe in data['recipes']:
        assert recipe['is_public'] is True # Assuming to_dict_summary includes is_public

def test_get_my_private_recipes_route(client, setup_teardown_db):
    user1 = create_test_user("user1_private", "user1pr@test.com", "password")
    user2 = create_test_user("user2_public", "user2pu@test.com", "password")

    create_test_recipe(user1.UserID, "User1 Private Recipe", False)
    create_test_recipe(user1.UserID, "User1 Public Recipe", True) # Should not appear in my-private
    create_test_recipe(user2.UserID, "User2 Private Recipe", False)

    response_user1 = client.get(f'/api/recipes/my-private?user_id={user1.UserID}')
    assert response_user1.status_code == 200
    data_user1 = response_user1.get_json()
    assert data_user1['total'] == 1
    assert data_user1['recipes'][0]['Title'] == "User1 Private Recipe"
    assert data_user1['recipes'][0]['is_public'] is False # is_public should be in summary dict

    response_user2 = client.get(f'/api/recipes/my-private?user_id={user2.UserID}')
    assert response_user2.status_code == 200
    data_user2 = response_user2.get_json()
    assert data_user2['total'] == 1
    assert data_user2['recipes'][0]['Title'] == "User2 Private Recipe"

    response_no_user = client.get('/api/recipes/my-private')
    assert response_no_user.status_code == 401 # Based on route's test user_id check

def test_get_recipe_detail_with_ratings(client, setup_teardown_db):
    user1 = create_test_user("user1_rate_detail", "user1rd@test.com", "password")
    user2 = create_test_user("user2_rate_detail", "user2rd@test.com", "password")
    recipe = create_test_recipe(user1.UserID, "Recipe for Rating Detail", True)

    create_test_rating(user1.UserID, recipe.RecipeID, 5)
    create_test_rating(user2.UserID, recipe.RecipeID, 3) # Avg should be 4.0

    # Unauthenticated view (no user_id_for_rating_testing param)
    response_unauth = client.get(f'/api/recipes/{recipe.RecipeID}')
    assert response_unauth.status_code == 200
    data_unauth = response_unauth.get_json()
    assert data_unauth['Title'] == "Recipe for Rating Detail"
    assert data_unauth['average_rating'] == 4.0
    assert data_unauth['current_user_rating'] is None

    # Authenticated view for user1 (simulated by passing user_id_for_rating_testing)
    response_auth_user1 = client.get(f'/api/recipes/{recipe.RecipeID}?user_id_for_rating_testing={user1.UserID}')
    assert response_auth_user1.status_code == 200
    data_auth_user1 = response_auth_user1.get_json()
    assert data_auth_user1['average_rating'] == 4.0
    assert data_auth_user1['current_user_rating'] == 5

    # Authenticated view for user2
    response_auth_user2 = client.get(f'/api/recipes/{recipe.RecipeID}?user_id_for_rating_testing={user2.UserID}')
    data_auth_user2 = response_auth_user2.get_json()
    assert data_auth_user2['current_user_rating'] == 3

    user3 = create_test_user("user3_no_rate", "user3nr@test.com", "password")
    response_auth_user3 = client.get(f'/api/recipes/{recipe.RecipeID}?user_id_for_rating_testing={user3.UserID}')
    data_auth_user3 = response_auth_user3.get_json()
    assert data_auth_user3['current_user_rating'] is None # User3 has not rated

def test_rate_recipe_route(client, setup_teardown_db):
    user = create_test_user("rater_user", "rater@test.com", "password")
    recipe = create_test_recipe(user.UserID, "Rate Me Recipe", True)

    rate_payload1 = {"user_id": user.UserID, "rating": 5} # user_id for testing
    response_rate1 = client.post(f'/api/recipes/{recipe.RecipeID}/rate', json=rate_payload1)
    assert response_rate1.status_code == 200
    data_rate1 = response_rate1.get_json()
    assert data_rate1['user_rating']['Rating'] == 5
    assert data_rate1['average_rating'] == 5.0

    rate_payload2 = {"user_id": user.UserID, "rating": 3} # Update rating
    response_rate2 = client.post(f'/api/recipes/{recipe.RecipeID}/rate', json=rate_payload2)
    assert response_rate2.status_code == 200
    data_rate2 = response_rate2.get_json()
    assert data_rate2['user_rating']['Rating'] == 3
    assert data_rate2['average_rating'] == 3.0 # Avg of just one rating (3) is 3.0

    rate_payload_invalid = {"user_id": user.UserID, "rating": 0} # Invalid rating
    response_invalid = client.post(f'/api/recipes/{recipe.RecipeID}/rate', json=rate_payload_invalid)
    assert response_invalid.status_code == 400 # Validation is in service
    assert "Rating must be an integer between 1 and 5" in response_invalid.get_json()['error']

def test_get_my_rating_route(client, setup_teardown_db):
    user = create_test_user("my_rater", "myrater@test.com", "password")
    recipe = create_test_recipe(user.UserID, "My Rating Check Recipe", True)

    response_no_rating = client.get(f'/api/recipes/{recipe.RecipeID}/my-rating?user_id={user.UserID}')
    assert response_no_rating.status_code == 200 # Route returns 200 with specific message for no rating
    json_resp = response_no_rating.get_json()
    assert json_resp['rating'] is None
    assert "No rating found" in json_resp['message']

    create_test_rating(user.UserID, recipe.RecipeID, 4) # User rates the recipe

    response_with_rating = client.get(f'/api/recipes/{recipe.RecipeID}/my-rating?user_id={user.UserID}')
    assert response_with_rating.status_code == 200
    data_with_rating = response_with_rating.get_json()
    assert data_with_rating['Rating'] == 4
    # Ensure other fields are present if to_dict() is returned fully
    assert data_with_rating['RecipeID'] == recipe.RecipeID
    assert data_with_rating['UserID'] == user.UserID
