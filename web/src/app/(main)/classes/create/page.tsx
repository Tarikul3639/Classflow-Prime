"use client";

import React, { useCallback, useState } from "react";
import { ArrowLeft, WandSparkles, Link } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

import {
  updateFormData,
  resetForm,
} from "@/store/features/classes/slices/create-class.slice";
import { createClass } from "@/store/features/classes/thunks/create-class.thunk";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "sonner";

const errorFieldMap: Record<string, string> = {
  ClassName: "className",
  Department: "department",
  Semester: "semester",
  CoverImage: "coverImage",
};

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

export default function CreateClassPage() {
  // State
  const [selectedColor, setSelectedColor] = useState(COLORS[5]);
  const router = useRouter();
  const despatch = useAppDispatch();
  const { formData, loading, error } = useAppSelector(
    (state) => state.classes.createClass,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    despatch(createClass(formData))
      .unwrap()
      .then((res) => {
        console.log("🎯 Class created successfully:", res);
        router.push(`/classes/${res.data.classId}/updates`);
        despatch(resetForm());
      })
      .catch((err) => {
        if (err.field) {
          const fieldId = errorFieldMap[error.field || ""];

          const el = document.getElementById(fieldId);

          if (el) {
            el.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });

            // optional: focus
            if ("focus" in el) {
              (el as HTMLElement).focus();
            }
          }
        } else {
          toast("Failed to create class", {
            description: err.message,
            position: "top-center",
          });
        }
      });
  };

  const regenerateCoverImage = useCallback(() => {
    const newSeed = Math.random().toString(36).substring(7);
    despatch(
      updateFormData({
        coverImage: `https://api.dicebear.com/9.x/shapes/svg?seed=${newSeed}`,
      }),
    );
  }, [despatch]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200/80 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={router.back}
            className="group flex items-center justify-center p-2 rounded-lg hover:bg-white transition-colors border border-slate-200 bg-white cursor-pointer hover:border-primary/30"
          >
            <ArrowLeft
              className="text-slate-900 group-hover:text-primary group-hover:-translate-x-0.5 transition-all duration-200"
              size={18}
            />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Create New Class
            </h1>
            <p className="text-slate-500 text-xs block">
              Set up a new virtual classroom for your students.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <form onSubmit={handleSubmit} className="h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl shadow-sm shadow-slate-200/50 border border-slate-100 overflow-hidden">
                {/* Banner Image */}
                <div className="relative h-64 w-full group overflow-hidden">
                  <img
                    alt="Class Banner Preview"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    src={formData.coverImage || ""}
                  />

                  <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={regenerateCoverImage}
                      className="md:opacity-0 md:translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <WandSparkles className="size-4 text-sky-300" />
                      <span className="text-xs font-medium tracking-wide">
                        Regenerate Banner
                      </span>
                    </button>
                  </div>

                  <div className="absolute bottom-4 left-4">
                    <p className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[10px] font-bold text-white uppercase tracking-widest border border-none">
                      AI Preview
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg bg-white">
                {/* Form Fields */}
                <div className="p-6 md:p-10 space-y-6">
                  <div>
                    <div className="flex flex-wrap gap-3 md:gap-3.5">
                      {COLORS.map((c) => {
                        const isActive = selectedColor.hex === c.hex;
                        return (
                          <button
                            key={c.hex}
                            type="button"
                            onClick={() => {
                              setSelectedColor(c);
                              despatch(updateFormData({ themeColor: c.hex }));
                            }}
                            className={`group relative size-8 md:size-9 rounded-full transition-all duration-300 cursor-pointer ${isActive ? " scale-140" : "hover:scale-140"}`}
                            style={
                              {
                                backgroundColor: c.hex,
                                /* Ring-offset color should match your app's background */
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
                    value={formData.className}
                    error={
                      error?.field === "ClassName"
                        ? error.message || undefined
                        : undefined
                    }
                    onChange={(e) => {
                      if (e.target.value.length <= 30)
                        despatch(updateFormData({ className: e.target.value }));
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
                      value={formData.department}
                      error={
                        error?.field === "Department"
                          ? error.message || undefined
                          : undefined
                      }
                      onChange={(e) =>
                        despatch(updateFormData({ department: e.target.value }))
                      }
                      description="The academic department this class belongs to."
                    />

                    {/* Semester */}
                    <Input
                      id="semester"
                      label="Semester"
                      placeholder="e.g. Fall 2026"
                      value={formData.semester}
                      error={
                        error?.field === "Semester"
                          ? error.message || undefined
                          : undefined
                      }
                      onChange={(e) => {
                        if (e.target.value.length <= 10)
                          despatch(
                            updateFormData({ semester: e.target.value }),
                          );
                      }}
                      description="The semester or term for this class (e.g., Fall 2026). Max 10 characters."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Settings & Actions */}
            <div className="space-y-6">
              {/* Enroll via Code Toggle */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                    <Link className="size-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-bold text-slate-900">
                      Enroll via Code
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enable enrollment link
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowEnroll}
                      onChange={(e) =>
                        despatch(
                          updateFormData({ allowEnroll: e.target.checked }),
                        )
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/0 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Students can automatically enroll using a secure link or code
                  that you'll receive after creating the class.
                </p>
              </div>

              {/* Quick Tips */}
              <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-100 p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <svg
                    className="text-primary"
                    fill="none"
                    height="20"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="20"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  Quick Tips
                </h3>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Use a clear, descriptive class name</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Banner images work best at 1200x400px</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Course codes help students identify classes</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-sm shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <span>{loading ? "Creating..." : "Create Class"}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
