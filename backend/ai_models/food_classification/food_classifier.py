import tensorflow as tf
import numpy as np
import json
import os
from tensorflow.keras.preprocessing import image as keras_image

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
            print(f"❌ Error: Model file does not exist: {model_path}")
            return
        if not os.path.exists(indices_path):
            print(f"❌ Error: Class names JSON path does not exist: {indices_path}")
            return

        try:
            with open(indices_path, 'r') as f:
                class_names_list = json.load(f)
            if not isinstance(class_names_list, list):
                print(f"❌ Error: class_names.json should contain a list. Found {type(class_names_list)}")
                return
            self.idx_to_class = {i: name for i, name in enumerate(class_names_list)}
            print(f"✅ Loaded {len(self.idx_to_class)} class names from JSON: {indices_path}")

            self.model = tf.keras.models.load_model(model_path)
            print(f"✅ Loaded model from .keras file: {model_path}")

            self.model_loaded = True

        except Exception as e:
            print(f"❌ Error loading FoodClassifier model or class names: {e}")
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
            print("❌ Error: Model is not loaded.")
            return []

        try:
            preprocessed_image = self.preprocess_image(img_path)
            predictions = self.model.predict(preprocessed_image)

            if predictions.ndim == 2 and predictions.shape[0] == 1:
                predictions_1d = predictions[0]
            elif predictions.ndim == 1:
                predictions_1d = predictions
            else:
                print(f"❌ Unexpected predictions shape: {predictions.shape}")
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
            print(f"❌ Error during prediction: {e}")
            return []
