"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Users } from "lucide-react";
import MemberSearch from "./_components/MemberSearch";
import { Filters as RoleFilters } from "@/components/ui/Filters";
import MemberCard from "./_components/MemberCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/EmptyState";
import { TopLoader } from "@/components/ui/TopLoader";
// ─── Thunks ────────────────────────────────────────────────
import {
  fetchClassMembers,
  assignAssistant,
  revokeAssistant,
  revokeMember,
} from "@/store/features/classes/thunks/members/class-member.thunk";
// ─── Selectors ────────────────────────────────────────────────
import {
  makeSelectClassMembers,
  makeSelectClassMembersLoading,
  selectIsMembersStale,
} from "@/store/features/classes/selectors/class-members.selectors";

export default function MembersPage() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const classId = params.classId?.toString() || "";

  // ─── Selectors (one instance per component) ──────────────────
  const selectMembers = useMemo(() => makeSelectClassMembers(), [classId]);
  const selectLoading = useMemo(() => makeSelectClassMembersLoading(), [classId]);
  const selectIsStale = useMemo(() => selectIsMembersStale(classId), [classId]);

  const members = useAppSelector((state) => selectMembers(state, classId));
  const isLoading = useAppSelector((state) => selectLoading(state, classId));
  const isStale = useAppSelector((state) => selectIsStale(state, classId));

  const myId = useAppSelector((state) => state.profile.fetchUser.user?._id);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", label: "All Roles" },
    { id: "admins", label: "Admins" },
    { id: "students", label: "Students" },
  ];

  // ─── Fetch (only if stale) ────────────────────────────────────
  useEffect(() => {
    if (classId && isStale) {
      dispatch(fetchClassMembers(classId));
    }
  }, [dispatch, classId, isStale]);

  // ─── Current user role ────────────────────────────────────────
  const currentUserRole = useMemo(
    () => members.find((m) => m.userId === myId)?.role ?? "learner",
    [members, myId]
  );

  // ─── Member Actions ───────────────────────────────────────────
  const onAssignAssistant = (userId: string) => {
    if (!classId) return;
    toast.promise(
      dispatch(assignAssistant({ classId: classId, userId })).unwrap(),
      {
        loading: "Assigning assistant role...",
        success: "Assistant assigned successfully",
        error: "Failed to assign assistant",
      }
    );
  };

  const onRevokeAssistant = (userId: string) => {
    if (!classId) return;
    toast.promise(
      dispatch(revokeAssistant({ classId, userId })).unwrap(),
      {
        loading: "Revoking assistant role...",
        success: "Assistant revoked successfully",
        error: "Failed to revoke assistant",
      }
    );
  };

  const onRevokeMember = (userId: string) => {
    if (!classId) return;
    toast.promise(
      dispatch(revokeMember({ classId, userId })).unwrap(),
      {
        loading: "Removing member from class...",
        success: "Member removed successfully",
        error: "Failed to remove member",
      }
    );
  };

  // ─── Filter Logic ─────────────────────────────────────────────
  const filteredMembers = useMemo(() =>
    members.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "admins" &&
          (member.role === "instructor" || member.role === "assistant")) ||
        (activeFilter === "students" && member.role === "learner");

      return matchesSearch && matchesFilter;
    }),
    [members, searchQuery, activeFilter]
  );

  const groupedMembers = useMemo(() => ({
    Administrator: filteredMembers.filter(
      (m) => m.role === "instructor" || m.role === "assistant"
    ),
    Students: filteredMembers.filter((m) => m.role === "learner"),
  }), [filteredMembers]);

  const isEmpty = filteredMembers.length === 0;

  return (
    <main className="relative bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="shrink-0 p-4 flex flex-col gap-3 bg-white border-b border-slate-200">
        <MemberSearch value={searchQuery} onChange={setSearchQuery} />
        <RoleFilters
          filters={filters}
          active={activeFilter}
          onChange={setActiveFilter}
        />
      </div>

      {/* Content */}
      <div className="flex-1 relative flex flex-col px-4 py-6 space-y-6 pb-24 lg:pb-8">
        <TopLoader isLoading={isLoading} />

        {isEmpty ? (
          <div className="flex-1 flex items-center justify-center py-10">
            <EmptyState
              title={searchQuery ? "No matches found" : "No members found"}
              description={
                searchQuery
                  ? `We couldn't find anyone matching "${searchQuery}"`
                  : "It looks like there are no members in this category yet."
              }
              icon={Users}
              size="md"
            />
          </div>
        ) : (
          Object.entries(groupedMembers).map(
            ([groupName, groupList]) =>
              groupList.length > 0 && (
                <section key={groupName}>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 px-1">
                    {groupName} ({groupList.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupList.map((member) => (
                      <MemberCard
                        key={member.userId}
                        member={member}
                        isMe={member.userId === myId}
                        currentUserRole={currentUserRole}
                        onAssignAssistant={onAssignAssistant}
                        onRevokeAssistant={onRevokeAssistant}
                        onRevokeMember={onRevokeMember}
                      />
                    ))}
                  </div>
                </section>
              )
          )
        )}
      </div>
    </main>
  );
}