from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.services import PantryService

pantry_bp = Blueprint('pantry_bp', __name__, url_prefix='/api/pantry')
pantry_service = PantryService()


@pantry_bp.route('/bulk', methods=['POST'])
@jwt_required()
def add_to_pantry_bulk():
    user_id = get_jwt_identity()
    ingredients_data = request.get_json()

    if not isinstance(ingredients_data, list):
        return jsonify({"error": "Request body must be a list of ingredients"}), 400

    if not ingredients_data:
        return jsonify({
            "successful_items": [],
            "failed_items": [],
            "message": "No ingredients provided in the request."
        }), 200

    try:
        result = pantry_service.add_ingredients_bulk(user_id, ingredients_data)
        
        status_code = 200
        if result.get('successful_items') and not result.get('failed_items'):
            status_code = 201
        elif result.get('successful_items') and result.get('failed_items'):
            status_code = 207
        elif not result.get('successful_items') and result.get('failed_items'):
            status_code = 400

        return jsonify(result), status_code
    except Exception as e:
        print(f"Error in add_to_pantry_bulk: {e}")
        return jsonify({"error": "An unexpected error occurred during bulk operation.", "message": str(e)}), 500


@pantry_bp.route('', methods=['GET'])
@jwt_required()
def get_pantry():
    user_id = get_jwt_identity()
    try:
        pantry_items = pantry_service.get_pantry(user_id)
        return jsonify(pantry_items), 200
    except Exception as e:
        print(f"Error in get_pantry: {e}")
        return jsonify({"error": "Failed to retrieve pantry", "message": "An unexpected error occurred."}), 500

@pantry_bp.route('', methods=['POST'])
@jwt_required()
def add_to_pantry():
    user_id = get_jwt_identity()
    data = request.get_json()
    if not data or not data.get('ingredient_name') or data.get('quantity') is None:
        return jsonify({"error": "Missing required fields: ingredient_name and quantity"}), 400

    ingredient_name = data['ingredient_name']
    quantity = str(data['quantity'])
    unit = data.get('unit', '')

    try:
        added_item = pantry_service.add_ingredient(user_id, ingredient_name, quantity, unit)
        if added_item:
            return jsonify(added_item), 201
        else:
            return jsonify({"error": "Failed to add item to pantry, possibly due to invalid input or existing item conflict not handled by update."}), 400
    except Exception as e:
        print(f"Error in add_to_pantry: {e}")
        return jsonify({"error": "Failed to add item to pantry", "message": "An unexpected error occurred."}), 500

@pantry_bp.route('/<int:user_pantry_ingredient_id>', methods=['PUT'])
@jwt_required()
def update_pantry_item(user_pantry_ingredient_id):
    data = request.get_json()
    if not data or data.get('quantity') is None:
        return jsonify({"error": "Missing quantity"}), 400

    quantity = str(data['quantity'])
    unit = data.get('unit')

    try:
        updated_item = pantry_service.update_ingredient(user_pantry_ingredient_id, quantity, unit)
        if updated_item:
            return jsonify(updated_item), 200
        else:
            return jsonify({"error": "Failed to update pantry item or item not found"}), 404
    except Exception as e:
        print(f"Error in update_pantry_item: {e}")
        return jsonify({"error": "Failed to update pantry item", "message": "An unexpected error occurred."}), 500

@pantry_bp.route('/<int:user_pantry_ingredient_id>', methods=['DELETE'])
@jwt_required()
def remove_from_pantry(user_pantry_ingredient_id):
    try:
        result = pantry_service.remove_ingredient(user_pantry_ingredient_id)
        if result and result.get('success'):
            return jsonify({"message": result.get("message", "Item removed successfully")}), 200
        else:
            return jsonify({"error": result.get("message", "Failed to remove item or item not found")}), 404
    except Exception as e:
        print(f"Error in remove_from_pantry: {e}")
        return jsonify({"error": "Failed to remove item", "message": "An unexpected error occurred."}), 500

@pantry_bp.route('/suggest-recipes', methods=['GET'])
@jwt_required()
def suggest_pantry_recipes():
    user_id = get_jwt_identity()
    try:
        try:
            page = int(request.args.get('page', 1))
            limit = int(request.args.get('limit', 10))
        except ValueError:
            return jsonify({"error": "Invalid page or limit parameter. Must be integers."}), 400
        
        if page < 1: page = 1
        if limit < 1: limit = 10
        if limit > 50: limit = 50

        match_threshold_str = request.args.get('match_threshold', '0.5')
        try:
            match_threshold = float(match_threshold_str)
            if not (0.0 <= match_threshold <= 1.0):
                return jsonify({"error": "match_threshold must be between 0.0 and 1.0"}), 400
        except ValueError:
            return jsonify({"error": "Invalid match_threshold format, must be a float."}), 400

        suggestion_result = pantry_service.suggest_recipes(
            user_id, 
            match_threshold, 
            page=page, 
            limit=limit
        )
        return jsonify(suggestion_result), 200
    except Exception as e:
        print(f"Error in suggest_pantry_recipes: {e}")
        return jsonify({"error": "Failed to suggest recipes", "message": "An unexpected error occurred."}), 500
