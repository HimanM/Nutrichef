from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.services.favorites_service import FavoritesService

favorites_bp = Blueprint('favorites_bp', __name__, url_prefix='/api')

@favorites_bp.route('/users/<int:user_id>/favorites', methods=['GET'])
@jwt_required()
def get_user_favorites(user_id):
    """Get paginated user favorite recipes"""
    current_user_id = int(get_jwt_identity())
    if current_user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403
    
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 12))
        search = request.args.get('search', '').strip()
    except ValueError:
        return jsonify({"error": "Invalid pagination parameters"}), 400
    
    if page < 1:
        page = 1
    if limit < 1:
        limit = 12
    if limit > 100:
        limit = 100
    
    favorites_service = FavoritesService()
    data, error, status_code = favorites_service.get_user_favorites(
        user_id, page=page, limit=limit, search=search if search else None
    )
    
    if error:
        return jsonify(error), status_code
    return jsonify(data), status_code

@favorites_bp.route('/users/<int:user_id>/favorites/ids', methods=['GET'])
@jwt_required()
def get_user_favorite_ids(user_id):
    """Get list of recipe IDs that user has favorited"""
    current_user_id = int(get_jwt_identity())
    if current_user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403
    
    favorites_service = FavoritesService()
    favorite_ids = favorites_service.get_user_favorite_recipe_ids(user_id)
    
    return jsonify({"favorite_recipe_ids": favorite_ids}), 200

@favorites_bp.route('/users/<int:user_id>/favorites/count', methods=['GET'])
@jwt_required()
def get_user_favorite_count(user_id):
    """Get count of recipes favorited by user"""
    current_user_id = int(get_jwt_identity())
    if current_user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403
    
    favorites_service = FavoritesService()
    count = favorites_service.get_user_favorite_count(user_id)
    
    return jsonify({"favorite_count": count}), 200

@favorites_bp.route('/recipes/<int:recipe_id>/favorite', methods=['POST', 'DELETE'])
@jwt_required()
def toggle_favorite(recipe_id):
    """Toggle favorite status for authenticated user"""
    user_id = int(get_jwt_identity())
    favorites_service = FavoritesService()
    
    if request.method == 'POST':
        success, error = favorites_service.add_favorite(user_id, recipe_id)
        action = "added to"
    else:  # DELETE
        success, error = favorites_service.remove_favorite(user_id, recipe_id)
        action = "removed from"
    
    if error:
        return jsonify({"error": error}), 400
    
    # Return current status
    is_favorited = favorites_service.is_recipe_favorited(user_id, recipe_id)
    return jsonify({
        "success": success,
        "is_favorited": is_favorited,
        "message": f"Recipe {action} favorites successfully"
    }), 200

@favorites_bp.route('/recipes/<int:recipe_id>/favorites/count', methods=['GET'])
def get_recipe_favorite_count(recipe_id):
    """Get count of users who favorited this recipe (public endpoint)"""
    favorites_service = FavoritesService()
    count = favorites_service.get_favorite_count_for_recipe(recipe_id)
    
    return jsonify({"favorite_count": count}), 200

@favorites_bp.route('/recipes/most-favorited', methods=['GET'])
def get_most_favorited_recipes():
    """Get most favorited recipes across all users"""
    try:
        limit = int(request.args.get('limit', 10))
        if limit < 1:
            limit = 10
        if limit > 50:
            limit = 50
    except ValueError:
        limit = 10
    
    favorites_service = FavoritesService()
    data, error, status_code = favorites_service.get_most_favorited_recipes(limit)
    
    if error:
        return jsonify(error), status_code
    return jsonify({"recipes": data}), status_code

@favorites_bp.route('/recipes/<int:recipe_id>/is-favorited', methods=['GET'])
@jwt_required()
def check_if_favorited(recipe_id):
    """Check if a recipe is favorited by the current user"""
    user_id = int(get_jwt_identity())
    favorites_service = FavoritesService()
    
    is_favorited = favorites_service.is_recipe_favorited(user_id, recipe_id)
    
    return jsonify({"is_favorited": is_favorited}), 200
