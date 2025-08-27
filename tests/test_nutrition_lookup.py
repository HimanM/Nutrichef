import unittest
import os
import sys
import tempfile
import pandas as pd
import warnings

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from backend.ai_models.nutrition_lookup.nutrition_lookup import OfflineNutritionLookup


class TestOfflineNutritionLookup(unittest.TestCase):
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.test_dir = tempfile.mkdtemp()
        
        # Create mock food.csv
        food_data = {
            'fdc_id': [1001, 1002, 1003, 1004],
            'description': ['Apple, raw', 'Banana, raw', 'Chicken breast, raw', 'Broccoli, raw'],
            'data_type': ['sr_legacy_food'] * 4,
            'publication_date': ['2019-04-01'] * 4
        }
        self.food_csv = os.path.join(self.test_dir, 'food.csv')
        pd.DataFrame(food_data).to_csv(self.food_csv, index=False)
        
        # Create mock nutrient.csv
        nutrient_data = {
            'id': [1008, 1003, 1004, 1005],
            'name': ['Energy', 'Protein', 'Total lipid (fat)', 'Carbohydrate, by difference'],
            'unit_name': ['kcal', 'g', 'g', 'g'],
            'nutrient_nbr': [208, 203, 204, 205]
        }
        self.nutrient_csv = os.path.join(self.test_dir, 'nutrient.csv')
        pd.DataFrame(nutrient_data).to_csv(self.nutrient_csv, index=False)
        
        # Create mock food_nutrient.csv
        food_nutrient_data = {
            'fdc_id': [1001, 1001, 1001, 1002, 1002, 1003, 1003],
            'nutrient_id': [1008, 1003, 1004, 1008, 1005, 1008, 1003],
            'amount': [52.0, 0.3, 0.2, 89.0, 23.0, 165.0, 31.0],
            'data_points': [10] * 7,
            'derivation_id': [49] * 7,
            'min': [''] * 7,
            'max': [''] * 7,
            'median': [''] * 7,
            'footnote': [''] * 7,
            'min_year_acquired': [2016] * 7
        }
        self.food_nutrient_csv = os.path.join(self.test_dir, 'food_nutrient.csv')
        pd.DataFrame(food_nutrient_data).to_csv(self.food_nutrient_csv, index=False)
    
    def tearDown(self):
        """Clean up after each test."""
        import shutil
        shutil.rmtree(self.test_dir, ignore_errors=True)
    
    def test_init_success(self):
        """Test successful initialization of OfflineNutritionLookup."""
        lookup = OfflineNutritionLookup(data_folder=self.test_dir)
        
        # Print asserted variables for documentation
        print(f"📊 ASSERTED VARIABLES:")
        print(f"   len(lookup.food_df) = {len(lookup.food_df)}")
        print(f"   len(lookup.nutrient_df) = {len(lookup.nutrient_df)}")
        print(f"   len(lookup.food_nutrient_df) = {len(lookup.food_nutrient_df)}")
        print(f"   'apple raw' in description_clean = {'apple raw' in lookup.food_df['description_clean'].values}")
        print(f"   'banana raw' in description_clean = {'banana raw' in lookup.food_df['description_clean'].values}")
        print(f"   description_clean values = {list(lookup.food_df['description_clean'].values)}")
        
        self.assertEqual(len(lookup.food_df), 4)
        self.assertEqual(len(lookup.nutrient_df), 4)
        self.assertGreater(len(lookup.food_nutrient_df), 0)
        
        # Check that food descriptions are cleaned
        self.assertIn('apple raw', lookup.food_df['description_clean'].values)
        self.assertIn('banana raw', lookup.food_df['description_clean'].values)
    
    def test_init_missing_files(self):
        """Test initialization with missing CSV files."""
        empty_dir = tempfile.mkdtemp()
        
        # Print asserted variables for documentation
        print(f"📊 ASSERTED VARIABLES:")
        print(f"   Expected exception: FileNotFoundError")
        print(f"   Empty directory: {empty_dir}")
        
        with self.assertRaises(FileNotFoundError):
            OfflineNutritionLookup(data_folder=empty_dir)
        
        import shutil
        shutil.rmtree(empty_dir, ignore_errors=True)
    
    def test_clean_string(self):
        """Test string cleaning functionality."""
        lookup = OfflineNutritionLookup(data_folder=self.test_dir)
        
        # Test various string cleaning scenarios
        result1 = lookup._clean_string("Apple, raw")
        result2 = lookup._clean_string("BANANA (Fresh)")
        result3 = lookup._clean_string("Chicken-breast, 123")
        result4 = lookup._clean_string("")
        result5 = lookup._clean_string(None)
        
        # Print asserted variables for documentation
        print(f"📊 ASSERTED VARIABLES:")
        print(f"   lookup._clean_string('Apple, raw') = '{result1}'")
        print(f"   Expected = 'apple raw'")
        print(f"   lookup._clean_string('BANANA (Fresh)') = '{result2}'")
        print(f"   Expected = 'banana fresh'")
        print(f"   lookup._clean_string('Chicken-breast, 123') = '{result3}'")
        print(f"   Expected = 'chickenbreast 123'")
        print(f"   lookup._clean_string('') = '{result4}'")
        print(f"   lookup._clean_string(None) = '{result5}'")
        
        self.assertEqual(result1, "apple raw")
        self.assertEqual(result2, "banana fresh")
        # The regex removes non-alphanumeric characters, so hyphens are removed
        self.assertEqual(result3, "chickenbreast 123")
        self.assertEqual(result4, "")
        self.assertEqual(result5, "")
    
    def test_match_food_exact_match(self):
        """Test exact food matching."""
        lookup = OfflineNutritionLookup(data_folder=self.test_dir)
        
        matches = lookup._match_food("apple", top_n=5)
        
        self.assertGreater(len(matches), 0)
        self.assertEqual(matches[0]['fdc_id'], 1001)
        self.assertEqual(matches[0]['description'], 'Apple, raw')
        self.assertGreater(matches[0]['score'], 80)  # Should have high score for exact match
    
    def test_match_food_partial_match(self):
        """Test partial food matching."""
        lookup = OfflineNutritionLookup(data_folder=self.test_dir)
        
        matches = lookup._match_food("chicken", top_n=5)
        
        self.assertGreater(len(matches), 0)
        # Should find chicken breast
        chicken_match = next((m for m in matches if 'chicken' in m['description'].lower()), None)
        self.assertIsNotNone(chicken_match)
        self.assertEqual(chicken_match['fdc_id'], 1003)
    
    def test_match_food_no_match(self):
        """Test food matching when no matches found."""
        lookup = OfflineNutritionLookup(data_folder=self.test_dir)
        
        matches = lookup._match_food("pizza", top_n=5)
        
        # Should return empty list for no matches
        self.assertEqual(len(matches), 0)
    
    def test_match_food_plural_singular(self):
        """Test matching with plural/singular variations."""
        lookup = OfflineNutritionLookup(data_folder=self.test_dir)
        
        # Test singular
        matches_singular = lookup._match_food("apple", top_n=5)
        
        # Test plural
        matches_plural = lookup._match_food("apples", top_n=5)
        
        # Both should find the apple entry
        self.assertGreater(len(matches_singular), 0)
        self.assertGreater(len(matches_plural), 0)
    
    def test_get_nutrition_for_food_success(self):
        """Test successful nutrition retrieval."""
        lookup = OfflineNutritionLookup(data_folder=self.test_dir)
        
        result = lookup.get_nutrition_for_food("apple")
        
        self.assertTrue(result['success'])
        self.assertIn('matched_item', result)
        self.assertIn('nutrition', result)
        
        # Check matched item details
        matched_item = result['matched_item']
        self.assertEqual(matched_item['fdc_id'], 1001)
        self.assertEqual(matched_item['description'], 'Apple, raw')
        self.assertGreater(matched_item['match_score'], 0)
        
        # Check nutrition data
        nutrition = result['nutrition']
        self.assertIn('Energy', nutrition)
        self.assertEqual(nutrition['Energy']['amount'], 52.0)
        self.assertEqual(nutrition['Energy']['unit'], 'kcal')
    
    def test_get_nutrition_for_food_not_found(self):
        """Test nutrition retrieval when food not found."""
        lookup = OfflineNutritionLookup(data_folder=self.test_dir)
        
        result = lookup.get_nutrition_for_food("pizza")
        
        self.assertFalse(result['success'])
        self.assertIn('error', result)
        self.assertIn('No food match found', result['error'])
    
    def test_get_nutrition_for_food_plural_fallback(self):
        """Test nutrition retrieval with plural/singular fallback."""
        lookup = OfflineNutritionLookup(data_folder=self.test_dir)
        
        # Test with plural form
        result = lookup.get_nutrition_for_food("apples")
        
        self.assertTrue(result['success'])
        self.assertEqual(result['matched_item']['description'], 'Apple, raw')
    
    def test_get_nutrition_empty_nutrition_data(self):
        """Test nutrition retrieval when nutrition data is empty."""
        # Create food with no nutrition data
        food_data = {
            'fdc_id': [9999],
            'description': ['Test Food'],
            'data_type': ['sr_legacy_food'],
            'publication_date': ['2019-04-01']
        }
        
        test_food_csv = os.path.join(self.test_dir, 'test_food.csv')
        pd.DataFrame(food_data).to_csv(test_food_csv, index=False)
        
        # Create empty food_nutrient data for this food
        empty_food_nutrient_data = {
            'fdc_id': [],
            'nutrient_id': [],
            'amount': [],
            'data_points': [],
            'derivation_id': [],
            'min': [],
            'max': [],
            'median': [],
            'footnote': [],
            'min_year_acquired': []
        }
        
        empty_food_nutrient_csv = os.path.join(self.test_dir, 'empty_food_nutrient.csv')
        pd.DataFrame(empty_food_nutrient_data).to_csv(empty_food_nutrient_csv, index=False)
        
        # Create a separate test directory
        empty_test_dir = tempfile.mkdtemp()
        
        # Copy nutrient.csv to new directory
        import shutil
        shutil.copy(self.nutrient_csv, os.path.join(empty_test_dir, 'nutrient.csv'))
        shutil.copy(test_food_csv, os.path.join(empty_test_dir, 'food.csv'))
        shutil.copy(empty_food_nutrient_csv, os.path.join(empty_test_dir, 'food_nutrient.csv'))
        
        lookup = OfflineNutritionLookup(data_folder=empty_test_dir)
        result = lookup.get_nutrition_for_food("Test Food")
        
        self.assertTrue(result['success'])
        self.assertIn('warning', result)
        self.assertEqual(result['nutrition'], {})
        
        shutil.rmtree(empty_test_dir, ignore_errors=True)
    
    def test_get_nutrition_private_method(self):
        """Test the private _get_nutrition method."""
        lookup = OfflineNutritionLookup(data_folder=self.test_dir)
        
        nutrition = lookup._get_nutrition(1001)  # Apple
        
        self.assertIn('Energy', nutrition)
        self.assertIn('Protein', nutrition)
        self.assertIn('Total lipid (fat)', nutrition)
        
        # Check data structure
        energy_data = nutrition['Energy']
        self.assertEqual(energy_data['amount'], 52.0)
        self.assertEqual(energy_data['unit'], 'kcal')
    
    def test_get_nutrition_nonexistent_fdc_id(self):
        """Test _get_nutrition with non-existent FDC ID."""
        lookup = OfflineNutritionLookup(data_folder=self.test_dir)
        
        nutrition = lookup._get_nutrition(99999)  # Non-existent ID
        
        self.assertEqual(nutrition, {})
    
    def test_nutrient_lookup_creation(self):
        """Test that nutrient lookup dictionary is created correctly."""
        lookup = OfflineNutritionLookup(data_folder=self.test_dir)
        
        # Check that nutrient lookup contains expected entries
        self.assertIn(1008, lookup.nutrient_lookup)  # Energy
        self.assertIn(1003, lookup.nutrient_lookup)  # Protein
        
        # Check structure of nutrient lookup
        energy_info = lookup.nutrient_lookup[1008]
        self.assertEqual(energy_info['name'], 'Energy')
        self.assertEqual(energy_info['unit_name'], 'kcal')
    
    def test_food_df_dropna_functionality(self):
        """Test that rows with NaN descriptions are dropped."""
        # Create food data with NaN description
        food_data_with_nan = {
            'fdc_id': [1001, 1002, 1003],
            'description': ['Apple, raw', None, 'Banana, raw'],
            'data_type': ['sr_legacy_food'] * 3,
            'publication_date': ['2019-04-01'] * 3
        }
        
        nan_test_dir = tempfile.mkdtemp()
        nan_food_csv = os.path.join(nan_test_dir, 'food.csv')
        pd.DataFrame(food_data_with_nan).to_csv(nan_food_csv, index=False)
        
        # Copy other required files
        import shutil
        shutil.copy(self.nutrient_csv, os.path.join(nan_test_dir, 'nutrient.csv'))
        shutil.copy(self.food_nutrient_csv, os.path.join(nan_test_dir, 'food_nutrient.csv'))
        
        lookup = OfflineNutritionLookup(data_folder=nan_test_dir)
        
        # Should only have 2 rows (NaN row dropped)
        self.assertEqual(len(lookup.food_df), 2)
        
        shutil.rmtree(nan_test_dir, ignore_errors=True)


if __name__ == '__main__':
    unittest.main()