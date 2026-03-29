import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api/axios";
import { extractAxiosError } from "@/lib/api/extract-error";

// ─── Interfaces ───────────────────────────────────────────────

export interface ClassFaculty {
    facultyId: string;
    name: string;
    avatarUrl?: string;
    designation: string;
    location: string;
    email: string;
    phone?: string;
    classroomCode?: string;
}

interface FetchClassFacultiesData {
    classId: string;
    faculties: ClassFaculty[];
}

// Fetch faculties Response type
interface FetchClassFacultiesResponse {
    success: boolean;
    message: string;
    data: FetchClassFacultiesData;
}

// Response from API for Create/Update Faculty
interface ClassFacultyResponse {
    success: boolean;
    message: string;
    data: {
        classId: string;
        faculty: ClassFaculty;
    };
}

// ─── Payload Types ────────────────────────────────────────────

export interface CreateClassFacultyPayload {
    classId: string;
    facultyData: Omit<ClassFaculty, "facultyId">;
}

export interface UpdateClassFacultyPayload {
    classId: string;
    facultyId: string;
    facultyData: Partial<Omit<ClassFaculty, "facultyId">>;
}

// ─── Thunks ───────────────────────────────────────────────────

/**
 * Create Faculty
 */
export const createClassFaculty = createAsyncThunk<
    ClassFaculty,                 // single faculty
    CreateClassFacultyPayload,    // { classId: string, facultyData: ClassFacultyPayload }
    { rejectValue: string }
>(
    "classes/createFaculty",
    async ({ classId, facultyData }, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.post<ClassFacultyResponse>(
                `/classes/${classId}/faculties`,
                facultyData
            );
            return data.data.faculty; // single faculty object
        } catch (error: unknown) {
            return rejectWithValue(extractAxiosError(error));
        }
    }
);

/**
 * Update Faculty
 */
export const updateClassFaculty = createAsyncThunk<
    ClassFacultyResponse,
    UpdateClassFacultyPayload,
    { rejectValue: string }
>(
    "classes/updateFaculty",
    async ({ classId, facultyId, facultyData }, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.patch<ClassFacultyResponse>(
                `/classes/${classId}/faculties/${facultyId}`,
                facultyData
            );

            return data;
        } catch (error: unknown) {
            return rejectWithValue(extractAxiosError(error));
        }
    }
);

/**
 * Delete Faculty
 */
export const deleteClassFaculty = createAsyncThunk<
    { facultyId: string; message: string },
    { classId: string; facultyId: string },
    { rejectValue: string }
>(
    "classes/deleteFaculty",
    async ({ classId, facultyId }, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.delete<{
                success: boolean;
                message: string;
            }>(`/classes/${classId}/faculties/${facultyId}`);

            return {
                facultyId,
                message: data.message,
            };
        } catch (error: unknown) {
            return rejectWithValue(extractAxiosError(error));
        }
    }
);

/**
 * Fetch Faculties for a Class
 */
export const fetchClassFaculties = createAsyncThunk<
    ClassFaculty[],            // return type
    { classId: string },       // argument type
    { rejectValue: string }    // thunkApi config type
>(
    "classes/fetchFaculties",
    async ({ classId }, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get<FetchClassFacultiesResponse>(
                `/classes/${classId}/faculties`
            );
            return data.data.faculties; // return only array
        } catch (error: unknown) {
            return rejectWithValue(extractAxiosError(error));
        }
    }
);