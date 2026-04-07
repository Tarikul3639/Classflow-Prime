import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// Thunks
import { fetchClassUpdate } from "../thunks/fetch-class-update.thunk";
import { createClassUpdate } from "../thunks/create-class-update.thunk";
import { fetchSingleClassUpdate } from "../thunks/fetch-single-class-update.thunk";
import { updateClassUpdate } from "../thunks/update-class-update.thunk";
import { togglePinClassUpdate } from "../thunks/toggle-pin-class-update.thunk";
import { deleteSingleClassUpdate } from "../thunks/delete-single-class-update.thunk";
// Types
import type { ClassUpdateItem } from "@/types/update.types";
import type { ApiError } from "@/lib/errors/api-error.mapper";
import type { UpdateErrorFieldType } from "../class.types";

// State Structure
interface ClassBucket {
    items: ClassUpdateItem[];
    loading: {
        fetch: boolean;
        create: boolean;
        update: boolean;
        togglePin: boolean;
        delete: boolean;
    };
    error: {
        fetch: ApiError | null;
        create: ApiError<UpdateErrorFieldType> | null;
        update: ApiError<UpdateErrorFieldType> | null;
        togglePin: ApiError | null;
        delete: ApiError | null;
    };
}

// We can also consider normalizing the state if we expect a large number of updates, but for simplicity, we'll keep it as an array within each class bucket for now.
export interface ClassUpdatesState {
    updatesByClass: {
        [classId: string]: ClassBucket;
    };
}

const createEmptyBucket = (): ClassBucket => ({
    items: [],
    loading: { fetch: false, create: false, update: false, togglePin: false, delete: false },
    error: { fetch: null, create: null, update: null, togglePin: null, delete: null },
});

const initialState: ClassUpdatesState = {
    updatesByClass: {},
};

