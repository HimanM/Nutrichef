import pandas as pd
import os

class AllergyAnalyzer:
    def __init__(self, csv_file_path=None):
        if csv_file_path is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            csv_file_path = os.path.join(base_dir, 'allergies_processed.csv')

        if not os.path.exists(csv_file_path):
            raise FileNotFoundError(f"Allergy data file not found: {csv_file_path}")

        try:
            self.df = pd.read_csv(csv_file_path)
            self.df['Food'] = self.df['Food'].str.lower()
            self.df.columns = [col.lower().replace(' ', '_') for col in self.df.columns]
            if 'food' not in self.df.columns:
                raise ValueError("CSV must contain a 'Food' column.")
        except Exception as e:
            raise ValueError(f"Error loading or processing allergy CSV: {e}")

    def get_allergies(self, ingredient_name):
        ingredient_name_lower = ingredient_name.lower()
        
        self.df.columns = [col.lower() for col in self.df.columns]
        allergy_columns = [col for col in self.df.columns if col != 'food']

        allergies = []

        for index, row in self.df.iterrows():
            food_name = row['food'].lower()
            if food_name in ingredient_name_lower:
                for allergen in allergy_columns:
                    if row[allergen] == 1:
                        formatted_allergen = allergen.replace('_', ' ')
                        allergies.append(formatted_allergen)

        return list(set(allergies))


