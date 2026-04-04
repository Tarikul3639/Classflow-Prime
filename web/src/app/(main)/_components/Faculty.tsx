"use client";

import { useState } from "react";
import { ChevronDown, Mail, Phone, Code, Copy, Check } from "lucide-react";
import { DashboardFacultyItem } from "@/store/features/dashboard/dashboard.types";

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function ClassroomCode({ code }: { code: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-50 py-1 rounded w-fit group">
            <Code size={12} className="shrink-0" />
            <span className="font-mono">{code}</span>
            <button
                onClick={handleCopy}
                className="ml-1 p-0.5 md:opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-slate-200"
                title="Copy classroom code"
            >
                {copied ? (
                    <Check size={12} className="text-green-500" />
                ) : (
                    <Copy size={12} />
                )}
            </button>
        </div>
    );
}

function FacultyCard({ faculty }: { faculty: DashboardFacultyItem }) {
    return (
        <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-start gap-3">
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

                <div className="mt-2.5 space-y-1.5">
                    {faculty.email && (
                        <a
                            href={`mailto:${faculty.email}`}
                            className="flex items-center gap-1.5 text-[11px] text-slate-600 hover:text-primary transition-colors truncate"
                        >
                            <Mail size={12} className="shrink-0" />
                            <span className="truncate">{faculty.email}</span>
                        </a>
                    )}
                    {faculty.phone && (
                        <a
                            href={`tel:${faculty.phone}`}
                            className="flex items-center gap-1.5 text-[11px] text-slate-600 hover:text-primary transition-colors"
                        >
                            <Phone size={12} className="shrink-0" />
                            <span>{faculty.phone}</span>
                        </a>
                    )}
                    {faculty.classroomCode && (
                        <ClassroomCode code={faculty.classroomCode} />
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
    const [isExpanded, setIsExpanded] = useState(false);

    if (facultyList.length === 0) return null;

    const visibleFaculty = isExpanded ? facultyList : facultyList.slice(0, 3);
    const hasMore = facultyList.length > 3;

    return (
        <section className="min-w-0 w-full">
            <div className="px-6 mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Faculty</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 px-6 pb-6">
                {visibleFaculty.map((f) => (
                    <FacultyCard key={f._id} faculty={f} />
                ))}
            </div>

            {hasMore && (
                <div className="px-6 pb-6 flex justify-center">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
                    >
                        {isExpanded ? "Show less" : "Show more"} faculty
                        <ChevronDown
                            size={16}
                            className={`transition-transform ${isExpanded ? "rotate-180" : ""
                                }`}
                        />
                    </button>
                </div>
            )}
        </section>
    );
}