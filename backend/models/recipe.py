from ..db import db
from datetime import datetime

class Recipe(db.Model):
    __tablename__ = 'Recipes'

    RecipeID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    UserID = db.Column(db.Integer, db.ForeignKey('Users.UserID', ondelete='CASCADE'), nullable=False)
    Title = db.Column(db.String(255), nullable=False)
    Description = db.Column(db.Text, nullable=True)
    Instructions = db.Column(db.Text, nullable=False)
    PreparationTimeMinutes = db.Column(db.Integer, nullable=True)
    CookingTimeMinutes = db.Column(db.Integer, nullable=True)
    Servings = db.Column(db.Integer, nullable=True)
    ImageURL = db.Column(db.String(2083), nullable=True)
    is_public = db.Column(db.Boolean, default=False, nullable=False)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)
    UpdatedAt = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    recipe_ingredients = db.relationship('RecipeIngredient', back_populates='recipe', cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Recipe {self.RecipeID} {self.Title}>'

    def to_dict(self):
        image_url = self.ImageURL
        if self.ImageURL and not (self.ImageURL.startswith('http://') or self.ImageURL.startswith('https://')):
            image_url = f"{self.ImageURL}"
        return {
            'RecipeID': self.RecipeID,
            'UserID': self.UserID,
            'AuthorName': self.author.Name if self.author else None,
            'Title': self.Title,
            'Description': self.Description,
            'Instructions': self.Instructions,
            'PreparationTimeMinutes': self.PreparationTimeMinutes,
            'CookingTimeMinutes': self.CookingTimeMinutes,
            'Servings': self.Servings,
            'ImageURL': image_url,
            'is_public': self.is_public,
            'CreatedAt': self.CreatedAt.isoformat() if self.CreatedAt else None,
            'UpdatedAt': self.UpdatedAt.isoformat() if self.UpdatedAt else None,
            'ingredients': [ri.to_dict() for ri in self.recipe_ingredients],
            'average_rating': self.average_rating if hasattr(self, 'average_rating') else None
        }

    def to_dict_summary(self):
        image_url = self.ImageURL
        if self.ImageURL and not (self.ImageURL.startswith('http://') or self.ImageURL.startswith('https://')):
            image_url = f"{self.ImageURL}"
        return {
            'RecipeID': self.RecipeID,
            'Title': self.Title,
            'Description': self.Description,
            'ImageURL': image_url,
            'AuthorName': self.author.Name if self.author else None,
            'PreparationTimeMinutes': self.PreparationTimeMinutes,
            'CookingTimeMinutes': self.CookingTimeMinutes,
            'Servings': self.Servings,
            'is_public': self.is_public,
            'CreatedAt': self.CreatedAt.isoformat() if self.CreatedAt else None,
            'average_rating': self.average_rating if hasattr(self, 'average_rating') else None
        }
