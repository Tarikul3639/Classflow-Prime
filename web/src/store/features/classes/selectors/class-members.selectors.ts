import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/store/store";
import { EnrollmentRole } from "../thunks/members/class-member.thunk";

const EMPTY_MEMBERS = Object.freeze([]);
const EMPTY_BUCKET = Object.freeze({
    members: EMPTY_MEMBERS,
    lastFetched: 0,
    loading: {
        fetchMembers: false,
    },
    error: {
        fetchMembers: null,
    },
});

// Get bucket by classId
export const selectClassBucket = (
    state: RootState,
    classId: string,
) =>
    state.classes.classMembers.membersByClass[classId] ??
    EMPTY_BUCKET;

// ─── Stale Check (5 minutes) ───────────────────────────────────

export const selectIsMembersStale = (
    classId: string,
    staleTime = 5 * 60 * 1000,
) =>
    createSelector(
        [selectClassBucket],
        (bucket) => Date.now() - bucket.lastFetched > staleTime,
    );

// ─── Members ───────────────────────────────────────────────────

export const makeSelectClassMembers = () =>
    createSelector(
        [selectClassBucket],
        (bucket) => bucket.members ?? EMPTY_MEMBERS,
    );

// ─── Role-based ────────────────────────────────────────────────

export const makeSelectInstructors = () => {
    const selectMembers = makeSelectClassMembers();

    return createSelector(
        [selectMembers],
        (members) =>
            members.filter(
                (m) => m.role === EnrollmentRole.INSTRUCTOR,
            ),
    );
};

export const makeSelectAssistants = () => {
    const selectMembers = makeSelectClassMembers();

    return createSelector(
        [selectMembers],
        (members) =>
            members.filter(
                (m) => m.role === EnrollmentRole.ASSISTANT,
            ),
    );
};

export const makeSelectLearners = () => {
    const selectMembers = makeSelectClassMembers();

    return createSelector(
        [selectMembers],
        (members) =>
            members.filter(
                (m) => m.role === EnrollmentRole.LEARNER,
            ),
    );
};

// ─── Member Count ──────────────────────────────────────────────

export const makeSelectMemberCount = () => {
    const selectMembers = makeSelectClassMembers();

    return createSelector(
        [selectMembers],
        (members) => members.length,
    );
};