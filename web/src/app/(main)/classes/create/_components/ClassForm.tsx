"use client";

import React from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const DEPARTMENTS = [
  "Computer Science",
  "Mathematics",
  "English",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Art",
  "Business",
  "General Studies",
];

const COLORS = [
  { hex: "#3A8BFF", name: "Blue" },
  { hex: "#22C55E", name: "Green" },
  { hex: "#F59E0B", name: "Amber" },
  { hex: "#EF4444", name: "Red" },
  { hex: "#8B5CF6", name: "Purple" },
  { hex: "#14B8A6", name: "Teal" },
  { hex: "#EC4899", name: "Pink" },
  { hex: "#0EA5E9", name: "Sky Blue" },
];

interface ClassFormError {
  field?: string | null;
  message?: string | null;
}

interface ClassFormProps {
  className: string;
  department: string;
  semester: string;
  selectedColor: (typeof COLORS)[number];
  error?: ClassFormError | null;
  onClassNameChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onSemesterChange: (value: string) => void;
  onColorChange: (color: (typeof COLORS)[number]) => void;
}

export { COLORS, DEPARTMENTS };

export default function ClassForm({
  className,
  department,
  semester,
  selectedColor,
  error,
  onClassNameChange,
  onDepartmentChange,
  onSemesterChange,
  onColorChange,
}: ClassFormProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg bg-white">
      <div className="p-6 md:p-10 space-y-6">
        {/* Color Picker */}
        <div>
          <div className="flex flex-wrap gap-3 md:gap-3.5">
            {COLORS.map((c) => {
              const isActive = selectedColor.hex === c.hex;
              return (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => onColorChange(c)}
                  className={`group relative size-8 md:size-9 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive ? "scale-140" : "hover:scale-140"
                  }`}
                  style={
                    {
                      backgroundColor: c.hex,
                      "--tw-ring-offset-color": "#ffffff",
                    } as React.CSSProperties
                  }
                  title={c.name}
                >
                  {isActive && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="size-1.5 rounded-full bg-white shadow-sm" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-[12px] font-medium text-slate-400 mt-3 uppercase tracking-wider">
            Theme:{" "}
            <span
              className="font-bold text-slate-900"
              style={{ color: selectedColor.hex }}
            >
              {selectedColor.name}
            </span>
          </p>
        </div>

        {/* Class Name */}
        <Input
          id="className"
          label="Class Name"
          placeholder="e.g. Introduction to Computer Science"
          value={className}
          error={
            error?.field === "ClassName" ? error.message || undefined : undefined
          }
          onChange={(e) => {
            if (e.target.value.length <= 30) onClassNameChange(e.target.value);
          }}
          description="This is the name of your class that students will see. Max 30 characters."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Department */}
          <Select
            id="department"
            label="Department"
            placeholder="Select department"
            options={DEPARTMENTS.map((dept) => ({
              value: dept,
              label: dept,
            }))}
            value={department}
            error={
              error?.field === "Department"
                ? error.message || undefined
                : undefined
            }
            onChange={(e) => onDepartmentChange(e.target.value)}
            description="The academic department this class belongs to."
          />

          {/* Semester */}
          <Input
            id="semester"
            label="Semester"
            placeholder="e.g. Fall 2026"
            value={semester}
            error={
              error?.field === "Semester"
                ? error.message || undefined
                : undefined
            }
            onChange={(e) => {
              if (e.target.value.length <= 10) onSemesterChange(e.target.value);
            }}
            description="The semester or term for this class (e.g., Fall 2026). Max 10 characters."
          />
        </div>
      </div>
    </div>
  );
}