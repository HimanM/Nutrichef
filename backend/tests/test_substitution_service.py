import pytest
from unittest.mock import patch, MagicMock
import sys
import os

test_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(test_dir, '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from services.substitution_service import SubstitutionService

@pytest.fixture
def substitution_service():
    with patch('services.substitution_service.SubstitutionRecommender') as MockRecommender:
        mock_recommender = MockRecommender()
        mock_recommender.is_ready.return_value = True
        mock_recommender.get_substitutes.return_value = [{'name': 'Almond', 'score': 0.9}]
        with patch('services.substitution_service.log_warning'), patch('services.substitution_service.log_error'):
            service = SubstitutionService()
            service.recommender = mock_recommender
            yield service, mock_recommender

def test_get_substitutes_success(substitution_service):
    service, mock_recommender = substitution_service
    result, err, code = service.get_substitutes('Peanut')
    assert code == 200
    assert err is None
    assert isinstance(result, list)
    assert result[0]['name'] == 'Almond' 