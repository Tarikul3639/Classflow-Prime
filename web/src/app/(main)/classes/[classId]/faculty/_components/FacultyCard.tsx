import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  BookOpenText,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

import ActionMenu from "./ActionMenu";
import type { ClassFaculty } from "@/store/features/classes/class.types";

interface FacultyCardProps {
  isAdmin?: boolean;
  faculty: ClassFaculty;
  onTogglePin?: () => void;
  onSaveContact?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
  showActions?: boolean;
}

export const FacultyCard = ({
  isAdmin = false,
  faculty,
  onSaveContact,
  onDelete,
  onEdit,
  onTogglePin,
  onCopy,
  showActions = true,
}: FacultyCardProps) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyClassroomCode = async (
    classroomCode?: string,
    facultyId?: string,
  ) => {
    try {
      await navigator.clipboard.writeText(classroomCode || "");
      setCopied(facultyId || "unknown");
      setTimeout(() => {
        setCopied(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const openclassroomInviteLink = (classroomInviteLink?: string) => {
    if (!classroomInviteLink) return;

    window.open(classroomInviteLink, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col gap-4">
      {/* Faculty Info */}
      <div className="flex items-center gap-4">
        {faculty.avatarUrl ? (
          <img
            src={faculty.avatarUrl}
            alt={faculty.name}
            className="w-14 md:w-15 lg:w-16 h-14 md:h-15 lg:h-16 rounded-full object-cover border-2 border-blue-100"
          />
        ) : (
          <div className="w-14 md:w-15 lg:w-16 h-14 md:h-15 lg:h-16 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold text-xl border-2 border-blue-100">
            {faculty.name.match(/\b\w/g)?.join("")}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] md:text-[15px] lg:text-[16px] font-bold text-slate-900 leading-tight truncate">
            {faculty.name}
          </h3>
          <p className="text-[13px] md:text-[14px] lg:text-[15px] font-medium text-primary truncate">
            {faculty.designation}
          </p>
          <div className="flex items-center gap-1 mt-1 text-slate-500">
            <MapPin size={13} />
            <span className="text-[11px] md:text-[12px] lg:text-[13px] truncate">
              {faculty.location}
            </span>
          </div>
        </div>

        {showActions && (
          <div className="ml-auto">
            <ActionMenu
              isAdmin={isAdmin}
              onDelete={onDelete}
              onEdit={onEdit}
              onTogglePin={onTogglePin}
              onSaveContact={onSaveContact}
              onCopy={onCopy}
            />
          </div>
        )}
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 gap-1.5 md:gap-2 pt-2 border-t border-slate-200">
        {/* Email */}
        {faculty.email && (
          <a
            href={`mailto:${faculty.email}`}
            className="flex items-center gap-3 text-[13px] md:text-[14px] lg:text-[15px] text-slate-600 hover:text-primary transition-colors"
          >
            <Mail size={16} className="shrink-0" />
            <span className="truncate">{faculty.email}</span>
          </a>
        )}

        {/* Phone */}
        {faculty.phone && (
          <a
            href={`tel:${faculty.phone}`}
            className="flex items-center gap-3 text-[13px] md:text-[14px] lg:text-[15px] text-slate-600 hover:text-primary transition-colors"
          >
            <Phone size={16} className="shrink-0" />
            <span>{faculty.phone}</span>
          </a>
        )}

        {/* Classroom */}
        {faculty.classroomCode && (
          <div className="flex items-center gap-2 md:gap-2 text-[13px] md:text-[14px] lg:text-[15px] text-slate-600">
            <BookOpenText size={16} className="shrink-0" />

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-slate-600 shrink-0">Classroom:</span>
              <span className="font-semibold text-slate-900 truncate">
                {faculty.classroomCode}
              </span>
            </div>

            {/* Copy */}
            <button
              type="button"
              onClick={() =>
                copyClassroomCode(faculty.classroomCode, faculty.facultyId)
              }
              className="h-7 w-7 rounded-md hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              {copied === faculty.facultyId ? (
                <Check size={15} className="text-primary" />
              ) : (
                <Copy size={15} className="text-slate-400 hover:text-primary" />
              )}
            </button>

            {/* Join */}
            {faculty.classroomInviteLink && (
              <button
                type="button"
                onClick={() => openclassroomInviteLink(faculty.classroomInviteLink)}
                className="h-7 px-2 rounded-md bg-primary/10 text-primary hover:bg-primary/15 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ExternalLink size={13} />
                <span className="text-[11px] font-semibold">Join</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};