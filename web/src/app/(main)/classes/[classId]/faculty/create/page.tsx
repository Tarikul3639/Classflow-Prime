"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { EditorHeader } from "./_components/EditorHeader";
import PhotoUpload from "./_components/PhotoUpload";
import BasicInfoSection from "./_components/BasicInfoSection";
import ContactInfoSection from "./_components/ContactInfoSection";
import FormNote from "./_components/FormNote";
import FacultyPreview from "./_components/FacultyPreview";
import { toast } from "sonner";

import {
  createClassFaculty,
  ClassFaculty,
} from "@/store/features/classes/thunks/class-faculty.thunk";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function AddFacultyPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams();
  const classId = params.classId as string;

  const [formData, setFormData] = useState<Omit<ClassFaculty, "facultyId">>({
    name: "",
    designation: "",
    avatarUrl: "",
    location: "",
    email: "",
    phone: "",
    classroomCode: "",
  });

  const loading = useAppSelector(
    (state) => state.classes.classFaculty.loading.create,
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          avatarUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      avatarUrl: "",
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    dispatch(
      createClassFaculty({
        classId,
        facultyData: formData,
      }),
    )
      .then((res) => {
        if (createClassFaculty.fulfilled.match(res)) {
          router.push(`/classes/${classId}/faculty`);
        }
      })
      .catch((err) => {
        toast.error("Failed to create faculty", {
          description: err || "An unexpected error occurred",
        });
      });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <EditorHeader
        classId={classId}
        isNew={true}
        isLoading={loading}
        onSubmit={handleSubmit}
      />

      {/* Form Content */}
      <main className="p-4 pb-24">
        <form className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2 p-6 flex items-center justify-center">
            <PhotoUpload
              imagePreview={formData.avatarUrl || null}
              onImageUpload={handleImageUpload}
              onRemoveImage={removeImage}
            />
          </div>

          <BasicInfoSection
            formData={formData}
            onInputChange={handleInputChange}
          />

          <ContactInfoSection
            formData={formData}
            onInputChange={handleInputChange}
          />

          <FacultyPreview
            formData={formData}
            imagePreview={formData.avatarUrl || null}
          />

          <FormNote />
        </form>
      </main>
    </div>
  );
}
