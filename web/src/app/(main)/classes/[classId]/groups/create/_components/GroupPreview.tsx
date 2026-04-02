"use client";

import { GroupCard } from "../../_components/GroupCard";
import { ClassGroup } from "@/types/group.types";

interface GroupPreviewProps {
  formData: Omit<ClassGroup, "groupId" | "createdAt" | "updatedAt">;
}

export default function GroupPreview({ formData }: GroupPreviewProps) {
  const previewGroup: ClassGroup = {
    ...formData,
    groupId: "preview",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-sm font-bold text-slate-900 mb-4">Preview</h3>
      <p className="text-xs text-slate-500 mb-4">
        This is how the group card will appear to students
      </p>
      <GroupCard group={previewGroup} />
    </div>
  );
}
