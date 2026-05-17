"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";

// UI Components
import { Filters as FilterChips } from "@/components/ui/Filters";
import { EmptyState } from "@/components/ui/EmptyState";
import { UpdatesSkeleton } from "./_components/UpdatesSkeleton";
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
  selectClassUpdateItems,
} from "@/store/features/classes/selectors/class-updates.selectors";

// Types & Configurations
import { UPDATE_TYPE_CONFIG, ClassUpdateItem, UpdateCategory } from "@/types/update.types";

interface Filter {
  id: string;
  label: string;
}

export default function UpdatesPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams();

  const searchParams = useSearchParams();
  const updateId = searchParams.get("updateId");

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

  // Fetch status flags for conditional UI states
  const {
    loading: isFetching,
    error: fetchingError,
  } = useAppSelector(
    (state) =>
      state.classes.classUpdates.updatesByClass[classId]?.fetch || {}
  );

  // Class-level permissions
  const classEntry = useAppSelector(
    (state) => state.classes.fetchSingleClass.classesByClassId[classId],
  );
  const classDetails = classEntry?.classDetails;
  const classLoading = classEntry?.fetch.loading ?? false;

  // ──Notification to updateId ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!updateId) return;

    const timer = setTimeout(() => {
      const el = document.getElementById(updateId);
      if (!el) return;

      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // optional highlight
      el.classList.add("ring-2", "ring-primary/70");
      el.classList.add("!bg-primary/2");

      setTimeout(() => {
        el.classList.remove("ring-2", "ring-primary/70");
        el.classList.remove("!bg-primary/2");
      }, 1500);
    }, 500);

    return () => clearTimeout(timer);
  }, [updateId, grouped]);

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

  const handleCopy = async (update: ClassUpdateItem) => {
    try {
      const plainDescription = update.description
        .replace(/<[^>]*>/g, "") // remove HTML tags
        .trim();

      const info = [
        `Title: ${update.title}`,
        `Description: ${plainDescription}`,
        `Category: ${update.category}`,
        update.eventAt ? `Event Time: ${new Date(update.eventAt).toLocaleString()}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      await navigator.clipboard.writeText(info);

      toast.success("Update copied successfully");
    } catch (err) {
      console.error("Copy failed:", err);
      toast.error("Failed to copy update");
    }
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
  const isAdmin = !!(classDetails?.isInstructor || classDetails?.isAssistant);
  const isEmpty = sortedDateKeys.length === 0 && !isFetching && !fetchingError;
  const isLoading = isFetching || classLoading;

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

        {/* Create Card — Admin Only */}
        {isAdmin && !isLoading && (
          <div className="shrink-0">
            <CreateUpdateCard classId={classId} />
          </div>
        )}

        {/* Skeleton → Empty → List: mutually exclusive */}
        {isLoading ? (
          <UpdatesSkeleton groups={2} cardsPerGroup={3} />
        ) : isEmpty ? (
          <div className="flex-1 flex items-center justify-center py-10">
            <EmptyState
              icon={GraduationCap}
              title={searchQuery ? "No matches found" : "No updates yet"}
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
                      UPDATE_TYPE_CONFIG[update.category as UpdateCategory];
                    const isPast =
                      update.eventAt &&
                      new Date(update.eventAt).getTime() < Date.now();
                    return (
                      <UpdateCard
                        key={update._id}
                        isAdmin={isAdmin}
                        updateId={update._id}
                        isPast={!!isPast}
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
                          handleTogglePin(update._id, update.isPinned)
                        }
                        onEdit={() =>
                          router.push(`/classes/${classId}/updates/${update._id}`)
                        }
                        onDelete={() => handleDelete(update._id)}
                        onCopy={() => handleCopy(update)}
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