import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api/axios";
import type { ClassUpdateItem } from "@/types/update.types";
import { extractAxiosError } from "@/lib/api/extract-error";

/**
 * API Response Structure
 */
interface FetchClassUpdateResponse {
    success: boolean;
    message: string;
    data: {
        update: ClassUpdateItem; // Single object since we fetch by ID
    };
}

/**
 * Fetch a single class update by its ID
 * URL: /classes/:classId/updates/:updateId
 */
export const fetchSingleClassUpdate = createAsyncThunk<
    { classId: string; update: ClassUpdateItem },
    { classId: string; updateId: string },
    { rejectValue: { message: string } }
>(
    "classes/fetchSingleClassUpdate",
    async ({ classId, updateId }, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get<FetchClassUpdateResponse>(
                `/classes/${classId}/updates/${updateId}`
            );

            if (!data.success) {
                return rejectWithValue({
                    message:
                        data.message || "Failed to fetch the update details.",
                });
            }

            return {
                classId,
                update: data.data.update,
            };
        } catch (error) {
            return rejectWithValue({
                message: extractAxiosError(error),
            });
        }
    }
);