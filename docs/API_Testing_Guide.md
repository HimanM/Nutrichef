# Flask REST API Testing Guide with Postman

This guide provides comprehensive instructions for testing the NutriChef Flask REST API using Postman. It covers setting up the environment, handling authentication, and executing various test cases for the API endpoints.

## 1. Prerequisites

*   **Postman:** Ensure you have the latest version of the Postman desktop client installed. You can download it from [postman.com](https://www.postman.com/downloads/).
*   **Running Flask Application:** The Flask API server must be running locally. The base URL is assumed to be `http://127.0.0.1:5000`.

## 2. Postman Environment Setup

Using a Postman environment helps manage variables across your requests.

1.  **Create a new Environment:**
    *   Click on the "Environments" tab on the left sidebar.
    *   Click the `+` button to create a new environment.
    *   Name the environment (e.g., "NutriChef API").

2.  **Add Environment Variables:**
    *   Add a variable named `baseURL` and set its "Initial Value" and "Current Value" to `http://127.0.0.1:5000`.
    *   Add a variable named `authToken`. Leave its value empty for now. This will be populated automatically after logging in.

3.  **Select the Environment:**
    *   In the top-right corner of the Postman window, select your newly created environment from the dropdown menu.

## 3. Authentication Workflow

The API uses JSON Web Tokens (JWT) for authentication. Protected endpoints require a valid `authToken` in the `Authorization` header.

### /login Endpoint

This endpoint authenticates a user and returns a JWT.

*   **Method:** `POST`
*   **Endpoint:** `{{baseURL}}/login`
*   **Request Body (JSON):**
    ```json
    {
        "email": "admin@nutrichef.com",
        "password": "your_password"
    }
    ```

### Capturing the Auth Token

Use a Postman test script to automatically capture the JWT and store it in the `authToken` environment variable.

1.  In the Postman request builder for the `/login` request, go to the **Tests** tab.
2.  Add the following JavaScript code:

    ```javascript
    const jsonData = pm.response.json();

    if (pm.response.code === 200 && jsonData.access_token) {
        pm.environment.set("authToken", jsonData.access_token);
        console.log("Auth Token captured successfully.");
    } else {
        console.log("Could not capture auth token.");
    }
    ```

## 4. API Endpoint Test Cases

### Users

| Test Case | HTTP Method | Endpoint | Request Body/Params | Expected Status Code | Expected Response Body |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Get all users | `GET` | `/users` | | 200 | A JSON array of user objects |
| Get user by ID | `GET` | `/users/1` | | 200 | A JSON object of the user |
| Get non-existent user | `GET` | `/users/999` | | 404 | `{"error": "User not found"}` |
| Create a new user | `POST` | `/users` | `{"name": "Test User", "email": "test@example.com", "password": "password123"}` | 201 | A JSON object of the newly created user |
| Create user with existing email | `POST` | `/users` | `{"name": "Test User", "email": "admin@nutrichef.com", "password": "password123"}` | 409 | `{"error": "Email already exists"}` |
| Update user | `PUT` | `/users/1` | `{"name": "Updated Name"}` | 200 | A JSON object of the updated user |
| Update non-existent user | `PUT` | `/users/999` | `{"name": "Updated Name"}` | 404 | `{"error": "User not found"}` |
| Delete user | `DELETE` | `/users/1` | | 200 | `{"message": "User deleted successfully"}` |
| Delete non-existent user | `DELETE` | `/users/999` | | 404 | `{"error": "User not found"}` |

### Recipes

| Test Case | HTTP Method | Endpoint | Request Body/Params | Expected Status Code | Expected Response Body |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Get all public recipes | `GET` | `/recipes` | | 200 | A JSON array of public recipe objects |
| Get recipe by ID | `GET` | `/recipes/1` | | 200 | A JSON object of the recipe |
| Get non-existent recipe | `GET` | `/recipes/999` | | 404 | `{"error": "Recipe not found"}` |
| Create a new recipe | `POST` | `/recipes` | `{"title": "New Recipe", "description": "A test recipe", "instructions": "Mix all ingredients.", "user_id": 1}` | 201 | A JSON object of the newly created recipe |
| Create recipe with missing title | `POST` | `/recipes` | `{"description": "A test recipe", "instructions": "Mix all ingredients.", "user_id": 1}` | 400 | `{"error": "Missing required fields"}` |
| Update recipe | `PUT` | `/recipes/1` | `{"title": "Updated Recipe Title"}` | 200 | A JSON object of the updated recipe |
| Update non-existent recipe | `PUT` | `/recipes/999` | `{"title": "Updated Recipe Title"}` | 404 | `{"error": "Recipe not found"}` |
| Delete recipe | `DELETE` | `/recipes/1` | | 200 | `{"message": "Recipe deleted successfully"}` |
| Delete non-existent recipe | `DELETE` | `/recipes/999` | | 404 | `{"error": "Recipe not found"}` |

### Ingredients

| Test Case | HTTP Method | Endpoint | Request Body/Params | Expected Status Code | Expected Response Body |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Get all ingredients | `GET` | `/ingredients` | | 200 | A JSON array of ingredient objects |
| Get ingredient by ID | `GET` | `/ingredients/1` | | 200 | A JSON object of the ingredient |
| Get non-existent ingredient | `GET` | `/ingredients/999` | | 404 | `{"error": "Ingredient not found"}` |
| Create a new ingredient | `POST` | `/ingredients` | `{"name": "New Ingredient"}` | 201 | A JSON object of the newly created ingredient |
| Create ingredient with existing name | `POST` | `/ingredients` | `{"name": "salt"}` | 409 | `{"error": "Ingredient already exists"}` |
| Update ingredient | `PUT` | `/ingredients/1` | `{"name": "Updated Ingredient Name"}` | 200 | A JSON object of the updated ingredient |
| Update non-existent ingredient | `PUT` | `/ingredients/999` | `{"name": "Updated Ingredient Name"}` | 404 | `{"error": "Ingredient not found"}` |
| Delete ingredient | `DELETE` | `/ingredients/1` | | 200 | `{"message": "Ingredient deleted successfully"}` |
| Delete non-existent ingredient | `DELETE` | `/ingredients/999` | | 404 | `{"error": "Ingredient not found"}` |

### Allergy & Intolerances

| Test Case | HTTP Method | Endpoint | Request Body/Params | Expected Status Code | Expected Response Body |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Get all allergies | `GET` | `/allergies` | | 200 | A JSON array of allergy objects |
| Get allergy by ID | `GET` | `/allergies/1` | | 200 | A JSON object of the allergy |
| Get non-existent allergy | `GET` | `/allergies/999` | | 404 | `{"error": "Allergy not found"}` |
| Create a new allergy | `POST` | `/allergies` | `{"name": "New Allergy"}` | 201 | A JSON object of the newly created allergy |
| Create allergy with existing name | `POST` | `/allergies` | `{"name": "milk allergy"}` | 409 | `{"error": "Allergy already exists"}` |
| Update allergy | `PUT` | `/allergies/1` | `{"name": "Updated Allergy Name"}` | 200 | A JSON object of the updated allergy |
| Update non-existent allergy | `PUT` | `/allergies/999` | `{"name": "Updated Allergy Name"}` | 404 | `{"error": "Allergy not found"}` |
| Delete allergy | `DELETE` | `/allergies/1` | | 200 | `{"message": "Allergy deleted successfully"}` |
| Delete non-existent allergy | `DELETE` | `/allergies/999` | | 404 | `{"error": "Allergy not found"}` |

### Contact Messages

| Test Case | HTTP Method | Endpoint | Request Body/Params | Expected Status Code | Expected Response Body |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Get all contact messages | `GET` | `/contact-messages` | | 200 | A JSON array of contact message objects |
| Get contact message by ID | `GET` | `/contact-messages/1` | | 200 | A JSON object of the contact message |
| Get non-existent contact message | `GET` | `/contact-messages/999` | | 404 | `{"error": "Message not found"}` |
| Create a new contact message | `POST` | `/contact-messages` | `{"name": "Test User", "email": "test@example.com", "message": "This is a test message."}` | 201 | A JSON object of the newly created contact message |
| Update contact message | `PUT` | `/contact-messages/1` | `{"replied": true}` | 200 | A JSON object of the updated contact message |
| Update non-existent contact message | `PUT` | `/contact-messages/999` | `{"replied": true}` | 404 | `{"error": "Message not found"}` |
| Delete contact message | `DELETE` | `/contact-messages/1` | | 200 | `{"message": "Message deleted successfully"}` |
| Delete non-existent contact message | `DELETE` | `/contact-messages/999` | | 404 | `{"error": "Message not found"}` |