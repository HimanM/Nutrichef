from typing import Optional # Added import
from ..models import ContactMessage
from ..db import db

class ContactMessageDAO:
    def create_message(self, name: str, email: str, message: str) -> ContactMessage:
        """
        Creates a new ContactMessage instance without committing to the session.
        """
        new_message = ContactMessage(Name=name, Email=email, Message=message)
        db.session.add(new_message)
        return new_message

    def get_all_messages(self, page: int = 1, per_page: int = 10):
        """
        Retrieves all messages, paginated, ordered by CreatedAt descending.
        """
        query = ContactMessage.query.order_by(ContactMessage.CreatedAt.desc())
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        return pagination # Returns a Pagination object

    def get_message_by_id(self, message_id: int) -> Optional[ContactMessage]:
        """
        Retrieves a single message by its MessageID.
        Returns None if not found.
        """
        return ContactMessage.query.get(message_id)

    def update_message_replied_status(self, message_id: int, replied_status: bool) -> Optional[ContactMessage]:
        """
        Fetches the message by message_id and updates its Replied status.
        Returns the updated message object or None if not found.
        Does not commit; the service layer will handle commits.
        """
        message = self.get_message_by_id(message_id)
        if message:
            message.Replied = replied_status
            db.session.add(message)
        return message
