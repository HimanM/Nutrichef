from flask import Blueprint, jsonify, request, Response, stream_template, render_template # Added request back
from functools import wraps
from backend.services.admin_service import AdminService
from backend.services.recipe_comment_service import RecipeCommentService
from flask_jwt_extended import jwt_required, get_current_user
from backend.utils.log_monitor import log_monitor
from backend.dao.user_dao import UserDAO
import json
import time
import uuid

admin_bp = Blueprint('admin_bp', __name__, url_prefix='/api/admin')
admin_service = AdminService()
comment_service = RecipeCommentService()

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

@admin_bp.route('/logs/recent', methods=['GET'])
@admin_required
def get_recent_logs():
    """Get recent logs."""
    limit = request.args.get('limit', 50, type=int)
    logs = log_monitor.get_recent_logs(limit)
    return jsonify({
        'logs': logs,
        'total': len(logs)
    })

@admin_bp.route('/logs/stream')
def stream_logs():
    """Server-Sent Events endpoint for real-time logs."""
    # Check for token in query params for SSE
    token = request.args.get('token')
    if token:
        # Verify JWT token manually for SSE connection
        try:
            from flask_jwt_extended import decode_token
            decoded_token = decode_token(token)
            user_dao = UserDAO()
            user = user_dao.get_user_by_id(int(decoded_token['sub']))
            if not user or user.role != 'admin':
                return jsonify({"error": "Administration rights required"}), 403
        except Exception:
            return jsonify({"error": "Invalid token"}), 401
    else:
        # Fallback to normal JWT check
        try:
            from flask_jwt_extended import verify_jwt_in_request, get_current_user
            verify_jwt_in_request()
            current_user = get_current_user()
            if not current_user or current_user.role != 'admin':
                return jsonify({"error": "Administration rights required"}), 403
        except Exception:
            return jsonify({"error": "Authorization required"}), 401
    
    def event_stream():
        client_id = str(uuid.uuid4())
        log_monitor.add_client(client_id)
        
        try:
            while True:
                # Get new logs
                new_logs = log_monitor.get_new_logs()
                if new_logs:
                    data = json.dumps({
                        'type': 'logs',
                        'data': new_logs
                    })
                    yield f"data: {data}\n\n"
                
                # Send system metrics every 10 seconds
                if int(time.time()) % 10 == 0:
                    metrics = log_monitor.get_system_metrics()
                    if metrics:
                        data = json.dumps({
                            'type': 'metrics',
                            'data': metrics
                        })
                        yield f"data: {data}\n\n"
                
                # Send heartbeat
                yield f"data: {json.dumps({'type': 'heartbeat'})}\n\n"
                time.sleep(1)
                
        except GeneratorExit:
            log_monitor.remove_client(client_id)
    
    return Response(
        event_stream(),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
        }
    )

@admin_bp.route('/system/metrics', methods=['GET'])
@admin_required
def get_system_metrics():
    """Get current system metrics."""
    metrics = log_monitor.get_system_metrics()
    return jsonify(metrics)

@admin_bp.route('/logs/clear', methods=['POST'])
@admin_required
def clear_logs():
    """Clear all logs."""
    log_monitor.flask_logs.clear()
    return jsonify({'message': 'Logs cleared successfully'})

@admin_bp.route('/logs/monitor')
@admin_required  
def logs_monitor_page():
    """Serve the logs monitor page."""
    return render_template('admin/logs_monitor.html')

@admin_bp.route('/system/info', methods=['GET'])
@admin_required
def get_system_info():
    """Get detailed system information."""
    import platform
    import sys
    
    try:
        system_info = {
            'platform': {
                'system': platform.system(),
                'release': platform.release(),
                'version': platform.version(),
                'machine': platform.machine(),
                'processor': platform.processor(),
                'python_version': sys.version,
                'python_executable': sys.executable
            },
            'flask_info': {
                'debug_mode': request.environ.get('werkzeug.server.shutdown') is not None,
                'environment': request.environ.get('FLASK_ENV', 'production')
            }
        }
        return jsonify(system_info)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/comments', methods=['GET'])
@admin_required
def get_all_comments():
    """Get all comments for admin management"""
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)
        
        data, error, status = comment_service.get_all_comments_for_admin(page, limit)
        
        if error:
            return jsonify(error), status
        return jsonify(data), status
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch comments'}), 500

@admin_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@admin_required
def admin_delete_comment(comment_id):
    """Admin delete a comment"""
    try:
        data, error, status = comment_service.admin_delete_comment(comment_id)
        
        if error:
            return jsonify(error), status
        return jsonify(data), status
        
    except Exception as e:
        return jsonify({'error': 'Failed to delete comment'}), 500
