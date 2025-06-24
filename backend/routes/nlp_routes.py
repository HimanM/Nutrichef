from flask import Blueprint, request, jsonify
from ..ai_models.gemini_nlp.gemini_nlp_parser import GeminiNlpParser

nlp_bp = Blueprint('nlp_bp', __name__, url_prefix='/api/nlp')

parser_instance = None

def get_parser_instance():
    global parser_instance
    if parser_instance is None:
        print("Initializing GeminiNlpParser instance for nlp_routes...")
        parser_instance = GeminiNlpParser()
    return parser_instance

@nlp_bp.route('/parse_recipe', methods=['POST'])
def parse_recipe_text_route():
    """
    Parses raw recipe text using the GeminiNlpParser.
    Expects a JSON payload: {"recipe_text": "...", "userid": "..."}.
    The userid is logged or can be used for user-specific parser context in the future.
    """
    if 'application/json' not in request.headers.get('Content-Type', '').lower():
        return jsonify({"error": "Unsupported Content-Type. Must be 'application/json'."}), 415

    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    recipe_text = data.get('recipe_text')
    user_id = data.get('userid')

    if not recipe_text or not isinstance(recipe_text, str) or not recipe_text.strip():
        return jsonify({"error": "Missing or empty 'recipe_text' field in JSON payload"}), 400

    if user_id:
        print(f"Processing recipe text for user_id: {user_id}")
    else:
        print("Processing recipe text without a user_id (user_id not provided in request).")


    parser = get_parser_instance()

    parsed_data = parser.parse_recipe(recipe_text)

    if parsed_data.get("error"):
        status_code = 500
        if "API key not configured" in parsed_data.get("error", ""):
            status_code = 500
        elif "Invalid JSON response" in parsed_data.get("error", "") or "Empty API response" in parsed_data.get("error", ""):
            status_code = 502
        return jsonify(parsed_data), status_code

    return jsonify(parsed_data), 200
