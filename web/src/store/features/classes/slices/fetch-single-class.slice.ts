import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchSingleClass } from "../thunks/fetch-single-class.thunk";
import { IClassDetails } from "../thunks/fetch-single-class.thunk";
import { updateClass } from "../thunks/update-class.thunk";

// ─── Bucket Structure ───────────────────────────────────────────────
interface SingleClassBucket {
    classDetails: IClassDetails | null;

    fetch: {
        loading: boolean;
        error: string | null;
    };
}

// ─── State ─────────────────────────────────────────────────────────
interface FetchSingleClassState {
    classesByClassId: {
        [classId: string]: SingleClassBucket;
    };
}

// ─── Factory ───────────────────────────────────────────────────────
const createEmptyBucket = (): SingleClassBucket => ({
    classDetails: null,

    fetch: {
        loading: false,
        error: null,
    },
});

const initialState: FetchSingleClassState = {
    classesByClassId: {},
};

// ─── Slice ─────────────────────────────────────────────────────────
const fetchSingleClassSlice = createSlice({
    name: "fetchSingleClass",
    initialState,

    reducers: {
        resetClassDetailsState: (state, action: PayloadAction<string>) => {
            delete state.classesByClassId[action.payload];
        },

        clearFetchError: (state, action: PayloadAction<string>) => {
            const bucket = state.classesByClassId[action.payload];

            if (bucket) {
                bucket.fetch.error = null;
            }
        },
    },

    extraReducers: (builder) => {
        builder
            // ── Fetch Single Class ──────────────────────────

            .addCase(fetchSingleClass.pending, (state, action) => {
                const classId = action.meta.arg;

                if (!state.classesByClassId[classId]) {
                    state.classesByClassId[classId] = createEmptyBucket();
                }

                state.classesByClassId[classId].fetch.loading = true;
                state.classesByClassId[classId].fetch.error = null;
            })

            .addCase(fetchSingleClass.fulfilled, (state, action) => {
                const classId = action.meta.arg;
                const bucket = state.classesByClassId[classId];

                if (bucket) {
                    bucket.fetch.loading = false;
                    bucket.classDetails = action.payload;
                }
            })

            .addCase(fetchSingleClass.rejected, (state, action) => {
                const classId = action.meta.arg;
                const bucket = state.classesByClassId[classId];

                if (bucket) {
                    bucket.fetch.loading = false;
                    bucket.fetch.error =
                        action.payload?.message ?? "Failed to fetch class details.";
                }
            });

            // ── Update Class (to keep details in sync after an update) ───────

            builder
            .addCase(updateClass.fulfilled, (state, action) => {
                const { classId, data } = action.meta.arg;
                const bucket = state.classesByClassId[classId];

                if (bucket && bucket.classDetails) {
                    bucket.classDetails = {
                        ...bucket.classDetails,
                        ...data,
                    };
                }
            });
    },
});

export const { resetClassDetailsState, clearFetchError } =
    fetchSingleClassSlice.actions;
export default fetchSingleClassSlice.reducer;