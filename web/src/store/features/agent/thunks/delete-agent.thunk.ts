import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient, getErrorMessage } from '@/api/axios';

interface IDeleteAgentResponse {
    success: boolean;
    message: string;
    data: {
        agentId: string;
    };
}

export const deleteAgentThunk = createAsyncThunk<
    IDeleteAgentResponse,
    string,
    { rejectValue: string }
>(
    'agent/delete',
    async (agentId, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.delete<IDeleteAgentResponse>(
                `/agents/${agentId}`,
            );

            if (!data.success) {
                return rejectWithValue(data.message);
            }

            return data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    },
);