"use client";

import { Users, BookOpen, ChevronRight } from "lucide-react";
import type { DashboardClassItem } from "@/store/features/dashboard/dashboard.types";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";
import { useRouter } from "next/navigation";

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function ClassCard({ cls }: { cls: DashboardClassItem }) {
    const isEnded = cls.status === "ended";

    return (
        <div
            className={`relative rounded-2xl overflow-hidden bg-white border border-slate-100 cursor-pointer transition-all hover:border-slate-200 hover:shadow-sm ${isEnded ? "opacity-70" : ""
                }`}

            style={
                !isEnded
                    ? { borderColor: `${cls.themeColor}20` }
                    : undefined
            }
        >
            {/* Left accent bar */}
            <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                style={{ backgroundColor: isEnded ? "#94a3b8" : cls.themeColor }}
            />

            {/* Content */}
            <div className="pl-5 pr-4 pt-4 pb-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {cls.name}
                    </h4>
                    {isEnded ? (
                        <span className="shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                            Achieved
                        </span>
                    ) : cls.allowEnroll ? (
                        <span className="shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                            Active
                        </span>
                    ) : null}
                </div>

                <p className="text-xs text-slate-500">
                    {cls.department} · {cls.semester}
                </p>
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <div
                        className="size-5 rounded-full flex items-center justify-center text-[9px] font-semibold text-white shrink-0"
                        style={{ backgroundColor: isEnded ? "#94a3b8" : cls.themeColor }}
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
        </div>
    );
}

interface MyClassesProps {
    classes: DashboardClassItem[];
}

export default function MyClasses({ classes }: MyClassesProps) {
    const router = useRouter();
    const isEmpty = classes.length === 0;
    // const uniqueClassCount = new Set(classes.map((c) => c._id)).size;
    return (
        <section>
            <div className="px-6 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="text-md font-bold text-slate-900">My Classes</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
                        {classes.length}
                    </span>
                </div>

                <Link
                    href="/classes"
                    className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100/50 hover:bg-blue-200/70 transition-all duration-200"
                >
                    <span className="text-[12px] font-semibold text-blue-500 group-hover:text-blue-700 transition-colors">
                        View all
                    </span>
                    <ChevronRight
                        size={12}
                        className="text-blue-400 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all"
                    />
                </Link>
            </div>
            {isEmpty ? (
                <EmptyState
                    icon={BookOpen}
                    size="sm"
                    title="No classes yet"
                    description="Once you enroll in or create a class, it will show up here."
                    actionLabel="Create a class"
                    onAction={() => {
                        router.push("/classes/create");
                    }}
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 px-6 pb-6">
                    {classes.map((cls) => (
                        <ClassCard key={cls._id} cls={cls} />
                    ))}
                </div>
            )}
        </section>
    );
}
