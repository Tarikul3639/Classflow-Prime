import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/api/axios";

export enum ClassStatus {
    ACTIVE = 'active',
    ENDED = 'ended',
    UPCOMING = 'upcoming',
}

export interface IClassDetails {
    classId: string;
    department: string;
    className: string;
    members: number;
    instructor: string;
    semester: string;
    themeColor: string;
    coverImage?: string;
    avatarUrl?: string | null;
    status: ClassStatus;
    isInstructor: boolean; // ← bonus field to indicate if the current user is the instructor
    isAssistant: boolean; // ← bonus field to indicate if the current user is an assistant
    allowEnroll: boolean; // ← bonus field to indicate if enrollment is allowed
}

interface FetchClassResponse {
    success: boolean;
    message: string;
    data: {
        class: IClassDetails;
    };
}

export const fetchSingleClass = createAsyncThunk<
    IClassDetails,
    string,
    { rejectValue: { message: string } }
>("classes/fetchSingleUpdate", async (classId, { rejectWithValue }) => {
    try {
        const { data } = await apiClient.get<FetchClassResponse>(`/classes/${classId}`);

        if (!data.success) {
            return rejectWithValue({
                message: data.message || "Failed to fetch class details",
            });
        }

        // console.log("Fetch Class of " + `${data.data.class.className}: ` + JSON.stringify(data.data.class, null, 2));

        return data.data.class;
    } catch (error: unknown) {
        console.log("Error fetching class details:", error);
        const err = error as Error;
        return rejectWithValue({
            message: err.message || "An error occurred while fetching class details",
        });
    }
});