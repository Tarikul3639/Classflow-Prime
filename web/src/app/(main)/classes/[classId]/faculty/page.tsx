"use client";

import React, { useEffect } from "react";
import { Plus, GraduationCap } from "lucide-react";
import Link from "next/link";
import { FacultyCard } from "./_components/FacultyCard";
import { useParams, useRouter } from "next/navigation";
import { FacultySkeleton } from "./_components/FacultySkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "sonner";

// Thunks
import {
    fetchClassFaculties,
    deleteClassFaculty,
} from "@/store/features/classes/thunks/class-faculty.thunk";

// Selectors
import {
    selectClassFaculties,
    selectIsFacultyFetched,
} from "@/store/features/classes/selectors/class-faculty.selectors";
import { ClassFaculty } from "@/store/features/classes/class.types";

export default function FacultyPage() {
    const router = useRouter();
    const params = useParams();
    const classId = params.classId as string;

    const dispatch = useAppDispatch();

    // ── Selectors ──────────────────────────────────────────────────────────────
    const faculties = useAppSelector((state) =>
        selectClassFaculties(state, classId),
    );

    const facultyFetch = useAppSelector(
        (state) =>
            state.classes.classFaculty.facultiesByClass[classId]?.fetch ||
            state.classes.fetchSingleClass.classesByClassId[classId]?.fetch,
    );

    const isFetching = facultyFetch?.loading ?? false;
    const fetchingError = facultyFetch?.error ?? null;

    const isFetched = useAppSelector((state) =>
        selectIsFacultyFetched(state, classId),
    );

    const classDetails = useAppSelector(
        (state) =>
            state.classes.fetchSingleClass.classesByClassId[classId]?.classDetails,
    );

    // ── Initialization ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (!classId || isFetched) return;
        dispatch(fetchClassFaculties(classId));
    }, [dispatch, classId, isFetched]);

    // ── Derived State ──────────────────────────────────────────────────────────
    const isAdmin = classDetails?.isInstructor || classDetails?.isAssistant;
    const isEmpty = faculties.length === 0 && !isFetching && !fetchingError;

    // ── Event Handlers ─────────────────────────────────────────────────────────
    const handleDelete = (facultyId: string) => {
        const promise = dispatch(
            deleteClassFaculty({ classId, facultyId }),
        ).unwrap();

        toast.promise(promise, {
            loading: "Deleting faculty...",
            success: "Faculty deleted successfully",
            error: (err) => err || "Failed to delete faculty",
        });
    };

    // ── Save Contact Handlers ─────────────────────────────────────────────────────────
    const handleSaveContact = (faculty: ClassFaculty) => {
        const vCard = [
            "BEGIN:VCARD",
            "VERSION:3.0",
            `FN:${faculty.name}`,
            `TITLE:${faculty.designation}`,
            "ORG:ClassFlow",
            `TEL:${faculty.phone}`,
            `EMAIL:${faculty.email}`,
            `NOTE:Location: ${faculty.location} | Classroom Code: ${faculty.classroomCode}`,
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

    // ── Copy Info Handler ─────────────────────────────────────────────────────────
    const handleInfoCopy = (faculty: ClassFaculty) => {
        const info = `Name: ${faculty.name}\nDesignation: ${faculty.designation}\nLocation: ${faculty.location}\nEmail: ${faculty.email}\nPhone: ${faculty.phone}\nClassroom Code: ${faculty.classroomCode}`;

        navigator.clipboard
            .writeText(info)
            .then(() => {
                toast.success("Faculty information copied to clipboard");
            })
            .catch((err) => {
                console.error("Failed to copy:", err);
                toast.error("Failed to copy faculty information");
            });
    }

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <main className="relative bg-slate-50 p-4 space-y-4 pb-8 mx-auto flex flex-col">
            {/* Add Faculty Card — Admin Only */}
            {isAdmin && !isFetching && (
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

            {/* Skeleton → Empty → List: mutually exclusive */}
            {isFetching && faculties.length === 0 ? (
                <FacultySkeleton count={6} />
            ) : fetchingError ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10">
                    <EmptyState
                        title="Failed to load faculty"
                        description={fetchingError}
                        icon={GraduationCap}
                        size="md"
                    />
                </div>
            ) : isEmpty ? (
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
                    <div className="mt-6 mb-3 px-1">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1">
                            Class Faculty
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {faculties.map((faculty) => (
                            <FacultyCard
                                key={faculty.facultyId}
                                isAdmin={isAdmin}
                                faculty={faculty}
                                onDelete={() => handleDelete(faculty.facultyId)}
                                onEdit={() =>
                                    router.push(
                                        `/classes/${classId}/faculty/${faculty.facultyId}`,
                                    )
                                }
                                onTogglePin={() => {
                                    console.log("Toggle pin:", faculty.facultyId);
                                }}
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
