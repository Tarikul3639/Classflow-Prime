import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/api/axios";
import { extractAxiosError } from "@/api/extract-error";
import { Routine } from "@/types/routine.types";

export interface Period {
    _id?: string;
    periodNo: number;
    startTime: string;
    endTime: string;
}

export interface CreateRoutinePayload {
    classId: string;
    periods: Omit<Period, "_id">[];
}

interface RoutineResponse {
    success: boolean;
    message: string;
    data: Routine;
}

export const createRoutine = createAsyncThunk(
    "routine/createRoutine",
    async (payload: CreateRoutinePayload, { rejectWithValue }) => {
        try {
            // console.log("Create Routine with periods:", payload.periods);
            const res = await apiClient.post<RoutineResponse>(
                `/classes/${payload.classId}/routine`,
                {
                    periods: payload.periods,
                }
            );

            return res.data.data;
        } catch (error: any) {
            return rejectWithValue(
                extractAxiosError(error) || "Failed to create routine"
            );
        }
    }
);