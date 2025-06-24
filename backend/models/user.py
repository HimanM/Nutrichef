from ..db import db
from datetime import datetime 

class User(db.Model):
    __tablename__ = 'Users'

    UserID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Name = db.Column(db.String(255), nullable=False)
    Email = db.Column(db.String(255), nullable=False, unique=True)
    PasswordHash = db.Column(db.String(255), nullable=False)
    DietaryPreferences = db.Column(db.Text, nullable=True)
    role = db.Column(db.String(50), default='user', nullable=False)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)
    EmailVerificationToken = db.Column(db.String(255), nullable=True)
    EmailVerificationTokenExpiresAt = db.Column(db.DateTime, nullable=True)
    IsEmailVerified = db.Column(db.Boolean, default=False, nullable=False)

    recipes = db.relationship('Recipe', backref='author', lazy=True, cascade="all, delete-orphan")
    classification_results = db.relationship('ClassificationResult', backref='user', lazy=True, cascade="all, delete-orphan")

    user_allergy_associations = db.relationship('UserAllergy', back_populates='user', lazy='dynamic', cascade="all, delete-orphan")


    def __repr__(self):
        return f'<User {self.UserID} {self.Name}>'

    def to_dict(self, include_sensitive=False):
        user_dict = {
            'UserID': self.UserID,
            'Name': self.Name,
            'Email': self.Email,
            'DietaryPreferences': self.DietaryPreferences,
            'role': self.role,
            'CreatedAt': self.CreatedAt.isoformat() if self.CreatedAt else None
        }
        return user_dict
