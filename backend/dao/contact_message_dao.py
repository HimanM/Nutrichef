from typing import Optional # Added import
from backend.models import ContactMessage
from backend.db import db

class ContactMessageDAO:
    def create_message(self, name: str, email: str, message: str) -> ContactMessage:
        """
        Creates a new ContactMessage instance without committing to the session.
        """
        new_message = ContactMessage(Name=name, Email=email, Message=message)
        db.session.add(new_message)
        return new_message

    def get_all_messages(self, page: int = 1, per_page: int = 10, sort_by: str = 'CreatedAt', sort_order: str = 'desc'):
        """
        Retrieves all messages, paginated, with customizable sorting.
        
        Args:
            page: Page number (1-indexed)
            per_page: Items per page
            sort_by: Column to sort by (CreatedAt, Name, Email, Message, Replied, MessageID)
            sort_order: Sort direction ('asc' or 'desc')
        """
        # Map frontend column names to model attributes
        sort_mapping = {
            'CreatedAt': ContactMessage.CreatedAt,
            'Name': ContactMessage.Name,
            'Email': ContactMessage.Email,
            'Message': ContactMessage.Message,
            'Replied': ContactMessage.Replied,
            'MessageID': ContactMessage.MessageID
        }
        
        # Validate sort_by parameter
        if sort_by not in sort_mapping:
            sort_by = 'CreatedAt'
        
        # Validate sort_order parameter
        if sort_order.lower() not in ['asc', 'desc']:
            sort_order = 'desc'
        
        # Build the query with sorting
        sort_column = sort_mapping[sort_by]
        if sort_order.lower() == 'asc':
            query = ContactMessage.query.order_by(sort_column.asc())
        else:
            query = ContactMessage.query.order_by(sort_column.desc())
        
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
