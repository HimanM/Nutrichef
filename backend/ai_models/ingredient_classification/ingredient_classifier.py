import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import tensorflow_hub as hub
import os
import json

class FoodIngredientClassifier:
    def __init__(self, model_base_path=None, model_dir_name='ing_classification_model', indices_json_name='class_indices.json', img_size=(224, 224)):
        """
        Initializes the classifier.
        :param model_base_path: Base path to the 'ingredient_classification' directory. 
                                If None, defaults to the directory of this script.
        :param model_dir_name: Name of the directory containing the Keras model.
        :param indices_json_name: Name of the JSON file for class indices.
        :param img_size: Tuple for image target size.
        """
        if model_base_path is None:
            model_base_path = os.path.dirname(os.path.abspath(__file__))

        self.model_path = os.path.join(model_base_path, model_dir_name)
        self.indices_path = os.path.join(self.model_path, indices_json_name)
        self.img_size = img_size
        
        self.model = None
        self.idx_to_class = {}
        self.model_loaded = False

        input_shape_for_model = self.img_size + (3,)
        input_dtype_for_model = tf.float32

        try:
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"Model directory not found at: {self.model_path}. User needs to place 'ing_classification_model' directory here.")
            if not os.path.exists(self.indices_path):
                 raise FileNotFoundError(f"Class indices JSON not found at: {self.indices_path}. User needs to place '{indices_json_name}' inside '{model_dir_name}'.")

            self.model = hub.KerasLayer(self.model_path, trainable=False)
            print(f"✅ FoodIngredientClassifier: Model initialized with KerasLayer from {self.model_path}")
            
            with open(self.indices_path, 'r') as f:
                class_indices = json.load(f)
            self.idx_to_class = {int(v): k for k, v in class_indices.items()}
            
            self.model_loaded = True
            print(f"✅ FoodIngredientClassifier: Model '{model_dir_name}' and class indices processed successfully.")

        except FileNotFoundError as fnf_error:
            print(f"FoodIngredientClassifier: ERROR - {fnf_error}")
        except Exception as e:
            print(f"FoodIngredientClassifier: ERROR loading model using KerasLayer or class indices from {self.model_path} - {e}")
            
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
            print("FoodIngredientClassifier: Prediction skipped, model not loaded.")
            return []

        try:
            processed_img = self.preprocess_image(img_path)
            raw_predictions = self.model(processed_img)
            
            if isinstance(raw_predictions, dict):
                if 'output_0' in raw_predictions:
                    prediction_values = raw_predictions['output_0']
                elif len(raw_predictions) == 1:
                    prediction_values = next(iter(raw_predictions.values()))
                else:
                    print(f"FoodIngredientClassifier: WARNING - Model output is a dictionary with multiple keys: {list(raw_predictions.keys())}. Using first one found or failing. Please specify output key if default is incorrect.")
                    prediction_values = next(iter(raw_predictions.values()), None)
                    if prediction_values is None:
                        raise ValueError("Model output is a dictionary, but could not determine the correct output tensor. Please check model signature and update classifier code.")
            elif isinstance(raw_predictions, list):
                 prediction_values = raw_predictions[0]
            else:
                prediction_values = raw_predictions

            if prediction_values.ndim == 2 and prediction_values.shape[0] == 1:
                preds = prediction_values[0] 
            elif prediction_values.ndim == 1:
                preds = prediction_values
            else:
                raise ValueError(f"Unexpected shape for prediction_values: {prediction_values.shape}")

            top_indices = np.argsort(preds.numpy())[-top_k:][::-1]
            
            results = []
            for i in top_indices:
                class_name = self.idx_to_class.get(i, f"Unknown_Index_{i}")
                confidence = float(preds[i])
                results.append({"name": class_name, "confidence": confidence})
            
            return results
        except Exception as e:
            print(f"FoodIngredientClassifier: Error during prediction for {img_path} - {e}")
            return []
