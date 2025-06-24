from backend.ai_models.substitution_models import SubstitutionRecommender
import json

class SubstitutionService:
    def __init__(self):
        self.recommender = SubstitutionRecommender()
        if not self.recommender.is_ready():
            print("SubstitutionService: WARNING - Substitution Recommender failed to initialize. Substitute suggestions may be unavailable or limited.")

    def get_substitutes(self, ingredient_name):
        """Returns a list of substitutes for a given ingredient name using SubstitutionRecommender."""
        
        if not self.recommender or not self.recommender.is_ready():
            print(f"SubstitutionService: Recommender not ready for '{ingredient_name}', returning basic fallback.")
            fallback_subs_recommender_format = [
                {"name": f"Default Sub 1 for {ingredient_name}", "score": 0.0 },
                {"name": f"Default Sub 2 for {ingredient_name}", "score": 0.0 }
            ]
            return fallback_subs_recommender_format, None, 200

        try:
            substitutes_list = self.recommender.get_substitutes(ingredient_name, top_n=3)
            
            if substitutes_list is None:
                print(f"SubstitutionService: Recommender returned None for '{ingredient_name}'.")
                return None, {"error": "Failed to get substitutes due to recommender error"}, 500

            return substitutes_list, None, 200

        except Exception as e:
            print(f"SubstitutionService: Error getting substitutes for '{ingredient_name}' - {e}")
            import traceback
            traceback.print_exc()
            return None, {"error": f"An unexpected error occurred while getting substitutes."}, 500
