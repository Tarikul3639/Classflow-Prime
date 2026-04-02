"use client";

import React from "react";
import { MessageCircle, Radio, Send, Plus } from "lucide-react";
import Link from "next/link";
import { GroupCard } from "./_components/GroupCard";
import { useRouter, useParams } from "next/navigation";
import { GroupPlatform, ClassGroup } from "@/types/group.types";

const groups: ClassGroup[] = [
  {
    groupId: "1",
    name: "Class Chat - Section A",
    description: "Discussion & announcements",
    link: "https://chat.whatsapp.com/example",
    platform: GroupPlatform.WHATSAPP,
    createdBy: "user1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    groupId: "2",
    name: "Study Circle",
    description: "Voice + study sessions",
    link: "https://discord.gg/example",
    platform: GroupPlatform.DISCORD,
    createdBy: "user1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function GroupsPage() {
  const router = useRouter();
  const { classId } = useParams();

  return (
    <main className="p-4 space-y-4 pb-8 mx-auto">
      {/* Add New Group - Dashed Border */}
      <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-transparent p-6 flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
          <Plus className="text-primary" size={24} />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-base">
            Add New Group
          </h4>
          <p className="text-sm text-slate-600 mt-1">
            Help your classmates by sharing relevant group links
          </p>
        </div>
        <Link
          href={`/classes/${classId}/groups/create`}
          className="mt-2 px-4 py-2.5 rounded-lg border border-primary/30 bg-white/50 text-primary font-bold text-[11px] md:text-[12px] lg:text-[13px] hover:bg-blue-50 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span>Crete Group</span>
        </Link>
      </div>

      {/* Section Title */}
      <div className="mt-6 mb-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1">
          Active Communication Channels
        </h3>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => {
          return <GroupCard key={group.groupId} group={group} />;
        })}
      </div>
    </main>
  );
}
