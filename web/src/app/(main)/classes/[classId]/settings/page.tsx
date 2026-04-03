"use client";

import React, { use, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ClassInfoCard from "./_components/ClassInfoCard";
import NotificationSettings from "./_components/NotificationSettings";
import DangerZone from "./_components/DangerZone";
import { toast } from "sonner";

import {
  leaveClass,
  deleteClass,
  regenerateClassCode,
  fetchClassSettings,
  markClassAsEnded,
  toggleJoiningAllowed,
} from "@/store/features/classes/thunks/settings/class-setting.thunk";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function ClassSettingsPage() {
  const router = useRouter();
  const { classId } = useParams();
  const dispatch = useAppDispatch();

  const { classDetails, isLoading } = useAppSelector(
    (state) => state.classes.fetchSingleClass,
  );

  const { classCode, isJoiningAllowed } = useAppSelector(
    (state) => state.classes.classSettings,
  );

  // Fetch class code on mount
  useEffect(() => {
    if (classId) {
      dispatch(fetchClassSettings({ classId: classId as string }));
    }
  }, [classId]);

  const handleLeaveClass = async () => {
    const promise = dispatch(
      leaveClass({ classId: classId as string }),
    ).unwrap();

    toast.promise(promise, {
      loading: "Leaving class...",
      success: "You have left the class.",
      error: "Failed to leave the class. Please try again.",
    });

    try {
      await promise;
      router.push("/classes");
    } catch (error) {
      console.error("Error leaving class:", error);
      return;
    }
  };

  const handleDeleteClass = async () => {
    const promise = dispatch(
      deleteClass({ classId: classId as string }),
    ).unwrap();

    toast.promise(promise, {
      loading: "Deleting class...",
      success: "Class has been deleted.",
      error: "Failed to delete the class. Please try again.",
    });

    try {
      await promise;
      router.push("/classes");
    } catch (error) {
      console.error("Error deleting class:", error);
      return;
    }
  };

  const handleMarkAsEnded = async () => {
    const promise = dispatch(
      markClassAsEnded({ classId: classId as string }),
    ).unwrap();

    toast.promise(promise, {
      loading: "Marking class as ended...",
      success: "Class has been marked as ended.",
      error: "Failed to mark the class as ended. Please try again.",
    });

    try {
      await promise;
      router.back();
    } catch (error) {
      console.error("Error marking class as ended:", error);
      return;
    }
  };

  const handleGenerateClassCode = async () => {
    const promise = dispatch(
      regenerateClassCode({ classId: classId as string }),
    ).unwrap();

    toast.promise(promise, {
      loading: "Fetching class code...",
      success: "Class code fetched successfully.",
      error: "Failed to fetch class code. Please try again.",
    });

    try {
      await promise;
    } catch (error) {
      console.error("Error fetching class code:", error);
      return;
    }
  };

  const onToggleJoining = async () => {
    const promise = dispatch(
      toggleJoiningAllowed({ classId: classId as string }),
    ).unwrap();

    toast.promise(promise, {
      loading: "Toggling joining allowed status...",
      success: "Joining allowed status toggled successfully.",
      error: "Failed to toggle joining allowed status. Please try again.",
    });

    try {
      await promise;
    } catch (error) {
      console.error("Error toggling joining allowed status:", error);
      return;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-3 lg:px-6 py-6">
      <div className="mx-auto grid gap-6">
        <ClassInfoCard
          className={classDetails.name}
          classCode={classCode}
          instructor={classDetails.instructor}
          isInstructor={classDetails.isInstructor}
          totalStudents={classDetails.members}
          semester={classDetails.semester}
          handleGenerateClassCode={handleGenerateClassCode}
        />
        <NotificationSettings />

        <DangerZone
          className={classDetails.name}
          isInstructor={classDetails.isInstructor}
          isJoiningAllowed={isJoiningAllowed}
          isClassEnded={classDetails.status === "ended"}
          onLeaveClass={handleLeaveClass}
          onDeleteClass={handleDeleteClass}
          onMarkAsEnded={handleMarkAsEnded}
          onToggleJoining={onToggleJoining}
        />
      </div>
    </div>
  );
}
