"use client";

import { useState, useEffect } from "react";
import { Filters as FilterChips } from "@/components/ui/Filters";
import { EmptyState } from "@/components/ui/EmptyState";
import { BellOff, Loader2, GraduationCap } from "lucide-react";
import { TopLoader } from "@/components/ui/TopLoader";

import CreateUpdateCard from "./_components/CreateUpdateCard";
import DateHeader from "./_components/DateHeader";
import UpdateCard from "./_components/UpdateCard";
import SearchBar from "./_components/SearchBar";

import { formatRelativeDate } from "@/utils/date.utils";
import { UPDATE_TYPE_CONFIG, UpdateCategory } from "@/types/update.types";

import { fetchClassUpdate } from "@/store/features/classes/thunks/fetch-class-update.thunk";
import { togglePinClassUpdate } from "@/store/features/classes/thunks/toggle-pin-class-update.thunk";
import { deleteSingleClassUpdate } from "@/store/features/classes/thunks/delete-single-class-update.thunk";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

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

  const { updates, loading, error } = useAppSelector(
    (state) => state.classes.fetchClassUpdates,
  );
  const { classDetails } = useAppSelector(
    (state) => state.classes.fetchSingleClass,
  );

  useEffect(() => {
    if (!classId || !classDetails?.classId) return;
    if (updates.length > 0) return;

    dispatch(fetchClassUpdate(classId));
  }, [dispatch, classId, classDetails?.classId]);

  const filters: Filter[] = [
    { id: "all", label: "All Updates" },
    ...Object.entries(UPDATE_TYPE_CONFIG).map(([key, config]) => ({
      id: key,
      label: config.label + "s",
    })),
  ];

  // 1. Filter Logic
  const filteredUpdates = updates.filter((u) => {
    const matchesSearch =
      u.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || u.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // 2. Sorting Logic (Pinned first, then by date)
  const sortedUpdates = [...filteredUpdates].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return (
      new Date(b.eventAt ?? b.createdAt).getTime() -
      new Date(a.eventAt ?? a.createdAt).getTime()
    );
  });

  // 3. Grouping Logic
  const grouped: Record<string, typeof sortedUpdates> = {};
  sortedUpdates.forEach((u) => {
    const dateKey = formatRelativeDate(u.eventAt ?? u.createdAt, {
      showTime: false,
      showYear: true,
      relativeDaysLimit: 3,
    });
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(u);
  });

  // 4. Header Sorting
  const priority = ["Today", "Tomorrow", "Yesterday"];
  const sortedDateKeys = Object.keys(grouped).sort((a, b) => {
    const aP = priority.indexOf(a);
    const bP = priority.indexOf(b);
    if (aP !== -1 || bP !== -1)
      return (aP === -1 ? Infinity : aP) - (bP === -1 ? Infinity : bP);
    return new Date(b).getTime() - new Date(a).getTime();
  });

  const handleTogglePin = async (updateId: string, isPinned: boolean) => {
    const promise = dispatch(
      togglePinClassUpdate({ classId, updateId, isPinned }),
    ).unwrap();

    toast.promise(promise, {
      loading: "Updating pin status...",
      success: !isPinned ? "Pinned successfully" : "Unpinned successfully",
      error: (err) => err.message || "Failed to update pin",
    });
  };

  const handleDelete = async (updateId: string) => {
    const promise = dispatch(
      deleteSingleClassUpdate({ classId, updateId }),
    ).unwrap();

    toast.promise(promise, {
      loading: "Deleting update...",
      success: "Update deleted successfully",
      error: (err) => err.message || "Failed to delete",
    });
  };

  const isAdmin = classDetails?.isInstructor || classDetails?.isAssistant;
  const isEmpty = sortedDateKeys.length === 0;

  return (
    <main className="relative bg-slate-50 flex flex-col">
      <TopLoader isLoading={loading.update} />

      {/* Header: Search + Filters */}
      <div className="shrink-0 p-4 flex flex-col gap-3 bg-white border-b border-slate-200">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <FilterChips
          filters={filters}
          active={activeFilter}
          onChange={setActiveFilter}
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col px-4 py-4 space-y-6 pb-24 lg:pb-8">
        {/* Create Card Area */}
        {isAdmin && (
          <div className="shrink-0">
            <CreateUpdateCard classId={classId} />
          </div>
        )}

        {isEmpty ? (
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
                          handleTogglePin(update._id, update.isPinned)
                        }
                        onEdit={() =>
                          router.push(
                            `/classes/${classId}/updates/${update._id}`,
                          )
                        }
                        onDelete={() => handleDelete(update._id)}
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