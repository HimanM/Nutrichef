// frontend/src/utils/apiUtil.js

/**
 * A wrapper around the native fetch function to automatically include
 * authentication headers and handle common responses like 401 for session expiry.
 *
 * @param {string} url The URL to fetch.
 * @param {object} options Standard fetch options (method, body, custom headers, etc.).
 * @param {object} authContextValue The value obtained from useAuth(), expected to contain
 *                                  `token` and `showExpiryMessageAndLogout(message)`.
 * @returns {Promise<Response>} The promise returned by fetch.
 */
export const authenticatedFetch = async (url, options = {}, authContextValue) => {
  const { token, showExpiryMessageAndLogout } = authContextValue;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    // Add other default headers if needed
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Merge options, allowing custom options to override defaults or add new ones
  const fetchOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers, // User-provided headers override defaults
    },
  };

  // Special handling for FormData: remove Content-Type so browser can set it with boundary
  if (options.body instanceof FormData) {
    delete fetchOptions.headers['Content-Type'];
  }

  try {
    const response = await fetch(url, fetchOptions);

    if (response.status === 401) {
      if (showExpiryMessageAndLogout && typeof showExpiryMessageAndLogout === 'function') {
        showExpiryMessageAndLogout("Your session has expired. Please log in again.");
      }
      // Throw an error to be caught by the calling function (processAuthenticatedRequest)
      // This ensures that the promise chain is broken and subsequent .json() etc. are not called.
      throw new Error(`Unauthorized: ${response.statusText}`);
    }
    return response; // Return the response for the caller to handle .json(), .ok, etc.
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
};

const API_BASE_URL = '/api'; // Standard base URL for API calls

/**
 * Helper function to make authenticated API requests and process responses.
 * @param {string} url - The API endpoint (e.g., '/pantry').
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE).
 * @param {object} authContextValue - Auth context for authenticatedFetch.
 * @param {object} [body=null] - Request body for POST/PUT.
 * @param {object} [params={}] - URL query parameters.
 * @returns {Promise<any>} - The JSON response from the API.
 */
async function processAuthenticatedRequest(url, method = 'GET', authContextValue, body = null, params = {}) {
    let requestPath = `${API_BASE_URL}${url}`;

    if (Object.keys(params).length > 0) {
        const queryParams = new URLSearchParams(params).toString();
        requestPath = `${requestPath}?${queryParams}`;
    }

    const options = { method };
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) { // Added PATCH
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
            // Use the error message from backend if available, otherwise a generic one
            const errorMessage = errorData.error || errorData.message || `Request failed with status ${response.status}`;
            throw new Error(errorMessage);
        }

        // Handle 204 No Content responses (e.g., for DELETE)
        if (response.status === 204 || response.headers.get("content-length") === "0") {
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`API request failed: ${method} ${url}`, error.message);
        // Re-throw the error so UI components can handle it (e.g., display notifications)
        throw error;
    }
}

// Pantry API functions removed as they are now implemented with direct fetch in components.


// Example of how other API calls might be structured, if any exist:
// export const getSomeOtherData = async (authContextValue, someId) => {
// return processAuthenticatedRequest(`/other-data/${someId}`, 'GET', authContextValue);
// };
//
// If there's an existing object that all api functions are attached to,
// these new functions should be added to that object.
// For now, exporting them directly as named exports.
