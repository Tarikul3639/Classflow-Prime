"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";

// UI Components
import { Filters as FilterChips } from "@/components/ui/Filters";
import { EmptyState } from "@/components/ui/EmptyState";
import { TopLoader } from "@/components/ui/TopLoader";
import CreateUpdateCard from "./_components/CreateUpdateCard";
import DateHeader from "./_components/DateHeader";
import UpdateCard from "./_components/UpdateCard";
import SearchBar from "./_components/SearchBar";

// Store & Thunks
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchClassUpdate } from "@/store/features/classes/thunks/fetch-class-update.thunk";
import { togglePinClassUpdate } from "@/store/features/classes/thunks/toggle-pin-class-update.thunk";
import { deleteSingleClassUpdate } from "@/store/features/classes/thunks/delete-single-class-update.thunk";

// Memoized Selectors
import {
  selectGroupedUpdates,
  selectClassUpdatesLoading,
  selectClassUpdateItems,
} from "@/store/features/classes/selectors/class-updates.selectors";

// Types & Configurations
import { UPDATE_TYPE_CONFIG, UpdateCategory } from "@/types/update.types";

interface Filter {
  id: string;
  label: string;
}

export default function UpdatesPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams();

  const classId = params.classId as string;

  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // ── Selectors ──────────────────────────────────────────────────────────────

  // Raw items — used only for the "already fetched?" guard
  const updates = useAppSelector((state) =>
    selectClassUpdateItems(state, classId)
  );

  // Filtered, sorted, and grouped output for rendering
  const { grouped, sortedDateKeys } = useAppSelector((state) =>
    selectGroupedUpdates(state, classId, searchQuery, activeFilter)
  );

  // Per-operation loading flags
  const loading = useAppSelector((state) =>
    selectClassUpdatesLoading(state, classId)
  );

  // Class-level permissions
  const { classDetails } = useAppSelector(
    (state) => state.classes.fetchSingleClass
  );

  // ── Initialization ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!classId || !classDetails?.classId) return;
    if (updates.length > 0) return; // Skip if already loaded
    dispatch(fetchClassUpdate(classId));
  }, [dispatch, classId, classDetails?.classId, updates.length]);

  // ── Filter Config ──────────────────────────────────────────────────────────
  const filters: Filter[] = [
    { id: "all", label: "All Updates" },
    ...Object.entries(UPDATE_TYPE_CONFIG).map(([key, config]) => ({
      id: key,
      label: config.label + "s",
    })),
  ];

  // ── Event Handlers ─────────────────────────────────────────────────────────
  const handleTogglePin = (updateId: string, isPinned: boolean) => {
    const promise = dispatch(
      togglePinClassUpdate({ classId, updateId, isPinned })
    ).unwrap();

    toast.promise(promise, {
      loading: "Updating pin status...",
      success: !isPinned ? "Pinned successfully" : "Unpinned successfully",
      error: (err) => err.message || "Failed to update pin",
    });
  };

  const handleDelete = (updateId: string) => {
    const promise = dispatch(
      deleteSingleClassUpdate({ classId, updateId })
    ).unwrap();

    toast.promise(promise, {
      loading: "Deleting update...",
      success: "Update deleted successfully",
      error: (err) => err.message || "Failed to delete",
    });
  };

  // ── Derived UI State ───────────────────────────────────────────────────────
  const isAdmin = classDetails?.isInstructor || classDetails?.isAssistant;
  const isEmpty = sortedDateKeys.length === 0 && !loading.fetch;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main className="relative bg-slate-50 flex flex-col min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 p-4 flex flex-col gap-3 bg-white border-b border-slate-200">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <FilterChips
          filters={filters}
          active={activeFilter}
          onChange={setActiveFilter}
        />
      </div>

      <div className="flex-1 px-4 py-4 space-y-6 pb-24 lg:pb-8">
        {/* Network Activity Indicator */}
        <TopLoader
          isLoading={
            loading.fetch || loading.delete || loading.togglePin
          }
        />

        {/* Create Card — Admin Only */}
        {isAdmin && (
          <div className="shrink-0">
            <CreateUpdateCard classId={classId} />
          </div>
        )}

        {/* Empty State vs Update List */}
        {isEmpty ? (
          <div className="flex-1 flex items-center justify-center py-10">
            <EmptyState
              icon={GraduationCap}
              title={
                searchQuery ? "No matches found" : "No updates yet"
              }
              description={
                searchQuery
                  ? `Couldn't find anything for "${searchQuery}"`
                  : "Important announcements and class updates will appear here."
              }
            />
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDateKeys.map((dateKey) => (
              <section key={dateKey} className="space-y-3">
                <DateHeader label={dateKey} />

                <div className="space-y-3">
                  {grouped[dateKey].map((update) => {
                    const config =
                      UPDATE_TYPE_CONFIG[
                      update.category as UpdateCategory
                      ];
                    return (
                      <UpdateCard
                        key={update._id}
                        icon={config.icon}
                        iconBg={config.iconBg}
                        iconColor={config.iconColor}
                        title={update.title}
                        createdAt={update.createdAt}
                        updatedAt={update.updatedAt}
                        eventAt={update.eventAt ?? undefined}
                        description={update.description}
                        materials={update.materials}
                        postedBy={update.postedBy}
                        isPinned={update.isPinned}
                        onTogglePin={() =>
                          handleTogglePin(
                            update._id,
                            update.isPinned
                          )
                        }
                        onEdit={() =>
                          router.push(
                            `/classes/${classId}/updates/${update._id}`
                          )
                        }
                        onDelete={() =>
                          handleDelete(update._id)
                        }
                        showActions={isAdmin}
                      />
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}