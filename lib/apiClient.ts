import axios from "axios";

/**
 * Base URL for API requests.
 * Defaults to "http://localhost:8080/api" if the environment variable `SELF_API_URL` is not set.
 */
const BASE_URL = process.env.NEXT_PUBLIC_SELF_API_URL || "http://localhost:8080/api";

/**
 * Axios instance for making HTTP requests with predefined configurations.
 * Includes default base URL, timeout settings, and headers.
 */
const apiClient = axios.create({
  /**
   * The base URL for all API requests.
   */
  baseURL: BASE_URL,

  /**
   * Timeout for API requests, in milliseconds (default: 10,000ms).
   */
  timeout: 10000,

  /**
   * Default headers for all API requests.
   */
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor to add custom logic before the request is sent.
 * Example: Attaches an authentication token to the request headers.
 */
apiClient.interceptors.request.use(
  (config) => {
    if (config.headers) {
      config.headers.set("Cache-Control", "no-cache");
      config.headers.delete("if-none-match");
      config.headers.delete("if-modified-since");
    }
    /**
     * Retrieves the authentication token from local storage and adds it
     * to the request headers if it exists.
     */
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    /**
     * Handles errors that occur during the request configuration process.
     * @returns A rejected Promise with the error.
     */
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to process responses and handle errors globally.
 */
apiClient.interceptors.response.use(
  /**
   * Processes the successful response before passing it to the calling function.
   * @param response - The successful API response.
   * @returns The response object.
   */
  (response) => {
    return response;
  },
  /**
   * Handles errors that occur during the API request.
   * Logs the error to the console for debugging.
   * @param error - The error object from the failed API request.
   * @returns A rejected Promise with the error.
   */
  (error) => {
    console.log("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
