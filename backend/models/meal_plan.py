from ..db import db
from sqlalchemy.dialects.mysql import JSON as JSON_MYSQL
from sqlalchemy.dialects.mssql import NVARCHAR
from sqlalchemy.types import TypeDecorator
import json
from sqlalchemy import Index

class JSONText(TypeDecorator):
    impl = db.Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            return json.dumps(value)
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            return json.loads(value)
        return value

class UserMealPlan(db.Model):
    __tablename__ = 'UserMealPlans'
    UserMealPlanID = db.Column(db.Integer, primary_key=True)
    UserID = db.Column(db.Integer, db.ForeignKey('Users.UserID', ondelete='CASCADE'), nullable=False)
    MealPlanData = db.Column(JSONText())

    CreatedAt = db.Column(db.DateTime, default=db.func.current_timestamp())
    UpdatedAt = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    user = db.relationship('User', backref=db.backref('meal_plan', uselist=False))

    __table_args__ = (Index('ix_user_meal_plans_user_id', "UserID"),)

    def to_dict(self):
        return {
            'UserMealPlanID': self.UserMealPlanID,
            'UserID': self.UserID,
            'MealPlanData': self.MealPlanData,
            'CreatedAt': self.CreatedAt.isoformat() if self.CreatedAt else None,
            'UpdatedAt': self.UpdatedAt.isoformat() if self.UpdatedAt else None,
        }
