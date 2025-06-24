from ..models import User # Import User model using relative import
from ..db import db # Import db instance using relative import

class UserDAO:
    def get_user_by_id(self, user_id):
        return User.query.get(user_id)

    def get_user_by_email(self, email):
        return User.query.filter_by(Email=email).first()

    def get_all_users(self, page=1, per_page=10):
        """
        Retrieves a paginated list of all users.
        Orders by UserID ascending.
        """
        return User.query.order_by(User.UserID.asc()).paginate(page=page, per_page=per_page, error_out=False)

    def create_user(self, name, email, password_hash, dietary_preferences=None, email_verification_token=None, email_verification_token_expires_at=None, is_email_verified=False):
        new_user = User(
            Name=name,
            Email=email,
            PasswordHash=password_hash,
            DietaryPreferences=dietary_preferences,
            EmailVerificationToken=email_verification_token,
            EmailVerificationTokenExpiresAt=email_verification_token_expires_at,
            IsEmailVerified=is_email_verified
        )
        db.session.add(new_user)
        return new_user

    def get_user_by_verification_token(self, token):
        return User.query.filter_by(EmailVerificationToken=token).first()

    def update_user(self, user, data_to_update):
        if 'Name' in data_to_update:
            user.Name = data_to_update['Name']
        if 'Email' in data_to_update:
            user.Email = data_to_update['Email']
        if 'PasswordHash' in data_to_update:
            user.PasswordHash = data_to_update['PasswordHash']
        if 'DietaryPreferences' in data_to_update:
            user.DietaryPreferences = data_to_update['DietaryPreferences']
        if 'IsEmailVerified' in data_to_update:
            user.IsEmailVerified = data_to_update['IsEmailVerified']
        if 'EmailVerificationToken' in data_to_update:
            user.EmailVerificationToken = data_to_update['EmailVerificationToken']
        if 'EmailVerificationTokenExpiresAt' in data_to_update:
            user.EmailVerificationTokenExpiresAt = data_to_update['EmailVerificationTokenExpiresAt']
        
        return user
