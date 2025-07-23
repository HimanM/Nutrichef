from ..db import db
from datetime import datetime

class RecipeComment(db.Model):
    __tablename__ = 'RecipeComments'

    CommentID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    RecipeID = db.Column(db.Integer, db.ForeignKey('Recipes.RecipeID', ondelete='CASCADE'), nullable=False)
    UserID = db.Column(db.Integer, db.ForeignKey('Users.UserID', ondelete='CASCADE'), nullable=False)
    Comment = db.Column(db.Text, nullable=False)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)
    UpdatedAt = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    IsEdited = db.Column(db.Boolean, default=False, nullable=False)
    
    # Relationships
    recipe = db.relationship('Recipe', backref='comments')
    user = db.relationship('User', backref='recipe_comments')
    
    # Ensure one comment per user per recipe
    __table_args__ = (db.UniqueConstraint('RecipeID', 'UserID', name='uq_recipe_user_comment'),)

    def __repr__(self):
        return f'<RecipeComment {self.CommentID} Recipe {self.RecipeID} User {self.UserID}>'

    def to_dict(self, include_sensitive=False):
        # Censor username (show first letter + asterisks)
        username = self.user.Name if self.user else "Unknown"
        censored_username = username[0] + '*' * (len(username) - 1) if len(username) > 1 else username[0] if username else "U"
        
        return {
            'CommentID': self.CommentID,
            'RecipeID': self.RecipeID,
            'UserID': self.UserID if include_sensitive else None,
            'Comment': self.Comment,
            'Username': censored_username,
            'UserInitial': username[0].upper() if username else "U",
            'IsEdited': self.IsEdited,
            'CreatedAt': self.CreatedAt.isoformat() if self.CreatedAt else None,
            'UpdatedAt': self.UpdatedAt.isoformat() if self.UpdatedAt else None,
            'IsOwn': False  # Will be set by the service layer based on current user
        }
