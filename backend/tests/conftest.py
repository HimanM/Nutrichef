import pytest
from backend.app import app as flask_app # Renamed to avoid conflict
from backend.db import db as _db # Renamed to avoid conflict with pytest fixture
# Import models if they are needed for setup, e.g.
# from backend.models import User 

@pytest.fixture(scope='session')
def app():
    flask_app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:" # Use in-memory DB for tests
    })
    with flask_app.app_context():
        _db.create_all() # Create tables for the in-memory database
    yield flask_app
    with flask_app.app_context():
        _db.drop_all() # Clean up after tests

@pytest.fixture()
def client(app):
    return app.test_client()

@pytest.fixture(scope='function') # Changed to function scope for db operations
def db(app):
    with app.app_context():
        yield _db
        _db.session.remove() # Ensure session is clean after each test
