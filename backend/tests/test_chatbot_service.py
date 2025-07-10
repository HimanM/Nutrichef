import pytest
from unittest.mock import patch, MagicMock
import sys
import os

test_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(test_dir, '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from services.chatbot_service import ChatbotService

@pytest.fixture
def chatbot_service():
    with patch('services.chatbot_service.FoodChatbot') as MockFoodChatbot, \
         patch('services.chatbot_service.FoodClassifier'), \
         patch('services.chatbot_service.FoodLookupService'), \
         patch('services.chatbot_service.SubstitutionService'), \
         patch('services.chatbot_service.log_info'), \
         patch('services.chatbot_service.log_success'), \
         patch('services.chatbot_service.log_warning'), \
         patch('services.chatbot_service.log_error'), \
         patch('services.chatbot_service.os.path.exists', return_value=True), \
         patch('services.chatbot_service.os.makedirs'):
        mock_chatbot = MockFoodChatbot()
        mock_chatbot.is_ready.return_value = True
        mock_chatbot.process_query.return_value = {'response': 'Hello!'}
        MockFoodChatbot.return_value = mock_chatbot
        service = ChatbotService()
        service.chatbot_instance = mock_chatbot
        yield service, mock_chatbot

def test_process_user_query_success(chatbot_service):
    service, mock_chatbot = chatbot_service
    result = service.process_user_query('Hi')
    assert 'response' in result
    assert result['response'] == 'Hello!' 