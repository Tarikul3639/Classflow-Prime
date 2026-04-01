import { createSlice } from "@reduxjs/toolkit";
import { IClassDetails } from "../thunks/fetch-single-class.thunk";
import { fetchSingleClass } from "../thunks/fetch-single-class.thunk";

interface FetchSingleClassState {
    classDetails: IClassDetails;
    isLoading: boolean;
    error: string | null;
}

const initialState: FetchSingleClassState = {
    classDetails: {
        classId: "",
        department: "",
        name: "",
        members: 0,
        instructor: "",
        semester: "",
        themeColor: "#3B82F6",
        coverImage: "",
        avatarUrl: null,
        status: "active",
        isInstructor: false,
        isAssistant: false,
    },
    isLoading: false,
    error: null,
};
const fetchSingleClassSlice = createSlice({
    name: "fetchSingleClass",
    initialState,
    reducers: {
        // reset state when closing the Class Details Modal
        resetClassDetailsState: (state) => {
            state.classDetails = initialState.classDetails;
            state.isLoading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSingleClass.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.classDetails = initialState.classDetails; // Clear previous class details when starting a new fetch
            })
            .addCase(fetchSingleClass.fulfilled, (state, action) => {
                state.isLoading = false;
                state.classDetails = action.payload;
                state.error = null;
            })
            .addCase(fetchSingleClass.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Failed to fetch class details";
                state.classDetails = initialState.classDetails; // Clear class details on error
            });
    },
});

export const { resetClassDetailsState } = fetchSingleClassSlice.actions;
export default fetchSingleClassSlice.reducer;