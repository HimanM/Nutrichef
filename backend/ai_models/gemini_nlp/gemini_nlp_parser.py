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
        else:
            print("GEMINI_API_KEY loaded successfully.")

    def parse_recipe(self, recipe_text: str):
            if not self.api_key:
                print("ERROR in GeminiNlpParser: GEMINI_API_KEY not found or not loaded.")
                print("Please ensure GEMINI_API_KEY is set in backend/ai_models/gemini_nlp/.env")
                return {"error": "API key not configured", "Title": "Error: API Key Missing", "Ingredients": [], "Instructions": []}

            try:
                client = genai.Client(api_key=self.api_key)
                model_name = "gemini-1.5-flash-8b"
                system_instruction_text = '''When user uploads a recipe parse them into the given sample json format. nothing can be a NULL value.
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
                    
                    if not a recipe return 
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
