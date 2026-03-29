"use client";

import React from "react";
import { FacultyCard } from "../../_components/FacultyCard";
import type { ClassFaculty } from "@/store/features/classes/thunks/class-faculty.thunk";

interface FacultyPreviewProps {
  formData: Omit<ClassFaculty, "facultyId">;
  imagePreview: string | null;
}

export default function FacultyPreview({
  formData,
  imagePreview,
}: FacultyPreviewProps) {
  // Generate initials from name
  const getInitials = (name: string) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const previewFaculty = {
    facultyId: "preview",
    name: formData.name || "Faculty Name",
    designation: formData.designation || "Designation",
    location: formData.location || "Office Location",
    email: formData.email || "email@example.com",
    phone: formData.phone || "+1 (234) 567-890",
    classroomCode: formData.classroomCode || "CLASS-CODE",
    avatar: imagePreview || undefined,
    initials: !imagePreview ? getInitials(formData.name) : undefined,
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-sm font-bold text-slate-900 mb-4">Preview</h3>
      <p className="text-xs text-slate-500 mb-4">
        This is how the faculty card will appear to students
      </p>
      <FacultyCard faculty={previewFaculty} />
    </div>
  );
}
