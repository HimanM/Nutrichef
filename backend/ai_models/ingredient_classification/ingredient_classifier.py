import numpy as np
import tensorflow as tf
from keras.preprocessing import image
import os
import json
from backend.utils.logging_utils import log_success, log_error, log_warning

class FoodIngredientClassifier:
    def __init__(self, model_base_path=None, model_file_name='ingredient_model.keras', class_names_file='class_names.json', img_size=(224, 224)):
        """
        Initializes the classifier.
        :param model_base_path: Base path to the 'ingredient_classification' directory.
                                If None, defaults to the directory of this script.
        :param model_file_name: Name of the Keras model file.
        :param class_names_file: Name of the JSON file for class names.
        :param img_size: Tuple for image target size.
        """
        if model_base_path is None:
            model_base_path = os.path.dirname(os.path.abspath(__file__))

        self.model_path = os.path.join(model_base_path, model_file_name)
        self.class_names_path = os.path.join(model_base_path, class_names_file)
        self.img_size = img_size
        
        self.model = None
        self.idx_to_class = {}
        self.model_loaded = False

        try:
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"Model file not found at: {self.model_path}. User needs to place '{model_file_name}' here.")
            if not os.path.exists(self.class_names_path):
                raise FileNotFoundError(f"Class names JSON not found at: {self.class_names_path}. User needs to place '{class_names_file}' here.")

            import keras
            self.model = keras.models.load_model(self.model_path)
            log_success(f"Model loaded from {self.model_path}", "FoodIngredientClassifier")
            
            with open(self.class_names_path, 'r') as f:
                class_names = json.load(f)
            if not isinstance(class_names, list):
                raise ValueError(f"Expected class_names.json to be a list, got {type(class_names)}")
            self.idx_to_class = {i: name for i, name in enumerate(class_names)}
            
            self.model_loaded = True
            log_success(f"Model '{model_file_name}' and class names processed successfully.", "FoodIngredientClassifier")

        except FileNotFoundError as fnf_error:
            log_error(str(fnf_error), "FoodIngredientClassifier")
        except Exception as e:
            log_error(f"loading model using tf.keras.models.load_model or class names from {self.model_path} - {e}", "FoodIngredientClassifier")
    
    def is_model_loaded(self):
        return self.model_loaded

    def preprocess_image(self, img_path):
        if not self.is_model_loaded():
            raise RuntimeError("Model is not loaded. Cannot preprocess image.")
        img = image.load_img(img_path, target_size=self.img_size)
        img_array = image.img_to_array(img) / 255.0
        return np.expand_dims(img_array, axis=0)

    def predict_ingredient(self, img_path, top_k=3):
        if not self.is_model_loaded():
            log_warning("Prediction skipped, model not loaded.", "FoodIngredientClassifier")
            return []

        try:
            processed_img = self.preprocess_image(img_path)
            if self.model is None:
                raise RuntimeError("Model is not loaded.")
            raw_predictions = self.model(processed_img, training=False)

            if hasattr(raw_predictions, 'numpy'):
                preds = raw_predictions.numpy()[0]
            elif isinstance(raw_predictions, np.ndarray):
                preds = raw_predictions[0]
            else:
                raise ValueError(f"Unexpected prediction output type: {type(raw_predictions)}")

            top_indices = np.argsort(preds)[-top_k:][::-1]
            
            results = []
            for i in top_indices:
                class_name = self.idx_to_class.get(i, f"Unknown_Index_{i}")
                confidence = float(preds[i])
                results.append({"name": class_name, "confidence": confidence})
            
            return results
        except Exception as e:
            log_error(f"Error during prediction for {img_path} - {e}", "FoodIngredientClassifier")
            return []
