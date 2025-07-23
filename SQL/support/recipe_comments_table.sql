-- Add RecipeComments table to support recipe comment system
-- This should be added to your existing database schema

-- Table structure for table `RecipeComments`
CREATE TABLE IF NOT EXISTS `RecipeComments` (
  `CommentID` int NOT NULL AUTO_INCREMENT,
  `RecipeID` int NOT NULL,
  `UserID` int NOT NULL,
  `Comment` text NOT NULL,
  `IsEdited` tinyint(1) NOT NULL DEFAULT '0',
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`CommentID`),
  UNIQUE KEY `uq_recipe_user_comment` (`RecipeID`,`UserID`),
  KEY `UserID` (`UserID`),
  KEY `idx_recipe_comments_recipe_created` (`RecipeID`,`CreatedAt`),
  CONSTRAINT `recipecomments_ibfk_1` FOREIGN KEY (`RecipeID`) REFERENCES `Recipes` (`RecipeID`) ON DELETE CASCADE,
  CONSTRAINT `recipecomments_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Index for efficient comment retrieval by recipe
CREATE INDEX idx_recipe_comments_recipe_created ON RecipeComments (RecipeID, CreatedAt);

-- Index for user's comments (for admin management)
CREATE INDEX idx_recipe_comments_user_created ON RecipeComments (UserID, CreatedAt);
