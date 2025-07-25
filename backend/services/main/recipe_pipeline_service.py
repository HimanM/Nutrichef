from backend.dao.recipe_dao import RecipeDAO
from backend.dao.ingredient_dao import IngredientDAO
from backend.ai_models.gemini_nlp.gemini_nlp_parser import GeminiNlpParser
from backend.ai_models.allergy_analyzer.allergy_analyzer import AllergyAnalyzer
from backend.services.main.tags_service import TagsService
from backend.db import db # For transaction management (db.session)
from backend.models.ingredient import Ingredient # For type checking if needed
from backend.models.recipe import Recipe # For type checking if needed
import json

class RecipePipelineService:
    def __init__(self):
        self.recipe_dao = RecipeDAO()
        self.ingredient_dao = IngredientDAO()
        self.allergy_analyzer = AllergyAnalyzer() # Uses sample CSV
        self.gemini_nlp = GeminiNlpParser()
        self.tags_service = TagsService()
        

    def process_recipe_submission(self, submission_data, user_id):
        """
        Processes a recipe submission, either raw text or structured JSON.
        1. Parses input to structured JSON if necessary.
        2. Enriches ingredients with allergy and nutritional info.
        3. Stores the recipe and related data in the database.

        :param submission_data: Can be a string (raw recipe text) or a dict (structured recipe).
        :param user_id: The ID of the user submitting the recipe.
        :return: A tuple (result_dict, error_dict, status_code).
                 result_dict is the created recipe's data on success.
                 error_dict contains an error message on failure.
        """
        if not submission_data:
            return None, {"error": "No submission data provided."}, 400

        try:
            if isinstance(submission_data, str):
                # Parse raw text using Gemini NLP
                parsed_text_data = self.gemini_nlp.parse_recipe(submission_data)
                
                if "error" in parsed_text_data:
                    return None, {"error": f"NLP parsing failed: {parsed_text_data['error']}"}, 400

                recipe_json = {
                    "Title": parsed_text_data.get('title'), 
                    "Description": parsed_text_data.get('description'), 
                    "Instructions": parsed_text_data.get('instructions', []),
                    "PreparationTimeMinutes": parsed_text_data.get('preparationTimeMinutes', 0),
                    "CookingTimeMinutes": parsed_text_data.get('cookingTimeMinutes', 0),
                    "Servings": parsed_text_data.get('servings', 0),
                    "Ingredients": [],
                    "is_public": parsed_text_data.get('is_public', False)
                }
                for ing_nlp in parsed_text_data.get('ingredients', []):
                    recipe_json["Ingredients"].append({
                        "Ingredient": ing_nlp.get('name'),
                        "Unit": ing_nlp.get('unit'),
                        "Quantity": ing_nlp.get('quantity')
                    })

                if not recipe_json["Ingredients"]:
                     return None, {"error": "NLP parsing did not yield any ingredients."}, 400
                if not recipe_json["Title"] or recipe_json["Title"] == "Parsed Recipe (Title from NLP)":
                     recipe_json["Title"] = "Untitled Parsed Recipe"


            elif isinstance(submission_data, dict):
                recipe_json = submission_data 
            else:
                return None, {"error": "Invalid submission_data type. Must be raw text or JSON dict."}, 400


            if not all(k in recipe_json for k in ["Title", "Instructions", "Ingredients"]):
                return None, {"error": "Missing required fields in recipe data (Title, Instructions, Ingredients)."}, 400

            # Extract nutritional information using Gemini NLP
            nutrition_info = self.gemini_nlp.extract_recipe_nutrition(recipe_json)

            enriched_ingredients_for_dao = []
            processed_ingredient_ids_for_current_recipe = [] 

            for ing_data in recipe_json["Ingredients"]:
                ingredient_name = ing_data.get("Ingredient")
                if not ingredient_name:
                    print(f"Warning: Ingredient data missing 'Ingredient' name: {ing_data}")
                    continue

                ingredient_model = self.ingredient_dao.get_or_create_ingredient(ingredient_name)
                db.session.flush() 

                tracking_key = ingredient_model.IngredientID if hasattr(ingredient_model, 'IngredientID') and ingredient_model.IngredientID is not None else ingredient_model.Name

                if tracking_key in processed_ingredient_ids_for_current_recipe:
                    print(f"Skipping duplicate ingredient: {ingredient_name} (tracking key: {tracking_key})")
                else:
                    processed_ingredient_ids_for_current_recipe.append(tracking_key)
                
                    allergy_names = self.allergy_analyzer.get_allergies(ingredient_name)
                    for allergy_name in allergy_names:
                        self.ingredient_dao.add_allergy_to_ingredient(ingredient_model, allergy_name)



                    quantity_val = ing_data.get("Quantity")
                    unit_val = ing_data.get("Unit")

                    if quantity_val is None:
                        quantity_val = "1" 
                    if unit_val is None:
                        unit_val = "Unit" 

                    enriched_ingredients_for_dao.append({
                        'ingredient_model': ingredient_model,
                        'quantity': quantity_val, 
                        'unit': unit_val
                    })

            if not enriched_ingredients_for_dao:
                 return None, {"error": "No valid ingredients processed."}, 400

            # Create the recipe with nutritional information
            new_recipe = self.recipe_dao.create_recipe(
                user_id=user_id,
                title=recipe_json["Title"],
                description=recipe_json.get("Description"),
                instructions="\n".join(recipe_json["Instructions"]) if isinstance(recipe_json["Instructions"], list) else recipe_json["Instructions"],
                prep_time=recipe_json.get("PreparationTimeMinutes"),
                cook_time=recipe_json.get("CookingTimeMinutes"),
                servings=recipe_json.get("Servings"),
                image_url=recipe_json.get("ImageURL"), 
                ingredients_data=enriched_ingredients_for_dao,
                is_public=recipe_json.get("is_public"),
                nutrition_info=nutrition_info
            )

            # Extract and assign tags to the recipe
            self._extract_and_assign_tags(new_recipe, recipe_json)

            db.session.commit()
            db.session.refresh(new_recipe)
            return new_recipe.to_dict(), None, 201

        except FileNotFoundError as e:
            db.session.rollback()
            print(f"Error in RecipePipelineService: {e}")
            return None, {"error": f"Server configuration error: {e}"}, 500
        except ValueError as e:
            db.session.rollback()
            print(f"ValueError in RecipePipelineService: {e}")
            return None, {"error": f"Invalid data: {e}"}, 400
        except Exception as e:
            db.session.rollback()
            print(f"Unexpected error in RecipePipelineService: {e}")
            return None, {"error": f"An unexpected error occurred while processing the recipe.{e}"}, 500

    def _extract_and_assign_tags(self, recipe, recipe_json):
        """
        Extract tags using Gemini NLP and assign them to the recipe.
        This is a helper method called after recipe creation.
        """
        try:
            # Prepare recipe data for tag extraction
            tag_extraction_data = {
                "Title": recipe_json.get("Title", ""),
                "Description": recipe_json.get("Description", ""),
                "Instructions": recipe_json.get("Instructions", ""),
                "PreparationTimeMinutes": recipe_json.get("PreparationTimeMinutes", 0),
                "CookingTimeMinutes": recipe_json.get("CookingTimeMinutes", 0),
                "Ingredients": recipe_json.get("Ingredients", [])
            }
            
            # Extract tags using Gemini NLP
            tag_response = self.gemini_nlp.extract_recipe_tags(tag_extraction_data)
            
            if tag_response.get('success') and tag_response.get('tags'):
                tag_names = tag_response['tags']
                tag_ids = []
                
                # Get or create tags and collect their IDs
                for tag_name in tag_names:
                    tag = self.tags_service.tags_dao.get_tag_by_name(tag_name)
                    if tag:
                        tag_ids.append(tag.TagID)
                    else:
                        print(f"Tag '{tag_name}' not found in database, skipping")
                
                # Assign tags to the recipe
                if tag_ids:
                    self.tags_service.assign_multiple_tags_to_recipe(recipe.RecipeID, tag_ids)
                    print(f"Successfully assigned {len(tag_ids)} tags to recipe '{recipe.Title}'")
                else:
                    print(f"No valid tags found for recipe '{recipe.Title}'")
            else:
                print(f"Failed to extract tags for recipe '{recipe.Title}': {tag_response.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"Error in tag extraction and assignment for recipe '{recipe.Title}': {e}")
            # Don't raise the exception as tag assignment is optional
