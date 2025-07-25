from backend.dao.forum_dao import ForumDAO
from backend.utils.logging_utils import log_info, log_error
import re

class ForumService:
    def __init__(self):
        self.forum_dao = ForumDAO()

    def create_post(self, user_id, title, content):
        """Create a new forum post with recipe tag extraction"""
        try:
            # Validate input
            if not title or not title.strip():
                return None, {"error": "Title is required"}, 400
            if not content or not content.strip():
                return None, {"error": "Content is required"}, 400

            # Extract recipe tags from content (format: #RecipeName)
            recipe_tags = self._extract_recipe_tags(content)
            recipe_ids = []
            
            if recipe_tags:
                # Validate that tagged recipes exist and are public
                for tag in recipe_tags:
                    recipes = self.forum_dao.search_public_recipes(tag, limit=1)
                    if recipes:
                        recipe_ids.append(recipes[0].RecipeID)

            post = self.forum_dao.create_post(
                user_id=user_id,
                title=title.strip(),
                content=content.strip(),
                recipe_ids=recipe_ids
            )

            log_info(f"Forum post created by user {user_id}: {post.Id}", "ForumService")
            return post.to_dict(current_user_id=user_id), None, 201

        except Exception as e:
            log_error(f"Error creating forum post: {str(e)}", "ForumService")
            return None, {"error": "Failed to create post"}, 500

    def get_posts(self, page=1, per_page=10, sort_by='created_at', sort_order='desc', current_user_id=None):
        """Get paginated forum posts"""
        try:
            pagination = self.forum_dao.get_posts(
                page=page,
                per_page=per_page,
                sort_by=sort_by,
                sort_order=sort_order
            )

            posts = [post.to_dict_summary(current_user_id=current_user_id) for post in pagination.items]

            return {
                "posts": posts,
                "pagination": {
                    "page": pagination.page,
                    "per_page": pagination.per_page,
                    "total": pagination.total,
                    "pages": pagination.pages,
                    "has_next": pagination.has_next,
                    "has_prev": pagination.has_prev
                }
            }, None, 200

        except Exception as e:
            log_error(f"Error fetching forum posts: {str(e)}", "ForumService")
            return None, {"error": "Failed to fetch posts"}, 500

    def get_post_by_id(self, post_id, current_user_id=None, increment_views=True):
        """Get a specific forum post by ID"""
        try:
            post = self.forum_dao.get_post_by_id(post_id, increment_views=increment_views)
            if not post:
                return None, {"error": "Post not found"}, 404

            return post.to_dict(current_user_id=current_user_id), None, 200

        except Exception as e:
            log_error(f"Error fetching forum post {post_id}: {str(e)}", "ForumService")
            return None, {"error": "Failed to fetch post"}, 500

    def update_post(self, post_id, user_id, title=None, content=None):
        """Update a forum post"""
        try:
            recipe_ids = None
            if content:
                # Extract recipe tags from updated content
                recipe_tags = self._extract_recipe_tags(content)
                recipe_ids = []
                
                if recipe_tags:
                    for tag in recipe_tags:
                        recipes = self.forum_dao.search_public_recipes(tag, limit=1)
                        if recipes:
                            recipe_ids.append(recipes[0].RecipeID)

            post = self.forum_dao.update_post(
                post_id=post_id,
                user_id=user_id,
                title=title.strip() if title else None,
                content=content.strip() if content else None,
                recipe_ids=recipe_ids
            )

            if not post:
                return None, {"error": "Post not found or unauthorized"}, 404

            log_info(f"Forum post {post_id} updated by user {user_id}", "ForumService")
            return post.to_dict(current_user_id=user_id), None, 200

        except Exception as e:
            log_error(f"Error updating forum post {post_id}: {str(e)}", "ForumService")
            return None, {"error": "Failed to update post"}, 500

    def delete_post(self, post_id, user_id=None, is_admin=False):
        """Delete a forum post"""
        try:
            success = self.forum_dao.delete_post(post_id, user_id, is_admin)
            if not success:
                return None, {"error": "Post not found or unauthorized"}, 404

            log_info(f"Forum post {post_id} deleted by {'admin' if is_admin else f'user {user_id}'}", "ForumService")
            return {"message": "Post deleted successfully"}, None, 200

        except Exception as e:
            log_error(f"Error deleting forum post {post_id}: {str(e)}", "ForumService")
            return None, {"error": "Failed to delete post"}, 500

    def update_comment(self, comment_id, user_id, new_text):
        """Update a comment (by author only)"""
        try:
            if not new_text or not new_text.strip():
                return None, {"error": "Comment text is required"}, 400
            comment = self.forum_dao.update_comment(comment_id, user_id, new_text.strip())
            if not comment:
                return None, {"error": "Comment not found or unauthorized"}, 404
            return comment.to_dict(), None, 200
        except Exception as e:
            log_error(f"Error updating comment {comment_id}: {str(e)}", "ForumService")
            return None, {"error": "Failed to update comment"}, 500

    def get_user_comment_for_post(self, post_id, user_id):
        """Get a user's comment for a specific post (if any)"""
        try:
            comment = self.forum_dao.get_user_comment_for_post(post_id, user_id)
            return comment.to_dict() if comment else None
        except Exception as e:
            log_error(f"Error fetching user comment for post {post_id}: {str(e)}", "ForumService")
            return None

    def add_comment(self, post_id, user_id, comment_text):
        """Add a comment to a forum post, enforcing one comment per user per post"""
        try:
            if not comment_text or not comment_text.strip():
                return None, {"error": "Comment text is required"}, 400
            existing_comment = self.forum_dao.get_user_comment_for_post(post_id, user_id)
            if existing_comment:
                return None, {"error": "User has already commented on this post. Please edit your comment instead."}, 400
            comment = self.forum_dao.add_comment(
                post_id=post_id,
                user_id=user_id,
                comment_text=comment_text.strip()
            )
            log_info(f"Comment added to post {post_id} by user {user_id}", "ForumService")
            return comment.to_dict(), None, 201
        except Exception as e:
            log_error(f"Error adding comment to post {post_id}: {str(e)}", "ForumService")
            return None, {"error": "Failed to add comment"}, 500

    def get_comments_for_post(self, post_id, page=1, per_page=20):
        """Get paginated comments for a specific post"""
        try:
            pagination = self.forum_dao.get_comments_for_post(
                post_id=post_id,
                page=page,
                per_page=per_page
            )

            comments = [comment.to_dict() for comment in pagination.items]

            return {
                "comments": comments,
                "pagination": {
                    "page": pagination.page,
                    "per_page": pagination.per_page,
                    "total": pagination.total,
                    "pages": pagination.pages,
                    "has_next": pagination.has_next,
                    "has_prev": pagination.has_prev
                }
            }, None, 200

        except Exception as e:
            log_error(f"Error fetching comments for post {post_id}: {str(e)}", "ForumService")
            return None, {"error": "Failed to fetch comments"}, 500

    def delete_comment(self, comment_id, user_id=None, is_admin=False):
        """Delete a comment"""
        try:
            success = self.forum_dao.delete_comment(comment_id, user_id, is_admin)
            if not success:
                return None, {"error": "Comment not found or unauthorized"}, 404

            log_info(f"Comment {comment_id} deleted by {'admin' if is_admin else f'user {user_id}'}", "ForumService")
            return {"message": "Comment deleted successfully"}, None, 200

        except Exception as e:
            log_error(f"Error deleting comment {comment_id}: {str(e)}", "ForumService")
            return None, {"error": "Failed to delete comment"}, 500

    def toggle_like(self, post_id, user_id):
        """Toggle like status for a post"""
        try:
            post, liked = self.forum_dao.toggle_like(post_id, user_id)
            if post is None:
                return None, {"error": "Post not found"}, 404

            action = "liked" if liked else "unliked"
            log_info(f"Post {post_id} {action} by user {user_id}", "ForumService")
            
            return {
                "liked": liked,
                "likes_count": post.LikesCount,
                "message": f"Post {action} successfully"
            }, None, 200

        except Exception as e:
            log_error(f"Error toggling like for post {post_id}: {str(e)}", "ForumService")
            return None, {"error": "Failed to toggle like"}, 500

    def search_public_recipes(self, query, limit=10):
        """Search for public recipes for tagging"""
        try:
            if not query or len(query.strip()) < 2:
                return [], None, 200

            recipes = self.forum_dao.search_public_recipes(query.strip(), limit)
            recipe_data = [recipe.to_dict_summary() for recipe in recipes]

            return recipe_data, None, 200

        except Exception as e:
            log_error(f"Error searching recipes: {str(e)}", "ForumService")
            return None, {"error": "Failed to search recipes"}, 500

    def get_all_posts_for_admin(self, page=1, per_page=20, sort_by='Id', sort_order='desc'):
        """Get all forum posts for admin management"""
        try:
            pagination = self.forum_dao.get_all_posts_for_admin(page, per_page, sort_by, sort_order)
            posts = [post.to_dict() for post in pagination.items]

            return {
                "posts": posts,
                "pagination": {
                    "page": pagination.page,
                    "per_page": pagination.per_page,
                    "total": pagination.total,
                    "pages": pagination.pages,
                    "has_next": pagination.has_next,
                    "has_prev": pagination.has_prev
                }
            }, None, 200

        except Exception as e:
            log_error(f"Error fetching posts for admin: {str(e)}", "ForumService")
            return None, {"error": "Failed to fetch posts"}, 500

    def get_all_comments_for_admin(self, page=1, per_page=20, sort_by='Id', sort_order='desc'):
        """Get all forum comments for admin management"""
        try:
            pagination = self.forum_dao.get_all_comments_for_admin(page, per_page, sort_by, sort_order)
            comments = []
            
            for comment in pagination.items:
                comment_dict = comment.to_dict()
                comment_dict['PostTitle'] = comment.post.Title if comment.post else 'Unknown Post'
                comments.append(comment_dict)

            return {
                "comments": comments,
                "pagination": {
                    "page": pagination.page,
                    "per_page": pagination.per_page,
                    "total": pagination.total,
                    "pages": pagination.pages,
                    "has_next": pagination.has_next,
                    "has_prev": pagination.has_prev
                }
            }, None, 200

        except Exception as e:
            log_error(f"Error fetching comments for admin: {str(e)}", "ForumService")
            return None, {"error": "Failed to fetch comments"}, 500

    def _extract_recipe_tags(self, content):
        """Extract recipe tags from content using regex"""
        # Pattern to match #RecipeName (alphanumeric, spaces, hyphens, underscores)
        pattern = r'#([A-Za-z0-9\s\-_]+?)(?=\s|$|[^\w\s\-_])'
        matches = re.findall(pattern, content)
        return [match.strip() for match in matches if match.strip()]