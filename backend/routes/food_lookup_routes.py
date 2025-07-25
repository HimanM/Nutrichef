from flask import Blueprint, request, jsonify
from backend.services.main.food_lookup_service import FoodLookupService

food_lookup_bp = Blueprint('food_lookup_bp', __name__, url_prefix='/api')

food_lookup_service = FoodLookupService.get_instance()

@food_lookup_bp.route('/food-lookup', methods=['GET'])
def lookup_food_route():
    food_name = request.args.get('name', type=str)
    is_exact_str = request.args.get('is_exact', 'false', type=str)
    is_exact = is_exact_str.lower() == 'true'

    if not food_name:
        return jsonify({"error": "Query parameter 'name' is required."}), 400

    try:
        result = food_lookup_service.lookup_food(food_name, is_exact_match=is_exact)

        if result.get("error"):
            error_message = result.get("error")
            if "not found" in error_message.lower():
                return jsonify(result), 404
            elif "cannot be empty" in error_message.lower():
                return jsonify(result), 400
            else:
                return jsonify(result), 500 
        
        if "matches" in result:
            return jsonify(result), 200
        
        if "food" in result and "data" in result:
            return jsonify(result), 200
            
        return jsonify({"error": "Unexpected result structure from service."}), 500

    except Exception as e:
        print(f"Unexpected error in lookup_food_route for '{food_name}': {e}")
        return jsonify({"error": "An unexpected server error occurred."}), 500
