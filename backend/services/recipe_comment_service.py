from backend.dao.recipe_comment_dao import RecipeCommentDAO
from backend.dao.recipe_dao import RecipeDAO

class RecipeCommentService:
    
    def __init__(self):
        self.comment_dao = RecipeCommentDAO()
        self.recipe_dao = RecipeDAO()
    
    def get_comments_for_recipe(self, recipe_id, current_user_id=None):
        """Get all comments for a recipe"""
        try:
            # First check if recipe exists
            recipe = self.recipe_dao.get_recipe_by_id(recipe_id)
            if not recipe:
                return None, {"error": "Recipe not found"}, 404
            
            comments = self.comment_dao.get_comments_for_recipe(recipe_id, current_user_id)
            return {"comments": comments}, None, 200
            
        except Exception as e:
            print(f"Error in get_comments_for_recipe: {e}")
            return None, {"error": "Failed to fetch comments"}, 500
    
    def create_comment(self, user_id, recipe_id, comment_text):
        """Create a new comment for a recipe"""
        try:
            # Validate input
            if not comment_text or not comment_text.strip():
                return None, {"error": "Comment text is required"}, 400
            
            comment_text = comment_text.strip()
            if len(comment_text) > 1000:  # Set reasonable limit
                return None, {"error": "Comment is too long (max 1000 characters)"}, 400
            
            if len(comment_text) < 3:
                return None, {"error": "Comment is too short (min 3 characters)"}, 400
            
            # Check if recipe exists
            recipe = self.recipe_dao.get_recipe_by_id(recipe_id)
            if not recipe:
                return None, {"error": "Recipe not found"}, 404
            
            comment, error = self.comment_dao.create_comment(user_id, recipe_id, comment_text)
            if error:
                return None, {"error": error}, 400
            
            # Return the comment with ownership flag
            comment_dict = comment.to_dict()
            comment_dict['IsOwn'] = True  # User just created it
            
            return {"comment": comment_dict}, None, 201
            
        except Exception as e:
            print(f"Error in create_comment: {e}")
            return None, {"error": "Failed to create comment"}, 500
    
    def update_comment(self, comment_id, user_id, comment_text):
        """Update an existing comment"""
        try:
            # Validate input
            if not comment_text or not comment_text.strip():
                return None, {"error": "Comment text is required"}, 400
            
            comment_text = comment_text.strip()
            if len(comment_text) > 1000:
                return None, {"error": "Comment is too long (max 1000 characters)"}, 400
                
            if len(comment_text) < 3:
                return None, {"error": "Comment is too short (min 3 characters)"}, 400
            
            comment, error = self.comment_dao.update_comment(comment_id, user_id, comment_text)
            if error:
                return None, {"error": error}, 404
            
            # Return the updated comment with ownership flag
            comment_dict = comment.to_dict()
            comment_dict['IsOwn'] = True  # User owns this comment
            
            return {"comment": comment_dict}, None, 200
            
        except Exception as e:
            print(f"Error in update_comment: {e}")
            return None, {"error": "Failed to update comment"}, 500
    
    def delete_comment(self, comment_id, user_id):
        """Delete a comment"""
        try:
            success, error = self.comment_dao.delete_comment(comment_id, user_id)
            if error:
                return None, {"error": error}, 404
            
            return {"message": "Comment deleted successfully"}, None, 200
            
        except Exception as e:
            print(f"Error in delete_comment: {e}")
            return None, {"error": "Failed to delete comment"}, 500
    
    def admin_delete_comment(self, comment_id):
        """Admin delete comment (no ownership check)"""
        try:
            success, error = self.comment_dao.admin_delete_comment(comment_id)
            if error:
                return None, {"error": error}, 404
            
            return {"message": "Comment deleted successfully"}, None, 200
            
        except Exception as e:
            print(f"Error in admin_delete_comment: {e}")
            return None, {"error": "Failed to delete comment"}, 500
    
    def get_all_comments_for_admin(self, page=1, limit=20):
        """Get all comments for admin management"""
        try:
            result, error = self.comment_dao.get_all_comments_for_admin(page, limit)
            if error:
                return None, {"error": error}, 500
            
            return result, None, 200
            
        except Exception as e:
            print(f"Error in get_all_comments_for_admin: {e}")
            return None, {"error": "Failed to fetch comments"}, 500
