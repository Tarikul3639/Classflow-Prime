"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { EditorHeader } from "./_components/EditorHeader";
import GroupBasicInfo from "./_components/GroupBasicInfo";
import GroupLinkInput from "./_components/GroupLinkInput";
import GroupPreview from "./_components/GroupPreview";
import { toast } from "sonner";
import {
  ClassGroup,
  GroupPlatform,
  GROUP_PLATFORM_CONFIG,
} from "@/types/group.types";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createClassGroup } from "@/store/features/classes/thunks/groups/class-group.thunk";

export default function AddGroupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { classId } = useParams();

  const isCreating = useAppSelector((state) => state.classes.classGroups.loading.createGroup);

  const [formData, setFormData] = useState<
    Omit<ClassGroup, "groupId" | "createdAt" | "updatedAt">
  >({
    name: "",
    description: "",
    link: "",
    platform: GroupPlatform.WHATSAPP, // default
    createdBy: "",

    uiConfig: {
      platformColor: "text-emerald-600",
      platformBg: "bg-emerald-50",
      iconName: "MessageCircle",
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlatformChange = (platform: GroupPlatform) => {
    const config = GROUP_PLATFORM_CONFIG[platform];

    setFormData((prev) => ({
      ...prev,
      platform,
      uiConfig: config.uiConfig,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formEl = e.currentTarget as HTMLFormElement;

    if (!formEl.checkValidity()) {
      formEl.reportValidity(); // browser validation UI
      return;
    }

    if (!classId) return;

    const promise = dispatch(
      createClassGroup({
        classId: classId as string,
        groupData: formData,
      }),
    ).unwrap();

    toast.promise(promise, {
      loading: "Creating group...",
      success: "Group created successfully!",
      error: "Failed to create group. Please try again.",
    });

    try {
      await promise;
    } catch (error) {
      return;
    }

    router.back();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <EditorHeader
        classId={classId as string}
        isNew={true}
        isLoading={isCreating}
      />

      {/* Form Content */}
      <main className="p-4 pb-24">
        <form
          id="groupForm"
          onSubmit={handleSubmit}
          className="space-y-6 md:space-x-6 grid md:grid-cols-2"
        >
          <GroupBasicInfo
            formData={formData}
            onInputChange={handleInputChange}
          />

          <GroupLinkInput
            formData={formData}
            onInputChange={handleInputChange}
            onPlatformChange={handlePlatformChange}
          />

          <GroupPreview formData={formData} />

          <div className="col-start-1 col-end-1 md:pr-4 pl-0">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-900">Note:</span> All
                group links will be reviewed before being added. Please ensure
                the link is valid and appropriate for class communication.
              </p>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
