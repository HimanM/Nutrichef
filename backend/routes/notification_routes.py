from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_current_user
from ..services.main.notification_service import NotificationService

notification_bp = Blueprint('notification', __name__, url_prefix='/api/notifications')
notification_service = NotificationService()

@notification_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    current_user = get_current_user()
    limit = request.args.get('limit', 20, type=int)
    notifs = notification_service.get_notifications_for_user(current_user.UserID, limit)
    return jsonify(notifs), 200

@notification_bp.route('/<int:notification_id>/read', methods=['POST'])
@jwt_required()
def mark_notification_as_read(notification_id):
    current_user = get_current_user()
    notif = notification_service.mark_as_read(notification_id, current_user.UserID)
    if not notif:
        return jsonify({'error': 'Notification not found'}), 404
    return jsonify(notif), 200

@notification_bp.route('/clear', methods=['POST'])
@jwt_required()
def clear_notifications():
    current_user = get_current_user()
    notification_service.clear_all_notifications_for_user(current_user.UserID)
    return jsonify({'message': 'All notifications cleared.'}), 200 