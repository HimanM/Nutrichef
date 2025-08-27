import unittest
import os
import sys
import tempfile
import json
from unittest.mock import patch, MagicMock, mock_open
import numpy as np

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from backend.ai_models.food_classification.food_classifier import FoodClassifier


class TestFoodClassifier(unittest.TestCase):
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.test_dir = tempfile.mkdtemp()
        self.model_path = os.path.join(self.test_dir, "food_model.keras")
        self.class_names_path = os.path.join(self.test_dir, "class_names.json")
        
        # Create mock class names
        self.mock_class_names = ["pizza", "apple", "burger", "salad"]
        with open(self.class_names_path, 'w') as f:
            json.dump(self.mock_class_names, f)
    
    def tearDown(self):
        """Clean up after each test."""
        import shutil
        shutil.rmtree(self.test_dir, ignore_errors=True)
    
    @patch('tensorflow.keras.models.load_model')
    def test_init_success(self, mock_load_model):
        """Test successful initialization of FoodClassifier."""
        # Create a mock model file
        with open(self.model_path, 'w') as f:
            f.write("mock model")
        
        mock_model = MagicMock()
        mock_load_model.return_value = mock_model
        
        classifier = FoodClassifier(
            model_base_path=self.test_dir,
            model_file_name="food_model.keras",
            indices_json_name="class_names.json"
        )
        
        # Print asserted variables for documentation
        print(f"📊 ASSERTED VARIABLES:")
        print(f"   classifier.is_model_loaded() = {classifier.is_model_loaded()}")
        print(f"   len(classifier.idx_to_class) = {len(classifier.idx_to_class)}")
        print(f"   classifier.idx_to_class[0] = '{classifier.idx_to_class[0]}'")
        print(f"   classifier.idx_to_class = {classifier.idx_to_class}")
        
        self.assertTrue(classifier.is_model_loaded())
        self.assertEqual(len(classifier.idx_to_class), 4)
        self.assertEqual(classifier.idx_to_class[0], "pizza")
    
    def test_init_missing_model_file(self):
        """Test initialization with missing model file."""
        classifier = FoodClassifier(
            model_base_path=self.test_dir,
            model_file_name="nonexistent_model.keras",
            indices_json_name="class_names.json"
        )
        
        # Print asserted variables for documentation
        print(f"📊 ASSERTED VARIABLES:")
        print(f"   classifier.is_model_loaded() = {classifier.is_model_loaded()}")
        
        self.assertFalse(classifier.is_model_loaded())
    
    def test_init_missing_class_names_file(self):
        """Test initialization with missing class names file."""
        # Create a mock model file
        with open(self.model_path, 'w') as f:
            f.write("mock model")
        
        classifier = FoodClassifier(
            model_base_path=self.test_dir,
            model_file_name="food_model.keras",
            indices_json_name="nonexistent_classes.json"
        )
        
        # Print asserted variables for documentation
        print(f"📊 ASSERTED VARIABLES:")
        print(f"   classifier.is_model_loaded() = {classifier.is_model_loaded()}")
        
        self.assertFalse(classifier.is_model_loaded())
    
    def test_init_invalid_class_names_format(self):
        """Test initialization with invalid class names format."""
        # Create invalid class names file (dict instead of list)
        with open(self.class_names_path, 'w') as f:
            json.dump({"0": "pizza", "1": "apple"}, f)
        
        # Create a mock model file
        with open(self.model_path, 'w') as f:
            f.write("mock model")
        
        classifier = FoodClassifier(
            model_base_path=self.test_dir,
            model_file_name="food_model.keras",
            indices_json_name="class_names.json"
        )
        
        # Print asserted variables for documentation
        print(f"📊 ASSERTED VARIABLES:")
        print(f"   classifier.is_model_loaded() = {classifier.is_model_loaded()}")
        
        self.assertFalse(classifier.is_model_loaded())
    
    @patch('tensorflow.keras.models.load_model')
    @patch('backend.ai_models.food_classification.food_classifier.keras_image.load_img')
    @patch('backend.ai_models.food_classification.food_classifier.keras_image.img_to_array')
    @patch('tensorflow.keras.applications.mobilenet_v2.preprocess_input')
    def test_preprocess_image_success(self, mock_preprocess, mock_img_to_array, mock_load_img, mock_load_model):
        """Test successful image preprocessing."""
        # Setup mocks
        with open(self.model_path, 'w') as f:
            f.write("mock model")
        
        mock_model = MagicMock()
        mock_load_model.return_value = mock_model
        
        mock_img = MagicMock()
        mock_load_img.return_value = mock_img
        
        mock_array = np.random.rand(224, 224, 3)
        mock_img_to_array.return_value = mock_array
        
        mock_preprocessed = np.random.rand(224, 224, 3)
        mock_preprocess.return_value = mock_preprocessed
        
        classifier = FoodClassifier(
            model_base_path=self.test_dir,
            model_file_name="food_model.keras",
            indices_json_name="class_names.json"
        )
        
        # Create a dummy image file for the test (not actually used due to mocking)
        test_image_path = os.path.join(self.test_dir, "test_image.jpg")
        
        result = classifier.preprocess_image(test_image_path)
        
        # Print asserted variables for documentation
        print(f"📊 ASSERTED VARIABLES:")
        print(f"   result.shape = {result.shape}")
        print(f"   Expected shape = (1, 224, 224, 3)")
        print(f"   mock_load_img called with = {test_image_path}, target_size=(224, 224)")
        
        self.assertEqual(result.shape, (1, 224, 224, 3))
        mock_load_img.assert_called_once_with(test_image_path, target_size=(224, 224))
        mock_img_to_array.assert_called_once_with(mock_img)
        mock_preprocess.assert_called_once_with(mock_array)
    
    def test_preprocess_image_model_not_loaded(self):
        """Test preprocessing when model is not loaded."""
        classifier = FoodClassifier(
            model_base_path=self.test_dir,
            model_file_name="nonexistent_model.keras",
            indices_json_name="class_names.json"
        )
        
        # Print asserted variables for documentation
        print(f"📊 ASSERTED VARIABLES:")
        print(f"   Expected exception: RuntimeError")
        print(f"   classifier.is_model_loaded() = {classifier.is_model_loaded()}")
        
        with self.assertRaises(RuntimeError):
            classifier.preprocess_image("test_image.jpg")
    
    @patch('tensorflow.keras.models.load_model')
    @patch('backend.ai_models.food_classification.food_classifier.FoodClassifier.preprocess_image')
    def test_predict_food_success(self, mock_preprocess, mock_load_model):
        """Test successful food prediction."""
        # Setup mocks
        with open(self.model_path, 'w') as f:
            f.write("mock model")
        
        mock_model = MagicMock()
        mock_predictions = np.array([[0.1, 0.8, 0.05, 0.05]])  # High confidence for "apple"
        mock_model.predict.return_value = mock_predictions
        mock_load_model.return_value = mock_model
        
        mock_preprocessed_image = np.random.rand(1, 224, 224, 3)
        mock_preprocess.return_value = mock_preprocessed_image
        
        classifier = FoodClassifier(
            model_base_path=self.test_dir,
            model_file_name="food_model.keras",
            indices_json_name="class_names.json"
        )
        
        results = classifier.predict_food("test_image.jpg", top_k=2)
        
        # Print asserted variables for documentation
        print(f"📊 ASSERTED VARIABLES:")
        print(f"   len(results) = {len(results)}")
        print(f"   results[0]['name'] = '{results[0]['name']}'")
        print(f"   results[0]['confidence'] = {results[0]['confidence']}")
        print(f"   results[1]['name'] = '{results[1]['name']}'")
        print(f"   results[1]['confidence'] = {results[1]['confidence']}")
        print(f"   Full results = {results}")
        
        self.assertEqual(len(results), 2)
        self.assertEqual(results[0]["name"], "Apple")  # Capitalized
        self.assertAlmostEqual(results[0]["confidence"], 0.8, places=2)
        self.assertEqual(results[1]["name"], "Pizza")
        self.assertAlmostEqual(results[1]["confidence"], 0.1, places=2)
    
    def test_predict_food_model_not_loaded(self):
        """Test prediction when model is not loaded."""
        classifier = FoodClassifier(
            model_base_path=self.test_dir,
            model_file_name="nonexistent_model.keras",
            indices_json_name="class_names.json"
        )
        
        results = classifier.predict_food("test_image.jpg")
        
        # Print asserted variables for documentation
        print(f"📊 ASSERTED VARIABLES:")
        print(f"   results = {results}")
        print(f"   Expected = []")
        
        self.assertEqual(results, [])
    
    @patch('tensorflow.keras.models.load_model')
    @patch('backend.ai_models.food_classification.food_classifier.FoodClassifier.preprocess_image')
    def test_predict_food_with_exception(self, mock_preprocess, mock_load_model):
        """Test prediction with exception during processing."""
        # Setup mocks
        with open(self.model_path, 'w') as f:
            f.write("mock model")
        
        mock_model = MagicMock()
        mock_load_model.return_value = mock_model
        
        # Make preprocess_image raise an exception
        mock_preprocess.side_effect = Exception("Image processing failed")
        
        classifier = FoodClassifier(
            model_base_path=self.test_dir,
            model_file_name="food_model.keras",
            indices_json_name="class_names.json"
        )
        
        results = classifier.predict_food("test_image.jpg")
        
        # Print asserted variables for documentation
        print(f"📊 ASSERTED VARIABLES:")
        print(f"   results = {results}")
        print(f"   Expected = []")
        print(f"   Exception handled gracefully = True")
        
        self.assertEqual(results, [])


if __name__ == '__main__':
    unittest.main()