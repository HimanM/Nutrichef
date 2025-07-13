from ..db import db
from ..models.recipe_tag import RecipeTag, RecipeTagAssignment
from ..models.recipe import Recipe
from sqlalchemy.orm import joinedload
from sqlalchemy import func, and_

class TagsDAO:
    def __init__(self):
        pass
    
    def get_all_tags(self, category=None):
        """Get all tags, optionally filtered by category"""
        query = RecipeTag.query
        
        if category:
            query = query.filter_by(TagCategory=category)
        
        return query.order_by(RecipeTag.TagCategory, RecipeTag.TagName).all()
    
    def get_tags_by_category(self):
        """Get all tags grouped by category"""
        tags = self.get_all_tags()
        grouped = {}
        
        for tag in tags:
            category = tag.TagCategory
            if category not in grouped:
                grouped[category] = []
            grouped[category].append(tag.to_dict())
        
        return grouped
    
    def get_tag_by_id(self, tag_id: int):
        """Get a specific tag by ID"""
        return RecipeTag.query.get(tag_id)
    
    def get_tag_by_name(self, tag_name: str):
        """Get a specific tag by name"""
        return RecipeTag.query.filter_by(TagName=tag_name).first()
    
    def create_tag(self, tag_name: str, category='general', color='#6B7280'):
        """Create a new tag"""
        try:
            # Check if tag already exists
            existing_tag = self.get_tag_by_name(tag_name)
            if existing_tag:
                return existing_tag, "Tag already exists"
            
            new_tag = RecipeTag(
                TagName=tag_name,
                TagCategory=category,
                TagColor=color
            )
            
            db.session.add(new_tag)
            db.session.commit()
            return new_tag, None
            
        except Exception as e:
            db.session.rollback()
            return None, str(e)
    
    def assign_tag_to_recipe(self, recipe_id: int, tag_id: int):
        """Assign a tag to a recipe"""
        try:
            # Check if assignment already exists
            existing = RecipeTagAssignment.query.filter_by(
                RecipeID=recipe_id,
                TagID=tag_id
            ).first()
            
            if existing:
                return False, "Tag is already assigned to this recipe"
            
            assignment = RecipeTagAssignment(
                RecipeID=recipe_id,
                TagID=tag_id
            )
            
            db.session.add(assignment)
            db.session.commit()
            return True, None
            
        except Exception as e:
            db.session.rollback()
            return False, str(e)
    
    def remove_tag_from_recipe(self, recipe_id: int, tag_id: int):
        """Remove a tag from a recipe"""
        try:
            assignment = RecipeTagAssignment.query.filter_by(
                RecipeID=recipe_id,
                TagID=tag_id
            ).first()
            
            if not assignment:
                return False, "Tag is not assigned to this recipe"
            
            db.session.delete(assignment)
            db.session.commit()
            return True, None
            
        except Exception as e:
            db.session.rollback()
            return False, str(e)
    
    def assign_multiple_tags_to_recipe(self, recipe_id: int, tag_ids: list):
        """Assign multiple tags to a recipe"""
        try:
            success_count = 0
            errors = []
            
            for tag_id in tag_ids:
                success, error = self.assign_tag_to_recipe(recipe_id, tag_id)
                if success:
                    success_count += 1
                elif error and "already assigned" not in error:
                    errors.append(f"Tag {tag_id}: {error}")
            
            return success_count, errors
            
        except Exception as e:
            return 0, [str(e)]
    
    def get_recipe_tags(self, recipe_id: int):
        """Get all tags assigned to a recipe"""
        assignments = RecipeTagAssignment.query.filter_by(
            RecipeID=recipe_id
        ).options(joinedload(RecipeTagAssignment.tag)).all()
        
        return [assignment.tag for assignment in assignments if assignment.tag]
    
    def get_recipes_by_tag(self, tag_id: int, page=1, limit=12):
        """Get paginated recipes that have a specific tag"""
        try:
            query = db.session.query(Recipe).join(
                RecipeTagAssignment,
                Recipe.RecipeID == RecipeTagAssignment.RecipeID
            ).filter(
                RecipeTagAssignment.TagID == tag_id,
                Recipe.is_public == True  # Only public recipes
            ).options(
                joinedload(Recipe.author),
                joinedload(Recipe.tag_assignments).joinedload('tag')
            ).order_by(Recipe.CreatedAt.desc())
            
            return query.paginate(page=page, per_page=limit, error_out=False)
            
        except Exception as e:
            print(f"Error in get_recipes_by_tag: {e}")
            return Recipe.query.filter_by(RecipeID=-1).paginate(
                page=page, per_page=limit, error_out=False
            )
    
    def get_recipes_by_multiple_tags(self, tag_ids: list, page=1, limit=12, match_all=False):
        """Get recipes that have specific tags"""
        try:
            if not tag_ids:
                return Recipe.query.filter_by(RecipeID=-1).paginate(
                    page=page, per_page=limit, error_out=False
                )
            
            if match_all:
                # Recipes must have ALL specified tags
                query = db.session.query(Recipe).join(
                    RecipeTagAssignment,
                    Recipe.RecipeID == RecipeTagAssignment.RecipeID
                ).filter(
                    RecipeTagAssignment.TagID.in_(tag_ids),
                    Recipe.is_public == True
                ).group_by(Recipe.RecipeID).having(
                    func.count(RecipeTagAssignment.TagID) == len(tag_ids)
                )
            else:
                # Recipes must have ANY of the specified tags
                query = db.session.query(Recipe).join(
                    RecipeTagAssignment,
                    Recipe.RecipeID == RecipeTagAssignment.RecipeID
                ).filter(
                    RecipeTagAssignment.TagID.in_(tag_ids),
                    Recipe.is_public == True
                ).distinct()
            
            query = query.options(
                joinedload(Recipe.author),
                joinedload(Recipe.tag_assignments).joinedload(RecipeTagAssignment.tag)
            ).order_by(Recipe.CreatedAt.desc())
            
            return query.paginate(page=page, per_page=limit, error_out=False)
            
        except Exception as e:
            print(f"Error in get_recipes_by_multiple_tags: {e}")
            return Recipe.query.filter_by(RecipeID=-1).paginate(
                page=page, per_page=limit, error_out=False
            )
    
    def get_popular_tags(self, limit=20):
        """Get most used tags"""
        try:
            tag_counts = db.session.query(
                RecipeTag.TagID,
                RecipeTag.TagName,
                RecipeTag.TagCategory,
                RecipeTag.TagColor,
                func.count(RecipeTagAssignment.AssignmentID).label('usage_count')
            ).join(
                RecipeTagAssignment,
                RecipeTag.TagID == RecipeTagAssignment.TagID
            ).group_by(
                RecipeTag.TagID
            ).order_by(
                func.count(RecipeTagAssignment.AssignmentID).desc()
            ).limit(limit).all()
            
            return [{
                'TagID': tag.TagID,
                'TagName': tag.TagName,
                'TagCategory': tag.TagCategory,
                'TagColor': tag.TagColor,
                'usage_count': tag.usage_count
            } for tag in tag_counts]
            
        except Exception as e:
            print(f"Error in get_popular_tags: {e}")
            return []
    
    def replace_recipe_tags(self, recipe_id: int, tag_ids: list):
        """Replace all tags for a recipe with new ones"""
        try:
            # Remove all existing tags for this recipe
            RecipeTagAssignment.query.filter_by(RecipeID=recipe_id).delete()
            
            # Add new tags
            success_count = 0
            for tag_id in tag_ids:
                assignment = RecipeTagAssignment(
                    RecipeID=recipe_id,
                    TagID=tag_id
                )
                db.session.add(assignment)
                success_count += 1
            
            db.session.commit()
            return success_count, None
            
        except Exception as e:
            db.session.rollback()
            return 0, str(e)
