"use client";

import {
    Pin,
    Calendar,
    Layers,
    Megaphone,
    AlertCircle,
    CheckCircle2,
    BookMarked,
    FileText,
    ChevronRight,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import {
    DashboardUpdateItem
} from "@/store/features/dashboard/dashboard.types";
import { MATERIAL_TYPE_CONFIG } from "@/types/update.types";



function timeAgo(date: Date) {
    const diff = Date.now() - date.getTime();
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (hrs < 1) return "Just now";
    if (hrs < 24) return `${hrs}h ago`;
    return `${days}d ago`;
}

function formatEventDate(date: Date) {
    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function UpdateCard({ update }: { update: DashboardUpdateItem }) {
    const cfg = MATERIAL_TYPE_CONFIG[update.category.toLowerCase() as keyof typeof MATERIAL_TYPE_CONFIG];
    const CatIcon = cfg.icon;

    return (
        <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-start gap-3 hover:border-slate-200 transition-colors">
            {/* Category icon */}
            <div
                className={`size-9 rounded-xl ${cfg.bgColor} flex items-center justify-center shrink-0`}
            >
                <CatIcon className={cfg.color} size={17} />
            </div>

            <div className="flex-1 min-w-0">
                {/* Badges row */}
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    {update.isPinned && (
                        <Pin size={11} className="text-amber-500 shrink-0" />
                    )}
                    <span
                        className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${cfg.bgColor} ${cfg.color}`}
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
                <p className="text-xs text-slate-500 line-clamp-2">
                    {update.description}
                </p>

                {/* Footer meta */}
                <div className="flex items-center gap-3 mt-2">
                    {update.eventAt && (
                        <div className="flex items-center gap-1 text-slate-500">
                            <Calendar size={11} />
                            <span className="text-[11px] font-medium">
                                {formatEventDate(update.eventAt)}
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
                        {timeAgo(update.createdAt)}
                    </span>
                </div>
            </div>
        </div>
    );
}

interface RecentUpdatesProps {
    updates: DashboardUpdateItem[];
}

export default function RecentUpdates({ updates }: RecentUpdatesProps) {
    return (
        <section>
            <div className="px-6 mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Recent Updates</h3>
                <Link
                    href="#"
                    className="flex items-center gap-1 text-sm font-medium text-primary"
                >
                    View all <ChevronRight size={15} />
                </Link>
            </div>

            <div className="flex flex-col gap-3 px-6 pb-6">
                {updates.map((update) => (
                    <UpdateCard key={update._id} update={update} />
                ))}
            </div>
        </section>
    );
}
