import os
import tempfile
from werkzeug.utils import secure_filename
from backend.ai_models.ingredient_classification.ingredient_classifier import FoodIngredientClassifier
from backend.ai_models.food_classification.food_classifier import FoodClassifier
import json
from ..dao import ClassificationResultDAO
from ..db import db
from backend.services.nutrition_service import NutritionService

class ClassificationService:
    def __init__(self):
        self.classification_result_dao = ClassificationResultDAO()
        self.nutrition_service = NutritionService.get_instance()

        self.ingredient_classifier = FoodIngredientClassifier()
        if not self.ingredient_classifier.is_model_loaded():
            print("ClassificationService: WARNING - Ingredient classifier model failed to load. Predictions for 'ingredient' mode will be based on fallback dummy logic.")

        self.food_classifier = FoodClassifier()
        if not self.food_classifier.is_model_loaded():
            print("ClassificationService: WARNING - Food classifier model failed to load. Predictions for 'food' mode will be based on fallback dummy logic.")

    def classify_item(self, image_file_storage, user_id, classification_mode, food_name=None):
        """
        Classifies an item based on an image, classification mode, and optional food name.
        image_file_storage should be a Flask FileStorage object.
        classification_mode can be 'food' or 'ingredient'.
        food_name is kept for now but will be ignored if an image is provided for model prediction.
        """
        classifier_to_use = None
        prediction_method_name = None

        if classification_mode == 'food':
            if self.food_classifier and self.food_classifier.is_model_loaded():
                classifier_to_use = self.food_classifier
                prediction_method_name = 'predict_food'
        elif classification_mode == 'ingredient':
            if self.ingredient_classifier and self.ingredient_classifier.is_model_loaded():
                classifier_to_use = self.ingredient_classifier
                prediction_method_name = 'predict_ingredient'
        else:
            return None, {"error": f"Invalid classification mode: {classification_mode}"}, 400


        if not classifier_to_use:
            print(f"ClassificationService: {classification_mode.capitalize()} model not loaded, using fallback dummy classification.")
            predicted_food_name_from_model = f"Fallback: {classification_mode.capitalize()} Model Not Loaded"
            name_for_nutrition_lookup = predicted_food_name_from_model
            predictions = []

            nutrition_result = self.nutrition_service.get_nutrition(name_for_nutrition_lookup)
            
            return {
                "classification": {
                    "providedFoodName": food_name,
                    "imagePredictedFoodName": predicted_food_name_from_model,
                    "allPredictions": predictions,
                    "finalFoodNameUsed": name_for_nutrition_lookup
                },
                "nutrition": nutrition_result
            }, None, 200

        if not image_file_storage:
            predicted_food_name_from_model = None
            predictions = []
            if food_name:
                print(f"ClassificationService: No image provided, using food name '{food_name}' for nutrition lookup (mode: {classification_mode}).")
                name_for_nutrition_lookup = food_name
                nutrition_result = self.nutrition_service.get_nutrition(name_for_nutrition_lookup)
                nutrition_info_json_string = json.dumps(nutrition_result)
                try:
                    self.classification_result_dao.create_classification_result(
                        user_id=user_id,
                        predicted_food_name=name_for_nutrition_lookup,
                        nutrition_info_json=nutrition_info_json_string,
                        score=None,
                        uploaded_image_url=None,
                        classification_mode=classification_mode
                    )
                    db.session.commit()
                except Exception as db_error:
                    db.session.rollback()
                    print(f"ClassificationService: Error saving name-only classification to DB - {db_error}")

                return {
                     "classification": {
                        "providedFoodName": food_name,
                        "imagePredictedFoodName": predicted_food_name_from_model,
                        "allPredictions": predictions,
                        "finalFoodNameUsed": name_for_nutrition_lookup
                    },
                    "nutrition": nutrition_result
                }, None, 200
            else:
                return None, {"error": "Image file or food name is required for classification"}, 400

        temp_dir = tempfile.gettempdir()
        temp_image_path = None
        try:
            filename = secure_filename(image_file_storage.filename if image_file_storage.filename else "temp_image.tmp")
            temp_image_path = os.path.join(temp_dir, filename)
            image_file_storage.save(temp_image_path)
            print(f"ClassificationService: Image saved temporarily to {temp_image_path} for {classification_mode} classification.")

            predictions = []
            predicted_food_name_from_model = None
            raw_score = None

            if prediction_method_name == 'predict_food':
                predictions = classifier_to_use.predict_food(temp_image_path)
            elif prediction_method_name == 'predict_ingredient':
                predictions = classifier_to_use.predict_ingredient(temp_image_path)

            if predictions:
                predicted_food_name_from_model = predictions[0]['name']
                raw_score = predictions[0]['confidence']

            if predicted_food_name_from_model:
                name_for_nutrition_lookup = predicted_food_name_from_model
            elif food_name:
                name_for_nutrition_lookup = food_name
                print(f"ClassificationService: Model prediction failed or empty for {classification_mode}, using provided food_name '{food_name}' as fallback.")
            else:
                name_for_nutrition_lookup = f"Unknown Food ({classification_mode} classification failed)"
            
            nutrition_result = self.nutrition_service.get_nutrition(name_for_nutrition_lookup)
            nutrition_info_json_string = json.dumps(nutrition_result)

            uploaded_image_url = None
            db_predicted_food_name = predicted_food_name_from_model if predicted_food_name_from_model else name_for_nutrition_lookup

            try:
                self.classification_result_dao.create_classification_result(
                    user_id=user_id,
                    predicted_food_name=db_predicted_food_name,
                    nutrition_info_json=nutrition_info_json_string,
                    score=raw_score,
                    uploaded_image_url=uploaded_image_url,
                )
                db.session.commit()
                print(f"ClassificationService: Result for user {user_id} ({classification_mode}) saved to DB.")
            except Exception as db_error:
                db.session.rollback()
                print(f"ClassificationService: Error saving {classification_mode} classification result to DB - {db_error}")

            response_data = {
                "classification": {
                    "providedFoodName": food_name,
                    "imagePredictedFoodName": predicted_food_name_from_model,
                    "allPredictions": predictions if predictions else [],
                    "finalFoodNameUsed": name_for_nutrition_lookup
                },
                "nutrition": nutrition_result
            }
            return response_data, None, 200

        except Exception as e:
            print(f"ClassificationService: Error during {classification_mode} classification - {e}")
            import traceback
            traceback.print_exc()
            nutrition_result_on_error = {'success': False, 'error': f"Error during {classification_mode} classification processing: {e}"}
            final_name_on_error = food_name if food_name else f"Unknown due to error in {classification_mode} processing"
            return {
                 "classification": {
                    "providedFoodName": food_name,
                    "imagePredictedFoodName": None,
                    "allPredictions": [],
                    "finalFoodNameUsed": final_name_on_error
                },
                "nutrition": nutrition_result_on_error
            }, None, 500
        finally:
            if temp_image_path and os.path.exists(temp_image_path):
                try:
                    os.remove(temp_image_path)
                    print(f"ClassificationService: Temporary image {temp_image_path} removed.")
                except Exception as e_remove:
                    print(f"ClassificationService: Error removing temporary image {temp_image_path} - {e_remove}")
