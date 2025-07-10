from ..models import Recipe, RecipeIngredient, Ingredient, User, RecipeRating, UserAllergy # Import necessary models using relative import
from ..models.ingredient import ingredient_allergies_association_table # Import for allergy filtering
from ..db import db # Import db instance using relative import
from sqlalchemy.orm import joinedload
from sqlalchemy import func # Import func for aggregate functions


class RecipeDAO:
    def get_recipe_by_id(self, recipe_id):
        recipe = Recipe.query.options(
            db.joinedload(Recipe.author),
            db.joinedload(Recipe.recipe_ingredients).joinedload(RecipeIngredient.ingredient)
        ).get(recipe_id)
        if recipe:
            avg_rating = self.get_average_rating_for_recipe(recipe_id)
            recipe.average_rating = avg_rating
        return recipe

    def get_all_recipes(self, page=1, limit=12, search_term=None, is_admin=False, sort_by=None, sort_order='asc'):
        sort_map = {
            'RecipeID': Recipe.RecipeID,
            'Title': Recipe.Title,
            'UserID': Recipe.UserID,
            'is_public': Recipe.is_public,
            'CreatedAt': Recipe.CreatedAt,
        }

        if is_admin:
            query = Recipe.query
        else:
            query = Recipe.query.filter(Recipe.is_public == True)

        if search_term:
            query = query.filter(Recipe.Title.ilike(f"%{search_term}%"))

        sort_column = sort_map.get(sort_by, Recipe.RecipeID)

        if sort_order.lower() == 'desc':
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())

        paginated_result = query.options(
            db.joinedload(Recipe.author)
        ).paginate(page=page, per_page=limit, error_out=False)
        
        for recipe in paginated_result.items:
            avg_rating = self.get_average_rating_for_recipe(recipe.RecipeID)
            recipe.average_rating = avg_rating
            
        return paginated_result

    def get_public_recipes(self, page=1, limit=12, search_term=None):
        query = Recipe.query.filter_by(is_public=True)
        if search_term:
            query = query.filter(Recipe.Title.ilike(f"%{search_term}%"))
        paginated_result = query.options(
            db.joinedload(Recipe.author)
        ).order_by(Recipe.CreatedAt.desc()).paginate(page=page, per_page=limit, error_out=False)

        for recipe in paginated_result.items:
            avg_rating = self.get_average_rating_for_recipe(recipe.RecipeID)
            recipe.average_rating = avg_rating
            
        return paginated_result

    def get_user_private_recipes(self, user_id, page=1, limit=12, search_term=None):
        query = Recipe.query.filter_by(UserID=user_id, is_public=False)
        if search_term:
            query = query.filter(Recipe.Title.ilike(f"%{search_term}%"))
        paginated_result = query.options(
            db.joinedload(Recipe.author)
        ).order_by(Recipe.CreatedAt.desc()).paginate(page=page, per_page=limit, error_out=False)

        for recipe in paginated_result.items:
            avg_rating = self.get_average_rating_for_recipe(recipe.RecipeID)
            recipe.average_rating = avg_rating
            
        return paginated_result

    def get_average_rating_for_recipe(self, recipe_id):
        avg_rating_query = db.session.query(func.avg(RecipeRating.Rating)).filter(RecipeRating.RecipeID == recipe_id)
        avg_rating = avg_rating_query.scalar()
        return float(avg_rating) if avg_rating is not None else 0.0

    def get_all_recipes_for_suggestions(self):
        """
        Returns all recipes, intended for use in suggestion algorithms
        where pagination is not desired.
        """
        return Recipe.query.filter_by(is_public=True).order_by(Recipe.CreatedAt.desc()).all()

    def get_ingredients_for_recipe(self, recipe_id):
        """
        Retrieves a list of Ingredient model instances for a given recipe_id.
        """
        recipe = Recipe.query.options(
            db.joinedload(Recipe.recipe_ingredients).joinedload(RecipeIngredient.ingredient)
        ).get(recipe_id)
        if recipe:
            return [ri.ingredient for ri in recipe.recipe_ingredients if ri.ingredient]
        return []


    def create_recipe(self, user_id, title, description, instructions, prep_time, cook_time, servings, image_url, ingredients_data, is_public, nutrition_info=None):
        """
        Creates a new recipe and its associated RecipeIngredient entries.
        'ingredients_data' is a list of dictionaries, each like:
        { 'ingredient_model': <Ingredient instance>, 'quantity': '1', 'unit': 'cup' }
        'nutrition_info' is optional nutritional information as a dictionary
        """
        new_recipe = Recipe(
            UserID=user_id,
            Title=title,
            Description=description,
            Instructions=instructions,
            PreparationTimeMinutes=prep_time,
            CookingTimeMinutes=cook_time,
            Servings=servings,
            ImageURL=image_url,
            is_public=is_public,
            NutritionInfoJSON=nutrition_info
        )
        db.session.add(new_recipe)

        for item_data in ingredients_data:
            recipe_ingredient = RecipeIngredient(
                Quantity=item_data['quantity'],
                Unit=item_data['unit']
            )
            recipe_ingredient.recipe = new_recipe 
            recipe_ingredient.ingredient = item_data['ingredient_model']
            db.session.add(recipe_ingredient)

        return new_recipe

    def update_recipe_public_status(self, recipe_id, is_public):
        recipe = Recipe.query.get(recipe_id)
        if recipe:
            recipe.is_public = is_public
            return recipe
        return None
        
    def get_personalized_recipes_for_user(self, user_id, page=1, limit=12):
        """
        Retrieves paginated recipes personalized for a user by filtering out
        recipes containing ingredients they are allergic to.
        Calculates and attaches average_rating to each recipe in the current page.
        """
        user = User.query.get(user_id)
        if not user:
            return Recipe.query.filter_by(RecipeID=-1).paginate(page=page, per_page=limit, error_out=False)

        user_allergy_links = UserAllergy.query.filter_by(UserID=user_id).all()
        user_allergy_ids = [ual.AllergyID for ual in user_allergy_links]

        recipes_query = Recipe.query.filter(Recipe.is_public == True)
        recipes_query = recipes_query.options(db.joinedload(Recipe.author))

        if user_allergy_ids:
            allergic_ingredient_ids_query = db.session.query(ingredient_allergies_association_table.c.ingredient_id)\
                .filter(ingredient_allergies_association_table.c.allergy_intolerance_id.in_(user_allergy_ids))\
                .distinct()
            allergic_ingredient_ids = [row[0] for row in allergic_ingredient_ids_query.all()]

            if allergic_ingredient_ids:
                recipes_to_exclude_ids_query = db.session.query(RecipeIngredient.RecipeID)\
                    .filter(RecipeIngredient.IngredientID.in_(allergic_ingredient_ids))\
                    .distinct()
                recipes_to_exclude_ids = [row[0] for row in recipes_to_exclude_ids_query.all()]

                if recipes_to_exclude_ids:
                    recipes_query = recipes_query.filter(Recipe.RecipeID.notin_(recipes_to_exclude_ids))
        
        paginated_recipes = recipes_query.order_by(Recipe.CreatedAt.desc()).paginate(
            page=page, per_page=limit, error_out=False
        )

        for recipe in paginated_recipes.items:
            avg_rating = self.get_average_rating_for_recipe(recipe.RecipeID)
            recipe.average_rating = avg_rating

        return paginated_recipes
