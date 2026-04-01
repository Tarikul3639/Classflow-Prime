"use client";

import React, { use, useEffect, useState } from "react";
import MemberSearch from "./_components/MemberSearch";
import { Filters as RoleFilters } from "@/components/ui/Filters";
import MemberCard from "./_components/MemberCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  fetchClassMembers,
  assignAssistant,
  revokeAssistant,
  revokeMember,
  type ClassMember,
} from "@/store/features/classes/thunks/members/class-member.thunk";

export default function MembersPage() {
  const { classId } = useParams();
  const dispatch = useAppDispatch();

  const myId = useAppSelector((state) => state.profile.fetchUser.user?._id);

  const { members, loading, error } = useAppSelector(
    (state) => state.classes.classMembers,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", label: "All Roles" },
    { id: "admins", label: "Admins" },
    { id: "students", label: "Students" },
  ];

  useEffect(() => {
    if (classId) {
      dispatch(fetchClassMembers(classId.toString()));
    }
  }, [dispatch, classId]);

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "admins" && member.role === "instructor") ||
      (activeFilter === "students" && member.role === "learner") ||
      (activeFilter === "admins" && member.role === "assistant");

    return matchesSearch && matchesFilter;
  });

  const groupedMembers = {
    Administrator: filteredMembers.filter(
      (m) => m.role === "instructor" || m.role === "assistant",
    ),
    Students: filteredMembers.filter((m) => m.role === "learner"),
  };

  const onAssignAssistant = async (userId: string) => {
    if (!classId) return;
    const promise = dispatch(
      assignAssistant({ classId: classId.toString(), userId }),
    ).unwrap();
    toast.promise(promise, {
      loading: "Assistant assigning...",
      success: "Assistant assign successfully",
      error: "Failed to assign assistant",
    });

    try {
      await promise;
    } catch (e) {
      console.error(e);
    }
  };

  const onRevokeAssistant = async (userId: string) => {
    if (!classId) return;
    const promise = dispatch(
      revokeAssistant({ classId: classId.toString(), userId }),
    ).unwrap();
    toast.promise(promise, {
      loading: "Removing assistant...",
      success: "Assistant revoked successfully",
      error: "Failed to revoke assistant",
    });

    try {
      await promise;
    } catch (e) {
      console.error(e);
    }
  };

  const onRevokeMember = async (userId: string) => {
    if (!classId) return;
    const promise = dispatch(
      revokeMember({ classId: classId.toString(), userId }),
    ).unwrap();
    toast.promise(promise, {
      loading: "Removing member...",
      success: "Member revoked successfully",
      error: "Failed to revoke member",
    });

    try {
      await promise;
    } catch (e) {
      console.error(e);
    }
  };

  if (loading.fetchMembers) {
    return (
      <div className="py-16 text-center text-sm text-slate-500">
        Loading members...
      </div>
    );
  }

  if (error.fetchMembers) {
    return (
      <div className="py-16 text-center text-sm text-red-500">
        {error.fetchMembers}
      </div>
    );
  }

  return (
    <>
      {/* Filters & Search */}
      <div className="p-4 flex flex-col gap-3 bg-slate-100/50 mx-auto w-full">
        <MemberSearch value={searchQuery} onChange={setSearchQuery} />
        <RoleFilters
          filters={filters}
          active={activeFilter}
          onChange={setActiveFilter}
        />
      </div>

      {/* Members Content */}
      <div className="px-4 py-2 space-y-4 pb-8 mx-auto w-full">
        {Object.entries(groupedMembers).map(
          ([groupName, members]) =>
            members.length > 0 && (
              <div key={groupName}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  {groupName} ({members.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {members.map((member) => (
                    <MemberCard
                      key={member.userId}
                      member={member}
                      isMe={member.userId === myId}
                      onAssignAssistant={onAssignAssistant}
                      onRevokeAssistant={onRevokeAssistant}
                      onRevokeMember={onRevokeMember}
                    />
                  ))}
                </div>
              </div>
            ),
        )}
      </div>
    </>
  );
}
