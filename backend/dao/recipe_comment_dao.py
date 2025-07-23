from backend.models import RecipeComment, User
from backend.db import db
from sqlalchemy.orm import joinedload
from sqlalchemy import desc

class RecipeCommentDAO:
    
    def get_comments_for_recipe(self, recipe_id, current_user_id=None):
        """Get all comments for a specific recipe"""
        try:
            comments = RecipeComment.query.options(
                joinedload(RecipeComment.user)
            ).filter(
                RecipeComment.RecipeID == recipe_id
            ).order_by(desc(RecipeComment.CreatedAt)).all()
            
            # Convert to dict and mark ownership
            comment_dicts = []
            for comment in comments:
                comment_dict = comment.to_dict()
                if current_user_id:
                    # Convert both to int for comparison (JWT returns string, DB stores int)
                    comment_dict['IsOwn'] = int(comment.UserID) == int(current_user_id)
                else:
                    comment_dict['IsOwn'] = False
                comment_dicts.append(comment_dict)
            
            return comment_dicts
        except Exception as e:
            print(f"Error fetching comments for recipe {recipe_id}: {e}")
            return []
    
    def get_comment_by_user_and_recipe(self, user_id, recipe_id):
        """Get a user's comment for a specific recipe (since only 1 comment per user per recipe)"""
        try:
            return RecipeComment.query.filter(
                RecipeComment.UserID == user_id,
                RecipeComment.RecipeID == recipe_id
            ).first()
        except Exception as e:
            print(f"Error fetching comment for user {user_id} and recipe {recipe_id}: {e}")
            return None
    
    def create_comment(self, user_id, recipe_id, comment_text):
        """Create a new comment for a recipe"""
        try:
            # Check if user already has a comment for this recipe
            existing_comment = self.get_comment_by_user_and_recipe(user_id, recipe_id)
            if existing_comment:
                return None, "You have already commented on this recipe. You can edit your existing comment."
            
            new_comment = RecipeComment(
                UserID=user_id,
                RecipeID=recipe_id,
                Comment=comment_text.strip()
            )
            
            db.session.add(new_comment)
            db.session.flush()  # Get the ID without committing
            
            # Load the user relationship before committing
            db.session.refresh(new_comment)
            new_comment_with_user = RecipeComment.query.options(
                joinedload(RecipeComment.user)
            ).get(new_comment.CommentID)
            
            db.session.commit()
            return new_comment_with_user, None
            
        except Exception as e:
            db.session.rollback()
            print(f"Error creating comment: {e}")
            return None, f"Failed to create comment: {str(e)}"
    
    def update_comment(self, comment_id, user_id, new_comment_text):
        """Update an existing comment (only by the comment owner)"""
        try:
            comment = RecipeComment.query.filter(
                RecipeComment.CommentID == comment_id,
                RecipeComment.UserID == user_id
            ).first()
            
            if not comment:
                return None, "Comment not found or you don't have permission to edit it."
            
            comment.Comment = new_comment_text.strip()
            comment.IsEdited = True
            
            db.session.commit()
            
            # Return updated comment with user data
            updated_comment = RecipeComment.query.options(
                joinedload(RecipeComment.user)
            ).get(comment_id)
            
            return updated_comment, None
            
        except Exception as e:
            db.session.rollback()
            print(f"Error updating comment {comment_id}: {e}")
            return None, f"Failed to update comment: {str(e)}"
    
    def delete_comment(self, comment_id, user_id):
        """Delete a comment (only by the comment owner)"""
        try:
            comment = RecipeComment.query.filter(
                RecipeComment.CommentID == comment_id,
                RecipeComment.UserID == user_id
            ).first()
            
            if not comment:
                return False, "Comment not found or you don't have permission to delete it."
            
            db.session.delete(comment)
            db.session.commit()
            return True, None
            
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting comment {comment_id}: {e}")
            return False, f"Failed to delete comment: {str(e)}"
    
    def admin_delete_comment(self, comment_id):
        """Admin delete comment (no ownership check)"""
        try:
            comment = RecipeComment.query.get(comment_id)
            if not comment:
                return False, "Comment not found."
            
            db.session.delete(comment)
            db.session.commit()
            return True, None
            
        except Exception as e:
            db.session.rollback()
            print(f"Error admin deleting comment {comment_id}: {e}")
            return False, f"Failed to delete comment: {str(e)}"
    
    def get_all_comments_for_admin(self, page=1, limit=20):
        """Get all comments for admin management with pagination"""
        try:
            offset = (page - 1) * limit
            
            comments_query = RecipeComment.query.options(
                joinedload(RecipeComment.user),
                joinedload(RecipeComment.recipe)
            )
            
            total_count = comments_query.count()
            comments = comments_query.order_by(desc(RecipeComment.CreatedAt)).offset(offset).limit(limit).all()
            
            comment_dicts = []
            for comment in comments:
                comment_dict = comment.to_dict(include_sensitive=True)
                comment_dict['RecipeTitle'] = comment.recipe.Title if comment.recipe else "Unknown Recipe"
                comment_dict['Username'] = comment.user.Name if comment.user else "Unknown User"
                comment_dicts.append(comment_dict)
            
            return {
                'comments': comment_dicts,
                'pagination': {
                    'total': total_count,
                    'page': page,
                    'pages': (total_count + limit - 1) // limit,
                    'per_page': limit
                }
            }, None
            
        except Exception as e:
            print(f"Error fetching comments for admin: {e}")
            return None, f"Failed to fetch comments: {str(e)}"
