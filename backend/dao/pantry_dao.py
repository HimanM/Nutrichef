from backend.db import db # For db.session and ORM utilities like joinedload
from backend.models import UserPantryIngredient, Ingredient # SQLAlchemy models
from .ingredient_dao import IngredientDAO # Assumed to be SQLAlchemy based

class PantryDAO:
    def __init__(self):
        self.ingredient_dao = IngredientDAO()

    def add_ingredient_to_pantry(self, user_id, ingredient_name, quantity, unit):
        ingredient = self.ingredient_dao.get_or_create_ingredient(ingredient_name)

        if not ingredient:
            return None

        pantry_item = self.get_pantry_ingredient_by_user_and_ingredient_id(user_id, ingredient.IngredientID)

        if pantry_item:
            if pantry_item.Unit == unit:
                try:
                    current_quantity_float = float(pantry_item.Quantity)
                    new_quantity_float = float(quantity)
                    pantry_item.Quantity = str(current_quantity_float + new_quantity_float)
                except ValueError:
                    pantry_item.Quantity = quantity
            else:
                pantry_item.Quantity = quantity
                pantry_item.Unit = unit
            db.session.add(pantry_item)
        else:
            pantry_item = UserPantryIngredient(
                UserID=user_id,
                IngredientID=ingredient.IngredientID,
                Quantity=quantity,
                Unit=unit
            )
            db.session.add(pantry_item)

        if not pantry_item.ingredient:
            pantry_item.ingredient = ingredient

        return pantry_item

    def get_pantry_by_user_id(self, user_id):
        return UserPantryIngredient.query.filter_by(UserID=user_id)\
                                     .join(Ingredient, UserPantryIngredient.IngredientID == Ingredient.IngredientID)\
                                     .options(db.joinedload(UserPantryIngredient.ingredient))\
                                     .order_by(Ingredient.Name)\
                                     .all()

    def get_pantry_ingredient_by_id(self, user_pantry_ingredient_id):
        return UserPantryIngredient.query.options(db.joinedload(UserPantryIngredient.ingredient))\
                                     .get(user_pantry_ingredient_id)

    def update_pantry_ingredient(self, user_pantry_ingredient_id, quantity, unit):
        pantry_item = self.get_pantry_ingredient_by_id(user_pantry_ingredient_id)
        if pantry_item:
            pantry_item.Quantity = quantity
            pantry_item.Unit = unit
            db.session.add(pantry_item)
            return pantry_item
        return None

    def remove_ingredient_from_pantry(self, user_pantry_ingredient_id):
        pantry_item = self.get_pantry_ingredient_by_id(user_pantry_ingredient_id)
        if pantry_item:
            db.session.delete(pantry_item)
            return True
        return False

    def get_pantry_ingredient_by_user_and_ingredient_id(self, user_id, ingredient_id):
        return UserPantryIngredient.query.filter_by(UserID=user_id, IngredientID=ingredient_id)\
                                     .options(db.joinedload(UserPantryIngredient.ingredient))\
                                     .first()
