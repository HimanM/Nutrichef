from flask import Blueprint, jsonify, request
from backend.services.nutrition_service import NutritionService

nutrition_bp = Blueprint('nutrition_bp', __name__, url_prefix='/api')

nutrition_service = NutritionService.get_instance()

@nutrition_bp.route('/nutrition/<ingredient_name>', methods=['GET'])
def get_nutrition_data_route(ingredient_name: str):
    """
    Fetches nutritional information for a given ingredient.
    """
    if not ingredient_name:
        return jsonify({"error": "Ingredient name cannot be empty"}), 400

    try:
        result = nutrition_service.get_nutrition(ingredient_name)

        if result.get('success'):
            data_to_return = {k: v for k, v in result.items() if k != 'success'}
            return jsonify(data_to_return), 200
        else:
            error_message = result.get('error', 'Nutritional information not found or an error occurred.')
            if "not found" in error_message.lower() or "invalid food name" in error_message.lower():
                status_code = 404
            elif "not initialized" in error_message.lower():
                status_code = 503
            else:
                status_code = 500
            return jsonify({"error": error_message}), status_code

    except Exception as e:
        print(f"Unexpected error in get_nutrition_data_route for '{ingredient_name}': {e}")
        return jsonify({"error": "An unexpected server error occurred."}), 500
