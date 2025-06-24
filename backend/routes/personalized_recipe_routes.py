from flask import Blueprint, jsonify, request
from backend.services.recipe_service import RecipeService

personalized_recipe_bp = Blueprint('personalized_recipe_bp', __name__, url_prefix='/api')

@personalized_recipe_bp.route('/users/<int:user_id>/personalized_recipes', methods=['GET'])
def get_personalized_recipes(user_id):
    """
    Retrieves recipes personalized for a user by calling the RecipeService.
    The user_id is taken from the URL.
    Pagination parameters `page` and `limit` are read from query arguments.
    """
    recipe_service = RecipeService()

    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
    except ValueError:
        return jsonify({"error": "Invalid page or limit parameter. Must be integers."}), 400

    if page < 1:
        page = 1
    if limit < 1:
        limit = 10 
    if limit > 100:
        limit = 100

    data, error_message, status_code = recipe_service.get_personalized_recipes(user_id, page=page, limit=limit)

    if error_message:
        return jsonify(error_message), status_code
    
    return jsonify(data), status_code
