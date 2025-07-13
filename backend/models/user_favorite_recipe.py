from ..db import db
from datetime import datetime

class UserFavoriteRecipe(db.Model):
    __tablename__ = 'UserFavoriteRecipes'
    
    FavoriteID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    UserID = db.Column(db.Integer, db.ForeignKey('Users.UserID', ondelete='CASCADE'), nullable=False)
    RecipeID = db.Column(db.Integer, db.ForeignKey('Recipes.RecipeID', ondelete='CASCADE'), nullable=False)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='favorite_recipes')
    recipe = db.relationship('Recipe', backref='favorited_by')
    
    def __repr__(self):
        return f'<UserFavoriteRecipe {self.FavoriteID} User {self.UserID} Recipe {self.RecipeID}>'
    
    def to_dict(self):
        return {
            'FavoriteID': self.FavoriteID,
            'UserID': self.UserID,
            'RecipeID': self.RecipeID,
            'CreatedAt': self.CreatedAt.isoformat() if self.CreatedAt else None
        }
