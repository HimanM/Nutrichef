from backend.dao import UserDAO
from backend.db import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from backend.services.util.email_service import EmailService
import secrets
from datetime import datetime, timedelta

class UserService:
    def __init__(self):
        self.user_dao = UserDAO()
        self.email_service = EmailService()

    def register_user(self, data):
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        dietary_preferences = data.get('dietaryPreferences')

        if not name or not email or not password:
            return None, {"error": "Missing name, email, or password"}, 400

        # Check if user exists
        existing_user = self.user_dao.get_user_by_email(email)
        
        if existing_user:
            # If user exists and email is verified, return error
            if existing_user.IsEmailVerified:
                return None, {"error": "Email already registered"}, 409
            
            # If user exists but email is not verified, delete the old user and allow re-registration
            try:
                db.session.delete(existing_user)
                db.session.commit()
                print(f"Deleted unverified user with email {email} to allow re-registration")
            except Exception as e:
                db.session.rollback()
                print(f"Error deleting unverified user: {e}")
                return None, {"error": "Registration failed due to server error"}, 500

        hashed_password = generate_password_hash(password)
        
        verification_token = secrets.token_urlsafe(32)
        token_expires_at = datetime.utcnow() + timedelta(hours=24)

        try:
            new_user = self.user_dao.create_user(
                name=name,
                email=email,
                password_hash=hashed_password,
                dietary_preferences=dietary_preferences,
                email_verification_token=verification_token,
                email_verification_token_expires_at=token_expires_at,
                is_email_verified=False
            )

            try:
                self.email_service.send_verification_email(
                    user_email=new_user.Email,
                    user_name=new_user.Name,
                    token=verification_token
                )
            except Exception as email_exc:
                print(f"Failed to send verification email to {new_user.Email}: {email_exc}")

            db.session.commit()
            return {"message": "Registration successful. Please check your email to verify your account."}, None, 201
        except Exception as e:
            db.session.rollback()
            print(f"Error during user registration: {e}")
            return None, {"error": "Registration failed due to server error"}, 500

    def login_user(self, email, password):
        if not email or not password:
            return None, None, {"error": "Email and password are required"}, 400

        user = self.user_dao.get_user_by_email(email)
        if user and check_password_hash(user.PasswordHash, password):
            if not user.IsEmailVerified:
                return None, None, {"error": "Email not verified. Please check your email for a verification link."}, 403

            access_token = create_access_token(identity=str(user.UserID))
            return user.to_dict(), access_token, None, 200
        else:
            return None, None, {"error": "Invalid email or password"}, 401

    def get_user_preferences(self, user_id):
        user = self.user_dao.get_user_by_id(user_id)
        if not user:
            return None, {"error": "User not found"}, 404
        
        return {
            "UserID": user.UserID, 
            "DietaryPreferences": user.DietaryPreferences,
            "DailyCalories": user.DailyCalories,
            "DailyProtein": user.DailyProtein,
            "DailyCarbs": user.DailyCarbs,
            "DailyFat": user.DailyFat,
            "DailyFiber": user.DailyFiber,
            "DailySugar": user.DailySugar,
            "DailySodium": user.DailySodium
        }, None, 200

    def update_user_preferences(self, user_id, prefs_data):
        user = self.user_dao.get_user_by_id(user_id)
        if not user:
            return False, {"error": "User not found"}, 404

        data_to_update = {}
        if 'preferences' in prefs_data and 'dietaryRestrictions' in prefs_data['preferences']:
             data_to_update['DietaryPreferences'] = prefs_data.get('preferences')


        if not data_to_update:
             return False, {"error": "No preference data provided or key mismatch"}, 400
             
        try:
            self.user_dao.update_user(user, data_to_update) 
            db.session.commit()
            return True, {"message": "Preferences updated successfully"}, 200
        except Exception as e:
            db.session.rollback()
            print(f"Error updating preferences: {e}")
            return False, {"error": "Failed to update preferences"}, 500
            
    def change_password(self, user_id, old_password, new_password):
        if not old_password or not new_password:
            return False, {"error": "Old and new passwords are required"}, 400

        user = self.user_dao.get_user_by_id(user_id)
        if not user:
            return False, {"error": "User not found"}, 404

        if not check_password_hash(user.PasswordHash, old_password):
            return False, {"error": "Incorrect current password"}, 401
        
        if old_password == new_password:
            return False, {"error": "New password must be different from the old password"}, 400

        new_password_hash = generate_password_hash(new_password)
        try:
            self.user_dao.update_user(user, {'PasswordHash': new_password_hash})
            db.session.commit()
            return True, {"message": "Password updated successfully"}, 200
        except Exception as e:
            db.session.rollback()
            print(f"Error changing password: {e}")
            return False, {"error": "Failed to change password"}, 500

    def verify_email(self, token):
        try:
            user = self.user_dao.get_user_by_verification_token(token)

            if not user:
                return None, {"error": "Invalid verification token"}, 400

            if user.IsEmailVerified:
                return None, {"error": "Email already verified"}, 400

            if user.EmailVerificationTokenExpiresAt and datetime.utcnow() > user.EmailVerificationTokenExpiresAt:
                return None, {"error": "Verification token expired"}, 400

            user.IsEmailVerified = True
            user.EmailVerificationToken = None
            user.EmailVerificationTokenExpiresAt = None

            update_data = {
                'IsEmailVerified': True,
                'EmailVerificationToken': None,
                'EmailVerificationTokenExpiresAt': None
            }
            self.user_dao.update_user(user, update_data)

            db.session.commit()

            return user.to_dict(), None, 200

        except Exception as e:
            db.session.rollback()
            print(f"Error during email verification: {e}")
            return None, {"error": "Email verification failed due to server error"}, 500

    def update_nutritional_targets(self, user_id, targets_data):
        print(f"Updating nutritional targets for user {user_id}: {targets_data}")
        user = self.user_dao.get_user_by_id(user_id)
        if not user:
            print(f"User {user_id} not found")
            return False, {"error": "User not found"}, 404

        # Validate and prepare data for update
        valid_fields = [
            'DailyCalories', 'DailyProtein', 'DailyCarbs', 'DailyFat', 
            'DailyFiber', 'DailySugar', 'DailySodium'
        ]
        
        data_to_update = {}
        for field in valid_fields:
            if field in targets_data:
                value = targets_data[field]
                # Convert empty strings to None
                if value == '' or value is None:
                    data_to_update[field] = None
                else:
                    # Ensure it's a valid number
                    try:
                        num_value = float(value)
                        if num_value < 0:
                            return False, {"error": f"{field} must be a positive number"}, 400
                        data_to_update[field] = num_value
                    except (ValueError, TypeError):
                        return False, {"error": f"{field} must be a valid number"}, 400

        print(f"Data to update: {data_to_update}")

        if not data_to_update:
            print("No valid data to update")
            return False, {"error": "No valid nutritional target data provided"}, 400

        try:
            print(f"Updating user with data: {data_to_update}")
            self.user_dao.update_user(user, data_to_update)
            db.session.commit()
            print("Successfully updated nutritional targets")
            return True, {"message": "Nutritional targets updated successfully", "targets": data_to_update}, 200
        except Exception as e:
            db.session.rollback()
            print(f"Error updating nutritional targets: {e}")
            return False, {"error": "Failed to update nutritional targets"}, 500
