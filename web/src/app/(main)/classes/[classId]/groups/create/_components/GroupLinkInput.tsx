"use client";

import React from "react";
import { Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ClassGroup, GroupPlatform } from "@/types/group.types";

interface GroupLinkInputProps {
  formData: Omit<ClassGroup, "groupId" | "createdAt" | "updatedAt">;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPlatformChange: (platform: GroupPlatform) => void;
}

export default function GroupLinkInput({
  formData,
  onInputChange,
  onPlatformChange,
}: GroupLinkInputProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
      <h3 className="text-sm font-bold text-slate-900 mb-4">Group Link</h3>

      <Select
        label="Platform"
        description="Choose the platform where this group is hosted"
        value={formData.platform}
        onChange={(e) => onPlatformChange(e.target.value as GroupPlatform)}
        options={[
          { value: GroupPlatform.WHATSAPP, label: "WhatsApp" },
          { value: GroupPlatform.DISCORD, label: "Discord" },
          { value: GroupPlatform.TELEGRAM, label: "Telegram" },
          { value: GroupPlatform.FACEBOOK, label: "Facebook" },
          { value: GroupPlatform.MESSENGER, label: "Messenger" },
          { value: GroupPlatform.OTHER, label: "Other" },
        ]}
      />

      <Input
        label="Invitation Link"
        name="link"
        type="url"
        value={formData.link}
        onChange={onInputChange}
        placeholder="e.g., https://chat.whatsapp.com/..."
        description="Paste the invite link that students can use to enroll the group."
        required
        icon={LinkIcon}
      />

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-xs text-slate-600 leading-relaxed">
          <span className="font-semibold text-amber-900">Privacy Note:</span>{" "}
          Make sure the link you're sharing is a public invite link that doesn't
          expire. Avoid sharing links that contain sensitive information.
        </p>
      </div>
    </div>
  );
}
