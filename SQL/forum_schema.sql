-- Forum Posts table
CREATE TABLE ForumPosts (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    UserId INT,
    Title VARCHAR(255) NOT NULL,
    Content TEXT NOT NULL,
    LikesCount INT DEFAULT 0,
    ViewsCount INT DEFAULT 0,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Forum Comments table
CREATE TABLE ForumComments (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    PostId INT,
    UserId INT,
    Comment TEXT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (PostId) REFERENCES ForumPosts(Id) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Forum Post Tags table (for recipe tags)
CREATE TABLE ForumPostTags (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    PostId INT,
    RecipeId INT,
    FOREIGN KEY (PostId) REFERENCES ForumPosts(Id) ON DELETE CASCADE,
    FOREIGN KEY (RecipeId) REFERENCES Recipes(RecipeID) ON DELETE CASCADE
);

-- Forum Likes table (for user-specific likes)
CREATE TABLE ForumLikes (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    PostId INT,
    UserId INT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_post_like (PostId, UserId),
    FOREIGN KEY (PostId) REFERENCES ForumPosts(Id) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_forum_posts_user_id ON ForumPosts(UserId);
CREATE INDEX idx_forum_posts_created_at ON ForumPosts(CreatedAt);
CREATE INDEX idx_forum_comments_post_id ON ForumComments(PostId);
CREATE INDEX idx_forum_comments_user_id ON ForumComments(UserId);
CREATE INDEX idx_forum_post_tags_post_id ON ForumPostTags(PostId);
CREATE INDEX idx_forum_post_tags_recipe_id ON ForumPostTags(RecipeId);
CREATE INDEX idx_forum_likes_post_id ON ForumLikes(PostId);
CREATE INDEX idx_forum_likes_user_id ON ForumLikes(UserId);