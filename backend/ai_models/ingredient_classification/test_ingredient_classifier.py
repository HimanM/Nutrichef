import os
import sys
import unittest
import numpy as np # For creating dummy image if needed
import tensorflow as tf # For tf.keras.preprocessing.image.save_img

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..', '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.ai_models.ingredient_classification.ingredient_classifier import FoodIngredientClassifier

SAMPLE_IMAGE_FILENAME = "sample_test_image.jpg"
SAMPLE_IMAGE_PATH = os.path.join(SCRIPT_DIR, SAMPLE_IMAGE_FILENAME)

class TestIngredientClassifier(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        """Ensure a dummy image exists for tests that might need it."""
        if not os.path.exists(SAMPLE_IMAGE_PATH):
            print(f"Test setup: '{SAMPLE_IMAGE_FILENAME}' not found. Creating a dummy random image for testing at {SAMPLE_IMAGE_PATH}")
            try:
                dummy_img_array = np.random.rand(224, 224, 3) * 255
                os.makedirs(os.path.dirname(SAMPLE_IMAGE_PATH), exist_ok=True)
                tf.keras.preprocessing.image.save_img(SAMPLE_IMAGE_PATH, dummy_img_array)
                print(f"Test setup: Created dummy image: {SAMPLE_IMAGE_PATH}")
            except Exception as e:
                print(f"Test setup warning: Could not create dummy image: {e}")

    def test_model_loads_successfully(self):
        """Tests if the FoodIngredientClassifier model loads successfully."""
        print("Running test: test_model_loads_successfully")
        classifier = FoodIngredientClassifier()
        self.assertTrue(classifier.is_model_loaded(), 
                        "FoodIngredientClassifier model should be loaded. Check logs for errors if this fails. "
                        "Ensure 'ing_classification_model' and 'class_indices.json' are correctly placed.")
        print("Test 'test_model_loads_successfully' PASSED: classifier.is_model_loaded() is True.")

    def test_predict_ingredient_basic(self):
        """Basic test for predict_ingredient method."""
        print("Running test: test_predict_ingredient_basic")
        classifier = FoodIngredientClassifier()
        self.assertTrue(classifier.is_model_loaded(), "Prerequisite: Model must be loaded for prediction test.")

        if not os.path.exists(SAMPLE_IMAGE_PATH):
            self.skipTest(f"Skipping prediction test as sample image '{SAMPLE_IMAGE_PATH}' does not exist and couldn't be created.")

        try:
            predictions = classifier.predict_ingredient(SAMPLE_IMAGE_PATH, top_k=3)
            self.assertIsInstance(predictions, list, "Predictions should be a list.")
            
            num_classes = len(classifier.idx_to_class)
            expected_len = min(3, num_classes if num_classes > 0 else 3)

            self.assertGreater(num_classes, 0, "idx_to_class should not be empty if model is loaded.")

            self.assertEqual(len(predictions), expected_len, f"Should return up to {expected_len} predictions.")

            if predictions:
                for item in predictions:
                    self.assertIsInstance(item, dict, "Each prediction item should be a dictionary.")
                    self.assertIn("name", item, "Prediction item should contain 'name' key.")
                    self.assertIsInstance(item["name"], str, "'name' should be a string.")
                    self.assertIn("confidence", item, "Prediction item should contain 'confidence' key.")
                    self.assertIsInstance(item["confidence"], float, "'confidence' should be a float.")
                    self.assertTrue(0.0 <= item["confidence"] <= 1.0, "Confidence score should be between 0.0 and 1.0.")
            print(f"Test 'test_predict_ingredient_basic' PASSED with {len(predictions)} predictions.")

        except Exception as e:
            self.fail(f"predict_ingredient raised an unexpected exception: {e}")

if __name__ == '__main__':
    unittest.main()
