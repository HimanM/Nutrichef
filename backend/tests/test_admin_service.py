import pytest
from unittest.mock import patch, MagicMock
import sys
import os

test_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(test_dir, '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from services.admin_service import AdminService

@pytest.fixture
def admin_service():
    with patch('services.admin_service.UserDAO') as MockUserDAO, \
         patch('services.admin_service.RecipeDAO') as MockRecipeDAO, \
         patch('services.admin_service.ClassificationResultDAO') as MockClassDAO, \
         patch('services.admin_service.db') as mock_db:
        service = AdminService()
        service.user_dao = MockUserDAO()
        service.recipe_dao = MockRecipeDAO()
        service.classification_result_dao = MockClassDAO()
        yield service, service.user_dao, service.recipe_dao, service.classification_result_dao, mock_db

def test_list_users_success(admin_service):
    service, mock_user_dao, *_ = admin_service
    mock_user = MagicMock(to_dict=lambda: {'id': 1})
    mock_pagination = MagicMock(items=[mock_user], total=1, pages=1, page=1)
    mock_user_dao.get_all_users.return_value = mock_pagination
    resp, err, code = service.list_users()
    assert code == 200
    assert err is None
    assert 'users' in resp

def test_get_user_details_success(admin_service):
    service, mock_user_dao, *_ = admin_service
    mock_user = MagicMock(to_dict=lambda: {'id': 1})
    mock_user_dao.get_user_by_id.return_value = mock_user
    resp, err, code = service.get_user_details(1)
    assert code == 200
    assert err is None
    assert resp['id'] == 1

def test_update_user_role_success(admin_service):
    service, mock_user_dao, *_ = admin_service
    mock_user = MagicMock(role='user', to_dict=lambda: {'id': 1, 'role': 'admin'})
    mock_user_dao.get_user_by_id.return_value = mock_user
    with patch('services.admin_service.db') as mock_db:
        mock_db.session.add.return_value = None
        mock_db.session.commit.return_value = None
        resp, err, code = service.update_user_role(1, 'admin')
        assert code == 200
        assert err is None
        assert resp['role'] == 'admin'

def test_delete_user_success(admin_service):
    service, mock_user_dao, *_ = admin_service
    mock_user = MagicMock()
    mock_user_dao.get_user_by_id.return_value = mock_user
    with patch('services.admin_service.db') as mock_db:
        mock_db.session.delete.return_value = None
        mock_db.session.commit.return_value = None
        resp, err, code = service.delete_user(1)
        assert code == 200
        assert err is None
        assert 'message' in resp

def test_list_all_recipes_success(admin_service):
    service, _, mock_recipe_dao, *_ = admin_service
    mock_recipe = MagicMock(to_dict=lambda: {'id': 1})
    mock_pagination = MagicMock(items=[mock_recipe], total=1, pages=1, page=1)
    mock_recipe_dao.get_all_recipes.return_value = mock_pagination
    resp, err, code = service.list_all_recipes()
    assert code == 200
    assert err is None
    assert 'recipes' in resp

def test_delete_recipe_success(admin_service):
    service, _, mock_recipe_dao, *_ = admin_service
    mock_recipe = MagicMock()
    mock_recipe_dao.get_recipe_by_id.return_value = mock_recipe
    with patch('services.admin_service.db') as mock_db:
        mock_db.session.delete.return_value = None
        mock_db.session.commit.return_value = None
        resp, err, code = service.delete_recipe(1)
        assert code == 200
        assert err is None
        assert 'message' in resp

def test_get_classification_scores_summary_success(admin_service):
    service, *_, mock_class_dao, _ = admin_service
    mock_class_dao.get_all_classification_scores_summary.return_value = {'scores': [1, 2, 3]}
    resp, err, code = service.get_classification_scores_summary()
    assert code == 200
    assert err is None
    assert 'scores' in resp 