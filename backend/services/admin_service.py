from ..dao import UserDAO, RecipeDAO, ClassificationResultDAO
from ..db import db # For db.session.commit() and db.session.rollback()

class AdminService:
    def __init__(self):
        self.user_dao = UserDAO()
        self.recipe_dao = RecipeDAO()
        self.classification_result_dao = ClassificationResultDAO()

    def list_users(self, page=1, per_page=10):
        """Lists all users with pagination."""
        try:
            paginated_users = self.user_dao.get_all_users(page=page, per_page=per_page)
            return {
                "users": [user.to_dict() for user in paginated_users.items],
                "total": paginated_users.total,
                "pages": paginated_users.pages,
                "current_page": paginated_users.page
            }, None, 200
        except Exception as e:
            print(f"AdminService - Error listing users: {e}")
            return None, {"error": "Failed to retrieve users"}, 500

    def get_user_details(self, user_id):
        """Gets detailed information for a specific user."""
        user = self.user_dao.get_user_by_id(user_id)
        if not user:
            return None, {"error": "User not found"}, 404
        return user.to_dict(), None, 200

    def update_user_role(self, user_id, new_role):
        """Updates the role of a specific user."""
        user = self.user_dao.get_user_by_id(user_id)
        if not user:
            return None, {"error": "User not found"}, 404

        allowed_roles = ['user', 'admin']
        if new_role not in allowed_roles:
            return None, {"error": f"Invalid role. Allowed roles are: {', '.join(allowed_roles)}"}, 400

        try:
            user.role = new_role
            db.session.add(user)
            db.session.commit()
            return user.to_dict(), None, 200
        except Exception as e:
            db.session.rollback()
            print(f"AdminService - Error updating user role: {e}")
            return None, {"error": "Failed to update user role"}, 500

    def delete_user(self, user_id):
        """Deletes a user. (Hard delete for now)."""
        user = self.user_dao.get_user_by_id(user_id)
        if not user:
            return None, {"error": "User not found"}, 404

        try:
            db.session.delete(user)
            db.session.commit()
            return {"message": "User deleted successfully"}, None, 200
        except Exception as e:
            db.session.rollback()
            print(f"AdminService - Error deleting user: {e}")
            return None, {"error": "Failed to delete user. They might be associated with other data."}, 500

    def list_all_recipes(self, page=1, per_page=10, sort_by=None, sort_order='asc'):
        """Lists all recipes with pagination for admin purposes."""
        try:
            paginated_recipes = self.recipe_dao.get_all_recipes(
                page=page,
                limit=per_page,
                is_admin=True,
                sort_by=sort_by,
                sort_order=sort_order
            )
            return {
                "recipes": [recipe.to_dict() for recipe in paginated_recipes.items],
                "total": paginated_recipes.total,
                "pages": paginated_recipes.pages,
                "current_page": paginated_recipes.page
            }, None, 200
        except Exception as e:
            print(f"AdminService - Error listing all recipes: {e}")
            return None, {"error": "Failed to retrieve all recipes"}, 500

    def delete_recipe(self, recipe_id):
        """Deletes a specific recipe by its ID. (Hard delete for now)."""
        recipe = self.recipe_dao.get_recipe_by_id(recipe_id)
        if not recipe:
            return None, {"error": "Recipe not found"}, 404

        try:
            db.session.delete(recipe)
            db.session.commit()
            return {"message": "Recipe deleted successfully"}, None, 200
        except Exception as e:
            db.session.rollback()
            print(f"AdminService - Error deleting recipe: {e}")
            return None, {"error": "Failed to delete recipe"}, 500

    def get_classification_scores_summary(self, page=1, per_page=20):
        """Gets a paginated summary of classification scores."""
        try:
            data = self.classification_result_dao.get_all_classification_scores_summary(page=page, per_page=per_page)
            return data, None, 200
        except Exception as e:
            print(f"AdminService - Error getting classification scores summary: {e}")
            return None, {"error": "Failed to retrieve classification scores summary"}, 500
