import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/api/axios";
import { CreateUpdateFormData, ClassUpdateItem } from "@/types/update.types";
import { mapToApiError } from "@/api/extract-error";
import type { ApiError } from "@/api/extract-error";
import { UpdateErrorField, type UpdateErrorFieldType } from "../class.types";

interface CreateClassUpdatePayload {
    classId: string;
    updateData: CreateUpdateFormData;
}

interface CreateClassUpdateResponse {
    success: boolean;
    message: string;
    data: {
        update: ClassUpdateItem;
    };
}

export const createClassUpdate = createAsyncThunk<
    ClassUpdateItem,
    CreateClassUpdatePayload,
    { rejectValue: ApiError<UpdateErrorFieldType> }
>("classes/createUpdate", async ({ classId, updateData }, { rejectWithValue }) => {
    try {
        if (!updateData.title) {
            return rejectWithValue({
                field: "title",
                message: "Title is required for the update",
            });
        }

        if (!updateData.category) {
            return rejectWithValue({
                field: "type", // or change to "category"
                message: "Update type is required",
            });
        }
        if (!updateData.description) {
            return rejectWithValue({
                field: "description",
                message: "Description is required for the update",
            });
        }

        const title = updateData.title.trim();
        const description = updateData.description.trim();

        if (title.length < 3) {
            return rejectWithValue({
                message: "Title must be at least 3 characters.",
                field: UpdateErrorField.title,
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

        const { data } = await apiClient.post<CreateClassUpdateResponse>(
            `/classes/${classId}/updates`,
            updateData,
        );
        // console.log("API RESPONSE:", data);
        if (!data.success) {
            return rejectWithValue({
                message: data.message || "Failed to create class update",
            });
        }
        // console.log("API RESPONSE:", data.data.update);
        return data.data.update; // ← return just the item
    } catch (error: unknown) {
        return rejectWithValue(
            mapToApiError<UpdateErrorFieldType>(error)
        );
    }
});