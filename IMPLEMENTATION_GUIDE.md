# NutriChef Recipe Favorites and Tags Implementation Guide

## Overview
This implementation adds comprehensive favorites and tags functionality to the NutriChef application, including database schema updates, backend services, API routes, and integration with the existing Gemini NLP system.

## Files Created/Modified

### Database Schema
1. **Updated: `SQL/schema_mysql.sql`**
   - Added `RecipeTags` table with predefined tags
   - Added `RecipeTagAssignments` junction table
   - Added `UserFavoriteRecipes` table
   - Added foreign key constraints and indexes

2. **Created: `SQL/migration_favorites_tags.sql`**
   - Migration script for existing databases
   - Includes sample data and automatic tag assignment

### Backend Models
3. **Created: `backend/models/user_favorite_recipe.py`**
   - UserFavoriteRecipe model for favorites functionality

4. **Created: `backend/models/recipe_tag.py`**
   - RecipeTag and RecipeTagAssignment models

5. **Updated: `backend/models/recipe.py`**
   - Added tags and is_favorited fields to to_dict methods

6. **Updated: `backend/models/__init__.py`**
   - Imported new models

### Data Access Layer (DAO)
7. **Created: `backend/dao/favorites_dao.py`**
   - Complete favorites data access functionality
   - Pagination, search, and statistics

8. **Created: `backend/dao/tags_dao.py`**
   - Complete tags data access functionality
   - Tag assignment, querying, and filtering

### Service Layer
9. **Created: `backend/services/favorites_service.py`**
   - Business logic for favorites management
   - Enhanced with ratings and additional data

10. **Created: `backend/services/tags_service.py`**
    - Business logic for tags management
    - Recipe filtering and tag operations

### API Routes
11. **Created: `backend/routes/favorites_routes.py`**
    - REST API endpoints for favorites functionality
    - JWT authentication and user authorization

12. **Created: `backend/routes/tags_routes.py`**
    - REST API endpoints for tags functionality
    - Public and authenticated endpoints

13. **Updated: `backend/app.py`**
    - Registered new route blueprints

### AI Integration
14. **Updated: `backend/ai_models/gemini_nlp/gemini_nlp_parser.py`**
    - Added extract_recipe_tags method
    - Intelligent tag suggestion based on recipe content

## API Endpoints

### Favorites Endpoints
- `GET /api/users/{user_id}/favorites` - Get user's favorite recipes (paginated)
- `GET /api/users/{user_id}/favorites/ids` - Get list of favorited recipe IDs
- `GET /api/users/{user_id}/favorites/count` - Get user's favorite count
- `POST/DELETE /api/recipes/{recipe_id}/favorite` - Toggle favorite status
- `GET /api/recipes/{recipe_id}/favorites/count` - Get recipe's favorite count
- `GET /api/recipes/most-favorited` - Get most popular recipes
- `GET /api/recipes/{recipe_id}/is-favorited` - Check if recipe is favorited

### Tags Endpoints
- `GET /api/tags` - Get all tags (optionally filtered by category)
- `GET /api/tags/by-category` - Get tags grouped by category
- `GET /api/tags/popular` - Get most used tags
- `GET /api/tags/{tag_id}` - Get specific tag
- `POST /api/tags` - Create new tag
- `GET /api/recipes/{recipe_id}/tags` - Get recipe's tags
- `POST /api/recipes/{recipe_id}/tags` - Assign tags to recipe
- `PUT /api/recipes/{recipe_id}/tags` - Replace all recipe tags
- `DELETE /api/recipes/{recipe_id}/tags/{tag_id}` - Remove tag from recipe
- `GET /api/tags/{tag_id}/recipes` - Get recipes with specific tag
- `POST /api/recipes/by-tags` - Get recipes with multiple tags

## Database Schema Details

### RecipeTags Table
```sql
TagID (PK, AUTO_INCREMENT)
TagName (UNIQUE, VARCHAR(100))
TagCategory (VARCHAR(50)) - 'cuisine', 'diet', 'course', 'difficulty', 'general'
TagColor (VARCHAR(7)) - Hex color for UI
CreatedAt (TIMESTAMP)
```

### RecipeTagAssignments Table
```sql
AssignmentID (PK, AUTO_INCREMENT)
RecipeID (FK to Recipes)
TagID (FK to RecipeTags)
AssignedAt (TIMESTAMP)
UNIQUE(RecipeID, TagID)
```

### UserFavoriteRecipes Table
```sql
FavoriteID (PK, AUTO_INCREMENT)
UserID (FK to Users)
RecipeID (FK to Recipes)
CreatedAt (TIMESTAMP)
UNIQUE(UserID, RecipeID)
```

## Pre-defined Tags
The system includes 17 pre-defined tags across 5 categories:

**Diet Tags:** Vegetarian, Vegan, Gluten-Free, Low-Carb, Keto
**Difficulty Tags:** Quick & Easy, Beginner, Intermediate, Advanced
**Cuisine Tags:** Italian, Asian, Mexican
**Course Tags:** Breakfast, Lunch, Dinner, Dessert
**General Tags:** Healthy

## AI-Powered Tag Extraction
The Gemini NLP integration automatically suggests tags based on:
- Recipe title and description
- Ingredient analysis
- Cooking time and complexity
- Cultural and dietary indicators

## Frontend Integration Plan
The next phase involves updating the frontend to:
1. Add favorites toggle to PublicRecipeBrowser
2. Display tags on recipe cards
3. Add tag filtering functionality
4. Show favorite status and counts
5. Integrate with existing search and pagination

## Installation Steps

### 1. Database Migration
Run the migration script on your existing database:
```bash
mysql -u your_username -p your_database < SQL/migration_favorites_tags.sql
```

### 2. Backend Dependencies
No new dependencies required - uses existing Flask/SQLAlchemy setup.

### 3. Environment Variables
Ensure `GEMINI_API_KEY` is configured for AI tag extraction.

### 4. Testing
Test the new endpoints using:
- Postman/curl for API testing
- Database queries to verify data integrity
- AI tag extraction with sample recipes

## Usage Examples

### Adding a Recipe to Favorites
```bash
curl -X POST "http://localhost:5000/api/recipes/1/favorite" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Getting User's Favorites
```bash
curl -X GET "http://localhost:5000/api/users/1/favorites?page=1&limit=12" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Filtering Recipes by Tags
```bash
curl -X POST "http://localhost:5000/api/recipes/by-tags" \
  -H "Content-Type: application/json" \
  -d '{"tag_ids": [1, 10], "match_all": false, "page": 1, "limit": 12}'
```

## Performance Considerations
- Database indexes on frequently queried columns
- Pagination for all list endpoints
- Efficient joins for tag and favorite queries
- Caching opportunities for popular tags and recipes

## Security Features
- JWT authentication for user-specific operations
- User authorization checks for favorites access
- Input validation and sanitization
- SQL injection prevention through SQLAlchemy ORM

## Next Steps
1. Update frontend components (PublicRecipeBrowser, RecipeCard)
2. Add nutritional goal-based filtering to personalized recipes
3. Implement tag-based search and filtering UI
4. Add admin interface for tag management
5. Performance optimization and caching
6. Analytics and usage tracking

This implementation provides a solid foundation for the favorites and tags functionality while maintaining compatibility with the existing NutriChef architecture.
