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
import { useFileUpload } from "@/hooks/useCloudinary";

import type { ClassFaculty } from "@/store/features/classes/class.types";
import { createClassFaculty } from "@/store/features/classes/thunks/class-faculty.thunk";
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
    classroomInviteLink: "",
  });

  // ── Selectors ──────────────────────────────────────────────────────────────
  const { loading: isCreating, error: createError } = useAppSelector(
    (state) =>
      state.classes.classFaculty.facultiesByClass[classId]?.create || {},
  );

  const { upload, loading: uploadLoading } = useFileUpload();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const promise = upload(file, "avatars");

    toast.promise(promise, {
      loading: "Uploading image...",
      success: "Image uploaded",
      error: "Failed to upload image",
    });

    try {
      const res = await promise;

      setFormData((prev) => ({
        ...prev,
        avatarUrl: res.secure_url, // 🔥 real URL from Cloudinary
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const removeAvatar = () => {
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

  const handleSubmit = async () => {
    dispatch(
      createClassFaculty({
        classId,
        facultyData: formData,
      }),
    )
      .unwrap()
      .then((_) => {
        router.push(`/classes/${classId}/faculty`);
        toast.success("Faculty created successfully");
      })
      .catch((err) => {
        toast.error("Failed to create faculty", {
          description: err || "An unexpected error occurred",
        });
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 cursor-default">
      {/* Header */}
      <EditorHeader
        classId={classId}
        isNew={true}
        isLoading={isCreating}
        onSubmit={handleSubmit}
      />

      {/* Form Content */}
      <main className="p-4 pb-24">
        <form className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2 p-6 flex items-center justify-center">
            <PhotoUpload
              imagePreview={formData.avatarUrl || null}
              onImageUpload={handleAvatarUpload}
              onRemoveImage={removeAvatar}
              isUploading={uploadLoading}
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
