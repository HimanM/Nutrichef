from ..db import db # Relative import

class RecipeIngredient(db.Model):
    __tablename__ = 'RecipeIngredients'

    RecipeIngredientID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    RecipeID = db.Column(db.Integer, db.ForeignKey('Recipes.RecipeID', ondelete='CASCADE'), nullable=False)
    IngredientID = db.Column(db.Integer, db.ForeignKey('Ingredients.IngredientID', ondelete='CASCADE'), nullable=False)
    Quantity = db.Column(db.String(50), nullable=False)
    Unit = db.Column(db.String(50), nullable=False)
    
    recipe = db.relationship('Recipe', back_populates='recipe_ingredients')
    ingredient = db.relationship('Ingredient')

    __table_args__ = (db.UniqueConstraint('RecipeID', 'IngredientID', name='uq_recipe_ingredient'),)

    def __repr__(self):
        return f'<RecipeIngredient {self.RecipeIngredientID} R:{self.RecipeID} I:{self.IngredientID}>'


    def to_dict(self):

        return {

            'RecipeIngredientID': self.RecipeIngredientID,

            'RecipeID': self.RecipeID,

            'IngredientID': self.IngredientID,

            'IngredientName': self.ingredient.Name if self.ingredient else None,

            'Quantity': self.Quantity,

            'Unit': self.Unit,

            'Allergies': [allergy.to_dict() for allergy in self.ingredient.allergies.all()] if self.ingredient and hasattr(self.ingredient, 'allergies') else []

        }
