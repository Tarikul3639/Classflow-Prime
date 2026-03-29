import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  BookOpenText,
  Copy,
  CheckCircle,
} from "lucide-react";
import type { ClassFaculty } from "@/store/features/classes/thunks/class-faculty.thunk";

export const FacultyCard = ({ faculty }: { faculty: ClassFaculty }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyClassroomCode = async (
    classroomCode?: string,
    facultyId?: string,
  ) => {
    try {
      await navigator.clipboard.writeText(classroomCode || "");
      setCopied(facultyId || "unknown");
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  return (
    <div
      key={faculty.facultyId}
      className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col gap-4"
    >
      {/* Faculty Info */}
      <div className="flex items-center gap-4">
        {faculty.avatarUrl ? (
          <img
            alt={faculty.name}
            className="w-14 md:w-15 lg:w-16 h-14 md:h-15 lg:h-16 rounded-full object-cover border-2 border-blue-100"
            src={faculty.avatarUrl}
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
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 gap-1.5 md:gap-2 pt-2 border-t border-slate-200">
        <a
          className="flex items-center gap-3 text-[13px] md:text-[14px] lg:text-[15px] text-slate-600 hover:text-primary transition-colors"
          href={`mailto:${faculty.email}`}
        >
          <Mail size={16} className="shrink-0" />
          <span className="truncate">{faculty.email}</span>
        </a>
        <a
          className="flex items-center gap-3 text-[13px] md:text-[14px] lg:text-[15px] text-slate-600 hover:text-primary transition-colors"
          href={`tel:${faculty.phone}`}
        >
          <Phone size={16} className="shrink-0" />
          <span>{faculty.phone}</span>
        </a>
        <button
          onClick={() =>
            copyClassroomCode(faculty.classroomCode, faculty.facultyId)
          }
          className="flex items-center gap-3 w-full rounded-md hover:bg-slate-50 text-[13px] md:text-[14px] lg:text-[15px] text-slate-600 hover:text-primary transition-all group active:scale-[0.98]"
          title="Click to copy code"
        >
          <BookOpenText
            size={16}
            className="shrink-0 text-slate-400 group-hover:text-primary"
          />

          <span className="flex-1 text-left font-medium">
            <span className="text-slate-600 font-normal">Classroom Code: </span>
            {faculty.classroomCode}
          </span>

          <div className="flex items-center justify-end min-w-16.25">
            {copied === faculty.facultyId ? (
              <div className="flex items-center gap-1 text-primary text-xs font-bold animate-in fade-in zoom-in duration-200">
                <CheckCircle size={14} />
                <span>Copied</span>
              </div>
            ) : (
              <Copy
                size={14}
                className="text-slate-400 group-hover:text-primary transition-colors"
              />
            )}
          </div>
        </button>
      </div>
    </div>
  );
};
