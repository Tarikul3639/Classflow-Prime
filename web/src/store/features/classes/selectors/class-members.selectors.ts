import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/store/store";
import { EnrollmentRole } from "../thunks/members/class-member.thunk";

// Get bucket by classId
export const selectClassBucket = (state: RootState, classId: string) =>
    state.classes.classMembers.membersByClass[classId] || {
        members: [],
        lastFetched: 0,
        loading: { fetchMembers: false },
        error: { fetchMembers: null },
    };

// ─── Loading & Error ───────────────────────────────────────────

export const makeSelectClassMembersLoading = () =>
    createSelector(
        [selectClassBucket],
        (bucket) => bucket.loading.fetchMembers
    );

export const makeSelectClassMembersError = () =>
    createSelector(
        [selectClassBucket],
        (bucket) => bucket.error.fetchMembers
    );

// ─── Stale Check (5 minutes) ───────────────────────────────────

export const selectIsMembersStale = (classId: string, staleTime = 5 * 60 * 1000) =>
    createSelector([selectClassBucket], (bucket) => {
        if (!bucket) return true;
        return Date.now() - bucket.lastFetched > staleTime;
    });

// ─── Members ───────────────────────────────────────────────────

export const makeSelectClassMembers = () =>
    createSelector(
        [selectClassBucket],
        (bucket) => bucket.members ?? []
    );

// ─── Role-based ────────────────────────────────────────────────

export const makeSelectInstructors = () => {
    const selectMembers = makeSelectClassMembers();
    return createSelector(
        [selectMembers],
        (members) => members.filter((m) => m.role === EnrollmentRole.INSTRUCTOR)
    );
};

export const makeSelectAssistants = () => {
    const selectMembers = makeSelectClassMembers();
    return createSelector(
        [selectMembers],
        (members) => members.filter((m) => m.role === EnrollmentRole.ASSISTANT)
    );
};

export const makeSelectLearners = () => {
    const selectMembers = makeSelectClassMembers();
    return createSelector(
        [selectMembers],
        (members) => members.filter((m) => m.role === EnrollmentRole.LEARNER)
    );
};

// ─── Member Count ──────────────────────────────────────────────

export const makeSelectMemberCount = () => {
    const selectMembers = makeSelectClassMembers();
    return createSelector(
        [selectMembers],
        (members) => members.length
    );
};