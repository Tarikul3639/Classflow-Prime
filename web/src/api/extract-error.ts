import axios, { AxiosError } from "axios";

/**
 * Extracts a user-friendly error message from an unknown error source.
 * Priority: Axios response data -> Axios error message -> Native error message -> Fallback.
 *
 * @param error - The error object (likely from a catch block).
 * @param fallback - Default message if no specific error text is found.
 * @returns {string} A human-readable error message.
 */
export function extractAxiosError(
    error: unknown,
    fallback: string = "Something went wrong"
): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data;

        return (
            data?.message ||
            error.message ||
            fallback
        );
    }

    if (error instanceof Error) {
        return error.message;
    }

    return fallback;
}

/**
 * Standard interface for structured API errors across the UI.
 * Used for consistent error states, form validation (via 'field'), and error tracking (via 'code' and 'status').
 */
export interface ApiError<T = string> {
    message: string;
    field?: T; // Useful for mapping errors to specific form fields
    code?: string; // Unique error code for conditional logic in UI
    status?: string; // Backend business status (NEW)
}

/**
 * Expected shape of error responses from the backend.
 */
type BackendError = {
    message?: string;
    field?: string;
    code?: string;
    status?: string; // NEW: supports backend status-based API
};

/**
 * Transforms any raw error into a structured ApiError object.
 * This ensures that components always receive a predictable error shape.
 *
 * @param error - Raw error caught from an API call or logic.
 * @returns {ApiError<T>} Formatted error object.
 */
export const mapToApiError = <T = string>(
    error: unknown
): ApiError<T> => {
    // Axios error
    if (axios.isAxiosError(error)) {
        const err = error as AxiosError<BackendError>;
        const data = err.response?.data;

        return {
            message:
                data?.message ||
                err.message ||
                "Something went wrong",

            field: data?.field as T,
            code: data?.code ?? "API_ERROR",
            status: data?.status,
        };
    }

    // Standard JS Error
    if (error instanceof Error) {
        return {
            message: error.message,
            code: "UNKNOWN_ERROR",
        };
    }

    // Fallback
    return {
        message: "Unexpected error occurred",
        code: "UNKNOWN_ERROR",
    };
};