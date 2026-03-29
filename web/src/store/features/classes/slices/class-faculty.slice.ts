import { createSlice } from "@reduxjs/toolkit";
import {
    createClassFaculty,
    updateClassFaculty,
    deleteClassFaculty,
    fetchClassFaculties,
    type ClassFaculty,
} from "../thunks/class-faculty.thunk";

interface ClassFacultyState {
    faculties: ClassFaculty[];
    loading: {
        fetch: boolean;
        create: boolean;
        update: boolean;
        delete: boolean;
    };
    error: {
        fetch: string | null;
        create: string | null;
        update: string | null;
        delete: string | null;
    };
}

const initialState: ClassFacultyState = {
    faculties: [],
    loading: {
        fetch: false,
        create: false,
        update: false,
        delete: false,
    },
    error: {
        fetch: null,
        create: null,
        update: null,
        delete: null,
    },
};

const classFacultySlice = createSlice({
    name: "classFaculty",
    initialState,
    reducers: {
        clearError(state, action: { payload: keyof ClassFacultyState["error"] }) {
            state.error[action.payload] = null;
        },
        clearAllErrors(state) {
            Object.keys(state.error).forEach((key) => {
                state.error[key as keyof ClassFacultyState["error"]] = null;
            });
        },
    },
    extraReducers: (builder) => {

        // ─── Fetch ────────────────────────────────────────────
        builder
            .addCase(fetchClassFaculties.pending, (state) => {
                state.loading.fetch = true;
                state.error.fetch = null;
            })
            .addCase(fetchClassFaculties.fulfilled, (state, action) => {
                state.loading.fetch = false;
                state.faculties = action.payload; // ClassFaculty[]
            })
            .addCase(fetchClassFaculties.rejected, (state, action) => {
                state.loading.fetch = false;
                state.error.fetch = action.payload ?? "Failed to fetch faculties";
            });

        // ─── Create ───────────────────────────────────────────
        builder
            .addCase(createClassFaculty.pending, (state) => {
                state.loading.create = true;
                state.error.create = null;
            })
            .addCase(createClassFaculty.fulfilled, (state, action) => {
                state.loading.create = false;
                state.faculties.push(action.payload); // single ClassFaculty
            })
            .addCase(createClassFaculty.rejected, (state, action) => {
                state.loading.create = false;
                state.error.create = action.payload ?? "Failed to create faculty";
            });

        // ─── Update ───────────────────────────────────────────
        builder
            .addCase(updateClassFaculty.pending, (state) => {
                state.loading.update = true;
                state.error.update = null;
            })
            .addCase(updateClassFaculty.fulfilled, (state, action) => {
                state.loading.update = false;
                const updated = action.payload.data.faculty; // ClassFaculty
                const index = state.faculties.findIndex(
                    (f) => f.facultyId === updated.facultyId
                );
                if (index !== -1) state.faculties[index] = updated;
            })
            .addCase(updateClassFaculty.rejected, (state, action) => {
                state.loading.update = false;
                state.error.update = action.payload ?? "Failed to update faculty";
            });

        // ─── Delete ───────────────────────────────────────────
        builder
            .addCase(deleteClassFaculty.pending, (state) => {
                state.loading.delete = true;
                state.error.delete = null;
            })
            .addCase(deleteClassFaculty.fulfilled, (state, action) => {
                state.loading.delete = false;
                state.faculties = state.faculties.filter(
                    (f) => f.facultyId !== action.payload.facultyId
                );
            })
            .addCase(deleteClassFaculty.rejected, (state, action) => {
                state.loading.delete = false;
                state.error.delete = action.payload ?? "Failed to delete faculty";
            });
    },
});

export const { clearError, clearAllErrors } = classFacultySlice.actions;
export default classFacultySlice.reducer;