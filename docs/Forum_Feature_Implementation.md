# Forum Feature Implementation

## Overview

The Forum feature allows authenticated users to create and interact with posts related to recipes. Users can create posts, comment on them, like posts, and tag recipes using the `#RecipeName` syntax. Admins have additional capabilities to manage forum content.

## Features

### User Features
- **Create Posts**: Authenticated users can create forum posts with title and content
- **Recipe Tagging**: Use `#RecipeName` syntax to tag public recipes in posts
- **Live Recipe Search**: When typing `#`, users get live suggestions for public recipes
- **View Posts**: Browse all forum posts with sorting options (recent, popular, views)
- **Like Posts**: Like/unlike posts (requires authentication)
- **Comment System**: Add comments to posts and view all comments
- **Post Management**: Users can delete their own posts
- **Comment Management**: Users can delete their own comments
- **Responsive Design**: Mobile-friendly interface with emerald green theme

### Admin Features
- **Forum Management Dashboard**: Dedicated admin page for forum oversight
- **Post Management**: View and delete any forum post
- **Comment Management**: View and delete any forum comment
- **Content Moderation**: Full control over forum content

## Database Schema

### Tables Created

1. **ForumPosts**
   - `Id` (Primary Key)
   - `UserId` (Foreign Key to Users.UserID)
   - `Title` (VARCHAR 255)
   - `Content` (TEXT)
   - `LikesCount` (INT, default 0)
   - `ViewsCount` (INT, default 0)
   - `CreatedAt` (DATETIME)
   - `UpdatedAt` (DATETIME)

2. **ForumComments**
   - `Id` (Primary Key)
   - `PostId` (Foreign Key to ForumPosts.Id)
   - `UserId` (Foreign Key to Users.UserID)
   - `Comment` (TEXT)
   - `CreatedAt` (DATETIME)

3. **ForumPostTags**
   - `Id` (Primary Key)
   - `PostId` (Foreign Key to ForumPosts.Id)
   - `RecipeId` (Foreign Key to Recipes.RecipeID)

4. **ForumLikes**
   - `Id` (Primary Key)
   - `PostId` (Foreign Key to ForumPosts.Id)
   - `UserId` (Foreign Key to Users.UserID)
   - `CreatedAt` (DATETIME)
   - Unique constraint on (PostId, UserId)

### Indexes
- Performance indexes on all foreign keys and frequently queried columns
- Composite unique index on ForumLikes to prevent duplicate likes

## Backend Implementation

### Models
- `ForumPost`: Main post model with relationships
- `ForumComment`: Comment model linked to posts and users
- `ForumLike`: Like tracking with unique constraints
- `ForumPostTag`: Recipe tagging system

### Services
- `ForumService`: Business logic for all forum operations
- Recipe tag extraction using regex patterns
- Pagination support for posts and comments
- Like/unlike toggle functionality

### API Endpoints

#### Public Endpoints
- `GET /api/forum/posts` - Get paginated forum posts
- `GET /api/forum/posts/{id}` - Get specific post with comments
- `GET /api/forum/posts/{id}/comments` - Get post comments
- `GET /api/forum/recipes/search` - Search public recipes for tagging

#### Authenticated Endpoints
- `POST /api/forum/posts` - Create new post
- `PUT /api/forum/posts/{id}` - Update post (author only)
- `DELETE /api/forum/posts/{id}` - Delete post (author/admin)
- `POST /api/forum/posts/{id}/comments` - Add comment
- `DELETE /api/forum/comments/{id}` - Delete comment (author/admin)
- `POST /api/forum/posts/{id}/like` - Toggle like status

#### Admin Endpoints
- `GET /api/admin/forum/posts` - Get all posts for management
- `DELETE /api/admin/forum/posts/{id}` - Admin delete post
- `GET /api/admin/forum/comments` - Get all comments for management
- `DELETE /api/admin/forum/comments/{id}` - Admin delete comment

## Frontend Implementation

### Pages
- `ForumPage`: Main forum listing with sorting and pagination
- `ForumPostDetailPage`: Individual post view with comments
- `AdminForumPage`: Admin management interface

### Components
- `ForumPostList`: Paginated post listing
- `ForumPostCard`: Individual post preview card
- `CreatePostModal`: Modal for creating new posts with recipe tagging
- `ForumPostDetail`: Full post view component
- `ForumComments`: Comment system with add/delete functionality

### Features
- **Responsive Design**: Mobile-first approach with responsive modals
- **Live Recipe Search**: Real-time recipe suggestions while typing
- **Recipe Tag Rendering**: Visual recipe tags in posts
- **Pagination**: Efficient pagination for posts and comments
- **Sorting**: Sort by recent, popular, or views
- **Authentication Integration**: Seamless auth context integration
- **Modal System**: Uses existing ResponsiveModal and ModalContext

## Setup Instructions

### Database Setup
1. Run the database migration script:
   ```bash
   python scripts/setup_forum_db.py
   ```

### Backend Setup
The forum routes are automatically registered in `app.py`. No additional setup required.

### Frontend Setup
The forum routes are added to the main App.jsx routing. Navigation links are updated in:
- Main NavigationBar (user-facing)
- AdminNavigationBar (admin interface)

## Usage

### Creating Posts
1. Navigate to `/forum`
2. Click "Create Post" (requires authentication)
3. Enter title and content
4. Use `#RecipeName` to tag recipes (live search available)
5. Submit post

### Recipe Tagging
- Type `#` followed by recipe name
- Live suggestions appear as you type
- Click suggestion to insert tag
- Only public recipes can be tagged

### Admin Management
1. Navigate to `/admin/forum`
2. View posts and comments in separate tabs
3. Delete inappropriate content
4. Monitor forum activity

## Security Features

- **Authentication Required**: Post creation, commenting, and liking require login
- **Authorization Checks**: Users can only edit/delete their own content
- **Admin Override**: Admins can manage all content
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Parameterized queries throughout
- **XSS Protection**: Content sanitization and proper escaping

## Performance Optimizations

- **Database Indexes**: Optimized queries with proper indexing
- **Pagination**: Efficient pagination to handle large datasets
- **Lazy Loading**: Comments loaded separately from posts
- **Caching**: View count increments optimized
- **Responsive Loading**: Progressive loading with skeleton screens

## Styling

### User Theme
- **Primary Colors**: Emerald green (#059669) and white
- **Background**: Gradient from emerald-50 to white
- **Cards**: White with subtle shadows and emerald accents
- **Buttons**: Emerald primary, gray secondary

### Admin Theme
- **Consistent**: Matches existing admin dashboard aesthetics
- **Blue Accents**: Blue-500 for active states
- **Clean Layout**: Tabbed interface for posts and comments

## Future Enhancements

- **Rich Text Editor**: Enhanced post creation with formatting
- **Image Uploads**: Support for images in posts
- **Post Categories**: Categorization system for posts
- **Search Functionality**: Full-text search across posts
- **Notification System**: Notify users of likes and comments
- **Moderation Tools**: Flagging and reporting system
- **User Profiles**: Enhanced user profiles with forum activity