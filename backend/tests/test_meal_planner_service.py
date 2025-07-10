import pytest
from unittest.mock import patch, MagicMock
import sys
import os

test_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(test_dir, '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from services.meal_planner_service import MealPlannerService

@pytest.fixture
def meal_planner_service():
    with patch('services.meal_planner_service.MealPlannerDAO') as MockMealPlannerDAO, \
         patch('services.meal_planner_service.db') as mock_db:
        service = MealPlannerService()
        service.meal_planner_dao = MockMealPlannerDAO()
        yield service, service.meal_planner_dao, mock_db

def test_get_user_meal_plan_success(meal_planner_service):
    service, mock_dao, _ = meal_planner_service
    mock_model = MagicMock(MealPlanData={'plan': 'data'})
    mock_dao.get_meal_plan_by_user_id.return_value = mock_model
    result = service.get_user_meal_plan(1)
    assert result == {'plan': 'data'}

def test_save_user_meal_plan_success(meal_planner_service):
    service, mock_dao, mock_db = meal_planner_service
    mock_model = MagicMock(to_dict=lambda: {'plan': 'data'})
    mock_dao.save_or_update_meal_plan.return_value = mock_model
    mock_db.session.commit.return_value = None
    result = service.save_user_meal_plan(1, {'plan': 'data'})
    assert result['success'] is True
    assert 'message' in result 