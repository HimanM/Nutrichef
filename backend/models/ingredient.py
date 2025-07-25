from ..db import db
from datetime import datetime
from backend.models.allergy_intolerance import AllergyIntolerance

ingredient_allergies_association_table = db.Table(
    'IngredientAllergiesIntolerances',
    db.metadata,
    db.Column('ingredient_id', db.Integer, db.ForeignKey('Ingredients.IngredientID'), primary_key=True),
    db.Column('allergy_intolerance_id', db.Integer, db.ForeignKey('AllergyIntolerances.id'), primary_key=True)
)

class Ingredient(db.Model):
    __tablename__ = 'Ingredients'

    IngredientID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Name = db.Column(db.String(255), nullable=False, unique=True)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)
    
    allergies = db.relationship(
        "AllergyIntolerance",
        secondary=ingredient_allergies_association_table,
        backref=db.backref("ingredients_associated", lazy="dynamic"),
        lazy="dynamic"
    )

    def __repr__(self):
        return f'<Ingredient {self.IngredientID} {self.Name}>'

    def to_dict(self, include_allergies=False):
        data = {
            'IngredientID': self.IngredientID,
            'Name': self.Name,
            'CreatedAt': self.CreatedAt.isoformat() if self.CreatedAt else None
        }
        if include_allergies:
            data['allergies'] = [allergy.to_dict() for allergy in self.allergies.all()]
        return data
