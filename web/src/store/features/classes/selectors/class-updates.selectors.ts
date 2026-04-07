import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/store/store";
import { formatRelativeDate } from "@/utils/date.utils";
import { ClassUpdateItem } from "@/types/update.types";

// ─── 1. Base Selector ────────────────────────────────────────────────────────
// Reads the bucket for a specific classId from the normalized state
const selectClassBucket = (state: RootState, classId: string) =>
    state.classes.classUpdates.updatesByClass[classId] ?? null;

// ─── 2. Raw Items Selector ───────────────────────────────────────────────────
export const selectClassUpdateItems = createSelector(
    [selectClassBucket],
    (bucket) => bucket?.items ?? []
);

// ─── 3. Loading Selector ─────────────────────────────────────────────────────
export const selectClassUpdatesLoading = createSelector(
    [selectClassBucket],
    (bucket) =>
        bucket?.loading ?? {
            fetch: false,
            create: false,
            update: false,
            togglePin: false,
            delete: false,
        }
);

// ─── 4. Error Selector ───────────────────────────────────────────────────────
export const selectClassUpdatesError = createSelector(
    [selectClassBucket],
    (bucket) =>
        bucket?.error ?? {
            fetch: null,
            create: null,
            update: null,
            togglePin: null,
            delete: null,
        }
);

// ─── 5. Filtered + Sorted Selector ───────────────────────────────────────────
export const selectFilteredAndSortedUpdates = createSelector(
    [
        selectClassUpdateItems,
        (_: RootState, __: string, searchQuery: string) => searchQuery,
        (_: RootState, __: string, ___: string, activeFilter: string) => activeFilter,
    ],
    (items, searchQuery, activeFilter) => {
        const filtered = items.filter((u: ClassUpdateItem) => {
            const matchesSearch =
                u.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = activeFilter === "all" || u.category === activeFilter;
            return matchesSearch && matchesFilter;
        });

        return [...filtered].sort((a, b) => {
            // 1. Pinned items always at the top
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;

            // 2. Upcoming events closest to today first
            if (a.eventAt && b.eventAt) {
                return new Date(a.eventAt).getTime() - new Date(b.eventAt).getTime();
            }
            if (a.eventAt && !b.eventAt) return -1;
            if (!a.eventAt && b.eventAt) return 1;

            // 3. Fallback: Newest created first
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }
);

// ─── 6. Grouped Selector (Final output for Component) ────────────────────────
export const selectGroupedUpdates = createSelector(
    [selectFilteredAndSortedUpdates],
    (sortedUpdates) => {
        const groups: Record<string, ClassUpdateItem[]> = {};

        sortedUpdates.forEach((u) => {
            const dateKey = u.isPinned
                ? "Pinned Updates"
                : formatRelativeDate(u.eventAt ?? u.createdAt, {
                    showTime: false,
                    showYear: true,
                    relativeDaysLimit: 3,
                });

            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(u);
        });

        const sortedKeys = Object.keys(groups).sort((a, b) => {
            if (a === "Pinned Updates") return -1;
            if (b === "Pinned Updates") return 1;

            const priority = ["Today", "Tomorrow", "Yesterday"];
            const aP = priority.indexOf(a);
            const bP = priority.indexOf(b);

            if (aP !== -1 || bP !== -1) {
                return (aP === -1 ? Infinity : aP) - (bP === -1 ? Infinity : bP);
            }

            const dateA = new Date(a).getTime();
            const dateB = new Date(b).getTime();
            const now = Date.now();

            if (dateA > now && dateB > now) return dateA - dateB;
            return dateB - dateA;
        });

        return { grouped: groups, sortedDateKeys: sortedKeys };
    }
);



/**
 * Some selectors are designed for specific UI states (e.g. loading, error) and are accessed via the same bucket to ensure consistency and avoid mismatches between different parts of the state.
 */

// Example: Create Update Form State Selector
export const selectCreateUpdateState = createSelector(
    [
        (state: RootState, classId: string) =>
            state.classes.classUpdates.updatesByClass[classId],
    ],
    (bucket) => ({
        loading: bucket?.loading.create ?? false,
        error: bucket?.error.create ?? null,
    })
);

// Example: Single Update Fetch State Selector
export const selectSingleUpdateState = createSelector(
    [
        (state: RootState, classId: string) =>
            state.classes.classUpdates.updatesByClass[classId],
        (_: RootState, __: string, updateId: string) => updateId,
    ],
    (bucket, updateId) => {
        const update =
            bucket?.items.find((u) => u._id === updateId) ?? null;

        return {
            data: update,
            loading: bucket?.loading.fetch ?? false,
            updating: bucket?.loading.update ?? false,
            error: bucket?.error.update ?? null,
        };
    }
);