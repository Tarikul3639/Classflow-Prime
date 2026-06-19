import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/api/axios";
import type { ClassUpdateItem, CreateUpdateFormData } from "@/types/update.types";
import { mapToApiError } from "@/api/extract-error";
import type { ApiError } from "@/api/extract-error";
import { UpdateErrorField, type UpdateErrorFieldType } from "../class.types";

/**
 * API Response Structure for Update
 */
interface UpdateClassUpdateResponse {
    success: boolean;
    message: string;
    error?: ApiError<UpdateErrorFieldType>;
    data: {
        update: ClassUpdateItem;
    };
}

/**
 * Payload structure for the thunk argument
 */
interface UpdateThunkArgs {
    classId: string;
    updateId: string;
    updateData: Partial<CreateUpdateFormData>; // Partial allows us to send only the fields that need to be updated
}

export const updateClassUpdate = createAsyncThunk<
    ClassUpdateItem, // Return type
    UpdateThunkArgs, // Argument type
    { rejectValue: ApiError<UpdateErrorFieldType> } // Error type
>(
    "classes/updateClassUpdate",
    async ({ classId, updateId, updateData }, { rejectWithValue }) => {

        if ("title" in updateData) {
            const title = updateData.title?.trim();

            if (!title) {
                return rejectWithValue({
                    message: "Title is required.",
                    field: UpdateErrorField.title,
                    code: "VALIDATION_ERROR",
                });
            }

            if (title.length < 3) {
                return rejectWithValue({
                    message: "Title must be at least 3 characters.",
                    field: UpdateErrorField.title,
                    code: "VALIDATION_ERROR",
                });
            }
        }

        if ("description" in updateData) {
            const description = updateData.description?.trim();

            if (!description) {
                return rejectWithValue({
                    message: "Description is required.",
                    field: UpdateErrorField.description,
                    code: "VALIDATION_ERROR",
                });
            }

            if (description.length < 5) {
                return rejectWithValue({
                    message: "Description must be at least 5 characters.",
                    field: UpdateErrorField.description,
                    code: "VALIDATION_ERROR",
                });
            }
        }

        try {
            // API call to update the class announcement/event
            const { data } = await apiClient.patch<UpdateClassUpdateResponse>(
                `/classes/${classId}/updates/${updateId}`,
                updateData
            );

            if (!data.success) {
                return rejectWithValue(
                    data.error ?? {
                        message: data.message || "Failed to update class update.",
                    }
                );
            }

            return data.data.update;
        } catch (error) {
            return rejectWithValue(
                mapToApiError<UpdateErrorFieldType>(error)
            );
        }
    }
);