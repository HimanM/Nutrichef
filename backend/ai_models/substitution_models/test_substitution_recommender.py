import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..', '..'))
sys.path.insert(0, PROJECT_ROOT)

from backend.ai_models.substitution_models.substitution_recommender import SubstitutionRecommender

def run_test():
    print("--- Substitution Recommender Test Script ---")
    
    print("Initializing SubstitutionRecommender...")
    recommender = SubstitutionRecommender() 

    if not recommender.is_ready():
        print("Recommender not ready. Please ensure:")
        print(f"1. 'sub_normalized.csv' is correctly placed in: '{SCRIPT_DIR}/'")
        print(f"2. The SpaCy model 'en_core_web_sm' is downloaded (run: python -m spacy download en_core_web_sm).")
        return

    print("Recommender initialized successfully.")

    test_ingredients = [
        "all purpose flour", 
        "beef sirloin", 
        "caster sugar", 
        "unsalted butter", 
        "a_completely_random_ingredient_name"
    ]

    for ingredient_name in test_ingredients:
        print(f"\nRequesting substitutes for: '{ingredient_name}'")
        try:
            substitutes = recommender.get_substitutes(ingredient_name, top_n=3)
            
            if substitutes:
                print("  Top substitutes found:")
                for sub in substitutes:
                    score_str = f"{sub['score']:.2%}" if isinstance(sub.get('score'), float) else "N/A"
                    print(f"  - Name: {sub['name']}, Score: {score_str}")
            else:
                print("  No substitutes found for this ingredient.")
        except RuntimeError as r_err:
            print(f"  Runtime Error during substitution: {r_err}")
        except Exception as e:
            print(f"  An unexpected error occurred during substitution for '{ingredient_name}': {e}")

    print("\n--- Test Script Finished ---")

if __name__ == '__main__':
    run_test()
