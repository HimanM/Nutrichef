from backend.dao.tags_dao import TagsDAO
from backend.dao.recipe_dao import RecipeDAO

class TagsService:
    def __init__(self):
        self.tags_dao = TagsDAO()
        self.recipe_dao = RecipeDAO()
    
    def get_all_tags(self, category=None):
        """Get all tags, optionally filtered by category"""
        try:
            tags = self.tags_dao.get_all_tags(category)
            return [tag.to_dict() for tag in tags], None, 200
        except Exception as e:
            print(f"Error getting all tags: {e}")
            return [], {"error": "Failed to retrieve tags"}, 500
    
    def get_tags_by_category(self):
        """Get all tags grouped by category"""
        try:
            grouped_tags = self.tags_dao.get_tags_by_category()
            return grouped_tags, None, 200
        except Exception as e:
            print(f"Error getting tags by category: {e}")
            return {}, {"error": "Failed to retrieve tags"}, 500
    
    def get_tag_by_id(self, tag_id: int):
        """Get a specific tag by ID"""
        try:
            tag = self.tags_dao.get_tag_by_id(tag_id)
            if not tag:
                return None, {"error": "Tag not found"}, 404
            return tag.to_dict(), None, 200
        except Exception as e:
            print(f"Error getting tag by ID: {e}")
            return None, {"error": "Failed to retrieve tag"}, 500
    
    def create_tag(self, tag_name: str, category='general', color='#6B7280'):
        """Create a new tag"""
        try:
            # Validate input
            if not tag_name or not tag_name.strip():
                return None, {"error": "Tag name is required"}, 400
            
            tag_name = tag_name.strip()
            
            # Validate category
            valid_categories = ['cuisine', 'diet', 'course', 'difficulty', 'general']
            if category not in valid_categories:
                return None, {"error": f"Invalid category. Must be one of: {', '.join(valid_categories)}"}, 400
            
            tag, error = self.tags_dao.create_tag(tag_name, category, color)
            
            if error:
                return None, {"error": error}, 400
            
            return tag.to_dict(), None, 201
            
        except Exception as e:
            print(f"Error creating tag: {e}")
            return None, {"error": "Failed to create tag"}, 500
    
    def assign_tag_to_recipe(self, recipe_id: int, tag_id: int):
        """Assign a tag to a recipe"""
        try:
            # Check if recipe exists
            recipe = self.recipe_dao.get_recipe_by_id(recipe_id)
            if not recipe:
                return False, {"error": "Recipe not found"}, 404
            
            # Check if tag exists
            tag = self.tags_dao.get_tag_by_id(tag_id)
            if not tag:
                return False, {"error": "Tag not found"}, 404
            
            success, error = self.tags_dao.assign_tag_to_recipe(recipe_id, tag_id)
            
            if error:
                return False, {"error": error}, 400
            
            return True, None, 200
            
        except Exception as e:
            print(f"Error assigning tag to recipe: {e}")
            return False, {"error": "Failed to assign tag"}, 500
    
    def remove_tag_from_recipe(self, recipe_id: int, tag_id: int):
        """Remove a tag from a recipe"""
        try:
            success, error = self.tags_dao.remove_tag_from_recipe(recipe_id, tag_id)
            
            if error:
                return False, {"error": error}, 400
            
            return True, None, 200
            
        except Exception as e:
            print(f"Error removing tag from recipe: {e}")
            return False, {"error": "Failed to remove tag"}, 500
    
    def assign_multiple_tags_to_recipe(self, recipe_id: int, tag_ids: list):
        """Assign multiple tags to a recipe"""
        try:
            # Check if recipe exists
            recipe = self.recipe_dao.get_recipe_by_id(recipe_id)
            if not recipe:
                return None, {"error": "Recipe not found"}, 404
            
            # Validate tag IDs
            if not tag_ids or not isinstance(tag_ids, list):
                return None, {"error": "Tag IDs must be provided as a list"}, 400
            
            success_count, errors = self.tags_dao.assign_multiple_tags_to_recipe(recipe_id, tag_ids)
            
            result = {
                "assigned_count": success_count,
                "total_requested": len(tag_ids)
            }
            
            if errors:
                result["errors"] = errors
            
            return result, None, 200
            
        except Exception as e:
            print(f"Error assigning multiple tags: {e}")
            return None, {"error": "Failed to assign tags"}, 500
    
    def get_recipe_tags(self, recipe_id: int):
        """Get all tags assigned to a recipe"""
        try:
            tags = self.tags_dao.get_recipe_tags(recipe_id)
            return [tag.to_dict() for tag in tags], None, 200
        except Exception as e:
            print(f"Error getting recipe tags: {e}")
            return [], {"error": "Failed to retrieve recipe tags"}, 500
    
    def get_recipes_by_tag(self, tag_id: int, page=1, limit=12):
        """Get paginated recipes that have a specific tag"""
        try:
            # Check if tag exists
            tag = self.tags_dao.get_tag_by_id(tag_id)
            if not tag:
                return None, {"error": "Tag not found"}, 404
            
            paginated_recipes = self.tags_dao.get_recipes_by_tag(tag_id, page, limit)
            
            # Enhance recipes with additional data
            for recipe in paginated_recipes.items:
                avg_rating = self.recipe_dao.get_average_rating_for_recipe(recipe.RecipeID)
                recipe.average_rating = avg_rating
            
            recipes_data = [recipe.to_dict_summary() for recipe in paginated_recipes.items]
            
            return {
                "recipes": recipes_data,
                "tag": tag.to_dict(),
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
            print(f"Error getting recipes by tag: {e}")
            return None, {"error": "Failed to retrieve recipes"}, 500
    
    def get_recipes_by_multiple_tags(self, tag_ids: list, page=1, limit=12, match_all=False):
        """Get recipes that have specific tags"""
        try:
            if not tag_ids:
                return None, {"error": "At least one tag ID is required"}, 400
            
            paginated_recipes = self.tags_dao.get_recipes_by_multiple_tags(
                tag_ids, page, limit, match_all
            )
            
            # Enhance recipes with additional data
            for recipe in paginated_recipes.items:
                avg_rating = self.recipe_dao.get_average_rating_for_recipe(recipe.RecipeID)
                recipe.average_rating = avg_rating
            
            recipes_data = [recipe.to_dict_summary() for recipe in paginated_recipes.items]
            
            return {
                "recipes": recipes_data,
                "filter_tags": tag_ids,
                "match_all": match_all,
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
            print(f"Error getting recipes by multiple tags: {e}")
            return None, {"error": "Failed to retrieve recipes"}, 500
    
    def get_popular_tags(self, limit=20):
        """Get most used tags"""
        try:
            popular_tags = self.tags_dao.get_popular_tags(limit)
            return popular_tags, None, 200
        except Exception as e:
            print(f"Error getting popular tags: {e}")
            return [], {"error": "Failed to retrieve popular tags"}, 500
    
    def replace_recipe_tags(self, recipe_id: int, tag_ids: list):
        """Replace all tags for a recipe with new ones"""
        try:
            # Check if recipe exists
            recipe = self.recipe_dao.get_recipe_by_id(recipe_id)
            if not recipe:
                return None, {"error": "Recipe not found"}, 404
            
            # Validate tag IDs exist
            for tag_id in tag_ids:
                tag = self.tags_dao.get_tag_by_id(tag_id)
                if not tag:
                    return None, {"error": f"Tag with ID {tag_id} not found"}, 404
            
            success_count, error = self.tags_dao.replace_recipe_tags(recipe_id, tag_ids)
            
            if error:
                return None, {"error": error}, 500
            
            return {
                "assigned_count": success_count,
                "message": "Recipe tags updated successfully"
            }, None, 200
            
        except Exception as e:
            print(f"Error replacing recipe tags: {e}")
            return None, {"error": "Failed to update recipe tags"}, 500
