import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
import json

class GeminiNlpParser:
    def __init__(self):
        dotenv_path = os.path.join(os.path.dirname(__file__), '../../.env')

        if os.path.exists(dotenv_path):
            load_dotenv(dotenv_path=dotenv_path)
        else:
            print(f"Warning: .env file not found at {dotenv_path}. Attempting to load from current working directory or other default locations.")
            load_dotenv()

        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            print("Warning: GEMINI_API_KEY not found in environment variables.")

    def parse_recipe(self, recipe_text: str):
        if not self.api_key:
            print("ERROR in GeminiNlpParser: GEMINI_API_KEY not found or not loaded.")
            print("Please ensure GEMINI_API_KEY is set in backend/ai_models/gemini_nlp/.env")
            return {"error": "API key not configured", "Title": "Error: API Key Missing", "Ingredients": [], "Instructions": []}

        try:
            client = genai.Client(api_key=self.api_key)
            model_name = "gemini-1.5-flash-8b"
            system_instruction_text = '''When user uploads a text that potentially contains a recipe, extract infotmation and  parse them into the given sample json format. nothing can be a NULL value.
                {
                "Title": "My Test Recipe (JSON)",
                "Description": "A delicious recipe submitted as JSON.",
                "Instructions": [
                    "Step 1: Mix ingredients.",
                    "Step 2: Bake at 200C for 20 minutes."
                ],
                "PreparationTimeMinutes": 10,
                "CookingTimeMinutes": 20,
                "Servings": 4,
                "Ingredients": [
                    {
                    "Ingredient": "Milk",
                    "Unit": "tbsp",
                    "Quantity": "1"
                    },
                    {
                    "Ingredient": "Flour",
                    "Unit": "cup",
                    "Quantity": "2"
                    },
                    {
                    "Ingredient": "Peanuts",
                    "Unit": "g",
                    "Quantity": "100"
                    }
                ]
                }
                
                if cannot extract a recipe in the text return 
                {"error":"not-a-recipe"}'''
            current_contents = [
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_text(text=recipe_text),
                    ],
                ),
            ]
            generation_config_obj = types.GenerateContentConfig(
                temperature=0.2,
                response_mime_type="application/json",
                system_instruction=[
                    types.Part.from_text(text=system_instruction_text),
                ],
            )
            full_response_text = ""
            stream = client.models.generate_content_stream(
                model=model_name,
                contents=current_contents,
                config=generation_config_obj,
            )
            for chunk in stream:
                if chunk.text:
                    full_response_text += chunk.text
            if not full_response_text.strip():
                print("Error in GeminiNlpParser: Received empty response stream from Gemini API.")
                return {"error": "Empty API response stream", "Title": "Error: Empty Response", "Ingredients": [], "Instructions": []}
            try:
                recipe_data = json.loads(full_response_text)
                return recipe_data
            except json.JSONDecodeError as e:
                print(f"Error in GeminiNlpParser: Failed to decode JSON response from Gemini API: {e}")
                print(f"Full (potentially large) response text was:{full_response_text[:1000]}...")
                return {"error": f"Invalid JSON response: {e.msg}", "Title": "Error: JSON Decode Failed", "Ingredients": [], "Instructions": []}
        except Exception as e:
            print(f"An error occurred in GeminiNlpParser.parse_recipe: {e}")
            return {"error": str(e), "Title": "Error: API Call Failed", "Ingredients": [], "Instructions": []}

    def extract_recipe_nutrition(self, recipe_data: dict):
        """
        Extract nutritional information for a recipe based on its ingredients.
        Uses Gemini to analyze the recipe and provide nutritional estimates.
        """
        if not self.api_key:
            print("ERROR in GeminiNlpParser: GEMINI_API_KEY not found or not loaded.")
            return {"error": "API key not configured", "success": False}

        try:
            # Prepare the recipe information for analysis
            recipe_info = {
                "title": recipe_data.get("Title", ""),
                "ingredients": recipe_data.get("Ingredients", []),
                "servings": recipe_data.get("Servings", 1)
            }

            # Create a detailed prompt for nutrition analysis
            nutrition_prompt = f"""
            Analyze the following recipe and provide nutritional information per serving.
            Ingredients with quantity and Units are given in a JSON format.

                Recipe Title: {recipe_info['title']}
                Servings: {recipe_info['servings']}
                Ingredients:
                {json.dumps(recipe_info['ingredients'], indent=2)}
            
            After analyzing above information about the recipe deeply, considering all the ingredients and quantities,
            Please provide nutritional information in the following JSON format (Add other nutrients if you can but these are the most important):


            {{
                "success": true,
                "nutrition": {{
                    "calories": {{"amount": 300, "unit": "kcal"}},
                    "protein": {{"amount": 15, "unit": "g"}},
                    "carbohydrates": {{"amount": 45, "unit": "g"}},
                    "fat": {{"amount": 10, "unit": "g"}},
                    "fiber": {{"amount": 5, "unit": "g"}},
                    "sugar": {{"amount": 8, "unit": "g"}},
                    "sodium": {{"amount": 500, "unit": "mg"}},
                    "cholesterol": {{"amount": 50, "unit": "mg"}}
                }},
                "per_serving": true,
                "notes": "Nutritional values are estimates based on typical ingredient values"
            }}
            
            Try to provide above information (assume quantity if needed) worst case scenario, if you really cannot provide accurate nutritional information, return:


            {{
                "success": false,
                "error": "Unable to calculate nutritional information for this recipe: <reason>"
            }}
            
            Always Focus on providing realistic estimates based on the ingredients listed rather than returning the false success message.
            if really need to return false success message replace the <reason> with the proper reason within 20 words (ex: nutritional values differ with brands)
            """


            client = genai.Client(api_key=self.api_key)
            model_name = "gemini-1.5-flash-8b"
            # print(nutrition_prompt)
            
            current_contents = [
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_text(text=nutrition_prompt),
                    ],
                ),
            ]
            
            generation_config_obj = types.GenerateContentConfig(
                temperature=0.1,
                response_mime_type="application/json",
            )
            
            full_response_text = ""
            stream = client.models.generate_content_stream(
                model=model_name,
                contents=current_contents,
                config=generation_config_obj,
            )
            
            for chunk in stream:
                if chunk.text:
                    full_response_text += chunk.text
                
            if not full_response_text.strip():
                return {"error": "Empty API response stream", "success": False}
                
            try:
                nutrition_data = json.loads(full_response_text)
                return nutrition_data
            except json.JSONDecodeError as e:
                print(f"Error in GeminiNlpParser: Failed to decode nutrition JSON response: {e}")
                return {"error": f"Invalid JSON response: {e.msg}", "success": False}
                
        except Exception as e:
            print(f"An error occurred in GeminiNlpParser.extract_recipe_nutrition: {e}")
            return {"error": str(e), "success": False}

    def extract_recipe_tags(self, recipe_data: dict):
        """
        Extract relevant tags for a recipe based on its content.
        Uses Gemini to analyze the recipe and suggest appropriate tags.
        """
        if not self.api_key:
            print("ERROR in GeminiNlpParser: GEMINI_API_KEY not found or not loaded.")
            return {"error": "API key not configured", "success": False}

        try:
            # Prepare the recipe information for analysis
            recipe_info = {
                "title": recipe_data.get("Title", ""),
                "description": recipe_data.get("Description", ""),
                "ingredients": recipe_data.get("Ingredients", []),
                "instructions": recipe_data.get("Instructions", []),
                "prep_time": recipe_data.get("PreparationTimeMinutes", 0),
                "cook_time": recipe_data.get("CookingTimeMinutes", 0)
            }

            # Create a detailed prompt for tag extraction
            tags_prompt = f"""
            Analyze the following recipe and suggest appropriate tags from the predefined categories.
            
            Recipe Title: {recipe_info['title']}
            Description: {recipe_info['description']}
            Preparation Time: {recipe_info['prep_time']} minutes
            Cooking Time: {recipe_info['cook_time']} minutes
            Ingredients: {json.dumps(recipe_info['ingredients'], indent=2)}
            Instructions: {recipe_info['instructions']}
            
            Available tag categories and examples:
            - cuisine: Italian, Asian, Mexican, Indian, Mediterranean, American, French, Chinese, Japanese, Thai
            - diet: Vegetarian, Vegan, Gluten-Free, Low-Carb, Keto, Paleo, Dairy-Free, Sugar-Free, High-Protein
            - course: Breakfast, Lunch, Dinner, Dessert, Snack, Appetizer, Side Dish
            - difficulty: Beginner (under 30 min, simple steps), Intermediate (30-60 min), Advanced (over 60 min, complex)
            - general: Healthy, Comfort Food, Quick & Easy, One-Pot, Baking, Grilling, Family-Friendly, Holiday, Seasonal
            
            Rules for tag suggestion:
            - Suggest 3-6 most relevant tags
            - Prioritize accuracy over quantity
            - Consider ingredients, cooking method, and cultural origin
            - Quick & Easy = prep + cook time under 30 minutes
            - Healthy = low in processed ingredients, includes vegetables/fruits
            - Analyze ingredient names to determine cuisine type
            - Look for dietary restrictions based on ingredients
            
            Return in JSON format:
            {{
                "success": true,
                "tags": ["tag1", "tag2", "tag3"],
                "reasoning": "Brief explanation of why these tags were chosen"
            }}
            
            If you cannot determine appropriate tags, return:
            {{
                "success": false,
                "error": "Unable to determine appropriate tags for this recipe"
            }}
            """

            client = genai.Client(api_key=self.api_key)
            model_name = "gemini-1.5-flash-8b"
            
            current_contents = [
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_text(text=tags_prompt),
                    ],
                ),
            ]
            
            generation_config_obj = types.GenerateContentConfig(
                temperature=0.1,
                response_mime_type="application/json",
            )
            
            full_response_text = ""
            stream = client.models.generate_content_stream(
                model=model_name,
                contents=current_contents,
                config=generation_config_obj,
            )
            
            for chunk in stream:
                if chunk.text:
                    full_response_text += chunk.text
                
            if not full_response_text.strip():
                return {"error": "Empty API response stream", "success": False}
                
            try:
                tags_data = json.loads(full_response_text)
                return tags_data
            except json.JSONDecodeError as e:
                print(f"Error in GeminiNlpParser: Failed to decode tags JSON response: {e}")
                return {"error": f"Invalid JSON response: {e.msg}", "success": False}
                
        except Exception as e:
            print(f"An error occurred in GeminiNlpParser.extract_recipe_tags: {e}")
            return {"error": str(e), "success": False}
