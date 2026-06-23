"use client";

import React from "react";
import { Mail, Phone, BookOpenText } from "lucide-react";
import { Input } from "@/components/ui/Input";
import type { ClassFaculty } from "@/store/features/classes/class.types";

interface ContactInfoSectionProps {
  formData: Pick<ClassFaculty, "email" | "phone" | "classroomCode" | "classroomInviteLink">;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ContactInfoSection({
  formData,
  onInputChange,
}: ContactInfoSectionProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
      <h3 className="text-sm font-bold text-slate-900 mb-4">
        Contact Information
      </h3>

      <Input
        label="Email Address"
        name="email"
        type="email"
        value={formData.email}
        onChange={onInputChange}
        placeholder="e.g., alan.grant@university.edu"
        description="The primary email address for students to contact the faculty member."
        icon={Mail}
      />

      <Input
        label="Phone Number"
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={onInputChange}
        placeholder="e.g., +1 (234) 567-890"
        description="Optional phone number for contact. Please include country code if applicable."
        icon={Phone}
      />

      <Input
        label="Classroom Code"
        name="classroomCode"
        value={formData.classroomCode}
        onChange={onInputChange}
        placeholder="e.g., SCI-402"
        description="The unique code for the faculty member's classroom."
        icon={BookOpenText}
      />

      <Input
        label="Invite Link"
        name="classroomInviteLink"
        value={formData.classroomInviteLink ?? ""}
        onChange={onInputChange}
        placeholder="e.g., https://classroom.example.com/invite/abc123"
        description="Optional invite link for students to join the class directly."
      />
    </div>
  );
}