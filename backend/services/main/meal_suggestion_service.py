from backend.dao.recipe_dao import RecipeDAO
from backend.dao.user_dao import UserDAO
from backend.models import Recipe, UserAllergy, AllergyIntolerance
from backend.dao.ingredient_dao import IngredientDAO
from backend.db import db
import random
from typing import List, Dict, Any

class MealSuggestionService:
    def __init__(self):
        self.recipe_dao = RecipeDAO()
        self.user_dao = UserDAO()
        self.ingredient_dao = IngredientDAO()
    
    def suggest_meals_for_day(self, user_id: int, target_date: str, existing_meals: List[Dict] = None, exclude_allergies: bool = True) -> Dict[str, Any]:
        """
        Suggest meals for a specific day based on user's nutritional targets
        """
        try:
            # Get user's nutritional targets
            user = self.user_dao.get_user_by_id(user_id)
            if not user:
                return {"error": "User not found"}
            
            targets = {
                'calories': getattr(user, 'DailyCalories', None) or 2000,
                'protein': getattr(user, 'DailyProtein', None) or 50,
                'carbs': getattr(user, 'DailyCarbs', None) or 250,
                'fat': getattr(user, 'DailyFat', None) or 65,
                'fiber': getattr(user, 'DailyFiber', None) or 25,
                'sugar': getattr(user, 'DailySugar', None) or 50,
                'sodium': getattr(user, 'DailySodium', None) or 2300
            }
            
            # Calculate remaining nutritional needs
            remaining_targets = self._calculate_remaining_targets(targets, existing_meals or [])
            
            # Get all available recipes with nutrition info
            all_recipes = self.recipe_dao.get_all_recipes_with_nutrition()
            
            # Filter out recipes with user allergies if requested
            if exclude_allergies:
                all_recipes = self._filter_recipes_by_allergies(all_recipes, user_id)
            
            # Filter and score recipes based on nutritional fit
            suggested_meals = self._suggest_optimal_meals(all_recipes, remaining_targets)
            
            return {
                "success": True,
                "suggestions": suggested_meals,
                "remaining_targets": remaining_targets,
                "target_date": target_date
            }
            
        except Exception as e:
            print(f"Error in suggest_meals_for_day: {e}")
            return {"error": "Failed to generate meal suggestions"}
    
    def _calculate_remaining_targets(self, daily_targets: Dict, existing_meals: List[Dict]) -> Dict:
        """Calculate how much nutrition is still needed for the day"""
        consumed = {
            'calories': 0, 'protein': 0, 'carbs': 0, 'fat': 0,
            'fiber': 0, 'sugar': 0, 'sodium': 0
        }
        
        def safe_add_nutrition_value(current_value, nutrition_value):
            """Safely add nutrition value, handling string and numeric types"""
            try:
                if nutrition_value is None:
                    return current_value
                # Convert to float if it's a string
                if isinstance(nutrition_value, str):
                    nutrition_value = float(nutrition_value)
                return current_value + nutrition_value
            except (ValueError, TypeError):
                print(f"Warning: Could not convert nutrition value '{nutrition_value}' to number")
                return current_value
        
        # Sum up nutrition from existing meals
        for meal in existing_meals:
            try:
                if hasattr(meal, 'get') and meal.get('NutritionInfo') and meal['NutritionInfo'].get('nutrition'):
                    nutrition = meal['NutritionInfo']['nutrition']
                    consumed['calories'] = safe_add_nutrition_value(consumed['calories'], nutrition.get('calories', {}).get('amount', 0))
                    consumed['protein'] = safe_add_nutrition_value(consumed['protein'], nutrition.get('protein', {}).get('amount', 0))
                    consumed['carbs'] = safe_add_nutrition_value(consumed['carbs'], nutrition.get('carbs', {}).get('amount', 0))
                    consumed['fat'] = safe_add_nutrition_value(consumed['fat'], nutrition.get('fat', {}).get('amount', 0))
                    consumed['fiber'] = safe_add_nutrition_value(consumed['fiber'], nutrition.get('fiber', {}).get('amount', 0))
                    consumed['sugar'] = safe_add_nutrition_value(consumed['sugar'], nutrition.get('sugar', {}).get('amount', 0))
                    consumed['sodium'] = safe_add_nutrition_value(consumed['sodium'], nutrition.get('sodium', {}).get('amount', 0))
                elif hasattr(meal, 'NutritionInfoJSON') and meal.NutritionInfoJSON:
                    # Handle direct recipe objects
                    nutrition = meal.NutritionInfoJSON.get('nutrition', {})
                    consumed['calories'] = safe_add_nutrition_value(consumed['calories'], nutrition.get('calories', {}).get('amount', 0))
                    consumed['protein'] = safe_add_nutrition_value(consumed['protein'], nutrition.get('protein', {}).get('amount', 0))
                    consumed['carbs'] = safe_add_nutrition_value(consumed['carbs'], nutrition.get('carbs', {}).get('amount', 0))
                    consumed['fat'] = safe_add_nutrition_value(consumed['fat'], nutrition.get('fat', {}).get('amount', 0))
                    consumed['fiber'] = safe_add_nutrition_value(consumed['fiber'], nutrition.get('fiber', {}).get('amount', 0))
                    consumed['sugar'] = safe_add_nutrition_value(consumed['sugar'], nutrition.get('sugar', {}).get('amount', 0))
                    consumed['sodium'] = safe_add_nutrition_value(consumed['sodium'], nutrition.get('sodium', {}).get('amount', 0))
                # Handle cases where NutritionInfo might have different structure
                elif isinstance(meal, dict):
                    # Check for alternative nutrition structures
                    nutrition_info = meal.get('NutritionInfo', {})
                    if 'nutrition' in nutrition_info:
                        nutrition = nutrition_info['nutrition']
                        consumed['calories'] = safe_add_nutrition_value(consumed['calories'], nutrition.get('calories', {}).get('amount', 0))
                        consumed['protein'] = safe_add_nutrition_value(consumed['protein'], nutrition.get('protein', {}).get('amount', 0))
                        consumed['carbs'] = safe_add_nutrition_value(consumed['carbs'], nutrition.get('carbs', {}).get('amount', 0))
                        consumed['fat'] = safe_add_nutrition_value(consumed['fat'], nutrition.get('fat', {}).get('amount', 0))
                        consumed['fiber'] = safe_add_nutrition_value(consumed['fiber'], nutrition.get('fiber', {}).get('amount', 0))
                        consumed['sugar'] = safe_add_nutrition_value(consumed['sugar'], nutrition.get('sugar', {}).get('amount', 0))
                        consumed['sodium'] = safe_add_nutrition_value(consumed['sodium'], nutrition.get('sodium', {}).get('amount', 0))
            except Exception as e:
                print(f"Error processing meal nutrition data: {e}")
                continue
        
        # Calculate remaining needs
        remaining = {}
        for nutrient in consumed.keys():
            remaining[nutrient] = max(0, daily_targets[nutrient] - consumed[nutrient])
        
        return remaining
    
    def _suggest_optimal_meals(self, recipes: List, remaining_targets: Dict) -> List[Dict]:
        """Score and filter recipes based on how well they fit nutritional needs"""
        scored_recipes = []
        
        for recipe in recipes:
            if not recipe.NutritionInfoJSON:
                continue
                
            try:
                nutrition = recipe.NutritionInfoJSON.get('nutrition', {})
                score = self._calculate_nutrition_score(nutrition, remaining_targets)
                
                if score > 0.1:  # Only include recipes with decent nutritional fit
                    recipe_dict = recipe.to_dict()
                    recipe_dict['nutrition_score'] = score
                    recipe_dict['nutrition_fit'] = self._get_nutrition_fit_description(nutrition, remaining_targets)
                    scored_recipes.append(recipe_dict)
                    
            except Exception as e:
                print(f"Error processing recipe {recipe.RecipeID}: {e}")
                continue
        
        # Sort by nutrition score and return top suggestions
        scored_recipes.sort(key=lambda x: x['nutrition_score'], reverse=True)
        return scored_recipes[:12]  # Return top 12 suggestions
    
    def _calculate_nutrition_score(self, nutrition: Dict, targets: Dict) -> float:
        """Calculate how well a recipe fits the remaining nutritional targets"""
        score = 0.0
        total_weight = 0.0
        
        # Weight different nutrients by importance
        weights = {
            'calories': 0.3,
            'protein': 0.25,
            'carbs': 0.15,
            'fat': 0.15,
            'fiber': 0.1,
            'sugar': 0.05,  # Lower weight, prefer less sugar
            'sodium': 0.05  # Lower weight, prefer less sodium
        }
        
        def safe_get_nutrition_value(nutrition_data, nutrient_key):
            """Safely extract nutrition value, handling both string and numeric types"""
            try:
                value = nutrition_data.get(nutrient_key, {}).get('amount', 0)
                if isinstance(value, str):
                    return float(value)
                return float(value) if value is not None else 0
            except (ValueError, TypeError):
                return 0
        
        for nutrient, weight in weights.items():
            target_amount = targets.get(nutrient, 0)
            recipe_amount = safe_get_nutrition_value(nutrition, nutrient)
            
            if target_amount > 0:
                # Calculate how much of the target this recipe provides
                contribution_ratio = min(recipe_amount / target_amount, 1.0)
                
                # For sugar and sodium, prefer recipes with less
                if nutrient in ['sugar', 'sodium']:
                    nutrient_score = max(0, 1.0 - (recipe_amount / max(target_amount, 1)))
                else:
                    nutrient_score = contribution_ratio
                
                score += nutrient_score * weight
                total_weight += weight
        
        return score / total_weight if total_weight > 0 else 0.0
    
    def _get_nutrition_fit_description(self, nutrition: Dict, targets: Dict) -> str:
        """Generate a description of how the recipe fits nutritional needs"""
        fits = []
        
        def safe_get_nutrition_value(nutrition_data, nutrient_key):
            """Safely extract nutrition value, handling both string and numeric types"""
            try:
                value = nutrition_data.get(nutrient_key, {}).get('amount', 0)
                if isinstance(value, str):
                    return float(value)
                return float(value) if value is not None else 0
            except (ValueError, TypeError):
                return 0
        
        calories = safe_get_nutrition_value(nutrition, 'calories')
        protein = safe_get_nutrition_value(nutrition, 'protein')
        
        if calories > 0 and targets.get('calories', 0) > 0:
            cal_percent = (calories / targets['calories']) * 100
            if cal_percent >= 25:
                fits.append(f"Good calorie source ({int(cal_percent)}% of daily target)")
        
        if protein > 0 and targets.get('protein', 0) > 0:
            protein_percent = (protein / targets['protein']) * 100
            if protein_percent >= 20:
                fits.append(f"High protein ({int(protein_percent)}% of daily target)")
        
        return "; ".join(fits) if fits else "Balanced nutrition"
    
    def _filter_recipes_by_allergies(self, recipes: List, user_id: int) -> List:
        """Filter out recipes that contain ingredients the user is allergic to"""
        try:
            # Get user's allergies
            user_allergies = UserAllergy.query.filter_by(UserID=user_id).all()
            if not user_allergies:
                return recipes  # No allergies, return all recipes
            
            user_allergy_ids = [ua.AllergyID for ua in user_allergies]
            
            filtered_recipes = []
            for recipe in recipes:
                # Get all ingredients for this recipe
                recipe_ingredients = self.recipe_dao.get_ingredients_for_recipe(recipe.RecipeID)
                
                # Check if any ingredient has an allergy that matches user's allergies
                has_allergen = False
                for ingredient in recipe_ingredients:
                    ingredient_allergies = self.ingredient_dao.get_allergies_for_ingredient(ingredient.IngredientID)
                    if ingredient_allergies:
                        ingredient_allergy_ids = [allergy.id for allergy in ingredient_allergies]
                        if any(allergy_id in user_allergy_ids for allergy_id in ingredient_allergy_ids):
                            has_allergen = True
                            break
                
                if not has_allergen:
                    filtered_recipes.append(recipe)
            
            return filtered_recipes
            
        except Exception as e:
            print(f"Error filtering recipes by allergies: {e}")
            # If there's an error, return all recipes to avoid breaking the suggestion system
            return recipes
