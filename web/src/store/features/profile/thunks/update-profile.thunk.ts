import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient, getErrorMessage } from "@/api/axios";
import type { IUser } from '../profile.types'

/**
 * Update user profile.
 * Backend: PUT /profile/update
 */
interface UpdateProfileResponse {
    success: boolean;
    message: string;
    data: {
        user: IUser;
    };
}

interface UpdateProfilePayload {
    name: string;
    email: string;
    bio: string;
    avatarUrl: string;
}

export const updateProfileThunk = createAsyncThunk<
    UpdateProfileResponse, // Return type of the fulfilled action
    UpdateProfilePayload, // Argument type for the payload
    { rejectValue: string }
>("profile/update", async (payload: UpdateProfilePayload, { rejectWithValue }) => {
    try {
        const { data } = await apiClient.put<UpdateProfileResponse>("/profile/update", payload);
        if (!data.success) {
            return rejectWithValue(data.message || "Failed to update profile");
        }
        // console.log("Update: ", data.data);
        return data;
    }
    catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});