import tensorflow as tf
import numpy as np
import json
import os
from tensorflow.keras.preprocessing import image as keras_image
from backend.utils.logging_utils import log_success, log_error, log_warning

class FoodClassifier:
    def __init__(self, model_base_path=None, model_file_name="food_model.keras", indices_json_name="class_names.json", image_size=(224, 224)):
        self.image_size = image_size
        self.model_loaded = False
        self.model = None
        self.idx_to_class = {}
        self.input_shape_for_model = image_size + (3,)
        self.input_dtype_for_model = tf.float32

        if model_base_path is None:
            model_base_path = os.path.dirname(os.path.abspath(__file__))

        model_path = os.path.join(model_base_path, model_file_name)
        indices_path = os.path.join(model_base_path, indices_json_name)

        if not os.path.exists(model_path):
            log_error(f"Model file does not exist: {model_path}", "FoodClassifier")
            return
        if not os.path.exists(indices_path):
            log_error(f"Class names JSON path does not exist: {indices_path}", "FoodClassifier")
            return

        try:
            with open(indices_path, 'r') as f:
                class_names_list = json.load(f)
            if not isinstance(class_names_list, list):
                log_error(f"class_names.json should contain a list. Found {type(class_names_list)}", "FoodClassifier")
                return
            self.idx_to_class = {i: name for i, name in enumerate(class_names_list)}
            log_success(f"Loaded {len(self.idx_to_class)} class names from JSON: {indices_path}", "FoodClassifier")

            # Try loading with compile=False first to avoid compatibility issues
            try:
                self.model = tf.keras.models.load_model(model_path, compile=False)
                log_success(f"Loaded model from .keras file: {model_path}", "FoodClassifier")
            except Exception as model_load_error:
                log_warning(f"Initial model load failed, trying alternative method: {model_load_error}", "FoodClassifier")
                # Try with different loading method
                try:
                    import keras
                    self.model = keras.models.load_model(model_path, compile=False)
                    log_success(f"Loaded model with Keras fallback from .keras file: {model_path}", "FoodClassifier")
                except Exception as keras_load_error:
                    raise Exception(f"Failed to load model with both TensorFlow and Keras: {keras_load_error}")

            self.model_loaded = True

        except Exception as e:
            log_error(f"Error loading FoodClassifier model or class names: {e}", "FoodClassifier")
            self.model_loaded = False

    def is_model_loaded(self):
        return self.model_loaded

    def preprocess_image(self, image_path):
        if not self.is_model_loaded():
            raise RuntimeError("Model is not loaded.")
        img = keras_image.load_img(image_path, target_size=self.image_size)
        img_array = keras_image.img_to_array(img)
        img_array_preprocessed = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)
        return np.expand_dims(img_array_preprocessed, axis=0)

    def predict_food(self, img_path, top_k=3):
        if not self.is_model_loaded():
            log_error("Model is not loaded.", "FoodClassifier")
            return []

        try:
            preprocessed_image = self.preprocess_image(img_path)
            predictions = self.model.predict(preprocessed_image)

            if predictions.ndim == 2 and predictions.shape[0] == 1:
                predictions_1d = predictions[0]
            elif predictions.ndim == 1:
                predictions_1d = predictions
            else:
                log_error(f"Unexpected predictions shape: {predictions.shape}", "FoodClassifier")
                return []

            actual_top_k = min(top_k, len(self.idx_to_class))
            top_k_indices = np.argsort(predictions_1d)[-actual_top_k:][::-1]

            results = []
            for i in top_k_indices:
                class_name = self.idx_to_class.get(i, "Unknown Class")
                class_name = ' '.join(word.capitalize() for word in class_name.split('_'))
                confidence = float(predictions_1d[i])
                results.append({"name": class_name, "confidence": confidence})

            return results

        except Exception as e:
            log_error(f"Error during prediction: {e}", "FoodClassifier")
            return []
