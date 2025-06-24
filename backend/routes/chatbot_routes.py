from flask import Blueprint, request, jsonify, current_app
from werkzeug.exceptions import BadRequest
import os

try:
    from backend.services.chatbot_service import ChatbotService
except ImportError:
    from services.chatbot_service import ChatbotService


chatbot_bp = Blueprint('chatbot_bp', __name__, url_prefix='/api/chatbot')

def initialize_chatbot_service():
    instance_tmp_folder = os.path.join(current_app.instance_path, 'chatbot_temp_uploads')
    if not os.path.exists(instance_tmp_folder):
        try:
            os.makedirs(instance_tmp_folder)
            current_app.logger.info(f"Created instance temporary upload folder: {instance_tmp_folder}")
        except OSError as e:
            current_app.logger.error(f"Failed to create instance temporary upload folder {instance_tmp_folder}: {e}")

    if 'chatbot_service' not in current_app.extensions:
        current_app.extensions['chatbot_service'] = ChatbotService(static_tmp_folder=instance_tmp_folder)
        current_app.logger.info(f"ChatbotService initialized and stored in app.extensions. Temp folder: {instance_tmp_folder}")


@chatbot_bp.route('/query', methods=['POST'])
def handle_chatbot_query():
    if 'chatbot_service' not in current_app.extensions:
        current_app.logger.error("Chatbot service not initialized.")
        return jsonify({"error": "Chatbot service is not available. Please try again later."}), 503

    service = current_app.extensions['chatbot_service']

    if not service.is_chatbot_ready():
        current_app.logger.warn("Chatbot query received, but FoodChatbot core is not ready.")
        return jsonify({"error": "Chatbot is currently initializing or encountered an issue. Please try again shortly."}), 503

    text_query = request.form.get('text_query')
    image_file = request.files.get('image_file')

    if not text_query and not image_file:
        raise BadRequest("Missing 'text_query' or 'image_file'. At least one must be provided.")

    if not text_query and image_file:
        text_query = "What is this?"

    current_app.logger.info(f"Received chatbot query: Text='{text_query}', Image provided='{image_file is not None}'")

    try:
        response_data = service.process_user_query(text_query, image_file_storage=image_file)
        return jsonify(response_data)
    except BadRequest as e:
        current_app.logger.error(f"BadRequest error processing chatbot query: {e}")
        return jsonify({"error": str(e)}), 400
    except FileNotFoundError as e:
        current_app.logger.error(f"FileNotFoundError during chatbot processing: {e}")
        return jsonify({"error": "A required file was not found. Chatbot functionality may be affected."}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error processing chatbot query: {e}", exc_info=True)
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500


@chatbot_bp.route('/food_nutrition_direct', methods=['POST'])
def handle_direct_food_nutrition_query():
    if 'chatbot_service' not in current_app.extensions:
        current_app.logger.error("Chatbot service not initialized for direct nutrition query.")
        return jsonify({"error": "Chatbot service is not available. Please try again later."}), 503

    service = current_app.extensions['chatbot_service']

    if not service.is_chatbot_ready():
        current_app.logger.warn("Direct nutrition query received, but FoodChatbot core is not ready.")
        return jsonify({"error": "Chatbot is currently initializing or encountered an issue. Please try again shortly."}), 503

    try:
        data = request.get_json()
        if not data or 'food_name' not in data or not data['food_name'].strip():
            current_app.logger.error(f"Direct nutrition query failed: Missing or empty 'food_name'. Data: {data}")
            return jsonify({"error": "Missing or empty 'food_name' in request body"}), 400

        food_name = data['food_name'].strip()
        current_app.logger.info(f"Received direct nutrition query for: {food_name}")

        response_data = service.get_nutrition_for_food_direct(food_name)
        return jsonify(response_data)

    except BadRequest as e:
        current_app.logger.error(f"BadRequest error processing direct nutrition query (e.g. malformed JSON): {e}")
        return jsonify({"error": f"Invalid request format: {e}"}), 400
    except Exception as e:
        current_app.logger.error(f"Unexpected error processing direct nutrition query for '{data.get('food_name', 'N/A')}': {e}", exc_info=True)
        return jsonify({"error": "An unexpected error occurred while fetching nutrition data."}), 500
