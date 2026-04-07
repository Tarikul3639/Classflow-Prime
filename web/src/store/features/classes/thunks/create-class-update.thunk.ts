import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api/axios";
import { CreateUpdateFormData, ClassUpdateItem } from "@/types/update.types";
import { mapToApiError } from "@/lib/errors/api-error.mapper";
import type { ApiError } from "@/lib/errors/api-error.mapper";
import type { UpdateErrorFieldType } from "../class.types";

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

        const { data } = await apiClient.post<CreateClassUpdateResponse>(
            `/classes/${classId}/updates`,
            updateData,
        );
        console.log("API RESPONSE:", data);
        if (!data.success) {
            return rejectWithValue({
                message: data.message || "Failed to create class update",
            });
        }
        console.log("API RESPONSE:", data.data.update);
        return data.data.update; // ← return just the item
    } catch (error: unknown) {
        return rejectWithValue(
            mapToApiError<UpdateErrorFieldType>(error)
        );
    }
});