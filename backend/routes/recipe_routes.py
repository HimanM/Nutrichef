from flask import Blueprint, request, jsonify, current_app
import os
import uuid
from werkzeug.utils import secure_filename
from ..services import RecipeService, RecipeRatingService # Relative imports
from ..services.main.recipe_pipeline_service import RecipePipelineService
from flask_jwt_extended import jwt_required, get_jwt_identity

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

recipe_service = RecipeService() # Instantiate the service
recipe_rating_service = RecipeRatingService() # Instantiate RecipeRatingService

# Blueprint registration (url_prefix='/api' was set previously)
recipe_pipeline_service = RecipePipelineService()
recipe_bp = Blueprint('recipe_bp', __name__, url_prefix='/api')

@recipe_bp.route('/recipes', methods=['GET'])
def get_public_recipes():
    """ Retrieves a list of all public recipes with pagination. """
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 12, type=int)
    search = request.args.get('search', None, type=str)
    
    data, error, status = recipe_service.get_public_recipes_summary(page=page, limit=limit, search_term=search)
    
    if error:
        return jsonify(error), status
    return jsonify(data), status


@recipe_bp.route('/recipes/<recipe_id>', methods=['GET'])
def get_recipe(recipe_id):
    """ Retrieves details for a specific recipe by its ID. """
    current_user_id = request.args.get('user_id_for_rating_testing', type=int)

    data, error, status = recipe_service.get_recipe_details(recipe_id=recipe_id, current_user_id=current_user_id)
    
    if error:
        return jsonify(error), status
    return jsonify(data), status


@recipe_bp.route('/recipes/upload', methods=['POST'])
def create_recipe():
    """ Creates a new recipe from uploaded data. """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    user_id = data.get('user_id')

    if not user_id:
        return jsonify({"error": "Missing 'user_id' in JSON payload"}), 400

    created_recipe_data, error, status = recipe_service.create_recipe(user_id=user_id, data=data)
    
    if error:
        return jsonify(error), status
    
    return jsonify({"message": "Recipe created successfully", "recipe": created_recipe_data}), status


