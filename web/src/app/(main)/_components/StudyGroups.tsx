"use client";

import { Users, ExternalLink, ChevronRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import { DashboardGroupItem } from "@/store/features/dashboard/dashboard.types";
import { GROUP_PLATFORM_CONFIG } from "@/types/group.types";

function GroupCard({ group }: { group: DashboardGroupItem }) {
    const platformCfg = GROUP_PLATFORM_CONFIG[group.platform];
    return (
        <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center gap-3 hover:border-slate-200 transition-colors">
            {/* Platform icon */}
            <div
                className={`size-10 rounded-xl ${group.uiConfig?.platformBg} flex items-center justify-center shrink-0`}
            >
                <MessageCircle className={group.uiConfig?.platformColor} size={18} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                        {group.name}
                    </h4>
                    <span
                        className={`shrink-0 text-[11px] font-bold px-1.5 py-0.5 rounded ${group.uiConfig?.platformBg} ${group.uiConfig?.platformColor}`}
                    >
                        {/* {platformLabels[group.platform]} */}
                    </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {group.description}
                </p>

                <div className="flex items-center gap-1 mt-1.5 text-slate-400">
                    <Users size={11} />
                    <span className="text-[11px]">{group.memberCount} members</span>
                </div>
            </div>

            {/* Join link */}
            <a
                href={group.link}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center justify-center size-8 rounded-xl bg-slate-50 hover:bg-primary hover:text-white text-slate-500 transition-all"
            >
                <ExternalLink size={14} />
            </a>
        </div>
    );
}

interface StudyGroupsProps {
    groups: DashboardGroupItem[];
}

export default function StudyGroups({ groups }: StudyGroupsProps) {
    return (
        <section>
            <div className="px-6 mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Study Groups</h3>
                <Link
                    href="#"
                    className="flex items-center gap-1 text-sm font-medium text-primary"
                >
                    Join more <ChevronRight size={15} />
                </Link>
            </div>

            <div className="flex flex-col gap-3 px-6 pb-6">
                {groups.map((g) => (
                    <GroupCard key={g._id} group={g} />
                ))}
            </div>
        </section>
    );
}
