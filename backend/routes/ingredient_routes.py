from flask import Blueprint, request, jsonify
from backend.services.main.ingredient_service import IngredientService

ingredient_bp = Blueprint('ingredient_bp', __name__, url_prefix='/api/ingredients')
ingredient_service = IngredientService()

@ingredient_bp.route('/<int:ingredient_id>/allergies', methods=['GET'])
def get_allergies_for_ingredient_route(ingredient_id):
    """
    Route to get all allergies for a specific ingredient.
    """
    data, error, status_code = ingredient_service.get_allergies_for_ingredient(ingredient_id)
    if error:
        return jsonify(error), status_code
    return jsonify(data if data is not None else []), status_code

@ingredient_bp.route('/allergies_for_list', methods=['POST'])
def get_allergies_for_list_route():
    """
    Route to get unique allergies for a list of ingredient IDs.
    Expects JSON body: {"ingredient_ids": [1, 2, 3]}
    """
    json_data = request.get_json()
    if not json_data or 'ingredient_ids' not in json_data:
        return jsonify({"error": "Missing 'ingredient_ids' in request body"}), 400

    ingredient_ids = json_data['ingredient_ids']
    if not isinstance(ingredient_ids, list):
        return jsonify({"error": "'ingredient_ids' must be a list"}), 400

    data, error, status_code = ingredient_service.get_unique_allergies_for_multiple_ingredients(ingredient_ids)

    if error:
        return jsonify(error), status_code
    return jsonify(data if data is not None else {}), status_code
