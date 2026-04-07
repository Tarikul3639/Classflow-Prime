"use client";

import React from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ScheduleSection } from "./ScheduleSection";
import { DescriptionEditor } from "./DescriptionEditor";
import { MaterialsSection } from "./MaterialsSection";
import {
  UPDATE_TYPE_CONFIG,
  CreateUpdateFormData,
  UpdateCategory,
} from "@/types/update.types";
import type { ApiError } from "@/lib/errors/api-error.mapper";
import { UpdateErrorField } from "@/store/features/classes/class.types";

interface UpdateFormProps {
  form: CreateUpdateFormData;
  error: ApiError | null;
  setForm: React.Dispatch<React.SetStateAction<CreateUpdateFormData>>;
}

export function UpdateForm({ form, setForm, error }: UpdateFormProps) {
  return (
    <div
      id="update-form"
      className="bg-white rounded-2xl p-4 md:p-8 border border-slate-200 shadow-xs"
    >
      <div className="space-y-6">
        {/* Title */}
        <Input
          label="Update Title"
          placeholder="e.g., Midterm Exam Schedule Revision"
          description="Keep it concise and informative to grab students' attention."
          value={form.title}
          error={
            error?.field === UpdateErrorField.title ? error.message ?? undefined : undefined
          }
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
        />

        {/* Type Select */}
        <Select
          label="Update Type"
          value={form.category}
          description="Choose the type of update you're creating."
          error={
            error?.field === UpdateErrorField.type ? error.message ?? undefined : undefined
          }
          options={Object.entries(UPDATE_TYPE_CONFIG).map(([value, config]) => ({
            value,
            label: config.label,
          }))}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              category: e.target.value as UpdateCategory,
            }))
          }
        />

        {/* Schedule Section */}
        <ScheduleSection form={form} setForm={setForm} />

        {/* Description Editor */}
        <DescriptionEditor form={form} setForm={setForm} />

        {/* Materials Section */}
        <MaterialsSection form={form} setForm={setForm} />
      </div>
    </div>
  );
}