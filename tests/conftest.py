"""
Pytest configuration and shared fixtures for AI model tests.
"""

import pytest
import tempfile
import shutil
import os
import sys
import json
import pandas as pd
from unittest.mock import MagicMock

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))


@pytest.fixture
def temp_dir():
    """Create a temporary directory for test files."""
    temp_dir = tempfile.mkdtemp()
    yield temp_dir
    shutil.rmtree(temp_dir, ignore_errors=True)


@pytest.fixture
def mock_food_csv(temp_dir):
    """Create a mock food CSV file for testing."""
    csv_path = os.path.join(temp_dir, "food.csv")
    data = {
        'fdc_id': [1001, 1002, 1003],
        'description': ['Apple, raw', 'Banana, raw', 'Chicken breast, raw'],
        'data_type': ['sr_legacy_food'] * 3,
        'publication_date': ['2019-04-01'] * 3
    }
    pd.DataFrame(data).to_csv(csv_path, index=False)
    return csv_path


@pytest.fixture
def mock_nutrient_csv(temp_dir):
    """Create a mock nutrient CSV file for testing."""
    csv_path = os.path.join(temp_dir, "nutrient.csv")
    data = {
        'id': [1008, 1003, 1004],
        'name': ['Energy', 'Protein', 'Total lipid (fat)'],
        'unit_name': ['kcal', 'g', 'g'],
        'nutrient_nbr': [208, 203, 204]
    }
    pd.DataFrame(data).to_csv(csv_path, index=False)
    return csv_path


@pytest.fixture
def mock_food_nutrient_csv(temp_dir):
    """Create a mock food_nutrient CSV file for testing."""
    csv_path = os.path.join(temp_dir, "food_nutrient.csv")
    data = {
        'fdc_id': [1001, 1001, 1002],
        'nutrient_id': [1008, 1003, 1008],
        'amount': [52.0, 0.3, 89.0],
        'data_points': [10] * 3,
        'derivation_id': [49] * 3,
        'min': [''] * 3,
        'max': [''] * 3,
        'median': [''] * 3,
        'footnote': [''] * 3,
        'min_year_acquired': [2016] * 3
    }
    pd.DataFrame(data).to_csv(csv_path, index=False)
    return csv_path


@pytest.fixture
def mock_allergy_csv(temp_dir):
    """Create a mock allergy CSV file for testing."""
    csv_path = os.path.join(temp_dir, "allergies.csv")
    data = {
        'Food': ['Milk', 'Eggs', 'Peanuts'],
        'dairy': [1, 0, 0],
        'eggs': [0, 1, 0],
        'peanuts': [0, 0, 1]
    }
    pd.DataFrame(data).to_csv(csv_path, index=False)
    return csv_path


@pytest.fixture
def mock_substitution_csv(temp_dir):
    """Create a mock substitution CSV file for testing."""
    csv_path = os.path.join(temp_dir, "substitutions.csv")
    data = {
        'normalized_ingredient': ['butter', 'milk', 'egg'],
        'normalized_substitute': ['oil', 'almond milk', 'flax egg']
    }
    pd.DataFrame(data).to_csv(csv_path, index=False)
    return csv_path


@pytest.fixture
def mock_class_names_json(temp_dir):
    """Create a mock class names JSON file for testing."""
    json_path = os.path.join(temp_dir, "class_names.json")
    class_names = ["pizza", "apple", "burger", "salad"]
    with open(json_path, 'w') as f:
        json.dump(class_names, f)
    return json_path


@pytest.fixture
def mock_chatbot_config(temp_dir):
    """Create a mock chatbot configuration file."""
    config_path = os.path.join(temp_dir, "chatbot_config.json")
    config = {
        "intents": {
            "greeting_keywords": ["hello", "hi"],
            "classify_keywords": ["classify", "what is"],
            "substitute_keywords": ["substitute", "replace"],
            "nutrition_keywords": ["nutrition", "calories"]
        },
        "how_to_topics": {
            "browse_recipes": {
                "keywords": ["browse recipes"],
                "response": "You can browse recipes",
                "link_text": "Browse",
                "link_url": "/recipes"
            }
        }
    }
    with open(config_path, 'w') as f:
        json.dump(config, f)
    return config_path


@pytest.fixture
def mock_spacy_nlp():
    """Create a mock spaCy NLP object."""
    mock_nlp = MagicMock()
    mock_doc = MagicMock()
    mock_doc.text = "test"
    mock_nlp.return_value = mock_doc
    return mock_nlp


@pytest.fixture
def mock_tensorflow_model():
    """Create a mock TensorFlow model."""
    mock_model = MagicMock()
    mock_model.predict.return_value = [[0.1, 0.8, 0.05, 0.05]]
    return mock_model


@pytest.fixture
def mock_keras_model():
    """Create a mock Keras model."""
    mock_model = MagicMock()
    mock_predictions = MagicMock()
    mock_predictions.numpy.return_value = [[0.1, 0.7, 0.15, 0.05]]
    mock_model.return_value = mock_predictions
    return mock_model


@pytest.fixture(autouse=True)
def suppress_warnings():
    """Suppress warnings during tests."""
    import warnings
    warnings.filterwarnings("ignore", category=DeprecationWarning)
    warnings.filterwarnings("ignore", category=FutureWarning)
    warnings.filterwarnings("ignore", category=UserWarning)


# Pytest markers for test categorization
pytest.mark.unit = pytest.mark.unit
pytest.mark.integration = pytest.mark.integration
pytest.mark.classification = pytest.mark.classification
pytest.mark.nlp = pytest.mark.nlp
pytest.mark.database = pytest.mark.database
pytest.mark.slow = pytest.mark.slow