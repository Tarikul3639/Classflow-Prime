import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api/axios";
import { extractAxiosError } from "@/lib/api/extract-error";
import { DashboardData } from "../dashboard.types";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface FetchDashboardResponse {
    success: boolean;
    message: string;
    data: DashboardData;
}

// ─── Thunks ───────────────────────────────────────────────────────────────────

/**
 * Fetch Dashboard Data
 */
export const fetchDashboardData = createAsyncThunk<
    DashboardData,                         // fulfilled payload
    void,                                  // arg (user id comes from JWT)
    { rejectValue: { message: string } }
>("dashboard/fetchAll", async (_, { rejectWithValue }) => {
    try {
        const { data } = await apiClient.get<FetchDashboardResponse>("/dashboard");
        if (!data.success) {
            return rejectWithValue({
                message: data.message || "Failed to load dashboard",
            });
        }
        return data.data;
    } catch (error: unknown) {
        return rejectWithValue({
            message: extractAxiosError(error) || "An error occurred while loading dashboard",
        });
    }
});