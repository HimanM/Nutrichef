from ..db import db
from datetime import datetime

class UserPantryIngredient(db.Model):
    __tablename__ = 'UserPantryIngredients'

    UserPantryIngredientID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    UserID = db.Column(db.Integer, db.ForeignKey('Users.UserID', ondelete='CASCADE'), nullable=False)
    IngredientID = db.Column(db.Integer, db.ForeignKey('Ingredients.IngredientID', ondelete='CASCADE'), nullable=False)
    Quantity = db.Column(db.String(255), nullable=False)
    Unit = db.Column(db.String(50), nullable=True)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    UpdatedAt = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = db.relationship('User', backref=db.backref('pantry_items', lazy='dynamic', cascade="all, delete-orphan"))

    ingredient = db.relationship('Ingredient', backref=db.backref('in_pantries', lazy='dynamic'))

    def __repr__(self):
        return f'<UserPantryIngredient UserPantryIngredientID={self.UserPantryIngredientID} UserID={self.UserID} IngredientID={self.IngredientID} Quantity="{self.Quantity}">'

    def to_dict(self, include_relations=False):
        """
        Converts the UserPantryIngredient object to a dictionary.
        Optionally includes related data like IngredientName.
        """
        data = {
            "UserPantryIngredientID": self.UserPantryIngredientID,
            "UserID": self.UserID,
            "IngredientID": self.IngredientID,
            "Quantity": self.Quantity,
            "Unit": self.Unit,
            "CreatedAt": self.CreatedAt.isoformat() if self.CreatedAt else None,
            "UpdatedAt": self.UpdatedAt.isoformat() if self.UpdatedAt else None
        }
        if include_relations:
            if self.ingredient:
                 data['IngredientName'] = self.ingredient.Name
        return data
