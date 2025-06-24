import pytest
from backend.models import User, Recipe, RecipeIngredient, Ingredient, RecipeRating
from backend.dao import RecipeDAO, IngredientDAO, UserDAO
from backend.db import db # Assuming this is the SQLAlchemy db instance from your app

# Fixture for DAOs - function scope to ensure clean state if DAOs have internal state (unlikely for these)
@pytest.fixture(scope='function')
def recipe_dao():
    return RecipeDAO()

@pytest.fixture(scope='function')
def user_dao():
    return UserDAO()

@pytest.fixture(scope='function')
def ingredient_dao():
    return IngredientDAO()

# Fixture to ensure a clean database for each test function
@pytest.fixture(scope='function', autouse=True)
def init_database(db): # db fixture from conftest.py
    # Clean up relevant tables before each test
    # Order matters for foreign key constraints
    RecipeRating.query.delete()
    RecipeIngredient.query.delete()
    Recipe.query.delete()
    Ingredient.query.delete()
    User.query.delete()
    db.session.commit()
    yield
    # Teardown after yield is handled by conftest.py's db fixture (session.remove)
    # and app fixture (db.drop_all at session end)

@pytest.fixture(scope='function')
def new_user(db, user_dao):
    user = user_dao.create_user(name="Test User", email="test@example.com", password="password")
    db.session.commit() # Commit to get UserID
    return user

@pytest.fixture(scope='function')
def new_recipe(db, recipe_dao, new_user):
    # Create a basic recipe for tests that need an existing recipe
    # Note: ingredients_data is empty here, tests needing specific ingredients should handle that
    recipe = recipe_dao.create_recipe(
        user_id=new_user.UserID,
        title="Test Recipe",
        description="A test recipe description.",
        instructions="1. Test. 2. Test.",
        prep_time=10,
        cook_time=20,
        servings=4,
        image_url="/static/test_recipe.jpg",
        ingredients_data=[],
        is_public=True # Default to public for this general fixture
    )
    db.session.commit() # Commit to get RecipeID
    return recipe

# --- Tests from the prompt ---

def test_create_recipe_privacy(recipe_dao, new_user, ingredient_dao, db):
    # Setup ingredients_data
    ing1 = ingredient_dao.get_or_create_ingredient("Test Ingredient 1 Privacy")
    ing2 = ingredient_dao.get_or_create_ingredient("Test Ingredient 2 Privacy")
    db.session.commit() # Commit ingredients if get_or_create_ingredient doesn't

    ingredients_data = [
        {'ingredient_model': ing1, 'quantity': '1', 'unit': 'cup'},
        {'ingredient_model': ing2, 'quantity': '200', 'unit': 'g'}
    ]

    # Test creating a public recipe
    public_recipe = recipe_dao.create_recipe(
        user_id=new_user.UserID, title="Public Test Recipe", description="Desc",
        instructions="Instr", prep_time=10, cook_time=20, servings=2,
        image_url="/static/test_public.jpg", ingredients_data=ingredients_data, is_public=True
    )
    db.session.commit()
    fetched_public_recipe = recipe_dao.get_recipe_by_id(public_recipe.RecipeID)
    assert fetched_public_recipe is not None
    assert fetched_public_recipe.is_public is True

    # Test creating a private recipe
    private_recipe = recipe_dao.create_recipe(
        user_id=new_user.UserID, title="Private Test Recipe", description="Desc",
        instructions="Instr", prep_time=10, cook_time=20, servings=2,
        image_url="/static/test_private.jpg", ingredients_data=ingredients_data, is_public=False
    )
    db.session.commit()
    fetched_private_recipe = recipe_dao.get_recipe_by_id(private_recipe.RecipeID)
    assert fetched_private_recipe is not None
    assert fetched_private_recipe.is_public is False

def test_get_public_recipes(recipe_dao, new_user, ingredient_dao, db):
    ing_data = [] # Can be empty if ingredients are not crucial for this specific test logic

    # Recipe 1 (public)
    recipe_dao.create_recipe(user_id=new_user.UserID, title="Public Recipe 1", description="D1", instructions="I1", prep_time=10, cook_time=10, servings=1, image_url=None, ingredients_data=ing_data, is_public=True)
    # Recipe 2 (private)
    recipe_dao.create_recipe(user_id=new_user.UserID, title="Private Recipe 1", description="D2", instructions="I2", prep_time=10, cook_time=10, servings=1, image_url=None, ingredients_data=ing_data, is_public=False)
    # Recipe 3 (public, for search)
    recipe_dao.create_recipe(user_id=new_user.UserID, title="Searchable Public", description="D3", instructions="I3", prep_time=10, cook_time=10, servings=1, image_url=None, ingredients_data=ing_data, is_public=True)
    db.session.commit()

    paginated_public_recipes = recipe_dao.get_public_recipes(page=1, limit=10)
    assert paginated_public_recipes.total == 2
    assert len(paginated_public_recipes.items) == 2
    for recipe in paginated_public_recipes.items:
        assert recipe.is_public is True

    # Test search
    paginated_search = recipe_dao.get_public_recipes(page=1, limit=10, search_term="Searchable")
    assert paginated_search.total == 1
    assert paginated_search.items[0].Title == "Searchable Public"

