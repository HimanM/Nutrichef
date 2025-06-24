from flask import Blueprint, request, jsonify
from ..services import SubstitutionService

substitute_bp = Blueprint('substitute_bp', __name__, url_prefix='/api')
substitution_service = SubstitutionService()

@substitute_bp.route('/substitute', methods=['POST'])
def suggest_substitutes_route():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    ingredient_name = data.get('ingredientName')
    if not ingredient_name:
        return jsonify({"error": "ingredientName is required"}), 400

    substitutes, error, status = substitution_service.get_substitutes(ingredient_name)

    if error:
        return jsonify(error), status
    
    return jsonify(substitutes), status
