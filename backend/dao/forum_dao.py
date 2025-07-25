from ..db import db
from ..models.forum_post import ForumPost
from ..models.forum_comment import ForumComment
from ..models.forum_like import ForumLike
from ..models.forum_post_tag import ForumPostTag
from ..models.recipe import Recipe
from sqlalchemy import desc, func
from sqlalchemy.orm import joinedload

class ForumDAO:
    def __init__(self):
        pass

    def create_post(self, user_id, title, content, recipe_ids=None):
        """Create a new forum post with optional recipe tags"""
        try:
            post = ForumPost(
                UserId=user_id,
                Title=title,
                Content=content
            )
            db.session.add(post)
            db.session.flush()  # Get the post ID
            
            # Add recipe tags if provided
            if recipe_ids:
                for recipe_id in recipe_ids:
                    tag = ForumPostTag(PostId=post.Id, RecipeId=recipe_id)
                    db.session.add(tag)
            
            db.session.commit()
            return post
        except Exception as e:
            db.session.rollback()
            raise e

    def get_posts(self, page=1, per_page=10, sort_by='created_at', sort_order='desc'):
        """Get paginated forum posts"""
        try:
            query = ForumPost.query.options(
                joinedload(ForumPost.user),
                joinedload(ForumPost.tags).joinedload(ForumPostTag.recipe),
                joinedload(ForumPost.comments),
                joinedload(ForumPost.likes)
            )
            
            # Apply sorting
            if sort_by == 'created_at':
                if sort_order == 'desc':
                    query = query.order_by(desc(ForumPost.CreatedAt))
                else:
                    query = query.order_by(ForumPost.CreatedAt)
            elif sort_by == 'likes':
                if sort_order == 'desc':
                    query = query.order_by(desc(ForumPost.LikesCount))
                else:
                    query = query.order_by(ForumPost.LikesCount)
            elif sort_by == 'views':
                if sort_order == 'desc':
                    query = query.order_by(desc(ForumPost.ViewsCount))
                else:
                    query = query.order_by(ForumPost.ViewsCount)
            
            return query.paginate(
                page=page,
                per_page=per_page,
                error_out=False
            )
        except Exception as e:
            raise e

    def get_post_by_id(self, post_id, increment_views=False):
        """Get a specific forum post by ID"""
        try:
            post = ForumPost.query.options(
                joinedload(ForumPost.user),
                joinedload(ForumPost.tags).joinedload(ForumPostTag.recipe),
                joinedload(ForumPost.comments).joinedload(ForumComment.user),
                joinedload(ForumPost.likes).joinedload(ForumLike.user)
            ).filter_by(Id=post_id).first()
            
            if post and increment_views:
                post.ViewsCount += 1
                db.session.commit()
                
            return post
        except Exception as e:
            raise e

    def update_post(self, post_id, user_id, title=None, content=None, recipe_ids=None):
        """Update a forum post (only by the author)"""
        try:
            post = ForumPost.query.filter_by(Id=post_id, UserId=user_id).first()
            if not post:
                return None
                
            if title:
                post.Title = title
            if content:
                post.Content = content
                
            # Update recipe tags if provided
            if recipe_ids is not None:
                # Remove existing tags
                ForumPostTag.query.filter_by(PostId=post_id).delete()
                # Add new tags
                for recipe_id in recipe_ids:
                    tag = ForumPostTag(PostId=post_id, RecipeId=recipe_id)
                    db.session.add(tag)
            
            db.session.commit()
            return post
        except Exception as e:
            db.session.rollback()
            raise e

    def delete_post(self, post_id, user_id=None, is_admin=False):
        """Delete a forum post (by author or admin)"""
        try:
            query = ForumPost.query.filter_by(Id=post_id)
            if not is_admin and user_id:
                query = query.filter_by(UserId=user_id)
                
            post = query.first()
            if not post:
                return False
                
            db.session.delete(post)
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            raise e

    def add_comment(self, post_id, user_id, comment_text):
        """Add a comment to a forum post"""
        try:
            comment = ForumComment(
                PostId=post_id,
                UserId=user_id,
                Comment=comment_text
            )
            db.session.add(comment)
            db.session.commit()
            return comment
        except Exception as e:
            db.session.rollback()
            raise e

    def get_comments_for_post(self, post_id, page=1, per_page=20):
        """Get paginated comments for a specific post"""
        try:
            return ForumComment.query.options(
                joinedload(ForumComment.user)
            ).filter_by(PostId=post_id).order_by(
                ForumComment.CreatedAt
            ).paginate(
                page=page,
                per_page=per_page,
                error_out=False
            )
        except Exception as e:
            raise e

    def delete_comment(self, comment_id, user_id=None, is_admin=False):
        """Delete a comment (by author or admin)"""
        try:
            query = ForumComment.query.filter_by(Id=comment_id)
            if not is_admin and user_id:
                query = query.filter_by(UserId=user_id)
                
            comment = query.first()
            if not comment:
                return False
                
            db.session.delete(comment)
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            raise e

    def toggle_like(self, post_id, user_id):
        """Toggle like status for a post"""
        try:
            existing_like = ForumLike.query.filter_by(
                PostId=post_id,
                UserId=user_id
            ).first()
            
            post = ForumPost.query.filter_by(Id=post_id).first()
            if not post:
                return None, False
            
            if existing_like:
                # Unlike
                db.session.delete(existing_like)
                post.LikesCount = max(0, post.LikesCount - 1)
                liked = False
            else:
                # Like
                like = ForumLike(PostId=post_id, UserId=user_id)
                db.session.add(like)
                post.LikesCount += 1
                liked = True
            
            db.session.commit()
            return post, liked
        except Exception as e:
            db.session.rollback()
            raise e

    def search_public_recipes(self, query, limit=10):
        """Search for public recipes for tagging"""
        try:
            return Recipe.query.filter(
                Recipe.is_public == True,
                Recipe.Title.contains(query)
            ).limit(limit).all()
        except Exception as e:
            raise e

    def get_all_posts_for_admin(self, page=1, per_page=20):
        """Get all forum posts for admin management"""
        try:
            return ForumPost.query.options(
                joinedload(ForumPost.user),
                joinedload(ForumPost.tags).joinedload(ForumPostTag.recipe)
            ).order_by(desc(ForumPost.CreatedAt)).paginate(
                page=page,
                per_page=per_page,
                error_out=False
            )
        except Exception as e:
            raise e

    def get_all_comments_for_admin(self, page=1, per_page=20):
        """Get all forum comments for admin management"""
        try:
            return ForumComment.query.options(
                joinedload(ForumComment.user),
                joinedload(ForumComment.post)
            ).order_by(desc(ForumComment.CreatedAt)).paginate(
                page=page,
                per_page=per_page,
                error_out=False
            )
        except Exception as e:
            raise e