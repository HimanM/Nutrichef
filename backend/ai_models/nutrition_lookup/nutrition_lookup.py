import os
import pandas as pd
from rapidfuzz import process
import json
import re
import warnings

class OfflineNutritionLookup:
    def __init__(self, data_folder):
        # Suppress pandas DtypeWarnings for this specific case
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", category=pd.errors.DtypeWarning)
            
            # Build full paths
            food_csv = os.path.join(data_folder, "food.csv")
            nutrient_csv = os.path.join(data_folder, "nutrient.csv")
            food_nutrient_csv = os.path.join(data_folder, "food_nutrient.csv")

            self.food_df = pd.read_csv(food_csv)
            self.food_df = self.food_df.dropna(subset=['description'])
            self.nutrient_df = pd.read_csv(nutrient_csv)
            
            # Define dtype for mixed columns to avoid warning
            food_nutrient_dtypes = {
                'footnote': 'str',  # Column 9 has mixed types, force to string
                'min': 'str',       # These columns may have empty strings
                'max': 'str',
                'median': 'str'
            }
            self.food_nutrient_df = pd.read_csv(food_nutrient_csv, dtype=food_nutrient_dtypes, low_memory=False)

        self.food_df['description_clean'] = self.food_df['description'].apply(self._clean_string)
        self.nutrient_lookup = self.nutrient_df.set_index('id')[['name', 'unit_name']].to_dict('index')

    def _clean_string(self, text):
        if not isinstance(text, str):
            text = ''
        return re.sub(r'[^a-z0-9\s]', '', text.lower().strip())

    def _match_food(self, food_name, top_n=10):
        query_clean = self._clean_string(food_name)
        choices = self.food_df['description_clean'].tolist()
        matches = process.extract(query_clean, choices, limit=top_n)

        results = []
        for match_clean, score, index in matches:
            row = self.food_df.iloc[index]

            base_word = query_clean.rstrip('s')
            query_pattern = r'\b' + re.escape(base_word) + r's?\b'
            if not re.search(query_pattern, row['description_clean']):
                continue

            results.append({
                'fdc_id': int(row['fdc_id']),
                'description': row['description'],
                'score': float(score)
            })

        return sorted(results, key=lambda x: x['score'], reverse=True)

    def get_nutrition_for_food(self, food_name):
        matches = self._match_food(food_name)

        if not matches:
            if food_name.lower().endswith('s'):
                alt_food_name = food_name[:-1]
            else:
                alt_food_name = food_name + 's'
            matches = self._match_food(alt_food_name)
        else:
            alt_food_name = None

        if not matches:
            return {'success': False, 'error': f"No food match found for '{food_name}'"}

        top = matches[0]
        nutrition = self._get_nutrition(top['fdc_id'])

        result = {
            'success': True,
            'matched_item': {
                'description': top['description'],
                'fdc_id': int(top['fdc_id']),
                'match_score': round(float(top['score']), 2)
            },
            'nutrition': nutrition
        }

        if not nutrition:
            result['warning'] = 'Nutrition data not available for this item.'

        return result

    def _get_nutrition(self, fdc_id):
        nutrients = self.food_nutrient_df[self.food_nutrient_df['fdc_id'] == fdc_id]
        nutrition = {}
        for _, row in nutrients.iterrows():
            nutrient_id = row['nutrient_id']
            if nutrient_id in self.nutrient_lookup:
                nutrient_info = self.nutrient_lookup[nutrient_id]
                nutrition[nutrient_info['name']] = {
                    'amount': float(row['amount']),
                    'unit': nutrient_info['unit_name']
                }
        return nutrition
