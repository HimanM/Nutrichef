from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from ..services import ContactMessageService, EmailService, UserService
from .admin_routes import admin_required


contact_message_bp = Blueprint('contact_message_bp', __name__, url_prefix='/api/contact')

contact_message_service = ContactMessageService()
email_service = EmailService()
user_service = UserService()

@contact_message_bp.route('/messages', methods=['POST'])
def submit_contact_message():
    data = request.get_json()
    if not data:
        return jsonify({"msg": "Request body must be JSON"}), 400

    message, error, status_code = contact_message_service.save_new_message(data)

    if error:
        return jsonify({"msg": error}), status_code
    return jsonify(message), status_code

@contact_message_bp.route('/admin/messages', methods=['GET'])
@jwt_required()
@admin_required
def get_all_contact_messages():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        sort_by = request.args.get('sort_by', 'CreatedAt', type=str)
        sort_order = request.args.get('sort_order', 'desc', type=str)

        messages, pagination_details, error, status_code = contact_message_service.get_contact_messages(
            page=page, 
            per_page=per_page, 
            sort_by=sort_by, 
            sort_order=sort_order
        )

        if error:
            return jsonify({"msg": error}), status_code

        return jsonify({
            "messages": messages,
            "pagination": pagination_details
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching all contact messages: {e}")
        return jsonify({"msg": "An unexpected error occurred"}), 500


@contact_message_bp.route('/admin/messages/<int:message_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_specific_contact_message(message_id):
    message, error, status_code = contact_message_service.get_single_message(message_id)
    if error:
        return jsonify({"msg": error}), status_code
    return jsonify(message), status_code


@contact_message_bp.route('/admin/messages/<int:message_id>/reply', methods=['POST'])
@jwt_required()
@admin_required
def reply_to_contact_message(message_id):
    data = request.get_json()
    if not data:
        return jsonify({"msg": "Request body must be JSON"}), 400

    reply_subject = data.get('reply_subject')
    reply_body = data.get('reply_body')

    if not reply_subject or not reply_body:
        return jsonify({"msg": "Missing reply_subject or reply_body"}), 400

    original_message_dict, error, status_code = contact_message_service.get_single_message(message_id)
    if error:
        return jsonify({"msg": error}), status_code

    if original_message_dict.get('Replied'):
        return jsonify({"msg": "This message has already been replied to."}), 409

    recipient_email = original_message_dict.get('Email')
    recipient_name = original_message_dict.get('Name')

    if not recipient_email or not recipient_name:
        current_app.logger.error(f"MessageID {message_id} is missing Email or Name for reply.")
        return jsonify({"msg": "Original message details incomplete."}), 500

    try:
        email_sent = email_service.send_reply_to_contact_message(
            recipient_email=recipient_email,
            recipient_name=recipient_name,
            subject=reply_subject,
            reply_body=reply_body
        )
        if not email_sent:
            return jsonify({"msg": "Failed to send reply email. Check server logs."}), 500
    except Exception as e:
        current_app.logger.error(f"Exception sending reply email for MessageID {message_id}: {e}")
        return jsonify({"msg": f"An unexpected error occurred while sending email: {str(e)}"}), 500

    updated_message, error, status_code = contact_message_service.mark_as_replied(message_id)
    if error:
        current_app.logger.error(f"Failed to mark MessageID {message_id} as replied after sending email: {error}")
        return jsonify({
            "msg": "Reply email sent, but failed to update message status. Please check admin panel.",
            "error_details": error
        }), status_code

    return jsonify({
        "msg": "Reply sent and message marked as replied successfully.",
        "updated_message": updated_message
    }), 200