def test_get_user_private_recipes(recipe_dao, user_dao, db): # ingredient_dao not strictly needed if ingredients_data is empty
    user1 = user_dao.create_user(name="User One Private", email="user1private@test.com", password="pw1")
    user2 = user_dao.create_user(name="User Two Private", email="user2private@test.com", password="pw2")
    db.session.commit()

    ing_data = [] # Can be empty

    # User1's private recipe
    recipe_dao.create_recipe(user_id=user1.UserID, title="User1 Private", description="D", instructions="I", prep_time=10, cook_time=10, servings=1, image_url=None, ingredients_data=ing_data, is_public=False)
    # User1's public recipe
    recipe_dao.create_recipe(user_id=user1.UserID, title="User1 Public", description="D", instructions="I", prep_time=10, cook_time=10, servings=1, image_url=None, ingredients_data=ing_data, is_public=True)
    # User2's private recipe
    recipe_dao.create_recipe(user_id=user2.UserID, title="User2 Private", description="D", instructions="I", prep_time=10, cook_time=10, servings=1, image_url=None, ingredients_data=ing_data, is_public=False)
    db.session.commit()

    paginated_user1_private = recipe_dao.get_user_private_recipes(user_id=user1.UserID, page=1, limit=10)
    assert paginated_user1_private.total == 1
    assert len(paginated_user1_private.items) == 1
    assert paginated_user1_private.items[0].Title == "User1 Private"
    assert paginated_user1_private.items[0].is_public is False

    # Test search for user's private recipes
    paginated_search = recipe_dao.get_user_private_recipes(user_id=user1.UserID, page=1, limit=10, search_term="Private")
    assert paginated_search.total == 1
    assert paginated_search.items[0].Title == "User1 Private"

def test_get_recipe_average_rating(recipe_dao, new_user, new_recipe, user_dao, db):
    # new_recipe is already created and committed by its fixture

    # Create another user for another rating
    other_user = user_dao.create_user(name="Other Rating User", email="other_rating@test.com", password="password")
    db.session.commit() # Commit to get UserID for other_user

    # Add ratings directly
    rating1 = RecipeRating(RecipeID=new_recipe.RecipeID, UserID=new_user.UserID, Rating=5)
    rating2 = RecipeRating(RecipeID=new_recipe.RecipeID, UserID=other_user.UserID, Rating=3)
    db.session.add_all([rating1, rating2])
    db.session.commit()

    avg_rating = recipe_dao.get_average_rating_for_recipe(new_recipe.RecipeID)
    assert avg_rating == 4.0

    fetched_recipe = recipe_dao.get_recipe_by_id(new_recipe.RecipeID)
    assert hasattr(fetched_recipe, 'average_rating')
    assert fetched_recipe.average_rating == 4.0

    # Test for recipe with no ratings
    # For this, we need a new recipe that doesn't get ratings automatically.
    # The `new_recipe` fixture might not be suitable if it gets ratings by default in other tests.
    # Creating a specific one here:
    no_rating_recipe = recipe_dao.create_recipe(
        user_id=new_user.UserID, title="No Rating Recipe", description="D",
        instructions="I", prep_time=5, cook_time=5, servings=1,
        image_url=None, ingredients_data=[], is_public=True
    )
    db.session.commit()

    avg_no_rating = recipe_dao.get_average_rating_for_recipe(no_rating_recipe.RecipeID)
    assert avg_no_rating == 0.0
    fetched_no_rating_recipe = recipe_dao.get_recipe_by_id(no_rating_recipe.RecipeID)
    assert fetched_no_rating_recipe.average_rating == 0.0

# Test for get_all_recipes to ensure it only fetches public recipes now
def test_get_all_recipes_fetches_only_public(recipe_dao, new_user, db):
    ing_data = []
    # Public recipe
    recipe_dao.create_recipe(user_id=new_user.UserID, title="Public For GetAll", description="D_public", instructions="I_public", prep_time=10, cook_time=10, servings=1, image_url=None, ingredients_data=ing_data, is_public=True)
    # Private recipe
    recipe_dao.create_recipe(user_id=new_user.UserID, title="Private For GetAll", description="D_private", instructions="I_private", prep_time=10, cook_time=10, servings=1, image_url=None, ingredients_data=ing_data, is_public=False)
    db.session.commit()

    paginated_recipes = recipe_dao.get_all_recipes(page=1, limit=10)
    assert paginated_recipes.total == 1
    assert len(paginated_recipes.items) == 1
    assert paginated_recipes.items[0].Title == "Public For GetAll"
    assert paginated_recipes.items[0].is_public is True

# Example of an old test from the original file, adapted.
# This test might need adjustment if get_all_recipes only gets public ones.
# The sample_recipes_data from the old file did not have is_public field.
# For this to work, it would need to be adapted or ensure sample data is public.
# As get_all_recipes is now modified to only fetch public, this test needs to reflect that.
# If all recipes in sample_recipes_data were public, total would be 6.
# If some were private, total would be less.
# For now, I'll comment it out as the new test above (test_get_all_recipes_fetches_only_public) is more specific.

# def test_get_all_recipes_no_search_adapted(db, recipe_dao, new_user): # Assuming new_user creates some recipes or use specific setup
#     # This test would need a setup where a known number of PUBLIC recipes exist.
#     # For example, create 2 public and 1 private recipe.
#     recipe_dao.create_recipe(user_id=new_user.UserID, title="Public 1", description="D", instructions="I", prep_time=10, cook_time=10, servings=1, image_url=None, ingredients_data=[], is_public=True)
#     recipe_dao.create_recipe(user_id=new_user.UserID, title="Public 2", description="D", instructions="I", prep_time=10, cook_time=10, servings=1, image_url=None, ingredients_data=[], is_public=True)
#     recipe_dao.create_recipe(user_id=new_user.UserID, title="Private 1", description="D", instructions="I", prep_time=10, cook_time=10, servings=1, image_url=None, ingredients_data=[], is_public=False)
#     db.session.commit()

#     paginated_result = recipe_dao.get_all_recipes(page=1, limit=10)
#     assert paginated_result.total == 2 # Only public recipes
#     assert len(paginated_result.items) == 2
