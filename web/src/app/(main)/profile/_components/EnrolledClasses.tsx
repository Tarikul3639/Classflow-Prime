"use client";

import React from "react";
import ClassCard from "./ClassCard";
import Link from "next/link";

export enum ClassStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
  UPCOMING = 'upcoming',
}

interface ClassProps {
  classId: string;
  className: string;
  themeColor?: string;
  coverImage?: string;
  role: string;
  status: ClassStatus;
  enrolledAt: Date;
}

export default function EnrolledClasses({ classes }: { classes: ClassProps[] }) {

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-900">Enrolled Classes</h3>
        <Link
          href="/classes"
          className="text-primary text-xs font-bold hover:underline"
        >
          Manage All
        </Link>
      </div>
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {classes.map((classItem) => (
          <ClassCard key={classItem.classId} {...classItem} />
        ))}
      </div>
    </div>
  );
}
