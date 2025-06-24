export const authenticatedFetch = async (url, options = {}, authContextValue) => {
  const { token, showExpiryMessageAndLogout } = authContextValue;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  if (options.body instanceof FormData) {
    delete fetchOptions.headers['Content-Type'];
  }

  try {
    const response = await fetch(url, fetchOptions);

    if (response.status === 401) {
      if (showExpiryMessageAndLogout && typeof showExpiryMessageAndLogout === 'function') {
        showExpiryMessageAndLogout("Your session has expired. Please log in again.");
      }
      throw new Error(`Unauthorized: ${response.statusText}`);
    }
    return response;
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
};

const API_BASE_URL = '/api';

export const loginUser = (email, password) => {
  return fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
};

export const registerUser = (userData) => {
  return fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
};

export const getRecipeDetails = (recipeId) => {
  return fetch(`${API_BASE_URL}/recipes/${recipeId}`, {
    method: 'GET',
  });
};

export const getRecipeSubstitutes = (ingredientName, recipeId) => {
  return fetch(`${API_BASE_URL}/substitute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredient_name: ingredientName, recipe_id: recipeId }),
  });
};

export const getIngredientAllergies = (ingredientIds) => {
  return fetch(`${API_BASE_URL}/ingredients/allergies_for_list`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredient_ids: ingredientIds }),
  });
};

export const uploadRecipeImage = (formData, authContextValue) => {
  return authenticatedFetch(`${API_BASE_URL}/recipes/upload_image`, {
    method: 'POST',
    body: formData,
  }, authContextValue);
};

export const createRecipe = (recipeData, authContextValue) => {
  return authenticatedFetch(`${API_BASE_URL}/recipes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipeData),
  }, authContextValue);
};

export const saveMealPlan = (planData, authContextValue) => {
  return authenticatedFetch(`${API_BASE_URL}/meal-planner/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(planData),
  }, authContextValue);
};

export const loadMealPlan = (authContextValue) => {
  return authenticatedFetch(`${API_BASE_URL}/meal-planner/load`, {
    method: 'GET',
  }, authContextValue);
};

async function processAuthenticatedRequest(url, method = 'GET', authContextValue, body = null, params = {}) {
    let requestPath = `${API_BASE_URL}${url}`;

    if (Object.keys(params).length > 0) {
        const queryParams = new URLSearchParams(params).toString();
        requestPath = `${requestPath}?${queryParams}`;
    }

    const options = { method };
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await authenticatedFetch(requestPath, options, authContextValue);

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: response.statusText || `HTTP error ${response.status}` };
            }
            const errorMessage = errorData.error || errorData.message || `Request failed with status ${response.status}`;
            throw new Error(errorMessage);
        }

        if (response.status === 204 || response.headers.get("content-length") === "0") {
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`API request failed: ${method} ${url}`, error.message);
        throw error;
    }
}
