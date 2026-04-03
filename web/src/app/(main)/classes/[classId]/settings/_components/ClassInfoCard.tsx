"use client";

import React, { useState } from "react";
import { BookOpen, Users, Copy, Check, EyeOff, RefreshCw } from "lucide-react";

interface ClassInfoCardProps {
  className: string;
  classCode: string | null;
  isInstructor: boolean;
  instructor: string;
  totalStudents: number;
  semester: string;

  handleGenerateClassCode: () => void;
}

export default function ClassInfoCard({
  className,
  classCode,
  instructor,
  isInstructor,
  totalStudents,
  semester,
  handleGenerateClassCode,
}: ClassInfoCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!classCode) return;
    navigator.clipboard.writeText(classCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 md:w-12 h-10 md:h-12 rounded-xl bg-blue-100 flex items-center justify-center text-primary shrink-0">
          <BookOpen className="size-5 md:size-5.5" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base md:text-lg font-bold text-slate-900">
            {className}
          </h2>

          {/* Class Code — only for instructor */}
          {/* Class Code */}
          {isInstructor ? (
            <div className="mt-1 mb-3">
              <p className="text-[13px] md:text-sm text-slate-500">
                Code:{" "}
                <span className="font-mono font-semibold text-slate-800 tracking-wider">
                  {classCode ?? "—"}
                </span>
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <Check className="size-3 text-primary" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={handleGenerateClassCode}
                  className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <RefreshCw className="size-3" />
                  Regenerate
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-1 mb-3">
              <EyeOff className="size-3.5 text-slate-300" />
              <p className="text-[13px] md:text-sm text-slate-400">
                Class code hidden
              </p>
            </div>
          )}

          <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Users className="size-3.5 md:size-4 text-slate-400" />
              <span>Have a {totalStudents - 1} Learners</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 text-[13px] md:text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Creator:</span>
          <span className="font-semibold text-slate-900">{instructor}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-slate-500">Semester:</span>
          <span className="font-semibold text-slate-900">{semester}</span>
        </div>
      </div>
    </div>
  );
}