@recipe_bp.route('/recipes/upload_text', methods=['POST'])
def create_recipe_from_text_route():
    """
    Creates a new recipe from raw text input.
    Expects a JSON payload with a "recipe_text" field.
    e.g., {"recipe_text": "Ingredients: 2 eggs, 1 cup flour..."}
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    recipe_text = data.get('recipe_text')
    if not recipe_text or not isinstance(recipe_text, str) or not recipe_text.strip():
        return jsonify({"error": "Missing or empty 'recipe_text' field in JSON payload"}), 400

    user_id = data.get('user_id')

    if not user_id:
        return jsonify({"error": "Missing 'user_id' in JSON payload"}), 400

    created_recipe_data, error, status = recipe_service.create_recipe_from_text(
        user_id=user_id,
        recipe_text_input=recipe_text
    )

    if error:
        return jsonify(error), status

    return jsonify({"message": "Recipe created successfully from text", "recipe": created_recipe_data}), status


@recipe_bp.route('/recipes/process_submission', methods=['POST'])
def process_recipe_submission_route():
    """
    Processes a recipe submission, accepting either structured JSON or raw text.
    Uses the RecipePipelineService.
    """
    from flask import request, jsonify

    submission_data = None
    content_type = request.headers.get('Content-Type', '').lower()

    if 'application/json' in content_type:
        submission_data = request.get_json()
        if not submission_data:
            return jsonify({"error": "Request body must be valid JSON"}), 400
    elif 'text/plain' in content_type:
        submission_data = request.get_data(as_text=True)
        if not submission_data or not submission_data.strip():
            return jsonify({"error": "Request body must not be empty plain text"}), 400
    else:
        return jsonify({"error": "Unsupported Content-Type. Must be 'application/json' or 'text/plain'."}), 415

    user_id = None
    if 'application/json' in content_type:
        if not submission_data:
            return jsonify({"error": "Request body must be valid JSON"}), 400
        user_id = submission_data.get('user_id')
        if not user_id:
            return jsonify({"error": "Missing 'user_id' in JSON payload"}), 400

    processed_data, error, status = recipe_pipeline_service.process_recipe_submission(
        submission_data=submission_data,
        user_id=user_id
    )

    if error:
        return jsonify(error), status

    return jsonify({"message": "Recipe processed successfully", "recipe": processed_data}), status


@recipe_bp.route('/recipes/upload_image', methods=['POST'])
def upload_recipe_image():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        extension = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}.{extension}"
        filename = secure_filename(unique_filename)

        upload_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'static', 'recipe_images'))

        try:
            os.makedirs(upload_folder, exist_ok=True)
        except OSError as e:
            current_app.logger.error(f"Error creating upload directory {upload_folder}: {e}")
            return jsonify({"error": "Server error creating upload directory"}), 500

        try:
            file_path = os.path.join(upload_folder, filename)
            file.save(file_path)
        except Exception as e:
            current_app.logger.error(f"Error saving file to {file_path}: {e}")
            return jsonify({"error": "Server error saving file"}), 500

        image_url = f"/static/recipe_images/{filename}"

        return jsonify({"imageUrl": image_url}), 200
    else:
        return jsonify({"error": "Invalid file type. Allowed types are png, jpg, jpeg, gif"}), 400


@recipe_bp.route('/recipes/my-private', methods=['GET'])
def get_my_private_recipes():
    user_id = request.args.get('user_id', type=int)
    if not user_id:
        return jsonify({"error": "Authentication required (user_id parameter missing for testing)"}), 401

    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 12, type=int)
    search = request.args.get('search', None, type=str)

    data, error, status = recipe_service.get_user_private_recipes_summary(
        user_id=user_id, page=page, limit=limit, search_term=search
    )
    if error:
        return jsonify(error), status
    return jsonify(data), status


@recipe_bp.route('/recipes/<int:recipe_id>/rate', methods=['POST'])
def rate_recipe(recipe_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    user_id = data.get('user_id')
    rating_value = data.get('rating')

    if not user_id:
        return jsonify({"error": "User ID is required in payload for rating (for testing)"}), 400
    if rating_value is None:
        return jsonify({"error": "Rating value is required"}), 400
    if not isinstance(rating_value, int) or not (1 <= rating_value <= 5):
        return jsonify({"error": "Rating must be an integer between 1 and 5"}), 400


    result, error, status = recipe_rating_service.add_or_update_rating(
        recipe_id=recipe_id, user_id=user_id, rating=rating_value
    )
    if error:
        return jsonify(error), status
    return jsonify(result), status


@recipe_bp.route('/recipes/<int:recipe_id>/my-rating', methods=['GET'])
def get_my_rating_for_recipe(recipe_id):
    user_id = request.args.get('user_id', type=int)
    if not user_id:
        return jsonify({"error": "Authentication required (user_id parameter missing for testing)"}), 401

    data, error, status = recipe_rating_service.get_user_rating_for_recipe(
        recipe_id=recipe_id, user_id=user_id
    )
    if error:
        return jsonify(error), status
    if data is None and status == 404:
         return jsonify({"rating": None, "message": "No rating found for this user and recipe"}), 200
    return jsonify(data), status


@recipe_bp.route('/recipes/<int:recipe_id>/toggle-public', methods=['PATCH'])
@jwt_required()
def toggle_recipe_public_status_route(recipe_id):
    current_user_id = get_jwt_identity()
    
    updated_recipe_data, error, status = recipe_service.toggle_recipe_public_status(recipe_id, current_user_id)
    
    if error:
        return jsonify(error), status
    
    return jsonify({"message": "Recipe public status toggled successfully", "recipe": updated_recipe_data}), status
