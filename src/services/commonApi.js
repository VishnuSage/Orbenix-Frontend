import axios from "axios";
import { BASE_URL } from "./baseurl"; // Ensure BASE_URL is correctly imported

// Function to retrieve the JWT from local storage
const getJwtToken = () => {
  return localStorage.getItem("jwtToken"); // Adjust if using cookies or another storage method
};

export const commonApi = async (
  httpRequestType = "GET", // Default to GET
  url,
  reqBody = {},
  reqHeader = {}
) => {
  const token = getJwtToken(); // Get the JWT token

  // Validate HTTP method
  const allowedMethods = ["GET", "POST", "PUT", "DELETE"];
  if (!allowedMethods.includes(httpRequestType)) {
    throw new Error(`Invalid HTTP method: ${httpRequestType}`);
  }

  const reqConfig = {
    method: httpRequestType,
    url: `${BASE_URL}${url}`, // Combine base URL with the endpoint
    data: reqBody,
    headers: {
      "Content-Type": "application/json",
      ...reqHeader, // Spread any additional headers
      ...(token ? { Authorization: `Bearer ${token}` } : {}), // Include JWT if it exists
    },
    timeout: 10000, // Set timeout to 10 seconds
  };

  try {
    const result = await axios(reqConfig);
    if (result && result.data) {
      return result.data; // Return the response data
    }
    throw new Error("Unexpected response structure");
  } catch (err) {
    // Log the error for debugging
    console.error("API call error:", err);
    throw {
      error: true,
      message: err.response ? err.response.data : err.message,
      status: err.response ? err.response.status : 500,
    };
  }
};
