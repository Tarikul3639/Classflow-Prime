import { createSlice } from "@reduxjs/toolkit";
import { createClassGroup, updateClassGroup, deleteClassGroup, fetchClassGroups } from "../../thunks/groups/class-group.thunk";
import { ClassGroup } from "@/types/group.types";

interface ClassGroupState {
    groups: ClassGroup[];
    loading: {
        fetchGroups: boolean;
        fetchSingleGroup: boolean;
        createGroup: boolean;
        updateGroup: boolean;
        deleteGroup: boolean;
    };
    error: {
        fetchGroups: string | null;
        fetchSingleGroup: string | null;
        createGroup: string | null;
        updateGroup: string | null;
        deleteGroup: string | null;
    };
}

const initialState: ClassGroupState = {
    groups: [],
    loading: {
        fetchGroups: false,
        fetchSingleGroup: false,
        createGroup: false,
        updateGroup: false,
        deleteGroup: false,
    },
    error: {
        fetchGroups: null,
        fetchSingleGroup: null,
        createGroup: null,
        updateGroup: null,
        deleteGroup: null,
    },
};

const classGroupSlice = createSlice({
    name: "classGroup",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Fetch Groups
        builder.addCase(fetchClassGroups.pending, (state) => {
            state.loading.fetchGroups = true;
            state.error.fetchGroups = null;
        });
        builder.addCase(fetchClassGroups.fulfilled, (state, action) => {
            state.loading.fetchGroups = false;
            state.groups = action.payload.groups;
        });
        builder.addCase(fetchClassGroups.rejected, (state, action) => {
            state.loading.fetchGroups = false;
            state.error.fetchGroups = action.payload || "Failed to fetch groups.";
        });
        // Create Group
        builder.addCase(createClassGroup.pending, (state) => {
            state.loading.createGroup = true;
            state.error.createGroup = null;
        });
        builder.addCase(createClassGroup.fulfilled, (state, action) => {
            state.loading.createGroup = false;
            state.groups.push(action.payload);
        });
        builder.addCase(createClassGroup.rejected, (state, action) => {
            state.loading.createGroup = false;
            state.error.createGroup = action.payload || "Failed to create group.";
        });
        // Update Group
        builder.addCase(updateClassGroup.pending, (state) => {
            state.loading.updateGroup = true;
            state.error.updateGroup = null;
        });
        builder.addCase(updateClassGroup.fulfilled, (state, action) => {
            state.loading.updateGroup = false;
            const index = state.groups.findIndex(g => g.groupId === action.payload.groupId);
            if (index !== -1) {
                state.groups[index] = action.payload;
            }
        });
        builder.addCase(updateClassGroup.rejected, (state, action) => {
            state.loading.updateGroup = false;
            state.error.updateGroup = action.payload || "Failed to update group.";
        });
        // Delete Group
        builder.addCase(deleteClassGroup.pending, (state) => {
            state.loading.deleteGroup = true;
            state.error.deleteGroup = null;
        });
        builder.addCase(deleteClassGroup.fulfilled, (state, action) => {
            state.loading.deleteGroup = false;
            state.groups = state.groups.filter(g => g.groupId !== action.payload.groupId);
        });
        builder.addCase(deleteClassGroup.rejected, (state, action) => {
            state.loading.deleteGroup = false;
            state.error.deleteGroup = action.payload || "Failed to delete group.";
        });
    },
});

export default classGroupSlice.reducer;