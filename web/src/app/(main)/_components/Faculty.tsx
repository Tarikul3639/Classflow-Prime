"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { DashboardFacultyItem } from "@/store/features/dashboard/dashboard.types";

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function FacultyCard({ faculty }: { faculty: DashboardFacultyItem }) {
    return (
        <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-start gap-3">
            {/* Avatar / initials */}
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                {faculty.avatarUrl ? (
                    <img
                        src={faculty.avatarUrl}
                        alt={faculty.name}
                        className="size-10 rounded-xl object-cover"
                    />
                ) : (
                    getInitials(faculty.name)
                )}
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 truncate">
                    {faculty.name}
                </h4>
                <p className="text-xs text-slate-500">{faculty.designation}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{faculty.location}</p>

                <div className="flex items-center gap-2 mt-2">
                    <a
                        href={`mailto:${faculty.email}`}
                        className="text-[11px] font-medium text-primary truncate"
                    >
                        {faculty.email}
                    </a>
                    {faculty.classroomCode && (
                        <span className="shrink-0 text-[11px] bg-slate-50 text-slate-500 font-mono px-1.5 py-0.5 rounded">
                            GC: {faculty.classroomCode}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

interface FacultyProps {
    facultyList: DashboardFacultyItem[];
}

export default function Faculty({ facultyList }: FacultyProps) {
    return (
        <section>
            <div className="px-6 mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Faculty</h3>
                <Link
                    href="#"
                    className="flex items-center gap-1 text-sm font-medium text-primary"
                >
                    Directory <ChevronRight size={15} />
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 px-6 pb-6">
                {facultyList.map((f) => (
                    <FacultyCard key={f._id} faculty={f} />
                ))}
            </div>
        </section>
    );
}
