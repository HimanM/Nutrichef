from flask import Blueprint, request, jsonify
from backend.services.recipe_comment_service import RecipeCommentService
from flask_jwt_extended import jwt_required, get_jwt_identity, get_current_user

recipe_comment_bp = Blueprint('recipe_comment_bp', __name__, url_prefix='/api')
comment_service = RecipeCommentService()

@recipe_comment_bp.route('/recipes/<int:recipe_id>/comments', methods=['GET'])
def get_recipe_comments(recipe_id):
    """Get all comments for a specific recipe"""
    try:
        current_user_id = None
        
        # Try to get JWT identity if token is provided
        from flask_jwt_extended import verify_jwt_in_request
        try:
            verify_jwt_in_request(optional=True)
            current_user_id = get_jwt_identity()
        except Exception as e:
            pass  # No authentication required to view comments
        
        data, error, status = comment_service.get_comments_for_recipe(recipe_id, current_user_id)
        
        if error:
            return jsonify(error), status
        return jsonify(data), status
        
    except Exception as e:
        return jsonify({"error": "Failed to fetch comments"}), 500


@recipe_comment_bp.route('/recipes/<int:recipe_id>/comments', methods=['POST'])
@jwt_required()
def create_recipe_comment(recipe_id):
    """Create a new comment for a recipe"""
    try:
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({"error": "Authentication required"}), 401
        
        data = request.get_json()
        if not data or 'comment' not in data:
            return jsonify({"error": "Comment text is required"}), 400
        
        result, error, status = comment_service.create_comment(
            current_user_id, 
            recipe_id, 
            data['comment']
        )
        
        if error:
            return jsonify(error), status
        return jsonify(result), status
        
    except Exception as e:
        return jsonify({"error": "Failed to create comment"}), 500


@recipe_comment_bp.route('/comments/<int:comment_id>', methods=['PUT'])
@jwt_required()
def update_recipe_comment(comment_id):
    """Update an existing comment"""
    try:
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({"error": "Authentication required"}), 401
        
        data = request.get_json()
        if not data or 'comment' not in data:
            return jsonify({"error": "Comment text is required"}), 400
        
        result, error, status = comment_service.update_comment(
            comment_id, 
            current_user_id, 
            data['comment']
        )
        
        if error:
            return jsonify(error), status
        return jsonify(result), status
        
    except Exception as e:
        return jsonify({"error": "Failed to update comment"}), 500


@recipe_comment_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_recipe_comment(comment_id):
    """Delete a comment"""
    try:
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({"error": "Authentication required"}), 401
        
        result, error, status = comment_service.delete_comment(comment_id, current_user_id)
        
        if error:
            return jsonify(error), status
        return jsonify(result), status
        
    except Exception as e:
        return jsonify({"error": "Failed to delete comment"}), 500
