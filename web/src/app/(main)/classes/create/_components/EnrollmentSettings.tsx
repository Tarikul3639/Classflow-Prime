"use client";

import { Link } from "lucide-react";

interface EnrollmentSettingsProps {
  allowEnroll: boolean;
  onChange: (value: boolean) => void;
}

export default function EnrollmentSettings({
  allowEnroll,
  onChange,
}: EnrollmentSettingsProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
          <Link className="size-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-base font-bold text-slate-900">Enroll via Code</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Enable enrollment link
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={allowEnroll}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/0 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
        </label>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">
        Students can automatically enroll using a secure link or code that
        you'll receive after creating the class.
      </p>
    </div>
  );
}