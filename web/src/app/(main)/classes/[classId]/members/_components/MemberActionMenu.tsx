"use client";

import React from "react";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ClassMember,
  EnrollmentRole,
} from "@/store/features/classes/thunks/members/class-member.thunk";

type MemberActionMenuProps = {
  member: ClassMember;
  onAssignAssistant: () => void;
  onRevokeAssistant: () => void;
  onRevokeMember: () => void;
};

const MemberActionMenu: React.FC<MemberActionMenuProps> = ({
  member,
  onAssignAssistant,
  onRevokeAssistant,
  onRevokeMember,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 text-gray-400 hover:text-[#399aef] hover:bg-white rounded-xl transition-all outline-none">
          <MoreVertical size={18} strokeWidth={2.5} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-48 p-1.5 bg-white border-slate-200 rounded-lg shadow-sm animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Section */}
        <div className="px-2 py-1.5 mb-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Manage Member
          </span>
        </div>

        {/* 1. Assign Co-Admin Area */}
        {member.role === EnrollmentRole.LEARNER && (
          <DropdownMenuItem onClick={onAssignAssistant}>
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 group-hover:scale-125 transition-transform" />
            <span>Assign Assistant</span>
          </DropdownMenuItem>
        )}

        {/* 3. Role Management */}
        {member.role === EnrollmentRole.ASSISTANT && (
          <DropdownMenuItem onClick={onRevokeAssistant}>
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 group-hover:scale-125 transition-transform" />
            <span>Revoke Assistant</span>
          </DropdownMenuItem>
        )}

        {/* 4. Danger Zone */}
        <DropdownMenuItem onClick={onRevokeMember} className="text-red-500 focus:text-red-500">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 group-hover:scale-125 transition-transform" />
          <span>Revoke Member</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MemberActionMenu;
