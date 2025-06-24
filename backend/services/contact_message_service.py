from ..dao import ContactMessageDAO
from ..db import db
from sqlalchemy.exc import SQLAlchemyError

class ContactMessageService:
    def __init__(self):
        self.contact_message_dao = ContactMessageDAO()

    def save_new_message(self, data: dict):
        """
        Saves a new contact message after validation.
        Commits the session to the database.
        Returns a tuple: (message_dict | None, error_message | None, status_code)
        """
        name = data.get('name')
        email = data.get('email')
        message_text = data.get('message')

        if not all([name, email, message_text]):
            return None, "Missing required fields (name, email, message).", 400

        if "@" not in email or "." not in email:
            return None, "Invalid email format.", 400

        if len(name) > 255 or len(email) > 255:
            return None, "Name or Email exceeds maximum length of 255 characters.", 400

        try:
            new_message = self.contact_message_dao.create_message(name=name, email=email, message=message_text)
            db.session.commit()
            return new_message.to_dict(), None, 201
        except SQLAlchemyError as e:
            db.session.rollback()
            return None, f"Database error: {str(e)}", 500
        except Exception as e:
            db.session.rollback()
            return None, f"An unexpected error occurred: {str(e)}", 500

    def get_contact_messages(self, page: int = 1, per_page: int = 10):
        """
        Retrieves paginated contact messages.
        Returns a tuple: (list_of_message_dicts, pagination_details, error_message | None, status_code)
        """
        try:
            pagination_obj = self.contact_message_dao.get_all_messages(page=page, per_page=per_page)
            messages_dict = [msg.to_dict() for msg in pagination_obj.items]
            pagination_details = {
                'page': pagination_obj.page,
                'per_page': pagination_obj.per_page,
                'total_pages': pagination_obj.pages,
                'total_items': pagination_obj.total
            }
            return messages_dict, pagination_details, None, 200
        except Exception as e:
            return [], {}, f"An unexpected error occurred: {str(e)}", 500

    def get_single_message(self, message_id: int):
        """
        Retrieves a single contact message by its ID.
        Returns a tuple: (message_dict | None, error_message | None, status_code)
        """
        try:
            message = self.contact_message_dao.get_message_by_id(message_id)
            if message:
                return message.to_dict(), None, 200
            else:
                return None, "Message not found.", 404
        except Exception as e:
            return None, f"An unexpected error occurred: {str(e)}", 500

    def mark_as_replied(self, message_id: int):
        """
        Marks a message as replied.
        Commits the session.
        Returns a tuple: (updated_message_dict | None, error_message | None, status_code)
        """
        try:
            message = self.contact_message_dao.get_message_by_id(message_id)
            if not message:
                return None, "Message not found.", 404

            if message.Replied:
                return message.to_dict(), "Message already marked as replied.", 200

            updated_message = self.contact_message_dao.update_message_replied_status(message_id, True)
            if updated_message:
                db.session.commit()
                return updated_message.to_dict(), None, 200
            else:
                db.session.rollback()
                return None, "Failed to update message status or message not found.", 404
        except SQLAlchemyError as e:
            db.session.rollback()
            return None, f"Database error: {str(e)}", 500
        except Exception as e:
            db.session.rollback()
            return None, f"An unexpected error occurred: {str(e)}", 500
