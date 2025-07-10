from backend.dao import RecipeDAO, IngredientDAO, RecipeRatingDAO
from backend.db import db
from backend.ai_models.allergy_analyzer.allergy_analyzer import AllergyAnalyzer
from backend.ai_models.gemini_nlp.gemini_nlp_parser import GeminiNlpParser

class RecipeService:
    def __init__(self):
        self.recipe_dao = RecipeDAO()
        self.ingredient_dao = IngredientDAO()
        self.recipe_rating_dao = RecipeRatingDAO()
        self.allergy_analyzer = AllergyAnalyzer()
        self.gemini_nlp = GeminiNlpParser()

    def get_public_recipes_summary(self, page=1, limit=12, search_term=None):
        """Fetches a paginated list of public recipes with summary information."""
        try:
            paginated_recipes = self.recipe_dao.get_public_recipes(page=page, limit=limit, search_term=search_term)
            recipes_data = [
                recipe.to_dict_summary() for recipe in paginated_recipes.items
            ]
            return {
                "recipes": recipes_data,
                "pagination": {
                    "page": paginated_recipes.page,
                    "pages": paginated_recipes.pages,
                    "per_page": paginated_recipes.per_page,
                    "total": paginated_recipes.total,
                    "has_next": paginated_recipes.has_next,
                    "has_prev": paginated_recipes.has_prev
                }
            }, None, 200
        except Exception as e:
            print(f"Error getting public recipes summary: {e}")
            return None, {"error": "Failed to retrieve recipes"}, 500

    def get_user_private_recipes_summary(self, user_id, page=1, limit=12, search_term=None):
        """Fetches a paginated list of a user's private recipes with summary information."""
        try:
            paginated_recipes = self.recipe_dao.get_user_private_recipes(user_id=user_id, page=page, limit=limit, search_term=search_term)
            recipes_data = [recipe.to_dict_summary() for recipe in paginated_recipes.items]
            return {
                "recipes": recipes_data,
                "pagination": {
                    "page": paginated_recipes.page,
                    "pages": paginated_recipes.pages,
                    "per_page": paginated_recipes.per_page,
                    "total": paginated_recipes.total,
                    "has_next": paginated_recipes.has_next,
                    "has_prev": paginated_recipes.has_prev
                }
            }, None, 200
        except Exception as e:
            print(f"Error getting user private recipes summary: {e}")
            return None, {"error": "Failed to retrieve recipes"}, 500

    def get_recipe_details(self, recipe_id, current_user_id=None):
        """Fetches detailed information for a single recipe, including user's rating if available."""
        try:
            recipe = self.recipe_dao.get_recipe_by_id(recipe_id)
            if not recipe:
                return None, {"error": "Recipe not found"}, 404

            recipe_dict = recipe.to_dict()

            if current_user_id:
                user_rating_model = self.recipe_rating_dao.get_rating_by_user_and_recipe(recipe_id, current_user_id)
                recipe_dict['current_user_rating'] = user_rating_model.Rating if user_rating_model else None
            else:
                recipe_dict['current_user_rating'] = None

            return recipe_dict, None, 200
        except Exception as e:
            print(f"Error getting recipe details: {e}")
            return None, {"error": "Failed to retrieve recipe details"}, 500

    def create_recipe(self, user_id, data):
        """
        Creates a new recipe with nutritional information extraction.
        'data' is a dictionary from the route, expecting keys like:
        'title', 'description', 'instructions', 'preparationTimeMinutes',
        'cookingTimeMinutes', 'servings', 'imageURL', 'is_public', and 'ingredients' (list of dicts).
        Each ingredient dict: {'name': 'Flour', 'quantity': '1', 'unit': 'cup'}
        """
        required_fields = ['title', 'instructions', 'ingredients']
        for field in required_fields:
            if field not in data:
                return None, {"error": f"Missing required field: {field}"}, 400

        if not data['title'].strip():
            return None, {"error": "Recipe title cannot be empty"}, 400

        if not data['instructions'].strip():
            return None, {"error": "Recipe instructions cannot be empty"}, 400

        if not data['ingredients'] or not isinstance(data['ingredients'], list):
            return None, {"error": "Ingredients must be a non-empty list"}, 400

        ingredients_for_dao = []

        try:
            for ing_data in data['ingredients']:
                if not all(k in ing_data for k in ['name', 'quantity', 'unit']):
                    return None, {"error": "Each ingredient must have name, quantity, and unit"}, 400
                if not ing_data['name'].strip():
                    return None, {"error": "Ingredient name cannot be empty"}, 400
                    
                ingredient_model = self.ingredient_dao.get_or_create_ingredient(ing_data['name'].strip())
                ingredients_for_dao.append({
                    'ingredient_model': ingredient_model,
                    'quantity': ing_data['quantity'],
                    'unit': ing_data['unit']
                })
            
            is_public = data.get('is_public', False)

            # Extract nutritional information using Gemini NLP
            recipe_for_nutrition = {
                "Title": data['title'],
                "Ingredients": [{"Ingredient": ing['name'], "Quantity": ing['quantity'], "Unit": ing['unit']} for ing in data['ingredients']],
                "Servings": data.get('servings', 1)
            }
            nutrition_info = self.gemini_nlp.extract_recipe_nutrition(recipe_for_nutrition)

            new_recipe = self.recipe_dao.create_recipe(
                user_id=user_id,
                title=data['title'],
                description=data['description'],
                instructions=data['instructions'],
                prep_time=data.get('preparationTimeMinutes'),
                cook_time=data.get('cookingTimeMinutes'),
                servings=data.get('servings'),
                image_url=data.get('imageURL'),
                ingredients_data=ingredients_for_dao,
                is_public=is_public,
                nutrition_info=nutrition_info
            )
            db.session.commit()
            return new_recipe.to_dict(), None, 201
        except Exception as e:
            db.session.rollback()
            print(f"Error creating recipe: {e}")
            return None, {"error": "Failed to create recipe due to server error"}, 500

    def create_recipe_from_text(self, user_id, recipe_text_input):
        """
        Creates a new recipe from raw text input using NLP parsing.
        """
        if not recipe_text_input or not isinstance(recipe_text_input, str) or not recipe_text_input.strip():
            return None, {"error": "Recipe text input cannot be empty"}, 400

        try:
            # Parse the recipe text using Gemini NLP
            parsed_recipe = self.gemini_nlp.parse_recipe(recipe_text_input)
            
            if "error" in parsed_recipe:
                return None, {"error": f"Failed to parse recipe text: {parsed_recipe['error']}"}, 400

            # Extract nutritional information
            nutrition_info = self.gemini_nlp.extract_recipe_nutrition(parsed_recipe)

            # Convert parsed recipe to the format expected by create_recipe
            recipe_data = {
                'title': parsed_recipe.get('Title', 'Untitled Recipe'),
                'description': parsed_recipe.get('Description', ''),
                'instructions': parsed_recipe.get('Instructions', ''),
                'preparationTimeMinutes': parsed_recipe.get('PreparationTimeMinutes'),
                'cookingTimeMinutes': parsed_recipe.get('CookingTimeMinutes'),
                'servings': parsed_recipe.get('Servings'),
                'ingredients': []
            }

            # Convert ingredients to the expected format
            for ing in parsed_recipe.get('Ingredients', []):
                recipe_data['ingredients'].append({
                    'name': ing.get('Ingredient', ''),
                    'quantity': ing.get('Quantity', '1'),
                    'unit': ing.get('Unit', 'unit')
                })

            # Create the recipe using the existing method
            return self.create_recipe(user_id, recipe_data)

        except Exception as e:
            print(f"Error creating recipe from text: {e}")
            return None, {"error": "Failed to create recipe from text due to server error"}, 500

    def toggle_recipe_public_status(self, recipe_id, current_user_id):
        try:
            recipe = self.recipe_dao.get_recipe_by_id(recipe_id)
            if not recipe:
                return None, {"error": "Recipe not found"}, 404

            if int(recipe.UserID) != int(current_user_id):

                return None, {"error": "Forbidden: You are not the owner of this recipe"}, 403

            new_is_public = not recipe.is_public
            updated_recipe = self.recipe_dao.update_recipe_public_status(recipe_id, new_is_public)

            if updated_recipe:
                db.session.commit()
                return updated_recipe.to_dict(), None, 200
            else:
                db.session.rollback()
                return None, {"error": "Failed to update recipe status"}, 500
        except Exception as e:
            db.session.rollback()
            print(f"Error in toggle_recipe_public_status: {e}")
            return None, {"error": "Server error toggling recipe public status"}, 500

    def get_personalized_recipes(self, user_id, page=1, limit=12):
        """
        Fetches paginated personalized recipes for a given user.
        """
        try:
            paginated_recipes = self.recipe_dao.get_personalized_recipes_for_user(user_id, page=page, limit=limit)
            
            recipes_data = [recipe.to_dict_summary() for recipe in paginated_recipes.items]
            
            return {
                "recipes": recipes_data,
                "pagination": {
                    "page": paginated_recipes.page,
                    "pages": paginated_recipes.pages,
                    "per_page": paginated_recipes.per_page,
                    "total": paginated_recipes.total,
                    "has_next": paginated_recipes.has_next,
                    "has_prev": paginated_recipes.has_prev
                }
            }, None, 200
        except Exception as e:
            print(f"Error getting personalized recipes: {e}")
            return None, {"error": "Failed to retrieve personalized recipes"}, 500
