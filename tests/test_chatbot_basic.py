import unittest
import os
import sys
import tempfile
import json
from unittest.mock import patch, MagicMock

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))


class TestFoodChatbotBasic(unittest.TestCase):
    """Basic tests for FoodChatbot without complex dependencies."""
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.test_dir = tempfile.mkdtemp()
        self.config_path = os.path.join(self.test_dir, "test_config.json")
        
        # Create mock config
        self.mock_config = {
            "intents": {
                "greeting_keywords": ["hello", "hi", "hey"],
                "classify_keywords": ["classify", "what is", "identify"],
                "substitute_keywords": ["substitute", "replace", "alternative"],
                "nutrition_keywords": ["nutrition", "calories", "nutrients"]
            },
            "how_to_topics": {
                "browse_recipes": {
                    "keywords": ["browse recipes", "find recipes"],
                    "response": "You can browse recipes on our recipe page",
                    "link_text": "Browse Recipes",
                    "link_url": "/recipes"
                }
            }
        }
        
        with open(self.config_path, 'w') as f:
            json.dump(self.mock_config, f)
    
    def tearDown(self):
        """Clean up after each test."""
        import shutil
        shutil.rmtree(self.test_dir, ignore_errors=True)
    
    def test_config_loading(self):
        """Test that configuration loading works correctly."""
        # Mock the dependencies to avoid circular imports
        with patch.dict('sys.modules', {
            'backend.services.main.food_lookup_service': MagicMock(),
            'backend.services.main.substitution_service': MagicMock()
        }):
            from backend.ai_models.chatbot.food_chatbot import FoodChatbot
            
            mock_food_classifier = MagicMock()
            mock_food_lookup_service = MagicMock()
            mock_substitution_service = MagicMock()
            
            with patch('spacy.load') as mock_spacy_load:
                mock_nlp = MagicMock()
                mock_spacy_load.return_value = mock_nlp
                
                chatbot = FoodChatbot(
                    food_classifier_instance=mock_food_classifier,
                    food_lookup_service_instance=mock_food_lookup_service,
                    substitution_service_instance=mock_substitution_service,
                    config_path=self.config_path
                )
                
                # Test that config was loaded correctly
                self.assertIn("intents", chatbot.config)
                self.assertIn("greeting_keywords", chatbot.config["intents"])
                self.assertEqual(len(chatbot.config["intents"]["greeting_keywords"]), 3)
    
    def test_config_loading_missing_file(self):
        """Test configuration loading with missing file."""
        with patch.dict('sys.modules', {
            'backend.services.main.food_lookup_service': MagicMock(),
            'backend.services.main.substitution_service': MagicMock()
        }):
            from backend.ai_models.chatbot.food_chatbot import FoodChatbot
            
            mock_food_classifier = MagicMock()
            mock_food_lookup_service = MagicMock()
            mock_substitution_service = MagicMock()
            
            with patch('spacy.load') as mock_spacy_load:
                mock_spacy_load.side_effect = OSError("Model not found")
                
                chatbot = FoodChatbot(
                    food_classifier_instance=mock_food_classifier,
                    food_lookup_service_instance=mock_food_lookup_service,
                    substitution_service_instance=mock_substitution_service,
                    config_path="nonexistent_config.json"
                )
                
                # Should have default empty config
                self.assertEqual(chatbot.config, {"intents": {}, "how_to_topics": {}})
    
    def test_is_ready_method(self):
        """Test the is_ready method."""
        with patch.dict('sys.modules', {
            'backend.services.main.food_lookup_service': MagicMock(),
            'backend.services.main.substitution_service': MagicMock()
        }):
            from backend.ai_models.chatbot.food_chatbot import FoodChatbot
            
            mock_food_classifier = MagicMock()
            mock_food_classifier.is_model_loaded.return_value = True
            mock_food_lookup_service = MagicMock()
            mock_substitution_service = MagicMock()
            
            with patch('spacy.load') as mock_spacy_load:
                mock_nlp = MagicMock()
                mock_spacy_load.return_value = mock_nlp
                
                chatbot = FoodChatbot(
                    food_classifier_instance=mock_food_classifier,
                    food_lookup_service_instance=mock_food_lookup_service,
                    substitution_service_instance=mock_substitution_service,
                    config_path=self.config_path
                )
                
                # Should be ready when all components are loaded
                self.assertTrue(chatbot.is_ready())
    
    def test_is_ready_method_not_ready(self):
        """Test the is_ready method when not ready."""
        with patch.dict('sys.modules', {
            'backend.services.main.food_lookup_service': MagicMock(),
            'backend.services.main.substitution_service': MagicMock()
        }):
            from backend.ai_models.chatbot.food_chatbot import FoodChatbot
            
            mock_food_classifier = MagicMock()
            mock_food_lookup_service = MagicMock()
            mock_substitution_service = MagicMock()
            
            with patch('spacy.load') as mock_spacy_load:
                mock_spacy_load.side_effect = OSError("Model not found")
                
                chatbot = FoodChatbot(
                    food_classifier_instance=mock_food_classifier,
                    food_lookup_service_instance=mock_food_lookup_service,
                    substitution_service_instance=mock_substitution_service,
                    config_path=self.config_path
                )
                
                # Should not be ready when spaCy model fails to load
                self.assertFalse(chatbot.is_ready())


if __name__ == '__main__':
    unittest.main()