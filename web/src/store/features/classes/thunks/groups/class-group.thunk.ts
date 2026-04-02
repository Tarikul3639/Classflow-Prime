import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from "@/lib/api/axios";
import { extractAxiosError } from "@/lib/api/extract-error";
import { ClassGroup } from "@/types/group.types";

// ─── Interfaces ───────────────────────────────────────────────

interface FetchClassGroupsData {
    classId: string;
    groups: ClassGroup[];
}

// Fetch groups Response type
interface FetchClassGroupsResponse {
    success: boolean;
    message: string;
    data: FetchClassGroupsData;
}

export interface CreateClassGroupPayload {
    classId: string;
    groupData: Omit<ClassGroup, "groupId" | "createdAt" | "updatedAt">;
}

export interface UpdateClassGroupPayload {
    classId: string;
    groupId: string;
    groupData: Partial<Omit<ClassGroup, "groupId" | "createdAt" | "updatedAt">>;
}

// ─── Thunks ───────────────────────────────────────────────────

/**
 * Create Class Group
 */
export const createClassGroup = createAsyncThunk<
    ClassGroup,
    CreateClassGroupPayload,
    { rejectValue: string }
>(
    "classes/createGroup",
    async ({ classId, groupData }, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.post(
                `classes/${classId}/groups`,
                groupData
            );
            return data.data.group;
        } catch (error) {
            return rejectWithValue(extractAxiosError(error));
        }
    }
);

/**
 * Update Class Group
 */
export const updateClassGroup = createAsyncThunk<
    ClassGroup,
    UpdateClassGroupPayload,
    { rejectValue: string }
>(
    "classes/updateGroup",
    async ({ classId, groupId, groupData }, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.patch(
                `classes/${classId}/groups/${groupId}`,
                groupData
            );
            return data.data.group;
        } catch (error) {
            return rejectWithValue(extractAxiosError(error));
        }
    }
);

/**
 * Delete Class Group
 */
export const deleteClassGroup = createAsyncThunk<
    { groupId: string; message: string },
    { classId: string; groupId: string },
    { rejectValue: string }
>(
    "classes/deleteGroup",
    async ({ classId, groupId }, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.delete(
                `classes/${classId}/groups/${groupId}`
            );
            return {
                groupId,
                message: data.message,
            };
        } catch (error) {
            return rejectWithValue(extractAxiosError(error));
        }
    }
);

/**
 * Fetch Class Groups
 */
export const fetchClassGroups = createAsyncThunk<
    FetchClassGroupsData,
    { classId: string },
    { rejectValue: string }
>(
    "classes/fetchGroups",
    async ({ classId }, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get<FetchClassGroupsResponse>(
                `classes/${classId}/groups`
            );
            return data.data; // Return the entire data object containing classId and groups array
        } catch (error) {
            return rejectWithValue(extractAxiosError(error));
        }
    }
);

/**
 * Fetch single class group 
 * (used in group details page, so we get the latest data for that group)
 */
export const fetchSingleClassGroup = createAsyncThunk<
    ClassGroup,
    { classId: string; groupId: string },
    { rejectValue: string }
>(
    "classes/fetchGroup",
    async ({ classId, groupId }, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get<{
                success: boolean;
                message: string;
                data: {
                    group: ClassGroup;
                };
            }>(`classes/${classId}/groups/${groupId}`);
            return data.data.group; // Return the group object
        } catch (error) {
            return rejectWithValue(extractAxiosError(error));
        }
    }
);