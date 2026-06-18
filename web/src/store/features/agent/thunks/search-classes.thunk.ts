import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient, getErrorMessage } from "@/api/axios";
import type { ISearchClassesResponse } from "../agent.types";

export const searchClassesThunk = createAsyncThunk<
    ISearchClassesResponse,
    string,
    { rejectValue: string }
>("agent/searchClasses", async (query, { rejectWithValue }) => {
    try {
        const { data } = await apiClient.get<ISearchClassesResponse>(
            "/agents/classes/search",
            {
                params: { q: query },
            },
        );

        if (!data.success) {
            return rejectWithValue(data.message);
        }

        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});
