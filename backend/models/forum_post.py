from ..db import db
from datetime import datetime

class ForumPost(db.Model):
    __tablename__ = 'ForumPosts'

    Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    UserId = db.Column(db.Integer, db.ForeignKey('Users.UserID', ondelete='CASCADE'), nullable=False)
    Title = db.Column(db.String(255), nullable=False)
    Content = db.Column(db.Text, nullable=False)
    LikesCount = db.Column(db.Integer, default=0, nullable=False)
    ViewsCount = db.Column(db.Integer, default=0, nullable=False)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)
    UpdatedAt = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref='forum_posts', lazy=True)
    comments = db.relationship('ForumComment', back_populates='post', cascade="all, delete-orphan")
    likes = db.relationship('ForumLike', back_populates='post', cascade="all, delete-orphan")
    tags = db.relationship('ForumPostTag', back_populates='post', cascade="all, delete-orphan")

    def __repr__(self):
        return f'<ForumPost {self.Id} {self.Title}>'

    def to_dict(self, include_content=True, current_user_id=None):
        """Convert forum post to dictionary with optional content inclusion"""
        result = {
            'Id': self.Id,
            'UserId': self.UserId,
            'UserName': self.user.Name if self.user else 'Unknown User',
            'Title': self.Title,
            'LikesCount': self.LikesCount,
            'ViewsCount': self.ViewsCount,
            'CreatedAt': self.CreatedAt.isoformat() if self.CreatedAt else None,
            'UpdatedAt': self.UpdatedAt.isoformat() if self.UpdatedAt else None,
            'CommentsCount': len(self.comments) if self.comments else 0,
            'TaggedRecipes': [tag.to_dict() for tag in self.tags] if self.tags else []
        }
        
        if include_content:
            result['Content'] = self.Content
            
        # Check if current user has liked this post
        if current_user_id:
            result['IsLikedByCurrentUser'] = any(like.UserId == current_user_id for like in self.likes)
        else:
            result['IsLikedByCurrentUser'] = False
            
        return result

    def to_dict_summary(self, current_user_id=None):
        """Convert forum post to summary dictionary (without content)"""
        return self.to_dict(include_content=False, current_user_id=current_user_id)