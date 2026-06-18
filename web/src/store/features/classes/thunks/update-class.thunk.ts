import { createAsyncThunk } from "@reduxjs/toolkit";
import { IClassDetails } from "./fetch-single-class.thunk";
import { apiClient } from "@/api/axios";
import { AxiosError } from "axios";

interface UpdateClassPayload {
    classId: string;
    data: Partial<IClassDetails>;
}

interface UpdateClassResponse {
    success: boolean;
    message: string;
    data: {
        classId: string;
    };
}

interface UpdateClassError {
    message: string;
    field?: string | null;
}

export const updateClass = createAsyncThunk<
    UpdateClassResponse,
    UpdateClassPayload,
    { rejectValue: UpdateClassError }
>("classes/updateClass", async ({ classId, data }, { rejectWithValue }) => {
    try {
        if (!data.className || !data.department || !data.semester) {
            return rejectWithValue({
                field: !data.className
                    ? "ClassName"
                    : !data.department
                        ? "Department"
                        : "Semester",
                message:
                    (!data.className
                        ? "Class name is required"
                        : !data.department
                            ? "Department is required"
                            : "Semester is required") + " to create a class",
            });
        }

        const response = await apiClient.patch<UpdateClassResponse>(
            `/classes/${classId}`,
            data,
        );

        if (!response.data.success) {
            return rejectWithValue({
                field: null,
                message: response.data.message || "Failed to update class",
            });
        }

        return response.data;
    } catch (error: unknown) {
        const err = error as AxiosError<{ field?: string; message?: string }>;

        return rejectWithValue({
            field: err.response?.data?.field || null,
            message: err.response?.data?.message || "Something went wrong",
        });
    }
});
