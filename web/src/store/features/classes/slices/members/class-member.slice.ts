import { createSlice } from "@reduxjs/toolkit";
import { fetchClassMembers, assignAssistant, revokeAssistant, revokeMember, type ClassMember, EnrollmentRole } from "../../thunks/members/class-member.thunk";

interface ClassMemberState {
    members: ClassMember[];
    loading: {
        fetchMembers: boolean;
    };
    error: {
        fetchMembers: string | null;
    };
}

const initialState: ClassMemberState = {
    members: [],
    loading: {
        fetchMembers: false,
    },
    error: {
        fetchMembers: null,
    },
};

const classMemberSlice = createSlice({
    name: "classMembers",
    initialState,
    reducers: {
        // You can add synchronous reducers here if needed
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchClassMembers.pending, (state) => {
                state.loading.fetchMembers = true;
                state.error.fetchMembers = null;
            })
            .addCase(fetchClassMembers.fulfilled, (state, action) => {
                state.loading.fetchMembers = false;
                state.members = action.payload;
            })
            .addCase(fetchClassMembers.rejected, (state, action) => {
                state.loading.fetchMembers = false;
                state.error.fetchMembers = action.payload?.message || "Failed to fetch class members";
            });

        // You can handle assignAssistant, revokeAssistant, and revokeMember thunks here as well
        builder
            .addCase(assignAssistant.fulfilled, (state, action) => {
                const { userId } = action.payload;
                const member = state.members.find((m) => m.userId === userId);
                if (member) {
                    member.role = EnrollmentRole.ASSISTANT;
                }
            })
            .addCase(revokeAssistant.fulfilled, (state, action) => {
                const { userId } = action.payload;
                const member = state.members.find((m) => m.userId === userId);
                if (member) {
                    member.role = EnrollmentRole.LEARNER;
                }
            })
            .addCase(revokeMember.fulfilled, (state, action) => {
                const { userId } = action.payload;
                state.members = state.members.filter((m) => m.userId !== userId);
            });
    },
});

export default classMemberSlice.reducer;