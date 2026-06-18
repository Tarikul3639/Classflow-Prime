import { createAsyncThunk } from '@reduxjs/toolkit';

import { apiClient, getErrorMessage } from '@/api/axios';

import type {
    IFetchAgentsResponse,
} from '../agent.types';

export const fetchAgentsThunk = createAsyncThunk<
    IFetchAgentsResponse,
    void,
    { rejectValue: string }
>(
    'agent/fetch',

    async (_, { rejectWithValue }) => {
        try {
            const { data } =
                await apiClient.get<IFetchAgentsResponse>(
                    '/agents',
                );

            if (!data.success) {
                return rejectWithValue(
                    data.message,
                );
            }

            return data;

        } catch (error) {

            return rejectWithValue(
                getErrorMessage(error),
            );
        }
    },
);