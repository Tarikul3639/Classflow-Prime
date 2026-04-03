"use client";

import { User, Mail } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

interface PersonalInformationProps {
  name: string;
  email: string;
  bio: string;
  onNameChange: (value: string) => void;
  onBioChange: (value: string) => void;
}

export default function PersonalInformation({
  name,
  email,
  bio,
  onNameChange,
  onBioChange,
}: PersonalInformationProps) {
  return (
    <div className="mt-8 pt-6 border-none">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
        Personal Information
      </h3>
      <div className="space-y-4">
        <Input
          icon={User}
          label="Full Name"
          description="This is the name that will be displayed on your profile and to your classmates."
          type="text"
          className="px-3 py-2 text-sm"
          value={name}
          onChange={(e) => {
            if (e.target.value.trim().length < 25) {
              onNameChange(e.target.value);
            }
          }}
        />
        <Input
          icon={Mail}
          label="Email Address"
          description="Your registered email address. Contact support to change it."
          type="email"
          className="px-3 py-2 text-sm"
          value={email}
          disabled
        />
        <Textarea
          label="Bio"
          placeholder="Tell us about yourself..."
          description="Maximum 500 characters"
          value={bio}
          rows={4}
          onChange={(e) => {
            if (e.target.value.length <= 500) {
              onBioChange(e.target.value);
            }
          }}
        />
      </div>
    </div>
  );
}