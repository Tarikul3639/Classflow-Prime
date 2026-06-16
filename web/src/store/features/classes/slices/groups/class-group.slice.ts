import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
    createClassGroup,
    updateClassGroup,
    deleteClassGroup,
    fetchClassGroups,
    fetchSingleClassGroup,
} from "../../thunks/groups/class-group.thunk";

import { ClassGroup, GroupErrorFieldType } from "@/types/group.types";
import type { ApiError } from "@/api/extract-error";

// ─── Group Bucket Interface ────────────────────────────────────────────────
interface ClassGroupBucket {
    groups: ClassGroup[];

    fetch: {
        loading: boolean;
        error: string | null;
    };

    fetchSingle: {
        loading: boolean;
        error: string | null;
    };

    create: {
        loading: boolean;
        error: ApiError<GroupErrorFieldType> | null;
    };

    update: {
        loading: boolean;
        error: ApiError<GroupErrorFieldType> | null;
    };

    delete: {
        loading: boolean;
        error: string | null;
    };
}

// ─── State Interface ───────────────────────────────────────────────────────
export interface ClassGroupState {
    groupsByClass: {
        [classId: string]: ClassGroupBucket;
    };
}

// ─── Initial State ────────────────────────────────────────────────────────
const createEmptyBucket = (): ClassGroupBucket => ({
    groups: [],

    fetch: {
        loading: false,
        error: null,
    },

    fetchSingle: {
        loading: false,
        error: null,
    },

    create: {
        loading: false,
        error: null,
    },

    update: {
        loading: false,
        error: null,
    },

    delete: {
        loading: false,
        error: null,
    },
});

const initialState: ClassGroupState = {
    groupsByClass: {},
};

