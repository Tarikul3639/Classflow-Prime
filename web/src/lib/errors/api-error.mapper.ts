import { AxiosError } from "axios";

export interface ApiError<T = string> {
    message: string;
    field?: T;
    code?: string;
}

type BackendError = {
    message?: string;
    field?: string;
    code?: string;
};

export const mapToApiError = <T = string>(
    error: unknown
): ApiError<T> => {
    if ((error as AxiosError).isAxiosError) {
        const err = error as AxiosError<BackendError>;

        return {
            message:
                err.response?.data?.message ||
                err.message ||
                "Something went wrong",
            field: err.response?.data?.field as T, // 👈 important
            code: err.response?.data?.code ?? "API_ERROR",
        };
    }

    if (error instanceof Error) {
        return {
            message: error.message,
            code: "UNKNOWN_ERROR",
        };
    }

    return {
        message: "Unexpected error occurred",
        code: "UNKNOWN_ERROR",
    };
};