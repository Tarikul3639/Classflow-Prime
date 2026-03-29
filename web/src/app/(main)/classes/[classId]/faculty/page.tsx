"use client";

import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { FacultyCard } from "./_components/FacultyCard";
import { useParams } from "next/navigation";

import {
  fetchClassFaculties,
  ClassFaculty,
} from "@/store/features/classes/thunks/class-faculty.thunk";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function FacultyPage() {
  const params = useParams();
  const classId = params.classId as string;

  const dispatch = useAppDispatch();
  const faculties: ClassFaculty[] = useAppSelector(
    (state) => state.classes.classFaculty.faculties,
  );

  useEffect(() => {
    dispatch(fetchClassFaculties({ classId }));
  }, [classId]);

  return (
    <main className="bg-slate-50 p-4 space-y-4 pb-8 mx-auto">
      {/* Add New Faculty - Dashed Border */}
      <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-transparent p-6 flex flex-col items-center text-center gap-3">
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
          className="mt-2 px-4 py-2.5 rounded-lg border border-primary/30 bg-white/50 text-primary font-bold text-[11px] md:text-[12px] lg:text-[13px] hover:bg-blue-50 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span>Suggest Faculty</span>
        </Link>
      </div>

      {/* Section Title */}
      <div className="mt-6 mb-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1">
          Class Instructors
        </h3>
      </div>

      {/* Faculty Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {faculties.map((faculty) => (
          <FacultyCard key={faculty.facultyId} faculty={faculty} />
        ))}
      </div>
    </main>
  );
}
