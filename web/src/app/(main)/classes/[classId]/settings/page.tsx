"use client";

import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ClassInfoCard from "./_components/ClassInfoCard";
import NotificationSettings from "./_components/NotificationSettings";
import DangerZone from "./_components/DangerZone";
import { ClassSettingsSkeleton } from "./_components/ClassSettingsSkeleton";
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
    const { classId } = useParams() as { classId: string };
    const dispatch = useAppDispatch();

    // ── Selectors ──────────────────────────────────────────────────────────

    const classEntry = useAppSelector(
        (state) => state.classes.fetchSingleClass.classesByClassId[classId],
    );
    const classDetails = classEntry?.classDetails;
    const classFetching = classEntry?.fetch.loading ?? false;

    // ── New classId-wise selector ──────────────────────────────────────────

    const settingsBucket = useAppSelector(
        (state) => state.classes.classSettings.actionsByClass[classId],
    );

    const classCode = settingsBucket?.classCode ?? null;
    const isJoiningAllowed = settingsBucket?.isJoiningAllowed ?? true;
    const settingsFetching = settingsBucket?.fetchClassSettings.loading ?? false;

    const isLoading = classFetching || settingsFetching;

    // ── Initialization ─────────────────────────────────────────────────────

    useEffect(() => {
        if (classId) {
            dispatch(fetchClassSettings(classId));
        }
    }, [classId, dispatch]);

    // ── Handlers ───────────────────────────────────────────────────────────

    const handleLeaveClass = async () => {
        const promise = dispatch(leaveClass(classId)).unwrap();

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
        }
    };

    const handleDeleteClass = async () => {
        const promise = dispatch(deleteClass(classId)).unwrap();

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
        }
    };

    const handleMarkAsEnded = async () => {
        const promise = dispatch(markClassAsEnded(classId)).unwrap();

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
        }
    };

    const handleGenerateClassCode = async () => {
        const promise = dispatch(regenerateClassCode(classId)).unwrap();

        toast.promise(promise, {
            loading: "Fetching class code...",
            success: "Class code fetched successfully.",
            error: "Failed to fetch class code. Please try again.",
        });

        try {
            await promise;
        } catch (error) {
            console.error("Error fetching class code:", error);
        }
    };

    const onToggleJoining = async () => {
        const promise = dispatch(toggleJoiningAllowed(classId)).unwrap();

        toast.promise(promise, {
            loading: "Toggling joining allowed status...",
            success: "Joining allowed status toggled successfully.",
            error: "Failed to toggle joining allowed status. Please try again.",
        });

        try {
            await promise;
        } catch (error) {
            console.error("Error toggling joining allowed status:", error);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="relative h-full bg-slate-50">
            {isLoading || !classDetails ? (
                <ClassSettingsSkeleton />
            ) : (
                <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                    <ClassInfoCard
                        className={classDetails.className}
                        classCode={classCode}
                        instructor={classDetails.instructor}
                        isInstructor={classDetails.isInstructor}
                        totalStudents={classDetails.members}
                        semester={classDetails.semester}
                        handleGenerateClassCode={handleGenerateClassCode}
                    />
                    <NotificationSettings />
                    <DangerZone
                        className={classDetails.className}
                        isInstructor={classDetails.isInstructor}
                        isJoiningAllowed={isJoiningAllowed}
                        isClassEnded={classDetails.status === "ended"}
                        onLeaveClass={handleLeaveClass}
                        onDeleteClass={handleDeleteClass}
                        onMarkAsEnded={handleMarkAsEnded}
                        onToggleJoining={onToggleJoining}
                    />
                </div>
            )}
        </div>
    );
}