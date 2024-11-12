import axios from "axios";
import { BASE_URL } from './baseurl'; // Ensure BASE_URL is correctly imported

export const commonApi = async (
  httpRequestType,
  url,
  reqBody = {},
  reqHeader = {}
) => {
  const token = localStorage.getItem('token'); // Adjust according to where you store the token

  const reqConfig = {
    method: httpRequestType,
    url: `${BASE_URL}${url}`, // Combine base URL with the endpoint
    data: reqBody,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}), // Include token if it exists
      ...reqHeader, // Spread any additional headers
    },
  };

  try {
    const result = await axios(reqConfig);
    return result.data; // Return the response data
  } catch (err) {
    // Log the error for debugging
    console.error("API call error:", err);

    // Return error response for better error handling
    return {
      error: true,
      message: err.response ? err.response.data : err.message,
      status: err.response ? err.response.status : 500,
    };
  }
};