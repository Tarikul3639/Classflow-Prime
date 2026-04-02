"use client";

import React from "react";
import { Hash } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ClassGroup} from "@/types/group.types";

interface GroupBasicInfoProps {
  formData: Omit<ClassGroup, "groupId" | "createdAt" | "updatedAt">;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}

export default function GroupBasicInfo({
  formData,
  onInputChange,
}: GroupBasicInfoProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
      <h3 className="text-sm font-bold text-slate-900 mb-4">
        Group Information
      </h3>

      <Input
        label="Group Name"
        name="name"
        value={formData.name}
        onChange={onInputChange}
        placeholder="e.g., Class Chat - Section A"
        description="A clear, descriptive name for the group that helps identify its purpose."
        required
        icon={Hash}
      />
      <Textarea
        label="Group Description"
        name="description"
        value={formData.description}
        onChange={onInputChange}
        placeholder="Provide a brief description of the group's purpose, rules, or any other relevant information for students."
        description="This will help students understand the purpose of the group and any guidelines they should follow when enrolling."
      />
    </div>
  );
}
