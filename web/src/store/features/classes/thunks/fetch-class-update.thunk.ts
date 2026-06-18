import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/api/axios";
import type { ClassUpdateItem } from "@/types/update.types";

interface FetchClassUpdateResponse {
    success: boolean;
    message: string;
    data: { update: ClassUpdateItem[] };
}

export const fetchClassUpdate = createAsyncThunk<
    ClassUpdateItem[],
    string,
    { rejectValue: { message: string } }
>(
    "classes/fetchClassUpdate",
    async (classId, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get<FetchClassUpdateResponse>(
                `/classes/${classId}/updates`
            );
            if (!data.success) {
                return rejectWithValue({ message: data.message || "Failed to fetch updates." });
            }
            return data.data.update;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred.";
            return rejectWithValue({ message });
        }
    }
);