from ..db import db
from datetime import datetime

class Notification(db.Model):
    __tablename__ = 'Notifications'

    Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    UserId = db.Column(db.Integer, db.ForeignKey('Users.UserID', ondelete='CASCADE'), nullable=False)
    Type = db.Column(db.String(50), nullable=False)
    ReferenceId = db.Column(db.Integer)
    Message = db.Column(db.Text, nullable=False)
    IsRead = db.Column(db.Boolean, default=False)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='notifications', lazy=True)

    def to_dict(self):
        return {
            'Id': self.Id,
            'UserId': self.UserId,
            'Type': self.Type,
            'ReferenceId': self.ReferenceId,
            'Message': self.Message,
            'IsRead': self.IsRead,
            'CreatedAt': self.CreatedAt.isoformat() if self.CreatedAt else None
        } 