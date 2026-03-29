"use client";

import React from "react";
import { User, Briefcase, MapPin } from "lucide-react";
import { Input } from "@/components/ui/Input";
import type { ClassFaculty } from "@/store/features/classes/thunks/class-faculty.thunk";

interface BasicInfoSectionProps {
  formData: Pick<ClassFaculty, "name" | "designation" | "location">;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function BasicInfoSection({
  formData,
  onInputChange,
}: BasicInfoSectionProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
      <h3 className="text-sm font-bold text-slate-900 mb-4">
        Basic Information
      </h3>

      <Input
        label="Full Name"
        name="name"
        value={formData.name}
        onChange={onInputChange}
        placeholder="e.g., Dr. Alan Grant"
        description="The full name of the faculty member as they would like it to appear in the directory."
        required
        icon={User}
      />

      <Input
        label="Designation"
        name="designation"
        value={formData.designation}
        onChange={onInputChange}
        placeholder="e.g., Senior Professor"
        description="The official title or position of the faculty member within the institution."
        icon={Briefcase}
      />

      <Input
        label="Office Location"
        name="location"
        value={formData.location}
        onChange={onInputChange}
        placeholder="e.g., Room 123, Science Building"
        description="Where students can find the faculty member for office hours or meetings."
        icon={MapPin}
      />
    </div>
  );
}