import unittest
import os
import sys
import tempfile
import pandas as pd

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from backend.ai_models.allergy_analyzer.allergy_analyzer import AllergyAnalyzer


class TestAllergyAnalyzer(unittest.TestCase):
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.test_dir = tempfile.mkdtemp()
        self.csv_path = os.path.join(self.test_dir, "test_allergies.csv")
        
        # Create mock allergy data
        self.mock_data = {
            'Food': ['Milk', 'Eggs', 'Peanuts', 'Tree Nuts', 'Wheat'],
            'dairy': [1, 0, 0, 0, 0],
            'eggs': [0, 1, 0, 0, 0],
            'peanuts': [0, 0, 1, 0, 0],
            'tree_nuts': [0, 0, 0, 1, 0],
            'gluten': [0, 0, 0, 0, 1]
        }
        
        df = pd.DataFrame(self.mock_data)
        df.to_csv(self.csv_path, index=False)
    
    def tearDown(self):
        """Clean up after each test."""
        import shutil
        shutil.rmtree(self.test_dir, ignore_errors=True)
    
    def test_init_success(self):
        """Test successful initialization of AllergyAnalyzer."""
        analyzer = AllergyAnalyzer(csv_file_path=self.csv_path)
        
        # Print asserted variables for documentation
        print(f"📊 ASSERTED VARIABLES:")
        print(f"   len(analyzer.df) = {len(analyzer.df)}")
        print(f"   'food' in analyzer.df.columns = {'food' in analyzer.df.columns}")
        print(f"   analyzer.df.iloc[0]['food'] = '{analyzer.df.iloc[0]['food']}'")
        print(f"   analyzer.df.columns = {list(analyzer.df.columns)}")
        
        self.assertEqual(len(analyzer.df), 5)
        self.assertIn('food', analyzer.df.columns)
        self.assertEqual(analyzer.df.iloc[0]['food'], 'milk')  # Should be lowercase
    
    def test_init_missing_file(self):
        """Test initialization with missing CSV file."""
        # Print asserted variables for documentation
        print(f"📊 ASSERTED VARIABLES:")
        print(f"   Expected exception: FileNotFoundError")
        print(f"   File path: 'nonexistent.csv'")
        
        with self.assertRaises(FileNotFoundError):
            AllergyAnalyzer(csv_file_path="nonexistent.csv")
    
    def test_init_invalid_csv_no_food_column(self):
        """Test initialization with CSV missing Food column."""
        # Create CSV without Food column
        invalid_csv_path = os.path.join(self.test_dir, "invalid.csv")
        invalid_data = {
            'Item': ['Milk', 'Eggs'],
            'dairy': [1, 0]
        }
        pd.DataFrame(invalid_data).to_csv(invalid_csv_path, index=False)
        
        # Print asserted variables for documentation
        print(f"📊 ASSERTED VARIABLES:")
        print(f"   Expected exception: ValueError")
        print(f"   CSV columns: {list(invalid_data.keys())}")
        print(f"   Missing 'Food' column = True")
        
        with self.assertRaises(ValueError):
            AllergyAnalyzer(csv_file_path=invalid_csv_path)
    
    def test_get_allergies_exact_match(self):
        """Test getting allergies for exact food match."""
        analyzer = AllergyAnalyzer(csv_file_path=self.csv_path)
        
        allergies_milk = analyzer.get_allergies("Milk")
        allergies_eggs = analyzer.get_allergies("Eggs")
        
        # Print asserted variables for documentation
        print(f"📊 ASSERTED VARIABLES:")
        print(f"   analyzer.get_allergies('Milk') = {allergies_milk}")
        print(f"   Expected for Milk = ['dairy']")
        print(f"   analyzer.get_allergies('Eggs') = {allergies_eggs}")
        print(f"   Expected for Eggs = ['eggs']")
        
        self.assertEqual(allergies_milk, ['dairy'])
        self.assertEqual(allergies_eggs, ['eggs'])
    
    def test_get_allergies_case_insensitive(self):
        """Test getting allergies with case insensitive matching."""
        analyzer = AllergyAnalyzer(csv_file_path=self.csv_path)
        
        allergies_upper = analyzer.get_allergies("MILK")
        allergies_lower = analyzer.get_allergies("eggs")
        
        # Print asserted variables for documentation
        print(f"📊 ASSERTED VARIABLES:")
        print(f"   analyzer.get_allergies('MILK') = {allergies_upper}")
        print(f"   Expected for MILK = ['dairy']")
        print(f"   analyzer.get_allergies('eggs') = {allergies_lower}")
        print(f"   Expected for eggs = ['eggs']")
        
        self.assertEqual(allergies_upper, ['dairy'])
        self.assertEqual(allergies_lower, ['eggs'])
    
    def test_get_allergies_partial_match(self):
        """Test getting allergies for partial food name match."""
        analyzer = AllergyAnalyzer(csv_file_path=self.csv_path)
        
        # Should match "Peanuts" when searching for something containing "peanuts"
        allergies_peanut_butter = analyzer.get_allergies("peanuts butter")
        
        # Should match "Milk" when searching for something containing "milk"
        allergies_chocolate_milk = analyzer.get_allergies("chocolate milk")
        
        # Print asserted variables for documentation
        print(f"📊 ASSERTED VARIABLES:")
        print(f"   analyzer.get_allergies('peanuts butter') = {allergies_peanut_butter}")
        print(f"   Expected for 'peanuts butter' = ['peanuts']")
        print(f"   analyzer.get_allergies('chocolate milk') = {allergies_chocolate_milk}")
        print(f"   Expected for 'chocolate milk' = ['dairy']")
        
        self.assertEqual(allergies_peanut_butter, ['peanuts'])
        self.assertEqual(allergies_chocolate_milk, ['dairy'])
    
    def test_get_allergies_no_match(self):
        """Test getting allergies when no food matches."""
        analyzer = AllergyAnalyzer(csv_file_path=self.csv_path)
        
        allergies = analyzer.get_allergies("chocolate")
        
        # Print asserted variables for documentation
        print(f"📊 ASSERTED VARIABLES:")
        print(f"   analyzer.get_allergies('chocolate') = {allergies}")
        print(f"   Expected for 'chocolate' = []")
        
        self.assertEqual(allergies, [])
        self.assertEqual(allergies, [])
    
    def test_get_allergies_multiple_allergens(self):
        """Test getting multiple allergens for a single food."""
        # Create a food with multiple allergens
        multi_allergy_csv = os.path.join(self.test_dir, "multi_allergy.csv")
        multi_data = {
            'Food': ['Milk Chocolate'],
            'dairy': [1],
            'soy': [1],
            'nuts': [0]
        }
        pd.DataFrame(multi_data).to_csv(multi_allergy_csv, index=False)
        
        analyzer = AllergyAnalyzer(csv_file_path=multi_allergy_csv)
        allergies = analyzer.get_allergies("Milk Chocolate")
        
        # Print asserted variables for documentation
        print(f"📊 ASSERTED VARIABLES:")
        print(f"   analyzer.get_allergies('Milk Chocolate') = {allergies}")
        print(f"   set(allergies) = {set(allergies)}")
        print(f"   Expected set = {{'dairy', 'soy'}}")
        
        # Should return both allergens, order doesn't matter
        self.assertEqual(set(allergies), {'dairy', 'soy'})
    
    def test_get_allergies_duplicate_removal(self):
        """Test that duplicate allergens are removed."""
        # Create CSV with duplicate food entries
        duplicate_csv = os.path.join(self.test_dir, "duplicate.csv")
        duplicate_data = {
            'Food': ['Milk', 'Milk'],  # Duplicate entries
            'dairy': [1, 1],
            'lactose': [1, 1]
        }
        pd.DataFrame(duplicate_data).to_csv(duplicate_csv, index=False)
        
        analyzer = AllergyAnalyzer(csv_file_path=duplicate_csv)
        allergies = analyzer.get_allergies("Milk")
        
        # Print asserted variables for documentation
        print(f"📊 ASSERTED VARIABLES:")
        print(f"   analyzer.get_allergies('Milk') = {allergies}")
        print(f"   len(allergies) = {len(allergies)}")
        print(f"   len(set(allergies)) = {len(set(allergies))}")
        print(f"   set(allergies) = {set(allergies)}")
        print(f"   Expected set = {{'dairy', 'lactose'}}")
        
        # Should not have duplicates
        self.assertEqual(len(allergies), len(set(allergies)))
        self.assertEqual(set(allergies), {'dairy', 'lactose'})
    
    def test_column_name_normalization(self):
        """Test that column names are properly normalized."""
        # Create CSV with spaces and mixed case in column names
        normalized_csv = os.path.join(self.test_dir, "normalized.csv")
        normalized_data = {
            'Food': ['Test Food'],
            'Tree Nuts': [1],  # Should become 'tree_nuts'
            'Dairy Products': [1]  # Should become 'dairy_products'
        }
        pd.DataFrame(normalized_data).to_csv(normalized_csv, index=False)
        
        analyzer = AllergyAnalyzer(csv_file_path=normalized_csv)
        allergies = analyzer.get_allergies("Test Food")
        
        # Print asserted variables for documentation
        print(f"📊 ASSERTED VARIABLES:")
        print(f"   analyzer.df.columns = {list(analyzer.df.columns)}")
        print(f"   set(analyzer.df.columns) = {set(analyzer.df.columns)}")
        print(f"   Expected columns = {{'food', 'tree_nuts', 'dairy_products'}}")
        print(f"   analyzer.get_allergies('Test Food') = {allergies}")
        print(f"   set(allergies) = {set(allergies)}")
        print(f"   Expected allergies = {{'tree nuts', 'dairy products'}}")
        
        # Check that columns were normalized
        expected_columns = {'food', 'tree_nuts', 'dairy_products'}
        self.assertEqual(set(analyzer.df.columns), expected_columns)
        self.assertEqual(set(allergies), {'tree nuts', 'dairy products'})


if __name__ == '__main__':
    unittest.main()