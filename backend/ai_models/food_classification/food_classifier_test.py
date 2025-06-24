import pytest
import os
import numpy as np
from backend.ai_models.food_classification.food_classifier import FoodClassifier
from tensorflow.keras.preprocessing import image as keras_image

SAMPLE_IMAGE_PATH_RELATIVE_TO_PROJECT_ROOT = "backend/ai_models/food_classification/pizza.jpg"
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
SAMPLE_IMAGE_PATH_FOR_CREATION = os.path.join(CURRENT_DIR, "pizza.jpg")


@pytest.fixture(scope="module")
def classifier():
    """
    Fixture to create a FoodClassifier instance.
    It also ensures that the sample image 'pizza.jpg' exists in the same directory
    as food_classifier.py, creating a dummy one if not found.
    """
    if not os.path.exists(SAMPLE_IMAGE_PATH_FOR_CREATION):
        print(f"Warning: Sample image {SAMPLE_IMAGE_PATH_FOR_CREATION} not found. Creating a dummy image.")
        try:
            dummy_img_array = np.random.rand(224, 224, 3) * 255
            os.makedirs(os.path.dirname(SAMPLE_IMAGE_PATH_FOR_CREATION), exist_ok=True)
            keras_image.save_img(SAMPLE_IMAGE_PATH_FOR_CREATION, dummy_img_array.astype(np.uint8))
            print(f"Created dummy image at {SAMPLE_IMAGE_PATH_FOR_CREATION}")
        except Exception as e:
            pytest.fail(f"Failed to create dummy image: {e}")

    instance = FoodClassifier()
    if not instance.is_model_loaded():
        pytest.fail("FoodClassifier model failed to load. Check model path and class_names.json.")
    return instance

def test_classifier_initialization(classifier: FoodClassifier):
    """Tests basic initialization of the FoodClassifier."""
    assert classifier.is_model_loaded() is True, "Model should be loaded."
    assert classifier.idx_to_class is not None, "idx_to_class should be initialized."
    assert isinstance(classifier.idx_to_class, dict), "idx_to_class should be a dictionary."
    assert len(classifier.idx_to_class) > 0, "idx_to_class should not be empty."

def test_predict_food_output_format(classifier: FoodClassifier):
    """Tests the output format of the predict_food method."""
    if not os.path.exists(SAMPLE_IMAGE_PATH_RELATIVE_TO_PROJECT_ROOT):
        pytest.fail(f"Sample image for testing not found at {SAMPLE_IMAGE_PATH_RELATIVE_TO_PROJECT_ROOT}. "
                    f"It should have been created by the fixture at {SAMPLE_IMAGE_PATH_FOR_CREATION}.")

    predictions = classifier.predict_food(SAMPLE_IMAGE_PATH_RELATIVE_TO_PROJECT_ROOT, top_k=3)

    assert isinstance(predictions, list), "Predictions should be a list."
    num_classes = len(classifier.idx_to_class)
    expected_len = min(3, num_classes)
    assert len(predictions) == expected_len, f"Should return {expected_len} predictions."

    if expected_len > 0:
        for item in predictions:
            assert isinstance(item, dict), "Each prediction item should be a dictionary."
            assert "name" in item, "Prediction item should contain 'name' key."
            assert isinstance(item["name"], str), "'name' should be a string."
            assert "confidence" in item, "Prediction item should contain 'confidence' key."
            assert isinstance(item["confidence"], float), "'confidence' should be a float."
            assert 0.0 <= item["confidence"] <= 1.0, "Confidence score should be between 0.0 and 1.0."

def test_preprocess_image_basic_check(classifier: FoodClassifier):
    """Performs a basic check on the preprocess_image method."""
    if not os.path.exists(SAMPLE_IMAGE_PATH_RELATIVE_TO_PROJECT_ROOT):
         pytest.fail(f"Sample image for testing not found at {SAMPLE_IMAGE_PATH_RELATIVE_TO_PROJECT_ROOT}. "
                     f"It should have been created by the fixture at {SAMPLE_IMAGE_PATH_FOR_CREATION}.")

    preprocessed_image = classifier.preprocess_image(SAMPLE_IMAGE_PATH_RELATIVE_TO_PROJECT_ROOT)

    assert isinstance(preprocessed_image, np.ndarray), "Output should be a NumPy array."
    expected_shape = (1,) + classifier.input_shape_for_model
    assert preprocessed_image.shape == expected_shape, \
        f"Output shape should be {expected_shape}, but got {preprocessed_image.shape}."

def test_predict_food_with_nonexistent_image(classifier: FoodClassifier):
    """Tests predict_food with a non-existent image path."""
    non_existent_path = "path/to/non_existent_image.jpg"
    try:
        predictions = classifier.predict_food(non_existent_path)
        assert predictions == [], \
            f"predict_food with non-existent image should return an empty list, got {predictions}."
    except Exception as e:
        pytest.fail(f"predict_food raised an unexpected exception for a non-existent image: {e}")