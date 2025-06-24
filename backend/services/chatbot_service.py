import os
import tempfile
import uuid
from werkzeug.utils import secure_filename

from backend.ai_models.chatbot.food_chatbot import FoodChatbot
from backend.ai_models.food_classification.food_classifier import FoodClassifier
from backend.services.food_lookup_service import FoodLookupService
from backend.services.substitution_service import SubstitutionService


class ChatbotService:
    def __init__(self, static_tmp_folder='static/tmp'):
        """
        Initializes the ChatbotService.
        It instantiates FoodChatbot and its dependencies.

        Args:
            static_tmp_folder (str): Path to the temporary folder for uploaded images.
        """
        print("ChatbotService: Initializing dependencies...")
        try:
            food_classifier = FoodClassifier()
            print("ChatbotService: FoodClassifier instantiated.")
        except Exception as e:
            print(f"ChatbotService: ERROR - Failed to instantiate FoodClassifier: {e}")
            food_classifier = None

        try:
            food_lookup_service = FoodLookupService.get_instance()
            print("ChatbotService: FoodLookupService instance obtained.")
        except Exception as e:
            print(f"ChatbotService: ERROR - Failed to get FoodLookupService instance: {e}")
            food_lookup_service = None

        try:
            substitution_service = SubstitutionService()
            print("ChatbotService: SubstitutionService instantiated.")
        except Exception as e:
            print(f"ChatbotService: ERROR - Failed to instantiate SubstitutionService: {e}")
            substitution_service = None

        print("ChatbotService: Initializing FoodChatbot with dependencies...")
        self.chatbot_instance = FoodChatbot(
            food_classifier_instance=food_classifier,
            food_lookup_service_instance=food_lookup_service,
            substitution_service_instance=substitution_service
        )

        self.temp_image_folder = os.path.abspath(static_tmp_folder)
        if not os.path.exists(self.temp_image_folder):
            os.makedirs(self.temp_image_folder, exist_ok=True)
            print(f"ChatbotService: Created temp image folder: {self.temp_image_folder}")
        else:
            print(f"ChatbotService: Using existing temp image folder: {self.temp_image_folder}")

        if self.chatbot_instance.is_ready():
            print("ChatbotService: FoodChatbot instance is ready and configured.")
        else:
            print("ChatbotService: WARNING - FoodChatbot instance reported not ready after initialization. Functionality may be limited.")

    def is_chatbot_ready(self):
        return self.chatbot_instance and self.chatbot_instance.is_ready()

    def process_user_query(self, text_query, image_file_storage=None):
        """
        Processes a user's query, potentially including an image.

        Args:
            text_query (str): The text part of the user's query.
            image_file_storage (FileStorage, optional): An image file uploaded by the user
                                                       (e.g., from a Flask request.files).

        Returns:
            dict: A dictionary containing the chatbot's response.
        """
        if not self.chatbot_instance.is_ready():
            return {"error": "Chatbot is not fully operational at the moment. Please try again later."}

        image_path = None
        temp_file_to_delete = None

        if image_file_storage and image_file_storage.filename:
            try:
                filename = secure_filename(image_file_storage.filename)
                unique_filename = str(uuid.uuid4()) + "_" + filename
                image_path = os.path.join(self.temp_image_folder, unique_filename)

                image_file_storage.save(image_path)
                temp_file_to_delete = image_path
                print(f"ChatbotService: Image saved temporarily to {image_path}")
            except Exception as e:
                print(f"ChatbotService: Error saving temporary image: {e}")
                return {"error": "Could not process the uploaded image. Please try again."}

        try:
            response = self.chatbot_instance.process_query(text_query, image_path=image_path)
        finally:
            if temp_file_to_delete and os.path.exists(temp_file_to_delete):
                try:
                    os.remove(temp_file_to_delete)
                    print(f"ChatbotService: Temporary image {temp_file_to_delete} deleted.")
                except Exception as e:
                    print(f"ChatbotService: Error deleting temporary image {temp_file_to_delete}: {e}")

        return response

    def get_nutrition_for_food_direct(self, food_name_str: str) -> dict:
        """
        Fetches nutrition information for a given food item directly using FoodLookupService.

        Args:
            food_name_str (str): The name of the food item to look up.

        Returns:
            dict: A dictionary containing the nutrition information or an error message.
        """
        if not food_name_str or not food_name_str.strip():
            return {"error": "Food name cannot be empty."}

        try:
            if not self.chatbot_instance or not self.chatbot_instance.is_ready():
                print("ChatbotService: get_nutrition_for_food_direct called but chatbot core not ready.")
                return {"error": "Chatbot core components are not ready."}
            if not self.chatbot_instance.food_lookup_service:
                print("ChatbotService: get_nutrition_for_food_direct called but food_lookup_service not available.")
                return {"error": "Food lookup service is not available within the chatbot."}

            nutrition_data_dict = self.chatbot_instance.food_lookup_service.lookup_food(food_name_str.strip(), is_exact_match=True)

            if nutrition_data_dict.get("error"):
                print(f"ChatbotService: food_lookup_service reported error for '{food_name_str}': {nutrition_data_dict['error']}")
                return {"response": f"Could not retrieve nutritional information for '{food_name_str}': {nutrition_data_dict['error']}"}

            if nutrition_data_dict.get("data") and nutrition_data_dict.get("food"):
                formatted_nutrition_string = self.chatbot_instance._format_nutrition(nutrition_data_dict)
                return {"response": f"Nutrition for {nutrition_data_dict['food']}: {formatted_nutrition_string}"}

            print(f"ChatbotService: Unexpected data structure from food_lookup_service for '{food_name_str}': {nutrition_data_dict}")
            return {"response": f"Could not find specific nutritional details for '{food_name_str}' in the expected format."}

        except Exception as e:
            print(f"ChatbotService: Exception in get_nutrition_for_food_direct for '{food_name_str}': {e}")
            return {"error": f"An unexpected error occurred while fetching nutrition data for {food_name_str}."}
