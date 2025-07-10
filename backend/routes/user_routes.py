from flask import Blueprint, request, jsonify
from ..services import UserService
from flask_jwt_extended import jwt_required, get_jwt_identity

user_service = UserService()

user_bp = Blueprint('user_bp', __name__, url_prefix='/api')

@user_bp.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    user_dict, error_dict, status_code = user_service.register_user(data)

    if error_dict:
        return jsonify(error_dict), status_code
    
    return jsonify(user_dict), status_code

@user_bp.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    email = data.get('email')
    password = data.get('password')

    user_dict, token, error_dict, status_code = user_service.login_user(email, password)

    if error_dict:
        return jsonify(error_dict), status_code
    
    return jsonify({"message": "Login successful", "token": token, "user": user_dict}), status_code


@user_bp.route('/user/preferences', methods=['GET'])
@jwt_required()
def get_user_preferences_route():
    actual_user_id = get_jwt_identity()
    
    preferences_data, error, status = user_service.get_user_preferences(actual_user_id)
    if error:
        return jsonify(error), status
    return jsonify(preferences_data), status


@user_bp.route('/user/preferences', methods=['PUT'])
@jwt_required()
def update_user_preferences_route():
    actual_user_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    success, response_data, status = user_service.update_user_preferences(actual_user_id, data)
    return jsonify(response_data), status


@user_bp.route('/user/password', methods=['PUT'])
@jwt_required()
def update_user_password_route():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400
    
    user_id = data.get('userID')
    old_password = data.get('currentPassword')
    new_password = data.get('newPassword')

    success, response_data, status = user_service.change_password(user_id, old_password, new_password)
    return jsonify(response_data), status

@user_bp.route('/user/nutritional-targets', methods=['PUT'])
@jwt_required()
def update_nutritional_targets_route():
    actual_user_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    success, response_data, status = user_service.update_nutritional_targets(actual_user_id, data)
    return jsonify(response_data), status

@user_bp.route('/verify-email/<token>', methods=['GET'])
def verify_user_email(token):
    user_dict, error_dict, status_code = user_service.verify_email(token)

    if error_dict:
        return jsonify(error_dict), status_code

    return jsonify({"message": "Email verified successfully", "user": user_dict}), status_code
