import pytest
from unittest.mock import patch, MagicMock
import sys
import os

# Ensure the backend directory is in sys.path for relative imports
test_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(test_dir, '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from services.user_service import UserService

@pytest.fixture
def user_service():
    with patch('services.user_service.UserDAO') as MockUserDAO, \
         patch('services.user_service.EmailService') as MockEmailService, \
         patch('services.user_service.db') as mock_db:
        service = UserService()
        service.user_dao = MockUserDAO()
        service.email_service = MockEmailService()
        yield service, service.user_dao, service.email_service, mock_db

def test_register_user_success(user_service):
    service, mock_dao, mock_email, mock_db = user_service
    mock_dao.get_user_by_email.return_value = None
    mock_dao.create_user.return_value = MagicMock(Email='test@example.com', Name='Test', to_dict=lambda: {})
    mock_email.send_verification_email.return_value = None
    mock_db.session.commit.return_value = None
    data = {'name': 'Test', 'email': 'test@example.com', 'password': 'pass', 'dietaryPreferences': 'vegan'}
    resp, err, code = service.register_user(data)
    assert code == 201
    assert err is None
    assert 'message' in resp

def test_login_user_success(user_service):
    service, mock_dao, mock_email, mock_db = user_service
    user_mock = MagicMock(PasswordHash='pbkdf2:sha256:...', IsEmailVerified=True, UserID=1, to_dict=lambda: {'UserID': 1})
    mock_dao.get_user_by_email.return_value = user_mock
    with patch('services.user_service.check_password_hash', return_value=True), \
         patch('services.user_service.create_access_token', return_value='token'):
        user, token, err, code = service.login_user('test@example.com', 'pass')
        assert code == 200
        assert err is None
        assert user['UserID'] == 1
        assert token == 'token'

def test_get_user_preferences_success(user_service):
    service, mock_dao, *_ = user_service
    user_mock = MagicMock(UserID=1, DietaryPreferences='vegan', DailyCalories=2000, DailyProtein=50, DailyCarbs=250, DailyFat=70, DailyFiber=30, DailySugar=40, DailySodium=1500)
    mock_dao.get_user_by_id.return_value = user_mock
    resp, err, code = service.get_user_preferences(1)
    assert code == 200
    assert err is None
    assert resp['UserID'] == 1

def test_update_user_preferences_success(user_service):
    service, mock_dao, *_ = user_service
    user_mock = MagicMock()
    mock_dao.get_user_by_id.return_value = user_mock
    mock_dao.update_user.return_value = None
    prefs_data = {'preferences': {'dietaryRestrictions': 'vegan'}}
    with patch('services.user_service.db') as mock_db:
        mock_db.session.commit.return_value = None
        ok, resp, code = service.update_user_preferences(1, prefs_data)
        assert code == 200
        assert ok is True
        assert 'message' in resp

def test_change_password_success(user_service):
    service, mock_dao, *_ = user_service
    user_mock = MagicMock(PasswordHash='oldhash')
    mock_dao.get_user_by_id.return_value = user_mock
    mock_dao.update_user.return_value = None
    with patch('services.user_service.check_password_hash', side_effect=[True]), \
         patch('services.user_service.generate_password_hash', return_value='newhash'), \
         patch('services.user_service.db') as mock_db:
        mock_db.session.commit.return_value = None
        ok, resp, code = service.change_password(1, 'old', 'new')
        assert code == 200
        assert ok is True
        assert 'message' in resp

def test_verify_email_success(user_service):
    service, mock_dao, *_ = user_service
    user_mock = MagicMock(IsEmailVerified=False, EmailVerificationTokenExpiresAt=None, to_dict=lambda: {'UserID': 1})
    mock_dao.get_user_by_verification_token.return_value = user_mock
    mock_dao.update_user.return_value = None
    with patch('services.user_service.db') as mock_db:
        mock_db.session.commit.return_value = None
        user, err, code = service.verify_email('sometoken')
        assert code == 200
        assert err is None
        assert user['UserID'] == 1

def test_update_nutritional_targets_success(user_service):
    service, mock_dao, *_ = user_service
    user_mock = MagicMock()
    mock_dao.get_user_by_id.return_value = user_mock
    mock_dao.update_user.return_value = None
    targets_data = {'DailyCalories': 1800, 'DailyProtein': 60}
    with patch('services.user_service.db') as mock_db:
        mock_db.session.commit.return_value = None
        ok, resp, code = service.update_nutritional_targets(1, targets_data)
        assert code == 200
        assert ok is True
        assert 'message' in resp 