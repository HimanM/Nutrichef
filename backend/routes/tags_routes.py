from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.services.tags_service import TagsService

tags_bp = Blueprint('tags_bp', __name__, url_prefix='/api')

@tags_bp.route('/tags', methods=['GET'])
def get_all_tags():
    """Get all available tags, optionally filtered by category"""
    category = request.args.get('category')
    
    tags_service = TagsService()
    data, error, status_code = tags_service.get_all_tags(category)
    
    if error:
        return jsonify(error), status_code
    return jsonify({"tags": data}), status_code

@tags_bp.route('/tags/by-category', methods=['GET'])
def get_tags_by_category():
    """Get all tags grouped by category"""
    tags_service = TagsService()
    data, error, status_code = tags_service.get_tags_by_category()
    
    if error:
        return jsonify(error), status_code
    return jsonify({"tags_by_category": data}), status_code

@tags_bp.route('/tags/popular', methods=['GET'])
def get_popular_tags():
    """Get most used tags"""
    try:
        limit = int(request.args.get('limit', 20))
        if limit < 1:
            limit = 20
        if limit > 100:
            limit = 100
    except ValueError:
        limit = 20
    
    tags_service = TagsService()
    data, error, status_code = tags_service.get_popular_tags(limit)
    
    if error:
        return jsonify(error), status_code
    return jsonify({"popular_tags": data}), status_code

@tags_bp.route('/tags/<int:tag_id>', methods=['GET'])
def get_tag_by_id(tag_id):
    """Get a specific tag by ID"""
    tags_service = TagsService()
    data, error, status_code = tags_service.get_tag_by_id(tag_id)
    
    if error:
        return jsonify(error), status_code
    return jsonify(data), status_code

@tags_bp.route('/tags', methods=['POST'])
@jwt_required()
def create_tag():
    """Create a new tag (admin functionality)"""
    # Note: In production, you might want to restrict this to admin users only
    user_id = get_jwt_identity()
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON data required"}), 400
    
    tag_name = data.get('tag_name', '').strip()
    category = data.get('category', 'general')
    color = data.get('color', '#6B7280')
    
    if not tag_name:
        return jsonify({"error": "Tag name is required"}), 400
    
    tags_service = TagsService()
    result, error, status_code = tags_service.create_tag(tag_name, category, color)
    
    if error:
        return jsonify(error), status_code
    return jsonify(result), status_code

@tags_bp.route('/recipes/<int:recipe_id>/tags', methods=['GET'])
def get_recipe_tags(recipe_id):
    """Get all tags assigned to a recipe"""
    tags_service = TagsService()
    data, error, status_code = tags_service.get_recipe_tags(recipe_id)
    
    if error:
        return jsonify(error), status_code
    return jsonify({"tags": data}), status_code

@tags_bp.route('/recipes/<int:recipe_id>/tags', methods=['POST'])
@jwt_required()
def assign_tags_to_recipe(recipe_id):
    """Assign tags to a recipe"""
    user_id = get_jwt_identity()
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON data required"}), 400
    
    tag_ids = data.get('tag_ids', [])
    if not isinstance(tag_ids, list) or not tag_ids:
        return jsonify({"error": "tag_ids must be a non-empty list"}), 400
    
    tags_service = TagsService()
    
    # For multiple tags
    if len(tag_ids) > 1:
        result, error, status_code = tags_service.assign_multiple_tags_to_recipe(recipe_id, tag_ids)
    else:
        # For single tag
        success, error, status_code = tags_service.assign_tag_to_recipe(recipe_id, tag_ids[0])
        if error:
            result = None
        else:
            result = {"assigned_count": 1 if success else 0, "total_requested": 1}
    
    if error:
        return jsonify(error), status_code
    return jsonify(result), status_code

@tags_bp.route('/recipes/<int:recipe_id>/tags', methods=['PUT'])
@jwt_required()
def replace_recipe_tags(recipe_id):
    """Replace all tags for a recipe with new ones"""
    user_id = get_jwt_identity()
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON data required"}), 400
    
    tag_ids = data.get('tag_ids', [])
    if not isinstance(tag_ids, list):
        return jsonify({"error": "tag_ids must be a list"}), 400
    
    tags_service = TagsService()
    result, error, status_code = tags_service.replace_recipe_tags(recipe_id, tag_ids)
    
    if error:
        return jsonify(error), status_code
    return jsonify(result), status_code

@tags_bp.route('/recipes/<int:recipe_id>/tags/<int:tag_id>', methods=['DELETE'])
@jwt_required()
def remove_tag_from_recipe(recipe_id, tag_id):
    """Remove a tag from a recipe"""
    user_id = get_jwt_identity()
    
    tags_service = TagsService()
    success, error, status_code = tags_service.remove_tag_from_recipe(recipe_id, tag_id)
    
    if error:
        return jsonify(error), status_code
    return jsonify({"success": success, "message": "Tag removed from recipe successfully"}), status_code

@tags_bp.route('/tags/<int:tag_id>/recipes', methods=['GET'])
def get_recipes_by_tag(tag_id):
    """Get paginated recipes that have a specific tag"""
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 12))
    except ValueError:
        return jsonify({"error": "Invalid pagination parameters"}), 400
    
    if page < 1:
        page = 1
    if limit < 1:
        limit = 12
    if limit > 100:
        limit = 100
    
    tags_service = TagsService()
    data, error, status_code = tags_service.get_recipes_by_tag(tag_id, page, limit)
    
    if error:
        return jsonify(error), status_code
    return jsonify(data), status_code

@tags_bp.route('/recipes/by-tags', methods=['POST'])
def get_recipes_by_multiple_tags():
    """Get recipes that have specific tags"""
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON data required"}), 400
    
    tag_ids = data.get('tag_ids', [])
    if not isinstance(tag_ids, list) or not tag_ids:
        return jsonify({"error": "tag_ids must be a non-empty list"}), 400
    
    try:
        page = int(data.get('page', 1))
        limit = int(data.get('limit', 12))
        match_all = bool(data.get('match_all', False))
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid parameters"}), 400
    
    if page < 1:
        page = 1
    if limit < 1:
        limit = 12
    if limit > 100:
        limit = 100
    
    tags_service = TagsService()
    result, error, status_code = tags_service.get_recipes_by_multiple_tags(
        tag_ids, page, limit, match_all
    )
    
    if error:
        return jsonify(error), status_code
    return jsonify(result), status_code
