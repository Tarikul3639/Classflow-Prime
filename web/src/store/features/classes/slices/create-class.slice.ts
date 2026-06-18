import { createSlice } from "@reduxjs/toolkit";
import { createClass, } from "../thunks/create-class.thunk";

export type Errorfield =
    | "ClassName"
    | "Department"
    | "Semester"
    | "CoverImage"
    | null;

interface IRequestStatus {
    loading: boolean;
    success: boolean;
    message: string | null;
    error: {
        field: Errorfield | null;
        message: string | null;
    };
}

interface IClassFormData {
    className: string;
    department: string;
    semester: string;
    themeColor?: string;
    coverImage?: string;

    allowEnroll: boolean;
}

interface CreateClassState extends IRequestStatus {
    formData: IClassFormData;
}

const initialState: CreateClassState = {
    formData: {
        className: "",
        department: "",
        semester: "",
        themeColor: "#3B82F6", // Default blue
        coverImage: "https://shorturl.at/ccHJp",
        allowEnroll: true,
    },
    loading: false,
    success: false,
    message: null,
    error: {
        field: null,
        message: null,
    },
};

const createClassSlice = createSlice({
    name: "createClass",
    initialState,
    reducers: {
        updateFormData: (state, action: { payload: Partial<IClassFormData> }) => {
            state.formData = { ...state.formData, ...action.payload };

            // ✅ NEW: clear error if that field is being edited
            const updatedField = Object.keys(action.payload)[0];

            if (state.error.field === mapFieldToError(updatedField)) {
                state.error = { field: null, message: null };
            }
        },
        resetForm: (state) => {
            state.formData = initialState.formData;
            state.loading = false;
            state.success = false;
            state.message = null;
            state.error = { field: null, message: null };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createClass.pending, (state) => {
                state.loading = true;
                state.success = false;
                state.message = null;
                state.error = { field: null, message: null };
            })
            .addCase(createClass.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = action.payload.message || "Class created successfully";
                state.error = { field: null, message: null };
            })
            .addCase(createClass.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.message = null;

                const payload = action.payload;

                // DIRECT mapping (no string parsing needed since backend sends field names in camelCase)
                state.error = {
                    field: (payload?.field as Errorfield) || null,
                    message: payload?.message || "Failed to create class",
                };
            });
    },
});


function mapFieldToError(field: string): Errorfield {
    switch (field) {
        case "className":
            return "ClassName";
        case "department":
            return "Department";
        case "semester":
            return "Semester";
        case "coverImage":
            return "CoverImage";
        default:
            return null;
    }
}

export const { updateFormData, resetForm } = createClassSlice.actions;
export default createClassSlice.reducer;
