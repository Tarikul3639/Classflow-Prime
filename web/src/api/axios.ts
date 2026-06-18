import axios, { AxiosError } from "axios";

// NEXT_PUBLIC_ prefix = accessible on both server and browser
// Without NEXT_PUBLIC_ prefix = server only, undefined in browser
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || "/api/v3";

/**
 * Axios instance with base URL and credentials enabled.
 * withCredentials: true is crucial for sending cookies (accessToken, refreshToken) with each request.
 * This allows the server to read tokens from cookies for authentication/authorization.
 */
export const apiClient = axios.create({
  baseURL: API_PREFIX,
  withCredentials: true,
  timeout: 10000,
});

/**
 * Global Interceptor (Optional but Recommended)
 * Every response will go through this interceptor, allowing us to handle errors in a centralized way.
 * For example, we can check for 401 Unauthorized errors and trigger a global logout or show a toast notification.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = getErrorMessage(error);

    // Example: Triggering a toast globally
    // toast.error(message);

    return Promise.reject(error instanceof AxiosError ? error : new Error(message));
  }
);

/**
 * Helper to get error message (AxiosError based)
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as
      | { message?: string | string[]; error?: string }
      | undefined;

    const msg = data?.message;

    if (Array.isArray(msg)) return msg[0] ?? "Something went wrong";

    return msg || data?.error || error.message || "Something went wrong";
  }

  if (error instanceof Error) return error.message || "Something went wrong";

  return "An unexpected error occurred";
};