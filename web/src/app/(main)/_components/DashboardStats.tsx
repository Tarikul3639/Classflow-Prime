"use client";

import React from "react";
import { BookOpen, Pin, Calendar, Users } from "lucide-react";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  badge?: string | null;
  badgeColor?: string;
}

function StatCard({ icon: Icon, label, value, badge, badgeColor }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl p-3 sm:p-4 lg:p-5 bg-white shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-1 sm:mb-2">
        <Icon className="text-primary" size={18} />
        {badge && (
          <span className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
      <p className="text-slate-500 text-[10px] sm:text-xs font-medium tracking-wide uppercase">
        {label}
      </p>
      <p className="text-slate-900 text-xl sm:text-2xl lg:text-3xl font-bold leading-none">
        {value}
      </p>
    </div>
  );
}

interface DashboardStatsProps {
  enrolledCount: number;
  activeCount: number;
  pinnedCount: number;
  upcomingCount: number;
  groupCount: number;
}

export default function DashboardStats({
  enrolledCount,
  activeCount,
  pinnedCount,
  upcomingCount,
  groupCount,
}: DashboardStatsProps) {
  const stats = [
    {
      icon: BookOpen,
      label: "Enrolled Classes",
      value: String(enrolledCount),
      badge: `${activeCount} Active`,
      badgeColor: "bg-green-100 text-green-600",
    },
    {
      icon: Pin,
      label: "Pinned Updates",
      value: String(pinnedCount),
      badge: null,
      badgeColor: "",
    },
    {
      icon: Calendar,
      label: "Upcoming Events",
      value: String(upcomingCount),
      badge: upcomingCount > 0 ? "Soon" : null,
      badgeColor: "bg-red-100 text-red-500",
    },
    {
      icon: Users,
      label: "Study Groups",
      value: String(groupCount),
      badge: null,
      badgeColor: "",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-6 py-4">
      {stats.map((stat, i) => (
        <StatCard key={i} {...stat} />
      ))}
    </div>
  );
}
