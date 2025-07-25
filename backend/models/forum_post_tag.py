from ..db import db

class ForumPostTag(db.Model):
    __tablename__ = 'ForumPostTags'

    Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    PostId = db.Column(db.Integer, db.ForeignKey('ForumPosts.Id', ondelete='CASCADE'), nullable=False)
    RecipeId = db.Column(db.Integer, db.ForeignKey('Recipes.RecipeID', ondelete='CASCADE'), nullable=False)

    # Relationships
    post = db.relationship('ForumPost', back_populates='tags')
    recipe = db.relationship('Recipe', backref='forum_post_tags', lazy=True)

    def __repr__(self):
        return f'<ForumPostTag {self.Id} Post {self.PostId} Recipe {self.RecipeId}>'

    def to_dict(self):
        """Convert forum post tag to dictionary"""
        return {
            'Id': self.Id,
            'PostId': self.PostId,
            'RecipeId': self.RecipeId,
            'RecipeTitle': self.recipe.Title if self.recipe else 'Unknown Recipe',
            'RecipeImageURL': self.recipe.ImageURL if self.recipe else None
        }