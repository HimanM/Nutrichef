from ..db import db # Relative import
from datetime import datetime

class RecipeRating(db.Model):
    __tablename__ = 'RecipeRatings'

    RatingID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    RecipeID = db.Column(db.Integer, db.ForeignKey('Recipes.RecipeID', ondelete='CASCADE'), nullable=False)
    UserID = db.Column(db.Integer, db.ForeignKey('Users.UserID', ondelete='CASCADE'), nullable=False)
    Rating = db.Column(db.Integer, nullable=False)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)
    UpdatedAt = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<RecipeRating {self.RatingID} Recipe {self.RecipeID} User {self.UserID} Rating {self.Rating}>'

    def to_dict(self):
        return {
            'RatingID': self.RatingID,
            'RecipeID': self.RecipeID,
            'UserID': self.UserID,
            'Rating': self.Rating,
            'CreatedAt': self.CreatedAt.isoformat() if self.CreatedAt else None,
            'UpdatedAt': self.UpdatedAt.isoformat() if self.UpdatedAt else None,
        }
