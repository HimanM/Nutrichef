from ..db import db # Relative import
from datetime import datetime

class ClassificationResult(db.Model):
    __tablename__ = 'ClassificationResults'

    ResultID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    UserID = db.Column(db.Integer, db.ForeignKey('Users.UserID', ondelete='SET NULL'), nullable=True)
    UploadedImageURL = db.Column(db.String(2083), nullable=True)
    PredictedFoodName = db.Column(db.String(255), nullable=True)
    NutritionInfoJSON = db.Column(db.Text, nullable=True)
    Score = db.Column(db.Numeric(5, 4), nullable=True)
    ClassificationTimestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<ClassificationResult {self.ResultID}>'

    def to_dict(self):
        import json
        nutrition_info = None
        if self.NutritionInfoJSON:
            try:
                nutrition_info = json.loads(self.NutritionInfoJSON)
            except json.JSONDecodeError:
                nutrition_info = {"error": "Invalid JSON string in database"}

        return {
            'ResultID': self.ResultID,
            'UserID': self.UserID,
            'UserName': self.user.Name if self.user else None,
            'UploadedImageURL': self.UploadedImageURL,
            'PredictedFoodName': self.PredictedFoodName,
            'NutritionInfo': nutrition_info,
            'Score': float(self.Score) if self.Score is not None else None,
            'ClassificationTimestamp': self.ClassificationTimestamp.isoformat() if self.ClassificationTimestamp else None
        }
