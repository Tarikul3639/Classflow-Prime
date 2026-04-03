// class-actions.slice.ts
import { createSlice } from "@reduxjs/toolkit";
import {
    leaveClass,
    deleteClass,
    markClassAsEnded,
    fetchClassSettings,
    regenerateClassCode,
    toggleJoiningAllowed,
} from "../../thunks/settings/class-setting.thunk";

interface ClassActionsState {
    classCode: string | null;
    isJoiningAllowed: boolean;
    loading: {
        leaveClass: boolean;
        deleteClass: boolean;
        markAsEnded: boolean;
        fetchClassCode: boolean;
        regenerateClassCode: boolean;
        toggleJoiningAllowed: boolean;
    };
    error: {
        leaveClass: string | null;
        deleteClass: string | null;
        markAsEnded: string | null;
        fetchClassCode: string | null;
        regenerateClassCode: string | null;
        toggleJoiningAllowed: string | null;
    };
}

const initialState: ClassActionsState = {
    classCode: null,
    isJoiningAllowed: true,
    loading: {
        leaveClass: false,
        deleteClass: false,
        markAsEnded: false,
        fetchClassCode: false,
        regenerateClassCode: false,
        toggleJoiningAllowed: false,
    },
    error: {
        leaveClass: null,
        deleteClass: null,
        markAsEnded: null,
        fetchClassCode: null,
        regenerateClassCode: null,
        toggleJoiningAllowed: null,
    },
};

const classActionsSlice = createSlice({
    name: "classActions",
    initialState,
    reducers: {
        clearClassCode: (state) => {
            state.classCode = null;
        },
        clearErrors: (state) => {
            state.error = initialState.error;
        },
    },
    extraReducers: (builder) => {
        // ─── Leave Class ───────────────────────────────────────────────
        builder.addCase(leaveClass.pending, (state) => {
            state.loading.leaveClass = true;
            state.error.leaveClass = null;
        });
        builder.addCase(leaveClass.fulfilled, (state) => {
            state.loading.leaveClass = false;
        });
        builder.addCase(leaveClass.rejected, (state, action) => {
            state.loading.leaveClass = false;
            state.error.leaveClass = action.payload || "Failed to leave class.";
        });

        // ─── Delete Class ──────────────────────────────────────────────
        builder.addCase(deleteClass.pending, (state) => {
            state.loading.deleteClass = true;
            state.error.deleteClass = null;
        });
        builder.addCase(deleteClass.fulfilled, (state) => {
            state.loading.deleteClass = false;
        });
        builder.addCase(deleteClass.rejected, (state, action) => {
            state.loading.deleteClass = false;
            state.error.deleteClass = action.payload || "Failed to delete class.";
        });

        // ─── Mark As Ended ─────────────────────────────────────────────
        builder.addCase(markClassAsEnded.pending, (state) => {
            state.loading.markAsEnded = true;
            state.error.markAsEnded = null;
        });
        builder.addCase(markClassAsEnded.fulfilled, (state) => {
            state.loading.markAsEnded = false;
        });
        builder.addCase(markClassAsEnded.rejected, (state, action) => {
            state.loading.markAsEnded = false;
            state.error.markAsEnded = action.payload || "Failed to mark class as ended.";
        });

        // ─── Fetch Class Code ──────────────────────────────────────────
        builder.addCase(fetchClassSettings.pending, (state) => {
            state.loading.fetchClassCode = true;
            state.error.fetchClassCode = null;
            state.classCode = null; // Clear old code while fetching new one
            state.isJoiningAllowed = true; // Reset to default while fetching
        });
        builder.addCase(fetchClassSettings.fulfilled, (state, action) => {
            state.loading.fetchClassCode = false;
            state.classCode = action.payload.code;
            state.isJoiningAllowed = action.payload.isJoiningAllowed;
        });
        builder.addCase(fetchClassSettings.rejected, (state, action) => {
            state.loading.fetchClassCode = false;
            state.error.fetchClassCode = action.payload || "Failed to fetch class code.";
        });

        // ─── Regenerate Class Code ─────────────────────────────────────
        builder.addCase(regenerateClassCode.pending, (state) => {
            state.loading.regenerateClassCode = true;
            state.error.regenerateClassCode = null;
        });
        builder.addCase(regenerateClassCode.fulfilled, (state, action) => {
            state.loading.regenerateClassCode = false;
            state.classCode = action.payload.code; // replaces old code
        });
        builder.addCase(regenerateClassCode.rejected, (state, action) => {
            state.loading.regenerateClassCode = false;
            state.error.regenerateClassCode = action.payload || "Failed to regenerate class code.";
        });

        // ─── Toggle Joining Allowed ─────────────────────────────────────
        builder.addCase(toggleJoiningAllowed.pending, (state) => {
            // No loading state for toggle, but could add if desired
            state.error.toggleJoiningAllowed = null;
        });
        builder.addCase(toggleJoiningAllowed.fulfilled, (state, action) => {
            state.isJoiningAllowed = !state.isJoiningAllowed; // toggle the state
        });
        builder.addCase(toggleJoiningAllowed.rejected, (state, action) => {
            state.error.toggleJoiningAllowed = action.payload || "Failed to toggle joining allowed.";
        });
    },
});

export const { clearClassCode, clearErrors } = classActionsSlice.actions;
export default classActionsSlice.reducer;