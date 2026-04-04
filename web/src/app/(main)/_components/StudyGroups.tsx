"use client";

import { Users, ExternalLink } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

import { DashboardGroupItem } from "@/store/features/dashboard/dashboard.types";
import { GROUP_PLATFORM_CONFIG } from "@/types/group.types";

function GroupCard({ group }: { group: DashboardGroupItem }) {
    const platformCfg = GROUP_PLATFORM_CONFIG[group.platform];
    const PlatformIcon = platformCfg.icon;

    return (
        <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center gap-3 hover:border-slate-200 transition-colors">
            {/* Platform icon */}
            <div
                className={`size-10 rounded-xl ${platformCfg.uiConfig.platformBg} flex items-center justify-center shrink-0`}
            >
                <PlatformIcon
                    className={platformCfg.uiConfig.platformColor}
                    size={18}
                />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                        {group.name}
                    </h4>
                    <span
                        className={`shrink-0 text-[11px] font-bold px-1.5 py-0.5 rounded ${platformCfg.uiConfig.platformBg} ${platformCfg.uiConfig.platformColor}`}
                    >
                        {platformCfg.label}
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
    const isEmpty = groups.length === 0;
    const uniqueClassCount = new Set(groups.map((f) => f.classId)).size;

    // Don't render the section at all if there are no groups or if all groups are from classes that have been archived/removed
    if (uniqueClassCount === 0) {
        return null;
    }

    return (
        <section>
            {/* Header */}
            <div className="px-6 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="text-md font-bold text-slate-900">Groups</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
                        {groups.length}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-3 px-6 pb-6">
                {isEmpty ? (
                    <EmptyState
                        icon={Users}
                        size="sm"
                        title="No study groups yet"
                        description="Join or create groups to collaborate with classmates."
                    />
                ) : (
                    groups.map((group) => <GroupCard key={group._id} group={group} />)
                )}
            </div>
        </section>
    );
}