// ─── Slice ────────────────────────────────────────────────────────────────
const classGroupSlice = createSlice({
    name: "classGroup",
    initialState,

    reducers: {
        clearClassGroups: (state, action: PayloadAction<string>) => {
            const classId = action.payload;

            if (state.groupsByClass[classId]) {
                delete state.groupsByClass[classId];
            }
        },

        clearGroupError: (
            state,
            action: PayloadAction<{
                classId: string;
                field: keyof Omit<ClassGroupBucket, "groups">;
            }>
        ) => {
            const { classId, field } = action.payload;
            const bucket = state.groupsByClass[classId];

            if (bucket) {
                bucket[field].error = null;
            }
        },
    },

    extraReducers: (builder) => {
        builder

            // ─── Fetch Class Groups ───────────────────────────────────────────────

            .addCase(fetchClassGroups.pending, (state, action) => {
                const classId = action.meta.arg;

                if (!state.groupsByClass[classId]) {
                    state.groupsByClass[classId] = createEmptyBucket();
                }

                state.groupsByClass[classId].fetch.loading = true;
                state.groupsByClass[classId].fetch.error = null;
            })

            .addCase(fetchClassGroups.fulfilled, (state, action) => {
                const classId = action.meta.arg;
                const bucket = state.groupsByClass[classId];

                if (bucket) {
                    bucket.fetch.loading = false;
                    bucket.groups = action.payload.groups ?? [];
                }
            })

            .addCase(fetchClassGroups.rejected, (state, action) => {
                const classId = action.meta.arg;
                const bucket = state.groupsByClass[classId];

                if (bucket) {
                    bucket.fetch.loading = false;
                    bucket.fetch.error =
                        action.payload ?? "Failed to fetch groups.";
                }
            })

            // ─── Fetch Single Class Group ─────────────────────────────────────────

            .addCase(fetchSingleClassGroup.pending, (state, action) => {
                const classId = action.meta.arg.classId;

                if (!state.groupsByClass[classId]) {
                    state.groupsByClass[classId] = createEmptyBucket();
                }

                state.groupsByClass[classId].fetchSingle.loading = true;
                state.groupsByClass[classId].fetchSingle.error = null;
            })

            .addCase(fetchSingleClassGroup.fulfilled, (state, action) => {
                const classId = action.meta.arg.classId;
                const bucket = state.groupsByClass[classId];

                if (bucket) {
                    bucket.fetchSingle.loading = false;

                    const group = action.payload;

                    const index = bucket.groups.findIndex(
                        (g) => g.groupId === group.groupId
                    );

                    if (index !== -1) {
                        bucket.groups[index] = group;
                    } else {
                        bucket.groups.unshift(group);
                    }
                }
            })

            .addCase(fetchSingleClassGroup.rejected, (state, action) => {
                const classId = action.meta.arg.classId;
                const bucket = state.groupsByClass[classId];

                if (bucket) {
                    bucket.fetchSingle.loading = false;
                    bucket.fetchSingle.error =
                        action.payload ?? "Failed to fetch group details.";
                }
            })

            // ─── Create Class Group ───────────────────────────────────────────────

            .addCase(createClassGroup.pending, (state, action) => {
                const classId = action.meta.arg.classId;

                if (!state.groupsByClass[classId]) {
                    state.groupsByClass[classId] = createEmptyBucket();
                }

                state.groupsByClass[classId].create.loading = true;
                state.groupsByClass[classId].create.error = null;
            })

            .addCase(createClassGroup.fulfilled, (state, action) => {
                const newGroup: ClassGroup = action.payload;
                const classId = action.meta.arg.classId;
                const bucket = state.groupsByClass[classId];

                if (bucket) {
                    bucket.create.loading = false;
                    bucket.groups.unshift(newGroup);
                }
            })

            .addCase(createClassGroup.rejected, (state, action) => {
                const classId = action.meta.arg.classId;
                const bucket = state.groupsByClass[classId];

                if (bucket) {
                    bucket.create.loading = false;
                    bucket.create.error =
                        action.payload ?? {
                            message: "Failed to create group.",
                        };
                }
            })

            // ─── Update Class Group ───────────────────────────────────────────────

            .addCase(updateClassGroup.pending, (state, action) => {
                const classId = action.meta.arg.classId;
                const bucket = state.groupsByClass[classId];

                if (bucket) {
                    bucket.update.loading = true;
                    bucket.update.error = null;
                }
            })

            .addCase(updateClassGroup.fulfilled, (state, action) => {
                const updatedGroup = action.payload;
                const classId = action.meta.arg.classId;
                const bucket = state.groupsByClass[classId];

                if (bucket) {
                    bucket.update.loading = false;

                    const index = bucket.groups.findIndex(
                        (g) => g.groupId === updatedGroup.groupId
                    );

                    if (index !== -1) {
                        bucket.groups[index] = updatedGroup;
                    }
                }
            })

            .addCase(updateClassGroup.rejected, (state, action) => {
                const classId = action.meta.arg.classId;
                const bucket = state.groupsByClass[classId];

                if (bucket) {
                    bucket.update.loading = false;
                    bucket.update.error =
                        action.payload ?? {
                            message: "Failed to update group.",
                        };
                }
            })

            // ─── Delete Class Group ───────────────────────────────────────────────

            .addCase(deleteClassGroup.pending, (state, action) => {
                const classId = action.meta.arg.classId;
                const bucket = state.groupsByClass[classId];

                if (bucket) {
                    bucket.delete.loading = true;
                    bucket.delete.error = null;
                }
            })

            .addCase(deleteClassGroup.fulfilled, (state, action) => {
                const classId = action.meta.arg.classId;
                const bucket = state.groupsByClass[classId];

                if (bucket) {
                    bucket.delete.loading = false;

                    bucket.groups = bucket.groups.filter(
                        (g) => g.groupId !== action.payload.groupId
                    );
                }
            })

            .addCase(deleteClassGroup.rejected, (state, action) => {
                const classId = action.meta.arg.classId;
                const bucket = state.groupsByClass[classId];

                if (bucket) {
                    bucket.delete.loading = false;
                    bucket.delete.error =
                        action.payload ?? "Failed to delete group.";
                }
            });
    },
});

export const {
    clearClassGroups,
    clearGroupError,
} = classGroupSlice.actions;

export default classGroupSlice.reducer;