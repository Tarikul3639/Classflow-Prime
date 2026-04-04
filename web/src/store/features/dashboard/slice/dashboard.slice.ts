import { createSlice } from "@reduxjs/toolkit";
import { fetchDashboardData } from "../../dashboard/thunk/dashboard.thunk";
import {
    DashboardClassItem,
    DashboardFacultyItem,
    DashboardGroupItem,
    DashboardUpdateItem,
} from "../dashboard.types";

import { RootState } from "@/store/store";

// ─── State ────────────────────────────────────────────────────────────────────

interface DashboardState {
    classes: DashboardClassItem[];
    updates: DashboardUpdateItem[];
    faculty: DashboardFacultyItem[];
    groups: DashboardGroupItem[];
    loading: {
        fetchDashboard: boolean;
    };
    error: {
        fetchDashboard: string | null;
    };
}

const initialState: DashboardState = {
    classes: [],
    updates: [],
    faculty: [],
    groups: [],
    loading: {
        fetchDashboard: false,
    },
    error: {
        fetchDashboard: null,
    },
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        // Optimistic pin toggle — flips isPinned instantly without an API call
        togglePinUpdate(state, action: { payload: string }) {
            const update = state.updates.find((u) => u._id === action.payload);
            if (update) update.isPinned = !update.isPinned;
        },

        resetDashboard() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardData.pending, (state) => {
                state.loading.fetchDashboard = true;
                state.error.fetchDashboard = null;
            })
            .addCase(fetchDashboardData.fulfilled, (state, action) => {
                state.loading.fetchDashboard = false;
                state.classes = action.payload.classes;
                state.updates = action.payload.updates;
                state.faculty = action.payload.faculty;
                state.groups = action.payload.groups;
            })
            .addCase(fetchDashboardData.rejected, (state, action) => {
                state.loading.fetchDashboard = false;
                state.error.fetchDashboard =
                    action.payload?.message || "Failed to load dashboard";
            });
    },
});

export const { togglePinUpdate, resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectDashboardLoading = (state: { dashboard: RootState }) =>
    state.dashboard.dashboard.loading.fetchDashboard;

export const selectDashboardError = (state: { dashboard: RootState }) =>
    state.dashboard.dashboard.error.fetchDashboard;

export const selectClasses = (state: { dashboard: RootState }) =>
    state.dashboard.dashboard.classes;

export const selectActiveClasses = (state: { dashboard: RootState }) =>
    state.dashboard.dashboard.classes.filter((c) => c.status === "active");

export const selectUpdates = (state: { dashboard: RootState }) =>
    state.dashboard.dashboard.updates;

export const selectPinnedUpdates = (state: { dashboard: RootState }) =>
    state.dashboard.dashboard.updates.filter((u) => u.isPinned);

export const selectUpcomingEvents = (state: { dashboard: RootState }) =>
    state.dashboard.dashboard.updates.filter(
        (u) => u.eventAt && new Date(u.eventAt) > new Date(),
    );

export const selectFaculty = (state: { dashboard: RootState }) =>
    state.dashboard.dashboard.faculty;

export const selectGroups = (state: { dashboard: RootState }) =>
    state.dashboard.dashboard.groups;
