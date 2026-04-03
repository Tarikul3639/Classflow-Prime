"use client";

import React, { useEffect } from "react";
import { Plus, Users } from "lucide-react"; // Users icon for EmptyState
import Link from "next/link";
import { GroupCard } from "./_components/GroupCard";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { TopLoader } from "@/components/ui/TopLoader";
import { EmptyState } from "@/components/ui/EmptyState"; // Import EmptyState
import {
  fetchClassGroups,
  deleteClassGroup,
} from "@/store/features/classes/thunks/groups/class-group.thunk";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function GroupsPage() {
  const { classId } = useParams();
  const router = useRouter();

  const dispatch = useAppDispatch();
  const { classDetails } = useAppSelector(
    (state) => state.classes.fetchSingleClass,
  );

  const isAdmin = classDetails?.isInstructor || classDetails?.isAssistant;

  const isLoading = useAppSelector(
    (state) => state.classes.classGroups.loading.fetchGroups,
  );
  const error = useAppSelector(
    (state) => state.classes.classGroups.error.fetchGroups,
  );
  const groups = useAppSelector((state) => state.classes.classGroups.groups);

  useEffect(() => {
    if (classId) {
      dispatch(fetchClassGroups({ classId: classId as string }));
    }
  }, [classId, dispatch]);

  const handleDelete = async (groupId: string) => {
    const promise = dispatch(
      deleteClassGroup({ classId: classId as string, groupId }),
    ).unwrap();

    toast.promise(promise, {
      loading: "Deleting group...",
      success: "Group deleted successfully",
      error: "Failed to delete group",
    });

    try {
      await promise;
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (groupId: string) => {
    router.push(`/classes/${classId}/groups/${groupId}`);
  };

  const handleTogglePin = (groupId: string) => {
    console.log("Toggle pin for group with ID:", groupId);
  };

  const isEmpty = groups.length === 0;

  return (
    <main className="relative bg-slate-50 p-4 space-y-4 pb-8 mx-auto flex flex-col">
      <TopLoader isLoading={isLoading} />
      {/* Add New Group - Dashed Border */}
      {isAdmin && (
        <div className="shrink-0 border-2 border-dashed border-slate-300 rounded-2xl bg-transparent p-6 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <Plus className="text-primary" size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-base">
              Add New Group
            </h4>
            <p className="text-sm text-slate-600 mt-1">
              Help your classmates by sharing relevant group links
            </p>
          </div>
          <Link
            href={`/classes/${classId}/groups/create`}
            className="mt-2 px-4 py-2.5 rounded-lg border border-primary/30 bg-white/50 text-primary font-bold text-[11px] md:text-[12px] lg:text-[13px] hover:bg-blue-50 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>Create Group</span>
          </Link>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mt-4">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Content Section */}
      {isEmpty && !error ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10">
          <EmptyState
            title="No Groups Found"
            description="There are no active communication channels for this class yet."
            icon={Users}
            size="md"
          />
        </div>
      ) : (
        <div className="flex-1">
          {/* Section Title */}
          <div className="mt-6 mb-3 px-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1">
              Active Communication Channels
            </h3>
          </div>

          {/* Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <GroupCard
                key={group.groupId}
                group={group}
                onDelete={() => handleDelete(group.groupId)}
                onEdit={() => handleEdit(group.groupId)}
                onTogglePin={() => handleTogglePin(group.groupId)}
                showActions={isAdmin}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}