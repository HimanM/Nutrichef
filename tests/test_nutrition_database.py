import unittest
import os
import sys
import tempfile
import json

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from backend.ai_models.food_data.nutrition_database import NutritionDatabase


class TestNutritionDatabase(unittest.TestCase):
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.test_dir = tempfile.mkdtemp()
        self.csv_path = os.path.join(self.test_dir, "test_food_data.csv")
        
        # Create mock nutrition data CSV
        csv_content = """food,Caloric Value,Fat,Saturated Fats,Protein,Carbohydrates,Dietary Fiber,Sugars,Sodium,Vitamin C
Apple,52,0.2,0.1,0.3,14,2.4,10,1,4.6
Banana,89,0.3,0.1,1.1,23,2.6,12,1,8.7
Chicken Breast,165,3.6,1.0,31,0,0,0,74,0
Broccoli,34,0.4,0.1,2.8,7,2.6,1.5,33,89.2
Salmon,208,12.4,3.1,22.1,0,0,0,59,0"""
        
        with open(self.csv_path, 'w') as f:
            f.write(csv_content)
    
    def tearDown(self):
        """Clean up after each test."""
        import shutil
        shutil.rmtree(self.test_dir, ignore_errors=True)
    
    def test_init_success(self):
        """Test successful initialization of NutritionDatabase."""
        db = NutritionDatabase(csv_path=self.csv_path)
        
        # Print asserted variables for documentation
        print(f"📊 ASSERTED VARIABLES:")
        print(f"   len(db.food_data) = {len(db.food_data)}")
        print(f"   'Apple' in db.food_data = {'Apple' in db.food_data}")
        print(f"   'apple' in db.name_lookup = {'apple' in db.name_lookup}")
        print(f"   db.name_lookup['apple'] = '{db.name_lookup['apple']}'")
        print(f"   db.food_data.keys() = {list(db.food_data.keys())}")
        
        self.assertEqual(len(db.food_data), 5)
        self.assertIn('Apple', db.food_data)
        self.assertIn('apple', db.name_lookup)
        self.assertEqual(db.name_lookup['apple'], 'Apple')
    
    def test_init_missing_file(self):
        """Test initialization with missing CSV file."""
        # Print asserted variables for documentation
        print(f"📊 ASSERTED VARIABLES:")
        print(f"   Expected exception: FileNotFoundError")
        print(f"   File path: 'nonexistent.csv'")
        
        with self.assertRaises(FileNotFoundError):
            NutritionDatabase(csv_path="nonexistent.csv")
    
    def test_parse_value_valid_numbers(self):
        """Test parsing valid numeric values."""
        db = NutritionDatabase(csv_path=self.csv_path)
        
        val1 = db._parse_value("52")
        val2 = db._parse_value("0.2")
        val3 = db._parse_value("0")
        
        # Print asserted variables for documentation
        print(f"📊 ASSERTED VARIABLES:")
        print(f"   db._parse_value('52') = {val1}")
        print(f"   Expected = 52.0")
        print(f"   db._parse_value('0.2') = {val2}")
        print(f"   Expected = 0.2")
        print(f"   db._parse_value('0') = {val3}")
        print(f"   Expected = 0.0")
        
        self.assertEqual(val1, 52.0)
        self.assertEqual(val2, 0.2)
        self.assertEqual(val3, 0.0)
    
    def test_parse_value_invalid_numbers(self):
        """Test parsing invalid numeric values."""
        db = NutritionDatabase(csv_path=self.csv_path)
        
        val1 = db._parse_value("invalid")
        val2 = db._parse_value("")
        val3 = db._parse_value("-5")
        
        # Print asserted variables for documentation
        print(f"📊 ASSERTED VARIABLES:")
        print(f"   db._parse_value('invalid') = {val1}")
        print(f"   Expected = None")
        print(f"   db._parse_value('') = {val2}")
        print(f"   Expected = None")
        print(f"   db._parse_value('-5') = {val3}")
        print(f"   Expected = None (negative values rejected)")
        
        self.assertIsNone(val1)
        self.assertIsNone(val2)
        self.assertIsNone(val3)  # Negative values should return None
    
    def test_find_matches_exact_match(self):
        """Test finding exact matches."""
        db = NutritionDatabase(csv_path=self.csv_path)
        
        matches1 = db.find_matches("Apple")
        matches2 = db.find_matches("apple")  # Case insensitive
        
        # Print asserted variables for documentation
        print(f"📊 ASSERTED VARIABLES:")
        print(f"   db.find_matches('Apple') = {matches1}")
        print(f"   Expected = ['Apple']")
        print(f"   db.find_matches('apple') = {matches2}")
        print(f"   Expected = ['Apple'] (case insensitive)")
        
        self.assertEqual(matches1, ['Apple'])
        self.assertEqual(matches2, ['Apple'])
    
    def test_find_matches_plural_singular(self):
        """Test finding matches with plural/singular variations."""
        db = NutritionDatabase(csv_path=self.csv_path)
        
        # Test singular to plural
        matches = db.find_matches("apples")
        self.assertEqual(matches, ['Apple'])
        
        # Test plural to singular (if we had "Apples" in data)
        matches = db.find_matches("apple")
        self.assertEqual(matches, ['Apple'])
    
    def test_find_matches_partial_match(self):
        """Test finding partial matches."""
        db = NutritionDatabase(csv_path=self.csv_path)
        
        matches = db.find_matches("chicken")
        self.assertEqual(matches, ['Chicken Breast'])
        
        matches = db.find_matches("breast")
        self.assertEqual(matches, ['Chicken Breast'])
    
    def test_find_matches_no_match(self):
        """Test finding matches when no food matches."""
        db = NutritionDatabase(csv_path=self.csv_path)
        
        matches = db.find_matches("pizza")
        self.assertEqual(matches, [])
    
    def test_find_matches_multiple_matches(self):
        """Test finding multiple matches."""
        # Add more test data with similar names
        csv_content = """food,Caloric Value,Fat,Protein
Apple Juice,46,0.1,0.1
Apple Pie,237,11,2.4
Green Apple,52,0.2,0.3"""
        
        multi_csv_path = os.path.join(self.test_dir, "multi_food_data.csv")
        with open(multi_csv_path, 'w') as f:
            f.write(csv_content)
        
        db = NutritionDatabase(csv_path=multi_csv_path)
        matches = db.find_matches("apple")  # No exact "apple" match, so should return partial matches
        
        self.assertEqual(len(matches), 3)
        self.assertIn('Apple Juice', matches)
        self.assertIn('Apple Pie', matches)
        self.assertIn('Green Apple', matches)
    
    def test_get_food_info_single_match(self):
        """Test getting food info for single match."""
        db = NutritionDatabase(csv_path=self.csv_path)
        
        result = db.get_food_info("Apple")
        result_data = json.loads(result)
        
        self.assertEqual(result_data['food'], 'Apple')
        self.assertIn('data', result_data)
        self.assertIn('Caloric Value', result_data['data'])
        self.assertEqual(result_data['data']['Caloric Value']['value'], 52.0)
        self.assertEqual(result_data['data']['Caloric Value']['unit'], 'kcal')
    
    def test_get_food_info_multiple_matches(self):
        """Test getting food info for multiple matches."""
        # Add more test data with similar names (no exact "apple" match)
        csv_content = """food,Caloric Value,Fat,Protein
Apple Juice,46,0.1,0.1
Apple Pie,237,11,2.4"""
        
        multi_csv_path = os.path.join(self.test_dir, "multi_food_data.csv")
        with open(multi_csv_path, 'w') as f:
            f.write(csv_content)
        
        db = NutritionDatabase(csv_path=multi_csv_path)
        result = db.get_food_info("apple")  # No exact match, should return multiple matches
        result_data = json.loads(result)
        
        self.assertIn('matches', result_data)
        self.assertIn('message', result_data)
        self.assertEqual(len(result_data['matches']), 2)
    
    def test_get_food_info_no_match(self):
        """Test getting food info when no matches found."""
        db = NutritionDatabase(csv_path=self.csv_path)
        
        result = db.get_food_info("pizza")
        result_data = json.loads(result)
        
        self.assertIn('error', result_data)
        self.assertEqual(result_data['error'], 'Food not found')
    
    def test_get_food_by_exact_name_success(self):
        """Test getting food by exact name."""
        db = NutritionDatabase(csv_path=self.csv_path)
        
        result = db.get_food_by_exact_name("Apple")
        result_data = json.loads(result)
        
        self.assertEqual(result_data['food'], 'Apple')
        self.assertIn('data', result_data)
    
    def test_get_food_by_exact_name_not_found(self):
        """Test getting food by exact name when not found."""
        db = NutritionDatabase(csv_path=self.csv_path)
        
        result = db.get_food_by_exact_name("Pizza")
        result_data = json.loads(result)
        
        self.assertIn('error', result_data)
        self.assertEqual(result_data['error'], 'Exact food name not found')
    
    def test_format_food_json_with_units(self):
        """Test JSON formatting includes proper units."""
        db = NutritionDatabase(csv_path=self.csv_path)
        
        result = db._format_food_json("Apple")
        result_data = json.loads(result)
        
        # Check that units are properly assigned
        self.assertEqual(result_data['data']['Caloric Value']['unit'], 'kcal')
        self.assertEqual(result_data['data']['Fat']['unit'], 'g')
        self.assertEqual(result_data['data']['Protein']['unit'], 'g')
        self.assertEqual(result_data['data']['Sodium']['unit'], 'g')
        self.assertEqual(result_data['data']['Vitamin C']['unit'], 'mg')
    
    def test_format_food_json_excludes_none_values(self):
        """Test that None values are excluded from JSON output."""
        # Create CSV with some invalid values
        csv_content = """food,Caloric Value,Fat,Invalid Column
Test Food,52,invalid_value,"""
        
        invalid_csv_path = os.path.join(self.test_dir, "invalid_food_data.csv")
        with open(invalid_csv_path, 'w') as f:
            f.write(csv_content)
        
        db = NutritionDatabase(csv_path=invalid_csv_path)
        result = db._format_food_json("Test Food")
        result_data = json.loads(result)
        
        # Should only include valid values
        self.assertIn('Caloric Value', result_data['data'])
        self.assertNotIn('Fat', result_data['data'])  # Invalid value should be excluded
        self.assertNotIn('Invalid Column', result_data['data'])  # Empty value should be excluded


if __name__ == '__main__':
    unittest.main()