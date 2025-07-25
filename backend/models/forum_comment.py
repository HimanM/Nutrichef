from ..db import db
from datetime import datetime

class ForumComment(db.Model):
    __tablename__ = 'ForumComments'

    Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    PostId = db.Column(db.Integer, db.ForeignKey('ForumPosts.Id', ondelete='CASCADE'), nullable=False)
    UserId = db.Column(db.Integer, db.ForeignKey('Users.UserID', ondelete='CASCADE'), nullable=False)
    Comment = db.Column(db.Text, nullable=False)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)
    UpdatedAt = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    post = db.relationship('ForumPost', back_populates='comments')
    user = db.relationship('User', backref='forum_comments', lazy=True)

    def __repr__(self):
        return f'<ForumComment {self.Id} on Post {self.PostId}>'

    def to_dict(self):
        """Convert forum comment to dictionary"""
        return {
            'Id': self.Id,
            'PostId': self.PostId,
            'UserId': self.UserId,
            'UserName': self.user.Name if self.user else 'Unknown User',
            'Comment': self.Comment,
            'CreatedAt': self.CreatedAt.isoformat() if self.CreatedAt else None
        }