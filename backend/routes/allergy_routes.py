from flask import Blueprint, jsonify, request
from ..db import db
from ..models import AllergyIntolerance, UserAllergy, User # Ensure User is imported

allergy_bp = Blueprint('allergy_bp', __name__, url_prefix='/api')

@allergy_bp.route('/allergies', methods=['GET'])
def get_all_allergies():
    """
    Retrieves a list of all available allergies and intolerances.
    """
    try:
        allergies = AllergyIntolerance.query.all()
        return jsonify([allergy.to_dict() for allergy in allergies]), 200
    except Exception as e:
        return jsonify({"error": "Failed to retrieve allergies", "message": str(e)}), 500

@allergy_bp.route('/users/<int:user_id>/allergies', methods=['GET'])
def get_user_allergies(user_id):
    """
    Retrieves the list of AllergyIDs for a specific user.
    """
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    try:
        user_allergies_associations = UserAllergy.query.filter_by(UserID=user_id).all()
        allergies_details = []
        for ua_assoc in user_allergies_associations:
            allergy = AllergyIntolerance.query.get(ua_assoc.AllergyID)
            if allergy:
                 allergies_details.append(allergy.to_dict())

        return jsonify({
            "user_id": user_id,
            "allergies": allergies_details
        }), 200
    except Exception as e:
        return jsonify({"error": "Failed to retrieve user allergies", "message": str(e)}), 500

@allergy_bp.route('/users/<int:user_id>/allergies', methods=['POST'])
def update_user_allergies(user_id):
    """
    Updates the list of allergies for a specific user.
    Expects a JSON payload with a list of allergy_ids: {"allergy_ids": [1, 2, 3]}
    """
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    if not data or 'allergy_ids' not in data or not isinstance(data['allergy_ids'], list):
        return jsonify({"error": "Invalid request payload. 'allergy_ids' list is required."}), 400

    new_allergy_ids = set(data['allergy_ids'])

    try:
        valid_allergies = AllergyIntolerance.query.filter(AllergyIntolerance.id.in_(new_allergy_ids)).all()
        if len(valid_allergies) != len(new_allergy_ids):
            valid_allergy_ids_from_db = {v.id for v in valid_allergies}
            invalid_ids = list(new_allergy_ids - valid_allergy_ids_from_db)
            return jsonify({"error": f"Invalid AllergyID(s) provided: {invalid_ids}"}), 400

        UserAllergy.query.filter_by(UserID=user_id).delete()

        for allergy_id in new_allergy_ids:
            user_allergy_entry = UserAllergy(UserID=user_id, AllergyID=allergy_id)
            db.session.add(user_allergy_entry)

        db.session.commit()
        return jsonify({"message": "User allergies updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update user allergies", "message": str(e)}), 500
