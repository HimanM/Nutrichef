from flask import Blueprint, jsonify, request # Added request back
from functools import wraps
from backend.services.admin_service import AdminService
from flask_jwt_extended import jwt_required, get_current_user

admin_bp = Blueprint('admin_bp', __name__, url_prefix='/api/admin')
admin_service = AdminService()

def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        print(f"DEBUG: admin_required - Route function '{fn.__name__}' hit.", flush=True)
        _current_user = get_current_user()
        print(f"DEBUG: admin_required - Raw current_user from get_current_user(): {_current_user}, type: {type(_current_user)}", flush=True)

        if _current_user:
            print(f"DEBUG: admin_required - UserID: {_current_user.UserID}, type: {type(_current_user.UserID)}, Role: {_current_user.role if hasattr(_current_user, 'role') else 'N/A'}", flush=True)
            if hasattr(_current_user, 'role') and _current_user.role == 'admin':
                return fn(*args, **kwargs)

        print(f"DEBUG: admin_required - Access denied for user: {_current_user}", flush=True)
        return jsonify({"error": "Administration rights required"}), 403
    return wrapper

@admin_bp.route('/users', methods=['GET'])
@admin_required
def list_all_users_route():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    data, error, status = admin_service.list_users(page=page, per_page=per_page)
    if error:
        return jsonify(error), status
    return jsonify(data), status

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user_details_route(user_id):
    data, error, status = admin_service.get_user_details(user_id)
    if error:
        return jsonify(error), status
    return jsonify(data), status

@admin_bp.route('/users/<int:user_id>/role', methods=['PUT'])
@admin_required
def update_user_role_route(user_id):
    req_data = request.get_json()
    if not req_data or 'role' not in req_data:
        return jsonify({"error": "Missing 'role' in request body"}), 400

    new_role = req_data['role']
    data, error, status = admin_service.update_user_role(user_id, new_role)
    if error:
        return jsonify(error), status
    return jsonify({"message": "User role updated successfully", "user": data}), status

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user_route(user_id):
    data, error, status = admin_service.delete_user(user_id)
    if error:
        return jsonify(error), status
    return jsonify(data), status

@admin_bp.route('/recipes', methods=['GET'])
@admin_required
def list_all_recipes_route():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    sort_by = request.args.get('sort_by', None)
    sort_order = request.args.get('sort_order', 'asc')
    data, error, status = admin_service.list_all_recipes(
        page=page,
        per_page=per_page,
        sort_by=sort_by,
        sort_order=sort_order
    )
    if error:
        return jsonify(error), status
    return jsonify(data), status

@admin_bp.route('/recipes/<int:recipe_id>', methods=['DELETE'])
@admin_required
def delete_recipe_route(recipe_id):
    data, error, status = admin_service.delete_recipe(recipe_id)
    if error:
        return jsonify(error), status
    return jsonify(data), status

@admin_bp.route('/classification_scores_summary', methods=['GET'])
@admin_required
def get_classification_scores_summary_route():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    data, error, status = admin_service.get_classification_scores_summary(page=page, per_page=per_page)
    if error:
        return jsonify(error), status
    return jsonify(data), status
