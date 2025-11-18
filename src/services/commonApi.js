import axios from "axios";
import { BASE_URL } from "./baseurl";
import { store } from "../redux/store";

// SECURITY WARNING:
// Storing JWT tokens in localStorage exposes them to XSS attacks. For production, consider using httpOnly cookies for JWT storage.
// See: https://owasp.org/www-community/HttpOnly

// Function to store the JWT in local storage
export const setToken = (token) => {
  console.log("Setting jwtToken in localStorage:", token); // Log the token being set
  localStorage.setItem("jwtToken", token); // Store the token with the new name
};

// Function to remove the JWT from local storage
export const removeJwtToken = () => {
  console.log("Removing jwtToken from localStorage."); // Log the removal
  localStorage.removeItem("jwtToken"); // Remove the token using the new name
};

// Improved error handling utility
function extractApiError(error) {
  if (error.response && error.response.data) {
    if (typeof error.response.data === 'string') return error.response.data;
    if (error.response.data.message) return error.response.data.message;
    return JSON.stringify(error.response.data);
  }
  if (error.message) return error.message;
  return 'Unknown error occurred';
}

export const commonApi = async (
  httpRequestType = "GET", // Default to GET
  url,
  reqBody = {},
  reqHeader = {}
) => {
  const state = store.getState(); // Get the current state
  const token = state.auth.token; // Access the token from auth slice

  // Validate HTTP method
  const allowedMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
  if (!allowedMethods.includes(httpRequestType)) {
    throw new Error(`Invalid HTTP method: ${httpRequestType}`);
  }

  // Check if BASE_URL is defined
  if (!BASE_URL) {
    throw new Error("BASE_URL is not defined");
  }

  const reqConfig = {
    method: httpRequestType,
    url: `${BASE_URL}${url}`, // Combine base URL with the endpoint
    ...(httpRequestType !== "GET" && { data: reqBody }), // Only include data if not GET
    headers: {
      "Content-Type": "application/json",
      ...reqHeader, // Spread any additional headers
      ...(reqBody instanceof FormData && { 
        "Content-Type": "multipart/form-data"
      }),
      Authorization: `Bearer ${token || ""}`, // Always send Authorization
    },
    timeout: 10000, // Set timeout to 10 seconds
  };

  try {
    const response = await axios(reqConfig);

    // Handle different response status codes
    if (response.status >= 200 && response.status < 300) {
      return response.data; // Return the response data
    } else if (response.status >= 400 && response.status < 500) {
      throw new Error(response.data.message || "Client error"); // Throw an error for client-side issues
    } else {
      throw new Error("Server error"); // Throw an error for server-side issues
    }
  } catch (err) {
    // Log the error for debugging
    console.error("API call error:", err);
    // Throw a cleaner error message
    throw new Error(extractApiError(err));
  }
};
