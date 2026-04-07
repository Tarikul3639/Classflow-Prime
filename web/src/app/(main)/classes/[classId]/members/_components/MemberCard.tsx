"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MemberActionMenu from "./MemberActionMenu";
import {
  ClassMember,
  EnrollmentRole,
} from "@/store/features/classes/thunks/members/class-member.thunk";
import { m } from "motion/react";

interface MemberCardProps {
  member: ClassMember;
  isMe: boolean;
  currentUserRole: string;
  onAssignAssistant: (userId: string) => void;
  onRevokeAssistant: (userId: string) => void;
  onRevokeMember: (userId: string) => void;
}

export default function MemberCard({
  member,
  isMe,
  currentUserRole,
  onAssignAssistant,
  onRevokeAssistant,
  onRevokeMember,
}: MemberCardProps) {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case EnrollmentRole.INSTRUCTOR:
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-primary uppercase">
            Instructor
          </span>
        );
      case EnrollmentRole.ASSISTANT:
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-primary uppercase">
            Assistant
          </span>
        );
      default:
        return null;
    }
  };


  const canManage =
    !isMe &&
    (
      currentUserRole === EnrollmentRole.INSTRUCTOR ||
      (currentUserRole === EnrollmentRole.ASSISTANT &&
        member.role === EnrollmentRole.LEARNER)
    );

  return (
    <div className="group flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-primary/30 transition-all shadow-xs max-w-sm">
      <div className="relative">
        <Avatar className="w-11 h-11 rounded-full object-cover bg-primary/30">
          <AvatarImage src={member.avatarUrl} alt={member.name} />
          <AvatarFallback className="bg-primary text-white font-bold">
            {member.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {member.verified && (
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
            <ShieldCheck
              className="text-primary bg-blue-100 rounded-full p-0.5"
              size={14}
            />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[13px] md:text-[14px] font-bold truncate">
            {member.name}
          </p>
          {getRoleBadge(member.role)}
        </div>
        <p className="text-[12px] md:text-[13px] text-slate-500 truncate">
          {member.email}
        </p>
      </div>

      {canManage && (
        <MemberActionMenu
          member={member}
          onAssignAssistant={() => onAssignAssistant(member.userId)}
          onRevokeAssistant={() => onRevokeAssistant(member.userId)}
          onRevokeMember={() => onRevokeMember(member.userId)}
        />
      )}
    </div>
  );
}
