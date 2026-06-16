"use client";

import React, { useEffect } from "react";
import { Plus, Users } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { GroupCard } from "./_components/GroupCard";
import { GroupsSkeleton } from "./_components/GroupsSkeleton";

import { EmptyState } from "@/components/ui/EmptyState";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchClassGroups,
  deleteClassGroup,
} from "@/store/features/classes/thunks/groups/class-group.thunk";
import {
  selectClassGroups,
  selectIsGroupsFetched,
} from "@/store/features/classes/selectors/class-group.selectors";

export default function GroupsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const classId = params.classId as string;

  const groups = useAppSelector((state) => selectClassGroups(state, classId));
  const isFetched = useAppSelector((state) =>
    selectIsGroupsFetched(state, classId),
  );

  const groupsState = useAppSelector(
    (state) => state.classes.classGroups.groupsByClass[classId],
  );

  const classState = useAppSelector(
    (state) => state.classes.fetchSingleClass.classesByClassId[classId],
  );

  const isFetching = groupsState?.fetch?.loading ?? false;
  const fetchError = groupsState?.fetch?.error ?? null;

  const classDetails = classState?.classDetails;
  const classFetching = classState?.fetch?.loading ?? false;

  useEffect(() => {
    if (classId && !isFetched) {
      dispatch(fetchClassGroups(classId));
    }
  }, [classId, dispatch, isFetched]);

  const isAdmin = classDetails?.isInstructor || classDetails?.isAssistant;
  const isEmpty = groups.length === 0 && !isFetching;
  const isLoading = (isFetching && groups.length === 0) || (classFetching && !classDetails);

  const handleDelete = async (groupId: string) => {
    const promise = dispatch(deleteClassGroup({ classId, groupId })).unwrap();

    toast.promise(promise, {
      loading: "Deleting group...",
      success: "Group deleted successfully",
      error: "Failed to delete group",
    });

    try {
      await promise;
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (groupId: string) => {
    router.push(`/classes/${classId}/groups/${groupId}`);
  };

  const handleTogglePin = (groupId: string) => {
    console.log("Toggle pin for group with ID:", groupId);
  };

  return (
    <main className="relative mx-auto flex flex-col space-y-4 bg-slate-50 p-4 pb-8">
      {isAdmin && !isLoading && (
        <div className="shrink-0 rounded-2xl border-2 border-dashed border-slate-300 bg-transparent p-6 flex flex-col items-center text-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
            <Plus className="text-primary" size={24} />
          </div>

          <div>
            <h4 className="text-base font-bold text-slate-900">
              Add New Group
            </h4>
            <p className="mt-1 text-sm text-slate-600">
              Help your classmates by sharing relevant group links
            </p>
          </div>

          <Link
            href={`/classes/${classId}/groups/create`}
            className="mt-2 flex items-center gap-2 rounded-lg border border-primary/30 bg-white/50 px-4 py-2.5 text-[11px] font-bold text-primary transition-colors hover:bg-blue-50 md:text-[12px] lg:text-[13px] cursor-pointer"
          >
            <span>Create Group</span>
          </Link>
        </div>
      )}

      {fetchError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
          <p className="text-sm">{fetchError}</p>
        </div>
      )}

      {isLoading ? (
        <GroupsSkeleton count={6} />
      ) : isEmpty && !fetchError ? (
        <div className="flex flex-1 flex-col items-center justify-center py-10">
          <EmptyState
            title="No Groups Found"
            description="There are no active communication channels for this class yet."
            icon={Users}
            size="md"
          />
        </div>
      ) : (
        <div className="flex-1">
          <div className="mb-3 mt-6 px-1">
            <h3 className="px-1 text-xs font-bold uppercase tracking-widest text-slate-500">
              Active Communication Channels
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <GroupCard
                key={group.groupId}
                group={group}
                onDelete={() => handleDelete(group.groupId)}
                onEdit={() => handleEdit(group.groupId)}
                onTogglePin={() => handleTogglePin(group.groupId)}
                showActions={!!isAdmin}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}