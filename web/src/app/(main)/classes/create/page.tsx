"use client";

import React, { useCallback, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import ClassBanner from "./_components/ClassBanner";
import ClassForm, { COLORS } from "./_components/ClassForm";
import EnrollmentSettings from "./_components/EnrollmentSettings";
import QuickTips from "./_components/QuickTips";
import FormActions from "./_components/FormActions";

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

export default function CreateClassPage() {
  const [selectedColor, setSelectedColor] = useState(COLORS[5]);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { formData, loading, error } = useAppSelector(
    (state) => state.classes.createClass,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createClass(formData))
      .unwrap()
      .then((res) => {
        router.push(`/classes/${res.data.classId}/updates`);
        dispatch(resetForm());
      })
      .catch((err) => {
        if (err.field) {
          const fieldId = errorFieldMap[error.field || ""];
          const el = document.getElementById(fieldId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            if ("focus" in el) (el as HTMLElement).focus();
          }
        } else {
          toast("Failed to create class", {
            description: err.message,
            position: "top-center",
          });
        }
      });
  };

  const handleRegenerate = useCallback(() => {
    const newSeed = Math.random().toString(36).substring(7);
    dispatch(
      updateFormData({
        coverImage: `https://api.dicebear.com/9.x/shapes/svg?seed=${newSeed}`,
      }),
    );
  }, [dispatch]);

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
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <ClassBanner
                coverImage={formData.coverImage || ""}
                onRegenerate={handleRegenerate}
              />
              <ClassForm
                className={formData.className}
                department={formData.department}
                semester={formData.semester}
                selectedColor={selectedColor}
                error={error}
                onClassNameChange={(val) =>
                  dispatch(updateFormData({ className: val }))
                }
                onDepartmentChange={(val) =>
                  dispatch(updateFormData({ department: val }))
                }
                onSemesterChange={(val) =>
                  dispatch(updateFormData({ semester: val }))
                }
                onColorChange={(color) => {
                  setSelectedColor(color);
                  dispatch(updateFormData({ themeColor: color.hex }));
                }}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <EnrollmentSettings
                allowEnroll={formData.allowEnroll}
                onChange={(val) =>
                  dispatch(updateFormData({ allowEnroll: val }))
                }
              />
              <QuickTips />
              <FormActions loading={loading} onCancel={() => router.back()} />
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}