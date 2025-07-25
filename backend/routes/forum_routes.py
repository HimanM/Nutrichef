from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_current_user
from backend.services.main.forum_service import ForumService
from functools import wraps

forum_bp = Blueprint('forum_bp', __name__, url_prefix='/api/forum')
forum_service = ForumService()

# Public routes (no authentication required)
@forum_bp.route('/posts', methods=['GET'])
def get_posts():
    """Get paginated forum posts"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    sort_by = request.args.get('sort_by', 'created_at')
    sort_order = request.args.get('sort_order', 'desc')
    
    # Get current user ID if authenticated
    current_user_id = None
    try:
        from flask_jwt_extended import verify_jwt_in_request, get_current_user
        verify_jwt_in_request(optional=True)
        current_user = get_current_user()
        if current_user:
            current_user_id = current_user.UserID
    except:
        pass
    
    data, error, status = forum_service.get_posts(
        page=page,
        per_page=per_page,
        sort_by=sort_by,
        sort_order=sort_order,
        current_user_id=current_user_id
    )
    
    if error:
        return jsonify(error), status
    return jsonify(data), status

@forum_bp.route('/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    """Get a specific forum post"""
    # Get current user ID if authenticated
    current_user_id = None
    try:
        from flask_jwt_extended import verify_jwt_in_request, get_current_user
        verify_jwt_in_request(optional=True)
        current_user = get_current_user()
        if current_user:
            current_user_id = current_user.UserID
    except:
        pass
    
    data, error, status = forum_service.get_post_by_id(
        post_id=post_id,
        current_user_id=current_user_id,
        increment_views=True
    )
    
    if error:
        return jsonify(error), status
    return jsonify(data), status

@forum_bp.route('/posts/<int:post_id>/comments', methods=['GET'])
def get_post_comments(post_id):
    """Get comments for a specific post"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    data, error, status = forum_service.get_comments_for_post(
        post_id=post_id,
        page=page,
        per_page=per_page
    )
    
    if error:
        return jsonify(error), status
    return jsonify(data), status

@forum_bp.route('/recipes/search', methods=['GET'])
def search_recipes():
    """Search public recipes for tagging"""
    query = request.args.get('q', '')
    limit = request.args.get('limit', 10, type=int)
    
    data, error, status = forum_service.search_public_recipes(query, limit)
    
    if error:
        return jsonify(error), status
    return jsonify(data), status

# Authenticated routes
@forum_bp.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    """Create a new forum post"""
    current_user = get_current_user()
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    
    title = data.get('title')
    content = data.get('content')
    
    result, error, status = forum_service.create_post(
        user_id=current_user.UserID,
        title=title,
        content=content
    )
    
    if error:
        return jsonify(error), status
    return jsonify(result), status

@forum_bp.route('/posts/<int:post_id>', methods=['PUT'])
@jwt_required()
def update_post(post_id):
    """Update a forum post"""
    current_user = get_current_user()
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    
    title = data.get('title')
    content = data.get('content')
    
    result, error, status = forum_service.update_post(
        post_id=post_id,
        user_id=current_user.UserID,
        title=title,
        content=content
    )
    
    if error:
        return jsonify(error), status
    return jsonify(result), status

@forum_bp.route('/posts/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    """Delete a forum post"""
    current_user = get_current_user()
    is_admin = current_user.role == 'admin'
    
    result, error, status = forum_service.delete_post(
        post_id=post_id,
        user_id=current_user.UserID,
        is_admin=is_admin
    )
    
    if error:
        return jsonify(error), status
    return jsonify(result), status

@forum_bp.route('/posts/<int:post_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(post_id):
    """Add a comment to a forum post"""
    current_user = get_current_user()
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    
    comment_text = data.get('comment')
    
    result, error, status = forum_service.add_comment(
        post_id=post_id,
        user_id=current_user.UserID,
        comment_text=comment_text
    )
    
    if error:
        return jsonify(error), status
    return jsonify(result), status

@forum_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    """Delete a comment"""
    current_user = get_current_user()
    is_admin = current_user.role == 'admin'
    
    result, error, status = forum_service.delete_comment(
        comment_id=comment_id,
        user_id=current_user.UserID,
        is_admin=is_admin
    )
    
    if error:
        return jsonify(error), status
    return jsonify(result), status

@forum_bp.route('/posts/<int:post_id>/like', methods=['POST'])
@jwt_required()
def toggle_like(post_id):
    """Toggle like status for a post"""
    current_user = get_current_user()
    
    result, error, status = forum_service.toggle_like(
        post_id=post_id,
        user_id=current_user.UserID
    )
    
    if error:
        return jsonify(error), status
    return jsonify(result), status