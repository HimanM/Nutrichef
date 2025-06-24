from ..db import db # Relative import
from datetime import datetime

class Substitution(db.Model):
    __tablename__ = 'Substitutions'

    SubstitutionID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    OriginalIngredientID = db.Column(db.Integer, db.ForeignKey('Ingredients.IngredientID', ondelete='CASCADE'), nullable=False)
    SubstituteIngredientID = db.Column(db.Integer, db.ForeignKey('Ingredients.IngredientID', ondelete='CASCADE'), nullable=False)
    Notes = db.Column(db.Text, nullable=True)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships to get ingredient names easily
    original_ingredient = db.relationship('Ingredient', foreign_keys=[OriginalIngredientID], backref='substitutions_as_original')
    substitute_ingredient = db.relationship('Ingredient', foreign_keys=[SubstituteIngredientID], backref='substitutions_as_substitute')
    
    def __repr__(self):
        return f'<Substitution {self.SubstitutionID}>'

    def to_dict(self):
        return {
            'SubstitutionID': self.SubstitutionID,
            'OriginalIngredientID': self.OriginalIngredientID,
            'OriginalIngredientName': self.original_ingredient.Name if self.original_ingredient else None,
            'SubstituteIngredientID': self.SubstituteIngredientID,
            'SubstituteIngredientName': self.substitute_ingredient.Name if self.substitute_ingredient else None,
            'Notes': self.Notes,
            'CreatedAt': self.CreatedAt.isoformat() if self.CreatedAt else None
        }
