from backend.db import db # Import db for session management
from backend.dao import PantryDAO, RecipeDAO
# UserPantryIngredient model is not directly used here for instantiation by the service,
# but its instances are returned by the DAO and then converted to dicts.

class PantryService:
    def __init__(self):
        self.pantry_dao = PantryDAO()
        self.recipe_dao = RecipeDAO()

    def add_ingredient(self, user_id, ingredient_name, quantity, unit):
        try:
            pantry_item_model = self.pantry_dao.add_ingredient_to_pantry(user_id, ingredient_name, quantity, unit)

            if pantry_item_model:
                db.session.commit()
                return pantry_item_model.to_dict(include_relations=True)
            else:
                db.session.rollback()
                return None
        except Exception as e:
            db.session.rollback()
            print(f"Error in PantryService.add_ingredient: {e}")
            raise

    def add_ingredients_bulk(self, user_id, ingredients_data):
        successful_items = []
        failed_items = []
        processed_models_for_session = []

        for item_data in ingredients_data:
            ingredient_name = item_data.get('ingredient_name')
            quantity = item_data.get('quantity')
            unit = item_data.get('unit')

            if not ingredient_name or quantity is None:
                failed_items.append({
                    'item_provided': item_data,
                    'error': 'Missing required fields: ingredient_name and quantity must be provided.'
                })
                continue
            
            try:
                pantry_item_model = self.pantry_dao.add_ingredient_to_pantry(
                    user_id, 
                    ingredient_name, 
                    str(quantity),
                    unit
                )
                if pantry_item_model:
                    processed_models_for_session.append(pantry_item_model)
                else:
                    failed_items.append({
                        'item_provided': item_data,
                        'error': 'Failed to process ingredient via DAO, item model was not returned.'
                    })
            except Exception as e:
                failed_items.append({
                    'item_provided': item_data,
                    'error': f'An unexpected error occurred: {str(e)}'
                })

        if failed_items and not processed_models_for_session:
            db.session.rollback()
            message = 'All items failed to process. No changes were made to the pantry.'
        elif failed_items and processed_models_for_session:
            try:
                db.session.commit()
                successful_items = [model.to_dict(include_relations=True) for model in processed_models_for_session]
                message = f'{len(successful_items)} item(s) added successfully. {len(failed_items)} item(s) failed.'
            except Exception as e:
                db.session.rollback()
                failed_items.extend([{
                    'item_provided': model.to_dict(),
                    'error': f'Failed during final commit: {str(e)}'} for model in processed_models_for_session])
                successful_items = []
                message = 'An error occurred during final commit. All items failed to process.'

        elif processed_models_for_session:
            try:
                db.session.commit()
                successful_items = [model.to_dict(include_relations=True) for model in processed_models_for_session]
                message = f'All {len(successful_items)} item(s) added successfully.'
            except Exception as e:
                db.session.rollback()
                failed_items.extend([{
                    'item_provided': model.to_dict(),
                    'error': f'Failed during final commit: {str(e)}'} for model in processed_models_for_session])
                successful_items = []
                message = 'An error occurred during final commit. All items failed to process.'
        else:
            message = 'No items were processed. The pantry remains unchanged.'

        return {
            'successful_items': successful_items,
            'failed_items': failed_items,
            'message': message
        }

    def get_pantry(self, user_id):
        pantry_item_models = self.pantry_dao.get_pantry_by_user_id(user_id)
        return [item.to_dict(include_relations=True) for item in pantry_item_models]

    def update_ingredient(self, user_pantry_ingredient_id, quantity, unit):
        try:
            pantry_item_model = self.pantry_dao.update_pantry_ingredient(user_pantry_ingredient_id, quantity, unit)

            if pantry_item_model:
                db.session.commit()
                return pantry_item_model.to_dict(include_relations=True)
            else:
                return None
        except Exception as e:
            db.session.rollback()
            print(f"Error in PantryService.update_ingredient: {e}")
            raise

    def remove_ingredient(self, user_pantry_ingredient_id):
        try:
            success = self.pantry_dao.remove_ingredient_from_pantry(user_pantry_ingredient_id)

            if success:
                db.session.commit()
                return {"success": True, "message": "Ingredient removed successfully."}
            else:
                return {"success": False, "message": "Failed to remove ingredient or ingredient not found."}
        except Exception as e:
            db.session.rollback()
            print(f"Error in PantryService.remove_ingredient: {e}")
            raise

    def suggest_recipes(self, user_id, match_threshold=0.5, page=1, limit=12):
        pantry_item_models = self.pantry_dao.get_pantry_by_user_id(user_id)

        if not pantry_item_models:
            return {
                "recipes": [], 
                "total": 0,
                "pages": 0,
                "current_page": 1,
                "message": "Your pantry is empty. Add some ingredients to get recipe suggestions."
            }

        user_ingredient_ids = {item.IngredientID for item in pantry_item_models}
        all_recipes_models = self.recipe_dao.get_all_recipes_for_suggestions()

        suggested_recipes_list_all = []

        for recipe_model in all_recipes_models:
            recipe_ingredients_data = self.recipe_dao.get_ingredients_for_recipe(recipe_model.RecipeID)
            recipe_model.average_rating = self.recipe_dao.get_average_rating_for_recipe(recipe_model.RecipeID)

            if not recipe_ingredients_data:
                continue

            recipe_ingredient_ids = {ing.IngredientID for ing in recipe_ingredients_data}
            if not recipe_ingredient_ids:
                continue

            common_ingredients = user_ingredient_ids.intersection(recipe_ingredient_ids)
            match_percentage = len(common_ingredients) / len(recipe_ingredient_ids) if len(recipe_ingredient_ids) > 0 else 0

            if match_percentage >= match_threshold:
                recipe_dict = recipe_model.to_dict()
                recipe_dict['match_percentage'] = round(match_percentage * 100, 2)
                recipe_dict['available_ingredients_count'] = len(common_ingredients)
                recipe_dict['required_ingredients_count'] = len(recipe_ingredient_ids)
                suggested_recipes_list_all.append(recipe_dict)

        suggested_recipes_list_all.sort(key=lambda r: r['match_percentage'], reverse=True)
        
        total_matched_recipes = len(suggested_recipes_list_all)

        if total_matched_recipes == 0:
            return {
                "recipes": [], 
                "total": 0,
                "pages": 0,
                "current_page": page,
                "message": "No recipes found matching your pantry ingredients based on the current criteria."
            }

        start_index = (page - 1) * limit
        end_index = start_index + limit
        paginated_items = suggested_recipes_list_all[start_index:end_index]
        
        total_pages = (total_matched_recipes + limit - 1) // limit

        return {
            "recipes": paginated_items,
            "total": total_matched_recipes,
            "pages": total_pages,
            "current_page": page,
            "message": f"Found {total_matched_recipes} recipe(s) matching your pantry. Displaying page {page} of {total_pages}."
        }
