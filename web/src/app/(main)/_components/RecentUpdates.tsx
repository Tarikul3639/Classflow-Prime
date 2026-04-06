"use client";

import {
    Pin,
    Calendar,
    Layers,
    Megaphone,
} from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";

import { DashboardUpdateItem } from "@/store/features/dashboard/dashboard.types";
import { UPDATE_TYPE_CONFIG, UpdateCategory } from "@/types/update.types";
import { formatRelativeDate } from "@/utils/date.utils";
import { RichTextContent } from "@/components/ui/RichTextContent";

function UpdateCard({ update }: { update: DashboardUpdateItem }) {
    const cfg =
        UPDATE_TYPE_CONFIG[update.category.toLowerCase() as UpdateCategory];
    const CatIcon = cfg.icon;

    return (
        <Link href={`classes/${update.classId}/updates`} className="p-4 bg-white rounded-2xl border border-slate-100 flex items-start gap-3 hover:border-slate-200 transition-colors">
            {/* Category icon */}
            <div
                className={`size-9 rounded-xl ${cfg.iconBg} flex items-center justify-center shrink-0`}
            >
                <CatIcon className={cfg.iconColor} size={17} />
            </div>

            <div className="flex-1 min-w-0">
                {/* Badges row */}
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    {update.isPinned && (
                        <Pin size={11} className="text-amber-500 shrink-0" />
                    )}
                    <span
                        className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${cfg.iconBg} ${cfg.iconColor}`}
                    >
                        {cfg.label}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium truncate">
                        {update.className}
                    </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-snug mb-0.5">
                    {update.title}
                </h4>

                {update.description && (
                    <div className="py-1 line-clamp-2">
                        <RichTextContent html={update.description} className="px-2" />
                    </div>
                )}

                {/* Footer meta */}
                <div className="flex items-center gap-3 mt-2">
                    {update.eventAt && (
                        <div className="flex items-center gap-1 text-slate-500 capitalize">
                            <Calendar size={11} />
                            <span className="text-[11px] font-medium">
                                {formatRelativeDate(update.eventAt, { showYear: false })}
                            </span>
                        </div>
                    )}
                    {update.materials.length > 0 && (
                        <div className="flex items-center gap-1 text-slate-400">
                            <Layers size={11} />
                            <span className="text-[11px]">
                                {update.materials.length} file
                                {update.materials.length > 1 ? "s" : ""}
                            </span>
                        </div>
                    )}
                    <span className="ml-auto text-[11px] text-slate-400 font-medium">
                        {formatRelativeDate(update.createdAt, { showYear: false })}
                    </span>
                </div>
            </div>
        </Link>
    );
}

interface RecentUpdatesProps {
    updates: DashboardUpdateItem[];
}

export default function RecentUpdates({ updates }: RecentUpdatesProps) {
    const uniqueClassCount = new Set(updates.map((f) => f.classId)).size;
    const isEmpty = updates.length === 0;

    // Don't render the section at all if there are no updates and no classes (to avoid showing an empty "Recent Updates" section when the user has no classes at all)
    if (uniqueClassCount === 0) {
        return null;
    }
    return (
        <section>
            <div className="px-6 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="text-md font-bold text-slate-900">Recent Updates</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-600">
                        {updates.length}
                    </span>
                </div>
                {/* How may class */}
                {isEmpty ? null : (
                    <span className="text-xs text-slate-400">
                        Across {uniqueClassCount}{" "}
                        {uniqueClassCount === 1 ? "class" : "classes"}
                    </span>
                )}
            </div>

            {isEmpty ? (
                <EmptyState
                    icon={Megaphone}
                    title="No recent updates"
                    description="When your instructors post updates, they'll show up here."
                />
            ) : (
                <div className="flex flex-col gap-3 px-6 pb-6">
                    {updates.map((update) => (
                        <UpdateCard key={update._id} update={update} />
                    ))}
                </div>
            )}
        </section>
    );
}
