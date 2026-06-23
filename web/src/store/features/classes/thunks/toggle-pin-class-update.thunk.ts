import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/api/axios";
import { isAxiosError } from "axios";

/**
 * Payload structure for toggling pin
 */
interface TogglePinArgs {
    classId: string;
    updateId: string;
    isPinned: boolean;
}

interface TogglePinUpdate {
    updateId: string;
    isPinned: boolean;
}

interface TogglePinResponse {
    success: boolean;
    message: string;
    data: {
        update: TogglePinUpdate;
    };
}

export const togglePinClassUpdate = createAsyncThunk<
    TogglePinUpdate,
    TogglePinArgs,
    { rejectValue: { message: string } }
>(
    "classes/togglePinClassUpdate",
    async ({ classId, updateId, isPinned }, { rejectWithValue }) => {
        try {
            // API call to toggle the pin status of the class update
            const { data } = await apiClient.patch<TogglePinResponse>(
                `/classes/${classId}/updates/${updateId}/toggle-pin`,
                { isPinned: !isPinned }
            );

            if (!data.success) {
                return rejectWithValue({
                    message: data.message || "Failed to toggle pin status."
                });
            }

            // console.log("Toggle Pin Response: ", data.data.update);

            return data.data.update;
        } catch (error: unknown) {
            let errorMessage = "An error occurred while toggling pin.";

            if (isAxiosError(error)) {
                errorMessage = error.response?.data?.message || error.message;
            }

            return rejectWithValue({ message: errorMessage });
        }
    }
);