from flask import Blueprint, request, jsonify
from ..services import ClassificationService
from backend.services.main.nutrition_service import NutritionService

classification_bp = Blueprint('classification_bp', __name__, url_prefix='/api')
classification_service = ClassificationService()
nutrition_service = NutritionService.get_instance()

@classification_bp.route('/classify', methods=['POST'])
def classify_food_item_route():
    food_name = request.form.get('name') 
    image_file = request.files.get('image')
    classification_mode = request.form.get('classification_mode')

    if not classification_mode:
        return jsonify({"error": "Missing 'classification_mode' parameter"}), 400
    if classification_mode not in ['ingredient', 'food']:
        return jsonify({"error": f"Invalid 'classification_mode': {classification_mode}. Must be 'ingredient' or 'food'."}), 400

    user_id_str = request.form.get('user_id')
    if not user_id_str:
        return jsonify({"error": "Missing 'user_id' parameter. User may not be logged in or ID was not sent."}), 400
    else:
        try:
            user_id = int(user_id_str)
        except ValueError:
            return jsonify({"error": f"Invalid 'user_id' format: {user_id_str}. Must be an integer."}), 400

    result, error, status = classification_service.classify_item(
        image_file_storage=image_file,
        user_id=user_id,
        classification_mode=classification_mode,
        food_name=food_name
    )

    if error:
        return jsonify(error), status
    
    return jsonify(result), status

@classification_bp.route('/nutrition/<string:food_name>', methods=['GET'])
def get_nutrition_route(food_name):
    try:
        result = nutrition_service.get_nutrition(food_name)
        if result.get('success'):
            return jsonify(result), 200
        else:
            return jsonify(result), 404
    except Exception as e:
        print(f"Error in nutrition route for '{food_name}': {e}")
        return jsonify({'success': False, 'error': 'An unexpected error occurred on the server.'}), 500
