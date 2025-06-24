from ..db import db
from datetime import datetime

class ContactMessage(db.Model):
    __tablename__ = 'ContactMessages'

    MessageID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Name = db.Column(db.String(255), nullable=False)
    Email = db.Column(db.String(255), nullable=False)
    Message = db.Column(db.Text, nullable=False)
    Replied = db.Column(db.Boolean, default=False, nullable=False)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'MessageID': self.MessageID,
            'Name': self.Name,
            'Email': self.Email,
            'Message': self.Message,
            'Replied': self.Replied,
            'CreatedAt': self.CreatedAt.isoformat() if self.CreatedAt else None
        }

    def __repr__(self):
        return f"<ContactMessage {self.Name} ({self.Email})>"
