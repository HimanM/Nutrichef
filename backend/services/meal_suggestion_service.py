from backend.dao.recipe_dao import RecipeDAO
from backend.dao.user_dao import UserDAO
from backend.models import Recipe
import random
from typing import List, Dict, Any

class MealSuggestionService:
    def __init__(self):
        self.recipe_dao = RecipeDAO()
        self.user_dao = UserDAO()
    
    def suggest_meals_for_day(self, user_id: int, target_date: str, existing_meals: List[Dict] = None) -> Dict[str, Any]:
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
        
        # Sum up nutrition from existing meals
        for meal in existing_meals:
            if hasattr(meal, 'get') and meal.get('NutritionInfo') and meal['NutritionInfo'].get('nutrition'):
                nutrition = meal['NutritionInfo']['nutrition']
                consumed['calories'] += nutrition.get('calories', {}).get('amount', 0)
                consumed['protein'] += nutrition.get('protein', {}).get('amount', 0)
                consumed['carbs'] += nutrition.get('carbs', {}).get('amount', 0)
                consumed['fat'] += nutrition.get('fat', {}).get('amount', 0)
                consumed['fiber'] += nutrition.get('fiber', {}).get('amount', 0)
                consumed['sugar'] += nutrition.get('sugar', {}).get('amount', 0)
                consumed['sodium'] += nutrition.get('sodium', {}).get('amount', 0)
            elif hasattr(meal, 'NutritionInfoJSON') and meal.NutritionInfoJSON:
                # Handle direct recipe objects
                nutrition = meal.NutritionInfoJSON.get('nutrition', {})
                consumed['calories'] += nutrition.get('calories', {}).get('amount', 0)
                consumed['protein'] += nutrition.get('protein', {}).get('amount', 0)
                consumed['carbs'] += nutrition.get('carbs', {}).get('amount', 0)
                consumed['fat'] += nutrition.get('fat', {}).get('amount', 0)
                consumed['fiber'] += nutrition.get('fiber', {}).get('amount', 0)
                consumed['sugar'] += nutrition.get('sugar', {}).get('amount', 0)
                consumed['sodium'] += nutrition.get('sodium', {}).get('amount', 0)
        
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
        
        for nutrient, weight in weights.items():
            target_amount = targets.get(nutrient, 0)
            recipe_amount = nutrition.get(nutrient, {}).get('amount', 0)
            
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
        
        calories = nutrition.get('calories', {}).get('amount', 0)
        protein = nutrition.get('protein', {}).get('amount', 0)
        
        if calories > 0 and targets.get('calories', 0) > 0:
            cal_percent = (calories / targets['calories']) * 100
            if cal_percent >= 25:
                fits.append(f"Good calorie source ({int(cal_percent)}% of daily target)")
        
        if protein > 0 and targets.get('protein', 0) > 0:
            protein_percent = (protein / targets['protein']) * 100
            if protein_percent >= 20:
                fits.append(f"High protein ({int(protein_percent)}% of daily target)")
        
        return "; ".join(fits) if fits else "Balanced nutrition"
