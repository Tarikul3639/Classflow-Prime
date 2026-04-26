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

        const now = Date.now();

        return [...filtered].sort((a, b) => {
            // 1. Priority Function
            const getPriority = (item: ClassUpdateItem) => {
                if (item.isPinned) return 0;
                
                const itemTime = item.eventAt ? new Date(item.eventAt).getTime() : null;
                if (itemTime) {
                    return itemTime >= now ? 1 : 3; // 1 for Upcoming, 3 for Past
                }
                return 2; // Regular Updates (No eventAt)
            };

            const priorityA = getPriority(a);
            const priorityB = getPriority(b);

            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }

            // 2. Same Priority thakle internal sorting
            const aTime = a.eventAt ? new Date(a.eventAt).getTime() : new Date(a.createdAt).getTime();
            const bTime = b.eventAt ? new Date(b.eventAt).getTime() : new Date(b.createdAt).getTime();

            if (priorityA === 1) {
                return aTime - bTime; // Upcoming: Shobcheye kacher ta age
            }
            // Regular updates ebong Past events er jonno: Newest first
            return bTime - aTime; 
        });
    }
);

// ─── 6. Grouped Selector (Final output for Component) ────────────────────────
export const selectGroupedUpdates = createSelector(
    [selectFilteredAndSortedUpdates],
    (sortedUpdates) => {
        const groups: Record<string, ClassUpdateItem[]> = {};
        const keyOrder: string[] = [];
        const now = Date.now();

        sortedUpdates.forEach((u) => {
            let dateKey: string;

            const isPast = u.eventAt && new Date(u.eventAt).getTime() < now;

            if (u.isPinned) {
                dateKey = "Pinned Updates";
            } else if (isPast) {
                dateKey = "Past Events"; 
            } else {
                // Today, Tomorrow, ba Specific Date
                dateKey = formatRelativeDate(u.eventAt ?? u.createdAt, {
                    showTime: false,
                    showYear: true,
                    relativeDaysLimit: 7,
                });
            }

            if (!groups[dateKey]) {
                groups[dateKey] = [];
                keyOrder.push(dateKey);
            }
            groups[dateKey].push(u);
        });

        return { grouped: groups, sortedDateKeys: keyOrder };
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