const classUpdatesSlice = createSlice({
    name: "classUpdates",
    initialState,
    reducers: {
        clearClassUpdates: (state, action: PayloadAction<string>) => {
            delete state.updatesByClass[action.payload];
        },
        clearUpdateError: (state, action) => {
            const { classId } = action.payload;

            const bucket = state.updatesByClass[classId];

            if (bucket) {
                bucket.error.update = null;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // ── Fetch ────────────────────────────────────────────────────────
            .addCase(fetchClassUpdate.pending, (state, action) => {
                const classId = action.meta.arg;
                if (!state.updatesByClass[classId]) {
                    state.updatesByClass[classId] = createEmptyBucket();
                }
                state.updatesByClass[classId].loading.fetch = true;
                state.updatesByClass[classId].error.fetch = null;
            })
            .addCase(fetchClassUpdate.fulfilled, (state, action) => {
                const classId = action.meta.arg;
                const bucket = state.updatesByClass[classId];
                if (bucket) {
                    bucket.loading.fetch = false;
                    bucket.items = action.payload;
                }
            })
            .addCase(fetchClassUpdate.rejected, (state, action) => {
                const classId = action.meta.arg;
                const bucket = state.updatesByClass[classId];

                if (bucket) {
                    bucket.loading.fetch = false;
                    bucket.error.fetch =
                        action.payload ?? {
                            message: "Failed to fetch class updates.",
                        };
                }
            })

            // ── Create ───────────────────────────────────────────────────────
            .addCase(createClassUpdate.pending, (state, action) => {
                const { classId } = action.meta.arg;
                if (!state.updatesByClass[classId]) {
                    state.updatesByClass[classId] = createEmptyBucket();
                }
                state.updatesByClass[classId].loading.create = true;
                state.updatesByClass[classId].error.create = null;
            })
            .addCase(createClassUpdate.fulfilled, (state, action) => {
                const newItem: ClassUpdateItem = action.payload;
                const classId = newItem.classId;
                const bucket = classId ? state.updatesByClass[classId] : undefined;
                if (bucket) {
                    bucket.loading.create = false;
                    bucket.items.unshift(newItem); // newest first
                }
            })
            .addCase(createClassUpdate.rejected, (state, action) => {
                const { classId } = action.meta.arg;
                const bucket = state.updatesByClass[classId];
                if (bucket) {
                    bucket.loading.create = false;
                    bucket.error.create =
                        action.payload ?? {
                            message: "Failed to create update.",
                        };
                }
            })

            // ── Toggle Pin ───────────────────────────────────────────────────
            .addCase(togglePinClassUpdate.pending, (state, action) => {
                const { classId } = action.meta.arg;
                const bucket = state.updatesByClass[classId];
                if (bucket) {
                    bucket.loading.togglePin = true;
                    bucket.error.togglePin = null;
                }
            })
            .addCase(togglePinClassUpdate.fulfilled, (state, action) => {
                const { classId } = action.meta.arg;
                const bucket = state.updatesByClass[classId];
                if (bucket) {
                    bucket.loading.togglePin = false;
                    const index = bucket.items.findIndex(u => u._id === action.payload.updateId);
                    if (index !== -1) {
                        bucket.items[index].isPinned = action.payload.isPinned;
                    }
                }
            })
            .addCase(togglePinClassUpdate.rejected, (state, action) => {
                const { classId } = action.meta.arg;
                const bucket = state.updatesByClass[classId];
                if (bucket) {
                    bucket.loading.togglePin = false;
                    bucket.error.togglePin =
                        action.payload ?? {
                            message: "Failed to toggle pin status.",
                        };
                }
            })

            // ── Delete ───────────────────────────────────────────────────────
            .addCase(deleteSingleClassUpdate.pending, (state, action) => {
                const { classId } = action.meta.arg;
                const bucket = state.updatesByClass[classId];
                if (bucket) {
                    bucket.loading.delete = true;
                    bucket.error.delete = null;
                }
            })
            .addCase(deleteSingleClassUpdate.fulfilled, (state, action) => {
                const { classId } = action.meta.arg;
                const bucket = state.updatesByClass[classId];
                if (bucket) {
                    bucket.loading.delete = false;
                    bucket.items = bucket.items.filter(u => u._id !== action.payload.updateId);
                }
            })
            .addCase(deleteSingleClassUpdate.rejected, (state, action) => {
                const { classId } = action.meta.arg;
                const bucket = state.updatesByClass[classId];
                if (bucket) {
                    bucket.loading.delete = false;
                    bucket.error.delete =
                        action.payload ?? {
                            message: "Failed to delete the update.",
                        };
                }
            })

            // ── Fetch Single Update (for Edit Page) ───────────────────────────────
            .addCase(fetchSingleClassUpdate.pending, (state, action) => {
                const { classId } = action.meta.arg;

                if (!state.updatesByClass[classId]) {
                    state.updatesByClass[classId] = createEmptyBucket();
                }

                state.updatesByClass[classId].loading.fetch = true;
                state.updatesByClass[classId].error.fetch = null;
            })

            .addCase(fetchSingleClassUpdate.fulfilled, (state, action) => {
                const { classId, update } = action.payload;

                const bucket = state.updatesByClass[classId];

                if (bucket) {
                    bucket.loading.fetch = false;

                    const index = bucket.items.findIndex(
                        (u) => u._id === update._id
                    );

                    if (index !== -1) {
                        bucket.items[index] = update; // update existing
                    } else {
                        bucket.items.unshift(update); // insert new
                    }
                }
            })

            .addCase(fetchSingleClassUpdate.rejected, (state, action) => {
                const { classId } = action.meta.arg;

                const bucket = state.updatesByClass[classId];

                if (bucket) {
                    bucket.loading.fetch = false;
                    bucket.error.fetch =
                        action.payload ?? {
                            message: "Failed to fetch update.",
                        };
                }
            })

            // ── Edit/Update ──────────────────────────────────────────────────
            .addCase(updateClassUpdate.pending, (state, action) => {
                const { classId } = action.meta.arg;
                const bucket = state.updatesByClass[classId];
                if (bucket) {
                    bucket.loading.update = true;
                    bucket.error.update = null;
                }
            })
            .addCase(updateClassUpdate.fulfilled, (state, action) => {
                const updatedItem = action.payload;
                const classId = updatedItem.classId;
                const bucket = classId ? state.updatesByClass[classId] : undefined;
                if (bucket) {
                    bucket.loading.update = false;
                    const index = bucket.items.findIndex(i => i._id === updatedItem._id);
                    if (index !== -1) bucket.items[index] = updatedItem;
                }
            })
            .addCase(updateClassUpdate.rejected, (state, action) => {
                const { classId } = action.meta.arg;
                const bucket = state.updatesByClass[classId];
                if (bucket) {
                    bucket.loading.update = false;
                    bucket.error.update =
                        action.payload ?? {
                            message: "Failed to update.",
                        };
                }

            });
    },
});

export const { clearClassUpdates, clearUpdateError } = classUpdatesSlice.actions;
export default classUpdatesSlice.reducer;