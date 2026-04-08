import { createSlice } from "@reduxjs/toolkit";
import { fetchClassMembers, assignAssistant, revokeAssistant, revokeMember, type ClassMember, EnrollmentRole } from "../../thunks/members/class-member.thunk";

// Define the shape of the state for class members
interface ClassBucket {
    members: ClassMember[];
    lastFetched: number; // Timestamp of the last fetch in milliseconds
    loading: {
        fetchMembers: boolean;
    };
    error: {
        fetchMembers: string | null;
    };
}
// The overall state for class members, keyed by classId
export interface ClassMembersState {
    membersByClass: {
        [classId: string]: ClassBucket;
    };
}

// Helper function to create an initial ClassBucket
const createInitialClassBucket = (): ClassBucket => ({
    members: [],
    lastFetched: 0,
    loading: {
        fetchMembers: false,
    },
    error: {
        fetchMembers: null,
    },
});

// Initial state for the class members slice
const initialState: ClassMembersState = {
    membersByClass: {},
};

// Create the slice
const classMemberSlice = createSlice({
    name: "classMembers",
    initialState,
    reducers: {
        // You can add synchronous reducers here if needed
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchClassMembers.pending, (state, action) => {
                const classId = action.meta.arg; // Assuming the classId is passed as an argument to the thunk

                if (!state.membersByClass[classId]) {
                    state.membersByClass[classId] = createInitialClassBucket();
                }

                state.membersByClass[classId].loading.fetchMembers = true;
                state.membersByClass[classId].error.fetchMembers = null;

            })
            .addCase(fetchClassMembers.fulfilled, (state, action) => {
                const { classId, members } = action.payload;

                if (!state.membersByClass[classId]) {
                    state.membersByClass[classId] = createInitialClassBucket();
                }

                state.membersByClass[classId].members = members;
                state.membersByClass[classId].lastFetched = Date.now();
                state.membersByClass[classId].loading.fetchMembers = false;
                state.membersByClass[classId].error.fetchMembers = null;
            })
            .addCase(fetchClassMembers.rejected, (state, action) => {
                const classId = action.meta.arg;

                if (!state.membersByClass[classId]) {
                    state.membersByClass[classId] = createInitialClassBucket();
                }
                state.membersByClass[classId].loading.fetchMembers = false;
                state.membersByClass[classId].error.fetchMembers =
                    action.payload?.message || "Failed to fetch class members";
            });

        // You can handle assignAssistant, revokeAssistant, and revokeMember thunks here as well
        builder
            .addCase(assignAssistant.fulfilled, (state, action) => {
                const { userId, classId } = action.payload;
                const member = state.membersByClass[classId]?.members.find((m) => m.userId === userId);
                if (member) {
                    member.role = EnrollmentRole.ASSISTANT;
                }
            })
            .addCase(revokeAssistant.fulfilled, (state, action) => {
                const { userId, classId } = action.payload;
                const member = state.membersByClass[classId]?.members.find((m) => m.userId === userId);
                if (member) {
                    member.role = EnrollmentRole.LEARNER;
                }
            })
            .addCase(revokeMember.fulfilled, (state, action) => {
                const { userId, classId } = action.payload;
                const members = state.membersByClass[classId]?.members;
                if (members) {
                    state.membersByClass[classId].members = members.filter((m) => m.userId !== userId);
                }
            });
    },
});

export default classMemberSlice.reducer;