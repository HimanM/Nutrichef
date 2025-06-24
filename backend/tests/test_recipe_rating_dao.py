import pytest
from backend.models import User, Recipe, RecipeRating
from backend.dao import RecipeDAO, RecipeRatingDAO, UserDAO
from backend.db import db # Assuming this is the SQLAlchemy db instance

# Fixture for DAOs - function scope
@pytest.fixture(scope='function')
def recipe_rating_dao():
    return RecipeRatingDAO()

@pytest.fixture(scope='function')
def user_dao():
    return UserDAO()

@pytest.fixture(scope='function')
def recipe_dao(): # Added recipe_dao fixture for creating recipes
    return RecipeDAO()

# Fixture to ensure a clean database for each test function
# This relies on the db fixture from conftest.py for session management
@pytest.fixture(scope='function', autouse=True)
def init_database(db): # db fixture from conftest.py
    # Clean up relevant tables before each test
    # Order matters for foreign key constraints
    RecipeRating.query.delete()
    # RecipeIngredient.query.delete() # Assuming not directly used here but good for general cleanup
    Recipe.query.delete()
    # Ingredient.query.delete() # Assuming not directly used here
    User.query.delete()
    db.session.commit()
    yield
    # Teardown after yield is handled by conftest.py's db fixture

def test_add_new_rating(recipe_rating_dao, user_dao, recipe_dao, db): # Added db
    test_user = user_dao.create_user(name="testuser_rating", email="test_rating@example.com", password="password")
    db.session.commit() # Commit user to get UserID

    # Create recipe using DAO for consistency, ensure it's committed
    test_recipe_model = recipe_dao.create_recipe(
        user_id=test_user.UserID, title="Rating Test Recipe", description="Test",
        instructions="Test", prep_time=10, cook_time=10, servings=1,
        image_url=None, ingredients_data=[], is_public=True
    )
    db.session.commit() # Commit recipe to get RecipeID

    rating_obj = recipe_rating_dao.add_rating(test_recipe_model.RecipeID, test_user.UserID, 5)
    db.session.commit() # DAO add_rating doesn't commit

    assert rating_obj is not None
    assert rating_obj.RatingID is not None
    assert rating_obj.Rating == 5
    assert rating_obj.RecipeID == test_recipe_model.RecipeID
    assert rating_obj.UserID == test_user.UserID

def test_update_existing_rating(recipe_rating_dao, user_dao, recipe_dao, db): # Added db
    test_user = user_dao.create_user(name="testuser_updater", email="test_updater@example.com", password="password")
    db.session.commit()

    test_recipe_model = recipe_dao.create_recipe(
        user_id=test_user.UserID, title="Update Rating Recipe", description="Test",
        instructions="Test", prep_time=10, cook_time=10, servings=1,
        image_url=None, ingredients_data=[], is_public=True
    )
    db.session.commit()

    recipe_rating_dao.add_rating(test_recipe_model.RecipeID, test_user.UserID, 3)
    db.session.commit()

    updated_rating_obj = recipe_rating_dao.add_rating(test_recipe_model.RecipeID, test_user.UserID, 5)
    db.session.commit()

    assert updated_rating_obj.Rating == 5

    all_ratings_for_recipe = RecipeRating.query.filter_by(RecipeID=test_recipe_model.RecipeID, UserID=test_user.UserID).all()
    assert len(all_ratings_for_recipe) == 1

def test_get_rating_by_user_and_recipe(recipe_rating_dao, user_dao, recipe_dao, db): # Added db
    test_user = user_dao.create_user(name="testuser_get", email="test_get@example.com", password="password")
    db.session.commit()

    test_recipe_model = recipe_dao.create_recipe(
        user_id=test_user.UserID, title="Get Rating Recipe", description="Test",
        instructions="Test", prep_time=10, cook_time=10, servings=1,
        image_url=None, ingredients_data=[], is_public=True
    )
    db.session.commit()

    recipe_rating_dao.add_rating(test_recipe_model.RecipeID, test_user.UserID, 4)
    db.session.commit()

    fetched_rating = recipe_rating_dao.get_rating_by_user_and_recipe(test_recipe_model.RecipeID, test_user.UserID)
    assert fetched_rating is not None
    assert fetched_rating.Rating == 4

    non_existent_rating = recipe_rating_dao.get_rating_by_user_and_recipe(test_recipe_model.RecipeID, test_user.UserID + 100)
    assert non_existent_rating is None

def test_get_ratings_for_recipe(recipe_rating_dao, user_dao, recipe_dao, db): # Added db
    user1 = user_dao.create_user(name="user1_multi_rate", email="user1_multi@example.com", password="password")
    user2 = user_dao.create_user(name="user2_multi_rate", email="user2_multi@example.com", password="password")
    db.session.commit()

    test_recipe_model = recipe_dao.create_recipe(
        user_id=user1.UserID, title="Multi Rating Recipe", description="Test",
        instructions="Test", prep_time=10, cook_time=10, servings=1,
        image_url=None, ingredients_data=[], is_public=True
    )
    db.session.commit()

    recipe_rating_dao.add_rating(test_recipe_model.RecipeID, user1.UserID, 5)
    recipe_rating_dao.add_rating(test_recipe_model.RecipeID, user2.UserID, 3)
    db.session.commit()

    all_ratings = recipe_rating_dao.get_ratings_for_recipe(test_recipe_model.RecipeID)
    assert len(all_ratings) == 2
    ratings_values = sorted([r.Rating for r in all_ratings])
    assert ratings_values == [3, 5]

def test_get_average_rating_for_recipe_in_rating_dao(recipe_rating_dao, user_dao, recipe_dao, db): # Added db
    user1 = user_dao.create_user(name="user1_avg", email="user1_avg@example.com", password="password")
    user2 = user_dao.create_user(name="user2_avg", email="user2_avg@example.com", password="password")
    user3 = user_dao.create_user("user3_avg", "user3_avg@example.com", "password")
    db.session.commit()

    test_recipe_avg = recipe_dao.create_recipe(
        user_id=user1.UserID, title="Avg Rating Recipe DAO", description="Test",
        instructions="Test", prep_time=10, cook_time=10, servings=1,
        image_url=None, ingredients_data=[], is_public=True
    )
    db.session.commit()

    recipe_rating_dao.add_rating(test_recipe_avg.RecipeID, user1.UserID, 5)
    recipe_rating_dao.add_rating(test_recipe_avg.RecipeID, user2.UserID, 2)
    recipe_rating_dao.add_rating(test_recipe_avg.RecipeID, user3.UserID, 2)
    db.session.commit()

    avg_rating = recipe_rating_dao.get_average_rating_for_recipe(test_recipe_avg.RecipeID)
    assert avg_rating == 3.0 # (5 + 2 + 2) / 3 = 3.0

    # Test for recipe with no ratings
    no_rating_recipe_dao = recipe_dao.create_recipe(
        user_id=user1.UserID, title="No Rating Recipe DAO", description="Test",
        instructions="Test", prep_time=10, cook_time=10, servings=1,
        image_url=None, ingredients_data=[], is_public=True
    )
    db.session.commit()
    avg_no_rating = recipe_rating_dao.get_average_rating_for_recipe(no_rating_recipe_dao.RecipeID)
    assert avg_no_rating == 0.0
