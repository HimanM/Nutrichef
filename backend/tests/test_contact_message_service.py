import pytest
from unittest.mock import patch, MagicMock
import sys
import os

test_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(test_dir, '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from services.contact_message_service import ContactMessageService

@pytest.fixture
def contact_message_service():
    with patch('services.contact_message_service.ContactMessageDAO') as MockDAO, \
         patch('services.contact_message_service.db') as mock_db:
        service = ContactMessageService()
        service.contact_message_dao = MockDAO()
        yield service, service.contact_message_dao, mock_db

def test_save_new_message_success(contact_message_service):
    service, mock_dao, mock_db = contact_message_service
    mock_msg = MagicMock(to_dict=lambda: {'id': 1, 'name': 'Test'})
    mock_dao.create_message.return_value = mock_msg
    mock_db.session.commit.return_value = None
    data = {'name': 'Test', 'email': 'test@example.com', 'message': 'Hello'}
    msg, err, code = service.save_new_message(data)
    assert code == 201
    assert err is None
    assert msg['id'] == 1

def test_get_contact_messages_success(contact_message_service):
    service, mock_dao, _ = contact_message_service
    mock_msg = MagicMock(to_dict=lambda: {'id': 1})
    mock_pagination = MagicMock(items=[mock_msg], page=1, per_page=10, pages=1, total=1)
    mock_dao.get_all_messages.return_value = mock_pagination
    msgs, pagination, err, code = service.get_contact_messages()
    assert code == 200
    assert err is None
    assert isinstance(msgs, list)
    assert 'page' in pagination

def test_get_single_message_success(contact_message_service):
    service, mock_dao, _ = contact_message_service
    mock_msg = MagicMock(to_dict=lambda: {'id': 1})
    mock_dao.get_message_by_id.return_value = mock_msg
    msg, err, code = service.get_single_message(1)
    assert code == 200
    assert err is None
    assert msg['id'] == 1

def test_mark_as_replied_success(contact_message_service):
    service, mock_dao, mock_db = contact_message_service
    mock_msg = MagicMock(to_dict=lambda: {'id': 1}, Replied=False)
    mock_dao.get_message_by_id.return_value = mock_msg
    mock_dao.update_message_replied_status.return_value = mock_msg
    mock_db.session.commit.return_value = None
    msg, err, code = service.mark_as_replied(1)
    assert code == 200
    assert err is None
    assert msg['id'] == 1 