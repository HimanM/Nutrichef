from ..models import Ingredient, AllergyIntolerance
from ..db import db

class IngredientDAO:
    def get_ingredient_by_name(self, name):
        return Ingredient.query.filter_by(Name=name).first()

    def get_ingredient_by_id(self, ingredient_id):
        return Ingredient.query.get(ingredient_id)

    def create_ingredient(self, name):
        new_ingredient = Ingredient(Name=name)
        db.session.add(new_ingredient)
        return new_ingredient

    def get_or_create_ingredient(self, name):
        ingredient = self.get_ingredient_by_name(name)
        if not ingredient:
            ingredient = self.create_ingredient(name)
        return ingredient
        
    def get_allergies_for_ingredient(self, ingredient_id):
        """
        Retrieves all AllergyIntolerance objects associated with a given ingredient_id.
        Returns a list of AllergyIntolerance objects, or None if ingredient not found.
        Returns an empty list if the ingredient is found but has no associated allergies.
        """
        ingredient = self.get_ingredient_by_id(ingredient_id)

        if ingredient:
            return ingredient.allergies.all()
        return None

    def get_or_create_allergy_intolerance(self, name):
        """
        Retrieves an AllergyIntolerance by name, creating it if it doesn't exist.
        This is a helper method to be used by add_allergy_to_ingredient.
        Assumes AllergyIntolerance and db are imported in the module scope.
        """
        allergy = AllergyIntolerance.query.filter_by(name=name).first()
        if not allergy:
            allergy = AllergyIntolerance(name=name)
            db.session.add(allergy)
        return allergy

    def add_allergy_to_ingredient(self, ingredient_model, allergy_name):
        """
        Adds an allergy to an ingredient if it's not already associated.
        `ingredient_model` is an instance of the Ingredient model.
        `allergy_name` is the string name of the allergy.
        Assumes Ingredient model is imported in the module scope.
        """
        if not isinstance(ingredient_model, Ingredient):
            raise ValueError("ingredient_model must be an instance of Ingredient")

        allergy_model = self.get_or_create_allergy_intolerance(allergy_name)

        if allergy_model and allergy_model not in ingredient_model.allergies.all():
            ingredient_model.allergies.append(allergy_model)
        return ingredient_model
