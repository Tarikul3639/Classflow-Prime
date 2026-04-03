"use client";

import React, { useEffect } from "react";
import { Plus, GraduationCap } from "lucide-react";
import Link from "next/link";
import { FacultyCard } from "./_components/FacultyCard";
import { useParams, useRouter } from "next/navigation";
import { TopLoader } from "@/components/ui/TopLoader";
import { EmptyState } from "@/components/ui/EmptyState";

import {
  fetchClassFaculties,
  ClassFaculty,
  deleteClassFaculty,
} from "@/store/features/classes/thunks/class-faculty.thunk";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "sonner";

export default function FacultyPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.classId as string;

  const dispatch = useAppDispatch();

  const faculties: ClassFaculty[] = useAppSelector(
    (state) => state.classes.classFaculty.faculties,
  );

  const isLoading = useAppSelector(
    (state) => state.classes.classFaculty.loading.fetch,
  );

  const { classDetails } = useAppSelector(
    (state) => state.classes.fetchSingleClass,
  );

  const isAdmin = classDetails?.isInstructor || classDetails?.isAssistant;

  useEffect(() => {
    dispatch(fetchClassFaculties({ classId }));
  }, [classId, dispatch]);

  const onDelete = async (facultyId: string) => {
    const promise = dispatch(
      deleteClassFaculty({ classId, facultyId }),
    ).unwrap();

    toast.promise(promise, {
      loading: "Deleting faculty...",
      success: "Faculty deleted successfully",
      error: "Failed to delete faculty",
    });

    try {
      await promise;
    } catch (e) {
      console.error(e);
    }
  };

  const isEmpty = faculties.length === 0;

  return (
    <main className="relative bg-slate-50 p-4 space-y-4 pb-8 mx-auto flex flex-col">
      <TopLoader isLoading={isLoading} />

      {/* Add Faculty Card - shrink-0 ensures it keeps its size */}
      {isAdmin && (
        <div className="shrink-0 border-2 border-dashed border-slate-300 rounded-2xl bg-transparent p-6 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <Plus className="text-primary" size={24} />
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-base">
              Add Faculty Information
            </h4>
            <p className="text-sm text-slate-600 mt-1">
              Help complete the faculty directory for this class
            </p>
          </div>

          <Link
            href={`/classes/${classId}/faculty/create`}
            className="mt-2 px-4 py-2.5 rounded-lg border border-primary/30 bg-white/50 text-primary font-bold text-[11px] md:text-[12px] lg:text-[13px] hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <span>Add Faculty</span>
          </Link>
        </div>
      )}

      {/* Content Section */}
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10">
          <EmptyState
            title="No Faculty Assigned"
            description="There are currently no faculty members assigned to this class."
            icon={GraduationCap}
            size="md"
          />
        </div>
      ) : (
        <div className="flex-1">
          {/* Section Title */}
          <div className="mt-6 mb-3 px-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1">
              Class Faculty
            </h3>
          </div>

          {/* Faculty Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {faculties.map((faculty) => (
              <FacultyCard
                key={faculty.facultyId}
                faculty={faculty}
                onDelete={() => onDelete(faculty.facultyId)}
                onEdit={() =>
                  router.push(
                    `/classes/${classId}/faculty/${faculty.facultyId}`,
                  )
                }
                onTogglePin={() => {
                  console.log("Toggle pin:", faculty.facultyId);
                }}
                showActions={isAdmin}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
