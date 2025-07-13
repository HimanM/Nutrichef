from ..db import db
from datetime import datetime

class RecipeTag(db.Model):
    __tablename__ = 'RecipeTags'
    
    TagID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    TagName = db.Column(db.String(100), nullable=False, unique=True)
    TagCategory = db.Column(db.String(50), default='general')
    TagColor = db.Column(db.String(7), default='#6B7280')
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<RecipeTag {self.TagID} {self.TagName}>'
    
    def to_dict(self):
        return {
            'TagID': self.TagID,
            'TagName': self.TagName,
            'TagCategory': self.TagCategory,
            'TagColor': self.TagColor,
            'CreatedAt': self.CreatedAt.isoformat() if self.CreatedAt else None
        }

class RecipeTagAssignment(db.Model):
    __tablename__ = 'RecipeTagAssignments'
    
    AssignmentID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    RecipeID = db.Column(db.Integer, db.ForeignKey('Recipes.RecipeID', ondelete='CASCADE'), nullable=False)
    TagID = db.Column(db.Integer, db.ForeignKey('RecipeTags.TagID', ondelete='CASCADE'), nullable=False)
    AssignedAt = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    recipe = db.relationship('Recipe', backref='tag_assignments')
    tag = db.relationship('RecipeTag', backref='recipe_assignments')
    
    def __repr__(self):
        return f'<RecipeTagAssignment {self.AssignmentID} Recipe {self.RecipeID} Tag {self.TagID}>'
    
    def to_dict(self):
        return {
            'AssignmentID': self.AssignmentID,
            'RecipeID': self.RecipeID,
            'TagID': self.TagID,
            'TagName': self.tag.TagName if self.tag else None,
            'TagCategory': self.tag.TagCategory if self.tag else None,
            'TagColor': self.tag.TagColor if self.tag else None,
            'AssignedAt': self.AssignedAt.isoformat() if self.AssignedAt else None
        }
