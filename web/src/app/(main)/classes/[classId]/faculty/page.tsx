"use client";

import React, { useEffect } from "react";
import { Plus, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { FacultyCard } from "./_components/FacultyCard";
import { FacultySkeleton } from "./_components/FacultySkeleton";
import { EmptyState } from "@/components/ui/EmptyState";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchClassFaculties,
  deleteClassFaculty,
} from "@/store/features/classes/thunks/class-faculty.thunk";
import type { ClassFaculty } from "@/store/features/classes/class.types";

export default function FacultyPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.classId as string;
  const dispatch = useAppDispatch();

  // ── Faculty State ──────────────────────────────────────────
  const facultyBucket = useAppSelector(
    (state) => state.classes.classFaculty.facultiesByClass[classId]
  );

  const faculties = facultyBucket?.faculties ?? [];
  const isFetching = facultyBucket?.fetch.loading ?? false;
  const isFetched = facultyBucket?.fetch.isFetched ?? false;
  const fetchingError = facultyBucket?.fetch.error ?? null;

  // ── Class State ────────────────────────────────────────────
  const classDetails = useAppSelector(
    (state) => state.classes.fetchSingleClass.classesByClassId[classId]?.classDetails
  );

  // ── Fetch Faculties ────────────────────────────────────────
  useEffect(() => {
    if (classId) dispatch(fetchClassFaculties(classId));
  }, [dispatch, classId]);

  // ── Derived State ──────────────────────────────────────────
  const isAdmin = !!(classDetails?.isInstructor || classDetails?.isAssistant);
  const isEmpty = isFetched && faculties.length === 0 && !isFetching && !fetchingError;

  // ── Handlers ───────────────────────────────────────────────
  const handleDelete = (facultyId: string) => {
    const promise = dispatch(deleteClassFaculty({ classId, facultyId })).unwrap();
    toast.promise(promise, {
      loading: "Deleting faculty...",
      success: "Faculty deleted successfully",
      error: (err) => err || "Failed to delete faculty",
    });
  };

  const handleSaveContact = (faculty: ClassFaculty) => {
    const vCard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${faculty.name}`,
      `TITLE:${faculty.designation}`,
      "ORG:ClassFlow",
      `TEL:${faculty.phone}`,
      `EMAIL:${faculty.email}`,
      `NOTE:Location: ${faculty.location}\nClassroom Code: ${faculty.classroomCode}\nInvite Link: ${faculty.classroomInviteLink ?? ''}`,
      `PHOTO:${faculty.avatarUrl}`,
      "END:VCARD",
    ].join("\n");

    const blob = new Blob([vCard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${faculty.name}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleInfoCopy = async (faculty: ClassFaculty) => {
    try {
      const info = `Name: ${faculty.name}\nDesignation: ${faculty.designation}\nLocation: ${faculty.location}\nEmail: ${faculty.email}\nPhone: ${faculty.phone}\nClassroom Code: ${faculty.classroomCode}\nInvite Link: ${faculty.classroomInviteLink ?? ''}`;
      await navigator.clipboard.writeText(info);
      toast.success("Faculty information copied to clipboard");
    } catch {
      toast.error("Failed to copy faculty information");
    }
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <main className="relative bg-slate-50 p-4 space-y-4 pb-8 mx-auto flex flex-col">
      {isAdmin && !isFetching && (
        <div className="shrink-0 border-2 border-dashed border-slate-300 rounded-2xl bg-transparent p-6 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <Plus className="text-primary" size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-base">Add Faculty Information</h4>
            <p className="text-sm text-slate-600 mt-1">Help complete the faculty directory for this class</p>
          </div>
          <Link
            href={`/classes/${classId}/faculty/create`}
            className="mt-2 px-4 py-2.5 rounded-lg border border-primary/30 bg-white/50 text-primary font-bold text-[11px] md:text-[12px] lg:text-[13px] hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            Add Faculty
          </Link>
        </div>
      )}

      {isFetching ? (
        <FacultySkeleton count={6} />
      ) : fetchingError ? (
        <div className="flex-1 flex items-center justify-center py-10">
          <EmptyState title="Failed to load faculty" description={fetchingError} icon={GraduationCap} size="md" />
        </div>
      ) : isEmpty ? (
        <div className="flex-1 flex items-center justify-center py-10">
          <EmptyState
            title="No Faculty Assigned"
            description="There are currently no faculty members assigned to this class."
            icon={GraduationCap}
            size="md"
          />
        </div>
      ) : (
        <div className="flex-1">
          <div className="mt-6 mb-3 px-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1">Class Faculty</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {faculties.map((faculty) => (
              <FacultyCard
                key={faculty.facultyId}
                faculty={faculty}
                isAdmin={isAdmin}
                onDelete={() => handleDelete(faculty.facultyId)}
                onEdit={() => router.push(`/classes/${classId}/faculty/${faculty.facultyId}`)}
                onTogglePin={() => {}}
                onSaveContact={() => handleSaveContact(faculty)}
                onCopy={() => handleInfoCopy(faculty)}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}