import csv
import json
import os

class NutritionDatabase:
    def __init__(self, csv_path = os.path.join(os.path.dirname(__file__), 'Data', 'FOOD-DATA.csv')):
        self.food_data = {}
        self.name_lookup = {}
        self.load_data(csv_path)
        self.unit_map = self._build_unit_map()

    def _build_unit_map(self):
        return {
            "Caloric Value": "kcal",
            "Fat": "g",
            "Saturated Fats": "g",
            "Monounsaturated Fats": "g",
            "Polyunsaturated Fats": "g",
            "Carbohydrates": "g",
            "Sugars": "g",
            "Protein": "g",
            "Dietary Fiber": "g",
            "Cholesterol": "mg",
            "Sodium": "g",
            "Water": "g",
            "Vitamin A": "mg",
            "Vitamin B1": "mg",
            "Vitamin B11": "mg",
            "Vitamin B12": "mg",
            "Vitamin B2": "mg",
            "Vitamin B3": "mg",
            "Vitamin B5": "mg",
            "Vitamin B6": "mg",
            "Vitamin C": "mg",
            "Vitamin D": "mg",
            "Vitamin E": "mg",
            "Vitamin K": "mg",
            "Calcium": "mg",
            "Copper": "mg",
            "Iron": "mg",
            "Magnesium": "mg",
            "Manganese": "mg",
            "Phosphorus": "mg",
            "Potassium": "mg",
            "Selenium": "mg",
            "Zinc": "mg",
            "Nutrition Density": ""
        }

    def load_data(self, path):
        with open(path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                original_name = row['food'].strip()
                key = original_name.lower()
                self.food_data[original_name] = {
                    k: self._parse_value(v) for k, v in row.items() if k != 'food'
                }
                self.name_lookup[key] = original_name

    def _parse_value(self, val):
        try:
            number = float(val)
            return number if number >= 0 else None
        except ValueError:
            return None

    def find_matches(self, query):
        normalized = query.strip().lower()
        candidates = [normalized]
        if normalized.endswith('s'):
            candidates.append(normalized[:-1])
        else:
            candidates.append(normalized + 's')

        for name in candidates:
            if name in self.name_lookup:
                return [self.name_lookup[name]]

        matches = [
            original_name for original_name in self.food_data
            if any(term in original_name.lower() for term in candidates)
        ]
        return matches

    def get_food_info(self, query):
        matches = self.find_matches(query)
        if len(matches) == 1:
            return self._format_food_json(matches[0])
        elif len(matches) > 1:
            return json.dumps({
                "matches": matches,
                "message": "Multiple matches found. Please select one."
            }, indent=2)
        else:
            return json.dumps({"error": "Food not found"}, indent=2)

    def get_food_by_exact_name(self, food_name):
        if food_name in self.food_data:
            return self._format_food_json(food_name)
        else:
            return json.dumps({"error": "Exact food name not found"}, indent=2)

    def _format_food_json(self, food_name):
        raw_data = self.food_data[food_name]
        formatted_data = {}

        for k, v in raw_data.items():
            if v is not None:
                unit = self.unit_map.get(k, "")
                formatted_data[k] = {
                    "value": v,
                    "unit": unit
                }

        return json.dumps({
            "food": food_name,
            "data": formatted_data
        }, indent=2)