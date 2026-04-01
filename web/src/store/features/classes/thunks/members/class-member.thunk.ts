import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api/axios";
import { extractAxiosError } from "@/lib/api/extract-error";

// ─── Interfaces ───────────────────────────────────────────────

export enum EnrollmentRole {
    INSTRUCTOR = 'instructor',
    ASSISTANT = 'assistant',
    LEARNER = 'learner',
}

export interface ClassMember {
    userId: string;
    name: string;
    email: string;
    role: EnrollmentRole;
    verified?: boolean;
    avatarUrl?: string;
}

interface FetchClassMembersResponse {
    success: boolean;
    message: string;
    data: {
        classId: string;
        members: ClassMember[];
    };
}

// ─── Thunks ───────────────────────────────────────────────────

/**
 * Fetch Class Members
 */
export const fetchClassMembers = createAsyncThunk<
    ClassMember[],                 // array of members
    string,                        // classId
    { rejectValue: { message: string } }
>("classes/fetchMembers", async (classId, { rejectWithValue }) => {
    try {
        const { data } = await apiClient.get<FetchClassMembersResponse>(`/classes/${classId}/members`);
        if (!data.success) {
            return rejectWithValue({
                message: data.message || "Failed to fetch class members",
            });
        }
        console.log("All member: ", data.data.members);
        return data.data.members;
    } catch (error: unknown) {
        return rejectWithValue({
            message: extractAxiosError(error) || "An error occurred while fetching class members",
        });
    }
});

/**
 * Assign Assistant
 */
export const assignAssistant = createAsyncThunk<
    { userId: string },
    { classId: string; userId: string },
    { rejectValue: { message: string } }
>("classes/assignAssistant", async ({ classId, userId }, { rejectWithValue }) => {
    try {
        const { data } = await apiClient.post(`/classes/${classId}/members/assign-assistant`, { userId });
        if (!data.success) {
            return rejectWithValue({ message: data.message || "Failed to assign assistant" });
        }
        return { userId };
    } catch (error: unknown) {
        return rejectWithValue({ message: extractAxiosError(error) || "Error assigning assistant" });
    }
});

/**
 * Revoke Assistant
 */
export const revokeAssistant = createAsyncThunk<
    { userId: string },
    { classId: string; userId: string },
    { rejectValue: { message: string } }
>("classes/revokeAssistant", async ({ classId, userId }, { rejectWithValue }) => {
    try {
        const { data } = await apiClient.post(`/classes/${classId}/members/revoke-assistant`, { userId });
        if (!data.success) {
            console.log(data.message);
            return rejectWithValue({ message: data.message || "Failed to revoke assistant" });
        }
        return { userId };
    } catch (error: unknown) {
        return rejectWithValue({ message: extractAxiosError(error) || "Error removing assistant" });
    }
});

/**
 * Revoke Member
 */
export const revokeMember = createAsyncThunk<
    { userId: string },
    { classId: string; userId: string },
    { rejectValue: { message: string } }
>("classes/revokeMember", async ({ classId, userId }, { rejectWithValue }) => {
    try {
        const { data } = await apiClient.delete(`/classes/${classId}/members/${userId}` );
        if (!data.success) {
            return rejectWithValue({ message: data.message || "Failed to revoke member" });
        }
        return { userId };
    } catch (error: unknown) {
        return rejectWithValue({ message: extractAxiosError(error) || "Error removing member" });
    }
});