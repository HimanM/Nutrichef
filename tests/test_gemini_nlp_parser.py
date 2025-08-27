import unittest
import os
import sys
import json
from unittest.mock import patch, MagicMock

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from backend.ai_models.gemini_nlp.gemini_nlp_parser import GeminiNlpParser


class TestGeminiNlpParser(unittest.TestCase):
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.parser = GeminiNlpParser()
    
    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test_api_key'})
    def test_init_with_api_key(self):
        """Test initialization with API key present."""
        parser = GeminiNlpParser()
        self.assertEqual(parser.api_key, 'test_api_key')
    
    @patch.dict(os.environ, {}, clear=True)
    @patch('backend.ai_models.gemini_nlp.gemini_nlp_parser.load_dotenv')
    def test_init_without_api_key(self, mock_load_dotenv):
        """Test initialization without API key."""
        # Ensure load_dotenv doesn't load any environment variables
        mock_load_dotenv.return_value = None
        parser = GeminiNlpParser()
        self.assertIsNone(parser.api_key)
    
    def test_parse_recipe_no_api_key(self):
        """Test recipe parsing without API key."""
        parser = GeminiNlpParser()
        parser.api_key = None
        
        result = parser.parse_recipe("Test recipe text")
        
        self.assertIn('error', result)
        self.assertEqual(result['error'], 'API key not configured')
        self.assertEqual(result['Title'], 'Error: API Key Missing')
        self.assertEqual(result['Ingredients'], [])
        self.assertEqual(result['Instructions'], [])
    
    @patch('google.genai.Client')
    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test_api_key'})
    def test_parse_recipe_success(self, mock_client_class):
        """Test successful recipe parsing."""
        # Mock the Gemini API response
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        
        # Mock the stream response
        mock_chunk = MagicMock()
        mock_chunk.text = json.dumps({
            "Title": "Test Recipe",
            "Description": "A test recipe",
            "Instructions": ["Step 1", "Step 2"],
            "PreparationTimeMinutes": 10,
            "CookingTimeMinutes": 20,
            "Servings": 4,
            "Ingredients": [
                {"Ingredient": "Flour", "Unit": "cup", "Quantity": "2"},
                {"Ingredient": "Milk", "Unit": "ml", "Quantity": "250"}
            ]
        })
        
        mock_client.models.generate_content_stream.return_value = [mock_chunk]
        
        parser = GeminiNlpParser()
        result = parser.parse_recipe("Mix flour and milk. Bake for 20 minutes.")
        
        self.assertEqual(result['Title'], 'Test Recipe')
        self.assertEqual(result['Description'], 'A test recipe')
        self.assertEqual(len(result['Instructions']), 2)
        self.assertEqual(len(result['Ingredients']), 2)
        self.assertEqual(result['PreparationTimeMinutes'], 10)
        self.assertEqual(result['CookingTimeMinutes'], 20)
        self.assertEqual(result['Servings'], 4)
    
    @patch('google.genai.Client')
    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test_api_key'})
    def test_parse_recipe_not_a_recipe(self, mock_client_class):
        """Test parsing text that is not a recipe."""
        # Mock the Gemini API response for non-recipe text
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        
        mock_chunk = MagicMock()
        mock_chunk.text = json.dumps({"error": "not-a-recipe"})
        
        mock_client.models.generate_content_stream.return_value = [mock_chunk]
        
        parser = GeminiNlpParser()
        result = parser.parse_recipe("This is just random text, not a recipe.")
        
        self.assertIn('error', result)
        self.assertEqual(result['error'], 'not-a-recipe')
    
    @patch('google.genai.Client')
    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test_api_key'})
    def test_parse_recipe_empty_response(self, mock_client_class):
        """Test parsing with empty API response."""
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        
        # Mock empty response
        mock_chunk = MagicMock()
        mock_chunk.text = ""
        
        mock_client.models.generate_content_stream.return_value = [mock_chunk]
        
        parser = GeminiNlpParser()
        result = parser.parse_recipe("Test recipe")
        
        self.assertIn('error', result)
        self.assertEqual(result['error'], 'Empty API response stream')
        self.assertEqual(result['Title'], 'Error: Empty Response')
    
    @patch('google.genai.Client')
    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test_api_key'})
    def test_parse_recipe_invalid_json(self, mock_client_class):
        """Test parsing with invalid JSON response."""
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        
        # Mock invalid JSON response
        mock_chunk = MagicMock()
        mock_chunk.text = "Invalid JSON response"
        
        mock_client.models.generate_content_stream.return_value = [mock_chunk]
        
        parser = GeminiNlpParser()
        result = parser.parse_recipe("Test recipe")
        
        self.assertIn('error', result)
        self.assertIn('Invalid JSON response', result['error'])
        self.assertEqual(result['Title'], 'Error: JSON Decode Failed')
    
    @patch('google.genai.Client')
    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test_api_key'})
    def test_parse_recipe_api_exception(self, mock_client_class):
        """Test parsing with API exception."""
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        
        # Mock API exception
        mock_client.models.generate_content_stream.side_effect = Exception("API Error")
        
        parser = GeminiNlpParser()
        result = parser.parse_recipe("Test recipe")
        
        self.assertIn('error', result)
        self.assertEqual(result['error'], 'API Error')
        self.assertEqual(result['Title'], 'Error: API Call Failed')
    
    def test_extract_recipe_nutrition_no_api_key(self):
        """Test nutrition extraction without API key."""
        parser = GeminiNlpParser()
        parser.api_key = None
        
        recipe_data = {
            "Title": "Test Recipe",
            "Ingredients": [{"Ingredient": "Flour", "Unit": "cup", "Quantity": "2"}],
            "Servings": 4
        }
        
        result = parser.extract_recipe_nutrition(recipe_data)
        
        self.assertIn('error', result)
        self.assertEqual(result['error'], 'API key not configured')
        self.assertFalse(result['success'])
    
    @patch('google.genai.Client')
    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test_api_key'})
    def test_extract_recipe_nutrition_success(self, mock_client_class):
        """Test successful nutrition extraction."""
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        
        # Mock nutrition response
        nutrition_response = {
            "success": True,
            "nutrition": {
                "calories": {"amount": 300, "unit": "kcal"},
                "protein": {"amount": 15, "unit": "g"},
                "carbohydrates": {"amount": 45, "unit": "g"},
                "fat": {"amount": 10, "unit": "g"}
            },
            "per_serving": True,
            "notes": "Nutritional values are estimates"
        }
        
        mock_chunk = MagicMock()
        mock_chunk.text = json.dumps(nutrition_response)
        
        mock_client.models.generate_content_stream.return_value = [mock_chunk]
        
        parser = GeminiNlpParser()
        recipe_data = {
            "Title": "Test Recipe",
            "Ingredients": [{"Ingredient": "Flour", "Unit": "cup", "Quantity": "2"}],
            "Servings": 4
        }
        
        result = parser.extract_recipe_nutrition(recipe_data)
        
        self.assertTrue(result['success'])
        self.assertIn('nutrition', result)
        self.assertEqual(result['nutrition']['calories']['amount'], 300)
        self.assertEqual(result['nutrition']['protein']['unit'], 'g')
    
    def test_extract_recipe_tags_no_api_key(self):
        """Test tag extraction without API key."""
        parser = GeminiNlpParser()
        parser.api_key = None
        
        recipe_data = {"Title": "Test Recipe"}
        
        result = parser.extract_recipe_tags(recipe_data)
        
        self.assertIn('error', result)
        self.assertEqual(result['error'], 'API key not configured')
        self.assertFalse(result['success'])
    
    @patch('google.genai.Client')
    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test_api_key'})
    def test_extract_recipe_tags_success(self, mock_client_class):
        """Test successful tag extraction."""
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        
        # Mock tags response
        tags_response = {
            "success": True,
            "tags": ["Italian", "Vegetarian", "Quick & Easy"],
            "reasoning": "Based on ingredients and cooking method"
        }
        
        mock_chunk = MagicMock()
        mock_chunk.text = json.dumps(tags_response)
        
        mock_client.models.generate_content_stream.return_value = [mock_chunk]
        
        parser = GeminiNlpParser()
        recipe_data = {
            "Title": "Pasta with Tomato Sauce",
            "Description": "Quick pasta dish",
            "Ingredients": [
                {"Ingredient": "Pasta", "Unit": "g", "Quantity": "200"},
                {"Ingredient": "Tomato Sauce", "Unit": "ml", "Quantity": "150"}
            ],
            "PreparationTimeMinutes": 5,
            "CookingTimeMinutes": 15
        }
        
        result = parser.extract_recipe_tags(recipe_data)
        
        self.assertTrue(result['success'])
        self.assertIn('tags', result)
        self.assertEqual(len(result['tags']), 3)
        self.assertIn('Italian', result['tags'])
        self.assertIn('reasoning', result)
    
    @patch('google.genai.Client')
    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test_api_key'})
    def test_extract_recipe_tags_failure(self, mock_client_class):
        """Test tag extraction failure."""
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        
        # Mock failure response
        tags_response = {
            "success": False,
            "error": "Unable to determine appropriate tags for this recipe"
        }
        
        mock_chunk = MagicMock()
        mock_chunk.text = json.dumps(tags_response)
        
        mock_client.models.generate_content_stream.return_value = [mock_chunk]
        
        parser = GeminiNlpParser()
        recipe_data = {"Title": "Unclear Recipe"}
        
        result = parser.extract_recipe_tags(recipe_data)
        
        self.assertFalse(result['success'])
        self.assertIn('error', result)
    
    @patch('google.genai.Client')
    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test_api_key'})
    def test_extract_recipe_nutrition_empty_response(self, mock_client_class):
        """Test nutrition extraction with empty response."""
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        
        # Mock empty response
        mock_chunk = MagicMock()
        mock_chunk.text = ""
        
        mock_client.models.generate_content_stream.return_value = [mock_chunk]
        
        parser = GeminiNlpParser()
        recipe_data = {"Title": "Test Recipe", "Ingredients": [], "Servings": 1}
        
        result = parser.extract_recipe_nutrition(recipe_data)
        
        self.assertFalse(result['success'])
        self.assertIn('error', result)
        self.assertEqual(result['error'], 'Empty API response stream')


if __name__ == '__main__':
    unittest.main()