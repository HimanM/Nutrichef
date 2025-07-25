from ..db import db
from datetime import datetime

class ForumLike(db.Model):
    __tablename__ = 'ForumLikes'

    Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    PostId = db.Column(db.Integer, db.ForeignKey('ForumPosts.Id', ondelete='CASCADE'), nullable=False)
    UserId = db.Column(db.Integer, db.ForeignKey('Users.UserID', ondelete='CASCADE'), nullable=False)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    post = db.relationship('ForumPost', back_populates='likes')
    user = db.relationship('User', backref='forum_likes', lazy=True)

    # Unique constraint to prevent duplicate likes
    __table_args__ = (
        db.UniqueConstraint('PostId', 'UserId', name='unique_user_post_like'),
    )

    def __repr__(self):
        return f'<ForumLike {self.Id} User {self.UserId} Post {self.PostId}>'

    def to_dict(self):
        """Convert forum like to dictionary"""
        return {
            'Id': self.Id,
            'PostId': self.PostId,
            'UserId': self.UserId,
            'UserName': self.user.Name if self.user else 'Unknown User',
            'CreatedAt': self.CreatedAt.isoformat() if self.CreatedAt else None
        }