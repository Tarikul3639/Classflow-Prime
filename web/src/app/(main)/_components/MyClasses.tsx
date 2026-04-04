"use client";

import { Users, Hash, ChevronRight } from "lucide-react";
import type { DashboardClassItem } from "@/store/features/dashboard/dashboard.types";
import Link from "next/link";

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function ClassCard({ cls }: { cls: DashboardClassItem }) {
    return (
        <div className="relative rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            {/* Theme color bar */}
            <div className="h-2 w-full" style={{ backgroundColor: cls.themeColor }} />

            <div className="p-4">
                {/* Name + archived badge */}
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {cls.name}
                    </h4>
                    {cls.status === "ended" && (
                        <span className="shrink-0 text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">
                            Archived
                        </span>
                    )}
                </div>

                <p className="text-xs text-slate-500 mb-3">
                    {cls.department} • {cls.semester}
                </p>

                {/* Instructor + student count */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <div
                            className="size-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                            style={{ backgroundColor: cls.themeColor }}
                        >
                            {getInitials(cls.instructorName)}
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                            {cls.instructorName.split(" ").slice(-1)[0]}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                        <Users size={11} />
                        <span className="text-[11px]">{cls.studentCount}</span>
                    </div>
                </div>

                {/* Enroll code + enrolling badge */}
                <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-slate-50 rounded-lg px-2 py-1">
                        <Hash size={11} className="text-slate-400" />
                        <span className="text-[11px] font-mono font-bold text-slate-500 tracking-widest">
                            {cls.enrollCode}
                        </span>
                    </div>
                    {cls.allowEnroll && (
                        <span className="text-[11px] text-emerald-600 font-semibold">
                            Enrolling
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

interface MyClassesProps {
    classes: DashboardClassItem[];
}

export default function MyClasses({ classes }: MyClassesProps) {
    return (
        <section>
            <div className="px-6 mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">My Classes</h3>
                <Link
                    href="#"
                    className="flex items-center gap-1 text-sm font-medium text-primary"
                >
                    Browse all <ChevronRight size={15} />
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 px-6 pb-6">
                {classes.map((cls) => (
                    <ClassCard key={cls._id} cls={cls} />
                ))}
            </div>
        </section>
    );
}
