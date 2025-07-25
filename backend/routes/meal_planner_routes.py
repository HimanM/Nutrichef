from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services.main.meal_planner_service import MealPlannerService
from ..services.main.meal_suggestion_service import MealSuggestionService

meal_planner_bp = Blueprint('meal_planner_bp', __name__, url_prefix='/api/meal-planner')
meal_planner_service = MealPlannerService()
meal_suggestion_service = MealSuggestionService()

@meal_planner_bp.route('/save', methods=['POST'])
@jwt_required()
def save_meal_plan():
    """
    Saves or updates a user's meal plan.
    Expects JSON data in the request body.
    """
    try:
        user_id_from_token = get_jwt_identity()
        try:
            user_id = int(user_id_from_token)
        except ValueError:
            return jsonify({"msg": "User ID from token is not a valid integer"}), 400

        data = request.get_json()
        if not data:
            return jsonify({"msg": "Missing JSON in request"}), 400

        result = meal_planner_service.save_user_meal_plan(user_id, data)

        if result.get("success"):
            return jsonify({"msg": result.get("message", "Meal plan saved successfully."), "data": result.get("data")}), 200
        else:
            return jsonify({"msg": result.get("message", "Failed to save meal plan.")}), 400

    except Exception as e:
        print(f"Error in save_meal_plan: {e}")
        return jsonify({"msg": "An internal server error occurred."}), 500

@meal_planner_bp.route('/load', methods=['GET'])
@jwt_required()
def load_meal_plan():
    """
    Loads a user's meal plan.
    """
    try:
        user_id_from_token = get_jwt_identity()
        try:
            user_id = int(user_id_from_token)
        except ValueError:
            return jsonify({"msg": "User ID from token is not a valid integer"}), 400

        meal_plan_data = meal_planner_service.get_user_meal_plan(user_id)

        if meal_plan_data is not None:
            return jsonify(meal_plan_data), 200
        else:
            return jsonify({"msg": "Could not retrieve meal plan due to an error."}), 500

    except Exception as e:
        print(f"Error in load_meal_plan: {e}")
        return jsonify({"msg": "An internal server error occurred."}), 500


@meal_planner_bp.route('/suggest-meals', methods=['POST'])
@jwt_required()
def suggest_meals():
    """
    Suggest meals based on nutritional targets and existing meals for a day
    """
    try:
        user_id_from_token = get_jwt_identity()
        try:
            user_id = int(user_id_from_token)
        except ValueError:
            return jsonify({"msg": "User ID from token is not a valid integer"}), 400

        data = request.get_json()
        target_date = data.get('target_date')
        existing_meals = data.get('existing_meals', [])
        
        ## Debug logging for mobile issue
        # user_agent = request.headers.get('User-Agent', '')
        # print(f"Suggest meals request from user {user_id}")
        # print(f"User-Agent: {user_agent}")
        # print(f"Existing meals count: {len(existing_meals)}")
        # if existing_meals:
        #     print(f"Sample meal data: {existing_meals[0] if existing_meals else 'None'}")
        
        if not target_date:
            return jsonify({"error": "target_date is required"}), 400
        
        suggestions = meal_suggestion_service.suggest_meals_for_day(
            user_id, target_date, existing_meals
        )
        
        if suggestions.get('error'):
            return jsonify(suggestions), 400
            
        return jsonify(suggestions), 200

    except Exception as e:
        print(f"Error in suggest_meals: {e}")
        print(f"Request data: {request.get_json()}")
        import traceback
        traceback.print_exc()
        return jsonify({"msg": "An internal server error occurred."}), 500
