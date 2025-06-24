from ..db import db

class AllergyIntolerance(db.Model):
    __tablename__ = 'AllergyIntolerances'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), unique=True, nullable=False)
    CreatedAt = db.Column(db.DateTime, default=db.func.current_timestamp())

    user_allergy_associations = db.relationship('UserAllergy', back_populates='allergy', lazy='dynamic', cascade="all, delete-orphan")


    def __repr__(self):
        return f'<AllergyIntolerance {self.id}: {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'CreatedAt': self.CreatedAt.isoformat() if self.CreatedAt else None
        }

class UserAllergy(db.Model):
    __tablename__ = 'UserAllergies'

    UserAllergyID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    UserID = db.Column(db.Integer, db.ForeignKey('Users.UserID'), nullable=False)
    AllergyID = db.Column(db.Integer, db.ForeignKey('AllergyIntolerances.id'), nullable=False)
    CreatedAt = db.Column(db.DateTime, default=db.func.current_timestamp())

    # Relationships to User and AllergyIntolerance using back_populates
    user = db.relationship('User', back_populates='user_allergy_associations')
    allergy = db.relationship('AllergyIntolerance', back_populates='user_allergy_associations')

    def __repr__(self):
        return f'<UserAllergy UserID={self.UserID}, AllergyID={self.AllergyID}>'

    def to_dict(self):
        return {
            'UserAllergyID': self.UserAllergyID,
            'UserID': self.UserID,
            'AllergyID': self.AllergyID,
            'CreatedAt': self.CreatedAt.isoformat() if self.CreatedAt else None
        }
