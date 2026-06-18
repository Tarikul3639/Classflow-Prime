"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

import ClassBanner from "../../create/_components/ClassBanner";
import ClassForm, { COLORS } from "../../create/_components/ClassForm";
import EnrollmentSettings from "../../create/_components/EnrollmentSettings";
import QuickTips from "../../create/_components/QuickTips";
import FormActions from "../../create/_components/FormActions";

import { fetchSingleClass } from "@/store/features/classes/thunks/fetch-single-class.thunk";
import { updateClass } from "@/store/features/classes/thunks/update-class.thunk";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "sonner";
import { IClassDetails } from "@/store/features/classes/thunks/fetch-single-class.thunk";

const errorFieldMap: Record<string, string> = {
  ClassName: "className",
  Department: "department",
  Semester: "semester",
  CoverImage: "coverImage",
};

type EditFormData = Pick<
  IClassDetails,
  "className" | "department" | "semester" | "coverImage" | "themeColor" | "allowEnroll"
>;

export default function EditClassPage() {
  const router = useRouter();
  const { classId } = useParams<{ classId: string }>();
  const originalDataRef = useRef<EditFormData | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const dispatch = useAppDispatch();

  const bucket = useAppSelector(
    (state) => state.classes.fetchSingleClass.classesByClassId[classId],
  );

  const classDetails = bucket?.classDetails ?? null;
  const fetchLoading = bucket?.fetch.loading ?? false;
  const fetchError = bucket?.fetch.error ?? null;

  // Original snapshot — never mutated after seeding
  const [originalData, setOriginalData] = useState<EditFormData | null>(null);

  // Live form state
  const [formData, setFormData] = useState<EditFormData | null>(null);

  const [selectedColor, setSelectedColor] = useState(COLORS[5]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<{
    field?: string | null;
    message?: string | null;
  } | null>(null);

  // Fetch class on mount
  useEffect(() => {
    if (classId) dispatch(fetchSingleClass(classId));
  }, [classId, dispatch]);

  // Seed both original + form state once classDetails arrives
  useEffect(() => {
    if (!classDetails) return;

    const seeded: EditFormData = {
      className: classDetails.className,
      department: classDetails.department,
      semester: classDetails.semester,
      coverImage: classDetails.coverImage,
      themeColor: classDetails.themeColor,
      allowEnroll: classDetails.allowEnroll,
    };

    originalDataRef.current = seeded;
    setOriginalData(seeded);
    setFormData(seeded);

    const matched =
      COLORS.find((c) => c.hex === classDetails.themeColor) ?? COLORS[5];
    setSelectedColor(matched);
  }, [classDetails]);

  // Track if there are any changes compared to the original data


  const updateField = useCallback(
    <K extends keyof EditFormData>(
      key: K,
      value: EditFormData[K],
    ) => {

      setFormData((prev) => {
        if (!prev || !originalDataRef.current) {
          return prev;
        }

        const updated = {
          ...prev,
          [key]: value,
        };

        const dirty =
          JSON.stringify(updated) !==
          JSON.stringify(originalDataRef.current);

        setIsDirty(dirty);

        return updated;
      });

    },
    [],
  );

  const handleRegenerate = useCallback(() => {
    const newSeed = Math.random().toString(36).substring(7);
    updateField(
      "coverImage",
      `https://api.dicebear.com/9.x/shapes/svg?seed=${newSeed}`,
    );
  }, [updateField]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty) return;

    setSubmitLoading(true);
    setSubmitError(null);

    // Send only changed fields to the API
    dispatch(updateClass({ classId, data: formData! }))
      .unwrap()
      .then(() => {
        toast.success("Class updated successfully", { position: "top-center" });
        router.push(`/classes/${classId}/updates`);
      })
      .catch((err) => {
        setSubmitLoading(false);
        if (err.field) {
          setSubmitError({ field: err.field, message: err.message });
          const fieldId = errorFieldMap[err.field ?? ""];
          const el = document.getElementById(fieldId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            if ("focus" in el) (el as HTMLElement).focus();
          }
        } else {
          toast.error("Failed to update class", {
            description: err.message,
            position: "top-center",
          });
        }
      });
  };

  // ── Loading state ──────────────────────────────────────────────────
  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-slate-500 text-sm animate-pulse">
          Loading class details...
        </p>
      </div>
    );
  }

  // ── Fetch error state ──────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-3">
        <p className="text-slate-700 font-semibold">Failed to load class</p>
        <p className="text-slate-500 text-sm">{fetchError}</p>
        <button
          onClick={() => dispatch(fetchSingleClass(classId))}
          className="text-sm text-primary underline underline-offset-2"
        >
          Try again
        </button>
      </div>
    );
  }

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
            <h1 className="text-lg font-bold text-slate-900">Edit Class</h1>
            <p className="text-slate-500 text-xs block">
              {isDirty
                ? `${Object.keys(isDirty).length} unsaved change${Object.keys(isDirty).length > 1 ? "s" : ""}`
                : "Update your class details below."}
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
                coverImage={formData?.coverImage ?? ""}
                onRegenerate={handleRegenerate}
              />
              <ClassForm
                className={formData?.className ?? ""}
                department={formData?.department ?? ""}
                semester={formData?.semester ?? ""}
                selectedColor={selectedColor}
                error={submitError}
                onClassNameChange={(val) => updateField("className", val)}
                onDepartmentChange={(val) => updateField("department", val)}
                onSemesterChange={(val) => updateField("semester", val)}
                onColorChange={(color) => {
                  setSelectedColor(color);
                  updateField("themeColor", color.hex);
                }}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <EnrollmentSettings
                allowEnroll={formData?.allowEnroll ?? false}
                onChange={(val) => updateField("allowEnroll", val)}
              />
              <QuickTips />
              <FormActions
                loading={submitLoading}
                disabled={!isDirty}
                onCancel={() => router.back()}
                submitLabel="Save Changes"
                loadingLabel="Saving..."
              />
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}